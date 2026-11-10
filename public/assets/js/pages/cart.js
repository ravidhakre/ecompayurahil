(function () {
  'use strict';

  const AG = window.AG;
  const settings = AG.settings || {};
  const threshold = Number(settings.free_shipping_threshold) || 0;
  const shippingFee = Number(settings.shipping_fee) || 0;

  const cartLayout = document.getElementById('cartLayout');
  const cartItemsEl = document.getElementById('cartItems');
  const cartItemCount = document.getElementById('cartItemCount');
  const summaryCard = document.getElementById('cartSummary');
  const summaryRows = document.getElementById('summaryRows');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const couponForm = document.getElementById('couponForm');
  const couponInput = document.getElementById('couponInput');
  const couponHint = document.getElementById('couponHint');
  const freeShipMeter = document.getElementById('freeShipMeter');
  const freeShipText = document.getElementById('freeShipText');
  const freeShipBar = document.getElementById('freeShipBar');
  const cartContinue = document.querySelector('.cart-continue');
  const recommend = document.getElementById('cartRecommend');
  const recommendGrid = document.getElementById('cartRecommendGrid');

  let items = [];
  let discount = 0;
  let couponCode = '';
  let suppressChange = false;
  let booted = false;

  function subtotal() {
    return items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  }

  function setCartSilently(next) {
    suppressChange = true;
    AG.setCart(next);
    suppressChange = false;
    items = AG.getCart();
  }

  function renderEmpty() {
    cartLayout.classList.add('is-empty');
    summaryCard.hidden = true;
    if (cartContinue) cartContinue.hidden = true;
    if (cartItemCount) cartItemCount.textContent = '';
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon" aria-hidden="true">🛒</div>
        <h2>Your cart is feeling light</h2>
        <p class="muted">Good paper, beautiful lines and a quiet hour are waiting. Find the book that fits your mood.</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <a href="/shop" class="btn btn-ink btn-lg">Explore the library</a>
          <a href="/shop?sort=popular" class="btn btn-outline btn-lg">Shop bestsellers</a>
        </div>
      </div>`;
  }

  function renderItems() {
    cartItemsEl.innerHTML = items
      .map(
        (item) => `
      <div class="cart-line" data-line="${AG.esc(item.slug)}">
        <a class="cart-thumb" href="/product/${encodeURIComponent(item.slug)}">
          <img src="${AG.esc(item.cover)}" alt="${AG.esc(item.title)} cover" width="600" height="800">
        </a>
        <div class="cart-info">
          <span class="product-cat">${AG.esc(item.category || 'Colouring book')}</span>
          <h3><a href="/product/${encodeURIComponent(item.slug)}">${AG.esc(item.title)}</a></h3>
          <span class="cart-unit">${AG.money(item.price)} each · ${item.pages || 25} pages</span>
          <div class="cart-actions">
            <div class="cart-qty" aria-label="Quantity for ${AG.esc(item.title)}">
              <button type="button" data-cart-action="minus" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button type="button" data-cart-action="plus" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="cart-remove" data-cart-action="remove">Remove</button>
            ${Number(item.stock) > 0 && Number(item.stock) <= 10 ? `<span class="product-stock-low" style="margin:0">Only ${item.stock} left</span>` : ''}
          </div>
        </div>
        <div class="cart-line-price">
          <strong>${AG.money(item.price * item.qty)}</strong>
          ${item.mrp > item.price ? `<s>${AG.money(item.mrp * item.qty)}</s>` : ''}
        </div>
      </div>`
      )
      .join('');

    const count = items.reduce((sum, item) => sum + Number(item.qty), 0);
    if (cartItemCount) cartItemCount.textContent = `(${count} ${count === 1 ? 'book' : 'books'})`;
  }

  function renderSummary() {
    const sub = subtotal();
    const shipping = sub >= threshold || sub === 0 ? 0 : shippingFee;
    const total = Math.max(0, sub - discount + shipping);

    summaryRows.innerHTML = `
      <div class="summary-row"><span>Subtotal (${items.reduce((s, i) => s + i.qty, 0)} books)</span><span>${AG.money(sub)}</span></div>
      ${discount > 0 ? `<div class="summary-row discount"><span>Coupon ${AG.esc(couponCode)}</span><span>− ${AG.money(discount)}</span></div>` : ''}
      <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? '<strong style="color:var(--success)">FREE</strong>' : AG.money(shipping)}</span></div>
      <div class="summary-divider"></div>
      <div class="summary-total"><span>Total</span><strong>${AG.money(total)}</strong></div>
      <p class="muted small" style="text-align:right;margin-top:4px">Inclusive of all taxes</p>`;

    if (threshold > 0 && sub > 0 && sub < threshold) {
      const remaining = threshold - sub;
      freeShipMeter.hidden = false;
      freeShipText.innerHTML = `Add <strong>${AG.money(remaining)}</strong> more for free shipping`;
      freeShipBar.style.width = `${Math.min(100, (sub / threshold) * 100)}%`;
    } else {
      freeShipMeter.hidden = true;
    }

    if (couponCode && discount > 0) {
      couponHint.innerHTML = `✓ <strong>${AG.esc(couponCode)}</strong> applied — you saved ${AG.money(discount)}.`;
      couponHint.style.color = 'var(--success)';
    } else {
      couponHint.innerHTML = 'Try <strong>ART10</strong> for 10% off orders above ₹499.';
      couponHint.style.color = '';
    }
    couponInput.value = couponCode;
    checkoutBtn.href = '/checkout';
    checkoutBtn.classList.remove('is-disabled');
  }

  function render() {
    if (!items.length) {
      renderEmpty();
      loadRecommendations();
      return;
    }
    cartLayout.classList.remove('is-empty');
    summaryCard.hidden = false;
    if (cartContinue) cartContinue.hidden = false;
    renderItems();
    renderSummary();
    loadRecommendations();
  }

  async function validateCoupon(silent) {
    const stored = AG.getCoupon();
    if (!stored || !subtotal()) {
      couponCode = stored || '';
      discount = 0;
      if (!stored) couponCode = '';
      return;
    }
    try {
      const data = await AG.api('/api/coupon/validate', {
        method: 'POST',
        body: { subtotal: subtotal(), code: stored },
      });
      couponCode = data.code;
      discount = data.discount;
      AG.setCoupon(data.code);
      if (!silent) AG.toast(data.message, 'success');
    } catch (error) {
      couponCode = '';
      discount = 0;
      AG.clearCoupon();
      if (!silent) {
        AG.toast(error.message, 'error');
        couponHint.textContent = error.message;
        couponHint.style.color = 'var(--danger)';
      }
    }
  }

  async function loadCart() {
    const stored = AG.getCart();
    if (!stored.length) {
      items = [];
      discount = 0;
      couponCode = AG.getCoupon();
      render();
      booted = true;
      return;
    }

    const results = await Promise.allSettled(
      stored.map((item) => AG.api(`/api/products/${encodeURIComponent(item.slug)}`))
    );
    const fresh = [];
    let changed = false;
    const removed = [];

    results.forEach((result, index) => {
      const item = stored[index];
      if (result.status !== 'fulfilled') {
        removed.push(item.title);
        changed = true;
        return;
      }
      const product = result.value.product;
      if (!product || product.stock <= 0) {
        removed.push(item.title);
        changed = true;
        return;
      }
      const qty = Math.max(1, Math.min(Number(item.qty) || 1, product.stock, 10));
      if (qty !== Number(item.qty)) changed = true;
      fresh.push(
        Object.assign(AG.snapshotProduct(product), {
          qty,
        })
      );
    });

    items = fresh;
    if (changed) setCartSilently(fresh);
    if (removed.length) {
      AG.toast(`${removed.length > 1 ? 'Some books were' : removed[0] + ' was'} removed because ${removed.length > 1 ? 'they are' : 'it is'} no longer available.`, 'error');
    }
    await validateCoupon(true);
    render();
    booted = true;
  }

  async function loadRecommendations() {
    try {
      const data = await AG.api('/api/products?bestseller=1&sort=popular&limit=8');
      const inCart = new Set(items.map((item) => item.slug));
      const picks = data.products.filter((p) => !inCart.has(p.slug)).slice(0, 4);
      if (!picks.length) {
        recommend.hidden = true;
        return;
      }
      recommend.hidden = false;
      recommendGrid.innerHTML = picks.map((p) => AG.productCard(p)).join('');
    } catch (error) {
      recommend.hidden = true;
    }
  }

  cartItemsEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-cart-action]');
    if (!btn) return;
    const line = btn.closest('[data-line]');
    if (!line) return;
    const slug = line.dataset.line;
    const item = items.find((entry) => entry.slug === slug);
    if (!item) return;

    if (btn.dataset.cartAction === 'remove') {
      items = items.filter((entry) => entry.slug !== slug);
      setCartSilently(items);
      validateCoupon(true).then(render);
      return;
    }

    if (btn.dataset.cartAction === 'plus') {
      if (item.qty >= Math.min(10, item.stock || 10)) {
        AG.toast(`Only ${Math.min(10, item.stock || 10)} copies can be added.`, 'error');
        return;
      }
      item.qty += 1;
    }

    if (btn.dataset.cartAction === 'minus') {
      item.qty -= 1;
    }

    if (item.qty <= 0) {
      items = items.filter((entry) => entry.slug !== slug);
    }
    setCartSilently(items);
    validateCoupon(true).then(render);
  });

  couponForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = couponInput.value.trim();
    if (!code) {
      AG.clearCoupon();
      couponCode = '';
      discount = 0;
      render();
      return;
    }
    couponInput.disabled = true;
    try {
      const data = await AG.api('/api/coupon/validate', {
        method: 'POST',
        body: { subtotal: subtotal(), code },
      });
      AG.setCoupon(data.code);
      couponCode = data.code;
      discount = data.discount;
      AG.toast(data.message, 'success');
      render();
    } catch (error) {
      couponCode = '';
      discount = 0;
      AG.clearCoupon();
      couponHint.textContent = error.message;
      couponHint.style.color = 'var(--danger)';
      AG.toast(error.message, 'error');
      renderSummary();
    } finally {
      couponInput.disabled = false;
    }
  });

  // Keep the page in sync when a recommended book is added from this page.
  document.addEventListener('ag:cart-changed', () => {
    if (!booted || suppressChange) return;
    setTimeout(loadCart, 40);
  });

  loadCart();
})();
