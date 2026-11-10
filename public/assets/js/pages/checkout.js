(function () {
  'use strict';

  const AG = window.AG;
  const settings = AG.settings || {};
  const threshold = Number(settings.free_shipping_threshold) || 0;
  const shippingFee = Number(settings.shipping_fee) || 0;
  const codFeeSetting = Number(settings.cod_fee) || 0;

  const form = document.getElementById('checkoutForm');
  const emptyState = document.getElementById('checkoutEmpty');
  const mini = document.getElementById('checkoutMini');
  const summaryRows = document.getElementById('checkoutSummaryRows');
  const couponInput = document.getElementById('checkoutCoupon');
  const couponBtn = document.getElementById('checkoutCouponBtn');
  const couponHint = document.getElementById('checkoutCouponHint');
  const placeBtn = document.getElementById('placeOrderBtn');
  const alertBox = document.getElementById('checkoutAlert');

  let items = [];
  let couponCode = '';
  let discount = 0;
  let method = 'payu';

  function subtotal() {
    return items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  }

  function shipping() {
    const sub = subtotal();
    return sub >= threshold || sub === 0 ? 0 : shippingFee;
  }

  function codFee() {
    return method === 'cod' ? codFeeSetting : 0;
  }

  function total() {
    return Math.max(0, subtotal() - discount + shipping() + codFee());
  }

  function showAlert(message) {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.hidden = false;
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideAlert() {
    if (alertBox) alertBox.hidden = true;
  }

  function renderMini() {
    mini.innerHTML = items
      .map(
        (item) => `
        <div class="mini-line">
          <img src="${AG.esc(item.cover)}" alt="${AG.esc(item.title)} cover" width="46" height="61">
          <div class="ml-info">
            <strong>${AG.esc(item.title)}</strong>
            <span>Qty ${item.qty} · ${AG.money(item.price)} each</span>
          </div>
          <span class="ml-price">${AG.money(item.price * item.qty)}</span>
        </div>`
      )
      .join('');
  }

  function renderSummary() {
    const sub = subtotal();
    const ship = shipping();
    const cod = codFee();
    summaryRows.innerHTML = `
      <div class="summary-row"><span>Subtotal (${items.reduce((s, i) => s + Number(i.qty), 0)} books)</span><span>${AG.money(sub)}</span></div>
      ${discount > 0 ? `<div class="summary-row discount"><span>Coupon ${AG.esc(couponCode)}</span><span>− ${AG.money(discount)}</span></div>` : ''}
      <div class="summary-row"><span>Shipping</span><span>${ship === 0 ? '<strong style="color:var(--success)">FREE</strong>' : AG.money(ship)}</span></div>
      ${cod > 0 ? `<div class="summary-row"><span>COD handling fee</span><span>${AG.money(cod)}</span></div>` : ''}
      <div class="summary-divider"></div>
      <div class="summary-total"><span>Total payable</span><strong>${AG.money(total())}</strong></div>
      <p class="muted small" style="text-align:right;margin-top:4px">Inclusive of all taxes</p>`;

    couponInput.value = couponCode;
    if (discount > 0) {
      couponHint.innerHTML = `✓ <strong>${AG.esc(couponCode)}</strong> applied — you saved ${AG.money(discount)}.`;
      couponHint.style.color = 'var(--success)';
    } else {
      couponHint.innerHTML = 'Have a code? Try <strong>ART10</strong> above ₹499.';
      couponHint.style.color = '';
    }
  }

  function renderEmpty() {
    form.hidden = true;
    emptyState.hidden = false;
  }

  async function validateCoupon(code, silent) {
    if (!code) {
      couponCode = '';
      discount = 0;
      AG.clearCoupon();
      renderSummary();
      return;
    }
    try {
      couponBtn.disabled = true;
      const data = await AG.api('/api/coupon/validate', {
        method: 'POST',
        body: { subtotal: subtotal(), code },
      });
      couponCode = data.code;
      discount = data.discount;
      AG.setCoupon(data.code);
      renderSummary();
      if (!silent) AG.toast(data.message, 'success');
    } catch (error) {
      couponCode = '';
      discount = 0;
      AG.clearCoupon();
      renderSummary();
      if (!silent) {
        couponHint.textContent = error.message;
        couponHint.style.color = 'var(--danger)';
        AG.toast(error.message, 'error');
      }
    } finally {
      couponBtn.disabled = false;
    }
  }

  function selectMethod(value) {
    method = value === 'cod' ? 'cod' : 'payu';
    document.querySelectorAll('[data-payment-option]').forEach((option) => {
      option.classList.toggle('selected', option.dataset.paymentOption === method);
    });
    renderSummary();
  }

  document.querySelectorAll('[data-payment-option]').forEach((option) => {
    option.addEventListener('click', () => {
      const input = option.querySelector('input');
      if (input) input.checked = true;
      selectMethod(option.dataset.paymentOption);
    });
  });

  document.querySelectorAll('input[name="payment_method"]').forEach((input) => {
    input.addEventListener('change', () => selectMethod(input.value));
  });

  couponBtn.addEventListener('click', () => validateCoupon(couponInput.value.trim(), false));
  couponInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      validateCoupon(couponInput.value.trim(), false);
    }
  });

  function validateField(id, message) {
    const input = document.getElementById(id);
    const field = input.closest('.field');
    if (!message || !String(input.value).trim()) {
      if (field) field.classList.toggle('error', Boolean(message));
      return !message;
    }
    if (field) field.classList.toggle('error', Boolean(message));
    return !message;
  }

  function buildCustomer() {
    const value = (id) => String(document.getElementById(id).value || '').trim();
    return {
      name: value('coName'),
      email: value('coEmail'),
      phone: value('coPhone'),
      address: value('coAddress'),
      city: value('coCity'),
      state: value('coState'),
      pincode: value('coPincode').replace(/\D/g, ''),
      notes: value('coNotes'),
    };
  }

  function validateForm() {
    hideAlert();
    const customer = buildCustomer();
    const errors = [];

    if (customer.name.length < 2) errors.push({ id: 'coName', message: 'Please enter your full name.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(customer.email)) errors.push({ id: 'coEmail', message: 'Please enter a valid email address.' });
    if (!/^\d{10,13}$/.test(customer.phone.replace(/\D/g, ''))) errors.push({ id: 'coPhone', message: 'Please enter a valid 10-digit mobile number.' });
    if (customer.address.length < 10) errors.push({ id: 'coAddress', message: 'Please enter your complete address.' });
    if (customer.city.length < 2) errors.push({ id: 'coCity', message: 'Please enter your city.' });
    if (customer.state.length < 2) errors.push({ id: 'coState', message: 'Please enter your state.' });
    if (!/^[1-9]\d{5}$/.test(customer.pincode)) errors.push({ id: 'coPincode', message: 'Please enter a valid 6-digit PIN code.' });

    ['coName', 'coEmail', 'coPhone', 'coAddress', 'coCity', 'coState', 'coPincode'].forEach((id) => {
      const input = document.getElementById(id);
      const field = input.closest('.field');
      if (field) field.classList.remove('error');
    });

    if (errors.length) {
      errors.forEach((error) => {
        const input = document.getElementById(error.id);
        const field = input.closest('.field');
        if (field) field.classList.add('error');
      });
      showAlert(errors[0].message);
      const first = document.getElementById(errors[0].id);
      if (first) first.focus();
      return false;
    }

    const terms = document.getElementById('coTerms');
    if (!terms.checked) {
      showAlert('Please accept the Terms & Conditions to place your order.');
      terms.focus();
      return false;
    }
    return true;
  }

  async function submitOrder(event) {
    event.preventDefault();
    if (!items.length) return;
    if (!validateForm()) return;

    hideAlert();
    placeBtn.disabled = true;
    const oldHtml = placeBtn.innerHTML;
    placeBtn.innerHTML = '<span class="btn-spinner"></span> Placing your order…';

    try {
      const data = await AG.api('/api/orders', {
        method: 'POST',
        body: {
          customer: buildCustomer(),
          items: items.map((item) => ({ slug: item.slug, qty: item.qty })),
          coupon_code: couponCode,
          payment_method: method,
        },
      });

      AG.clearCart();
      AG.clearCoupon();
      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
      window.location.href = data.receipt_url;
    } catch (error) {
      showAlert(error.message);
      AG.toast(error.message, 'error');
      placeBtn.disabled = false;
      placeBtn.innerHTML = oldHtml;
    }
  }

  async function boot() {
    const stored = AG.getCart();
    if (!stored.length) {
      renderEmpty();
      return;
    }

    // Validate cart against live stock before showing the form.
    const results = await Promise.allSettled(
      stored.map((item) => AG.api(`/api/products/${encodeURIComponent(item.slug)}`))
    );
    const fresh = [];
    let removed = 0;
    results.forEach((result, index) => {
      const item = stored[index];
      if (result.status !== 'fulfilled') {
        removed += 1;
        return;
      }
      const product = result.value.product;
      if (!product || product.stock <= 0) {
        removed += 1;
        return;
      }
      fresh.push(
        Object.assign(AG.snapshotProduct(product), {
          qty: Math.max(1, Math.min(Number(item.qty) || 1, product.stock, 10)),
        })
      );
    });

    items = fresh;
    if (removed > 0) {
      AG.setCart(fresh);
      AG.toast(`${removed} item${removed > 1 ? 's were' : ' was'} removed because availability changed.`, 'error');
    }
    if (!items.length) {
      renderEmpty();
      return;
    }

    renderMini();
    couponCode = AG.getCoupon();
    if (couponCode) await validateCoupon(couponCode, true);
    renderSummary();
    selectMethod('cod' === method ? 'cod' : 'payu');

    form.addEventListener('submit', submitOrder);

    const notes = document.getElementById('coPincode');
    notes.addEventListener('input', () => {
      notes.value = notes.value.replace(/\D/g, '').slice(0, 6);
    });
  }

  boot();
})();
