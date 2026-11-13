(function () {
  'use strict';

  const AG = window.AG;
  const orderNo = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() || '');
  const params = new URLSearchParams(window.location.search);
  let key = params.get('key') || '';
  const phoneParam = params.get('phone') || '';

  const gate = document.getElementById('receiptGate');
  const gateForm = document.getElementById('receiptGateForm');
  const gateError = document.getElementById('receiptGateError');
  const content = document.getElementById('receiptContent');
  const errorBox = document.getElementById('receiptError');

  function dt(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  function money(value) {
    return AG.money(value);
  }

  function receiptUrl(extra) {
    const query = new URLSearchParams();
    if (key) query.set('key', key);
    const tail = extra ? `&${extra}` : '';
    return `/receipt/${encodeURIComponent(orderNo)}?${query.toString()}${tail}`;
  }

  function showError(title, message, actions) {
    content.hidden = true;
    gate.hidden = true;
    errorBox.hidden = false;
    errorBox.innerHTML = `
      <div class="empty-state" style="max-width:560px;margin:40px auto">
        <div style="font-size:46px;margin-bottom:10px">🧾</div>
        <h2>${AG.esc(title)}</h2>
        <p>${AG.esc(message)}</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          ${actions || '<a class="btn btn-ink" href="/shop">Browse the shop</a><a class="btn btn-outline" href="/contact">Contact support</a>'}
        </div>
      </div>`;
  }

  function stampFor(order) {
    if (order.status === 'cancelled') return { label: 'Cancelled', cls: 'failed' };
    if (order.payment_status === 'paid') return { label: 'Paid', cls: '' };
    if (order.payment_status === 'failed') return { label: 'Failed', cls: 'failed' };
    if (order.payment_status === 'refunded') return { label: 'Refunded', cls: 'pending' };
    if (order.payment_method === 'cod') return { label: 'COD', cls: 'pending' };
    return { label: 'Pending', cls: 'pending' };
  }

  function paymentLabel(order) {
    if (order.payment_method === 'cod') {
      return order.payment_status === 'paid' ? 'Cash on Delivery (collected)' : 'Cash on Delivery';
    }
    return `Online · PayU${order.payu_txnid ? ` · ${order.payu_txnid}` : ''}`;
  }

  function render(order) {
    document.title = `Order ${order.order_no} — Arts Book`;
    gate.hidden = true;
    errorBox.hidden = true;
    content.hidden = false;

    document.getElementById('invoiceNo').textContent = `Order ${order.order_no}`;
    document.getElementById('invoiceDate').textContent = dt(order.created_at);

    const stamp = stampFor(order);
    const stampEl = document.getElementById('invoiceStamp');
    stampEl.textContent = stamp.label;
    stampEl.className = `invoice-stamp ${stamp.cls}`.trim();

    document.getElementById('invoiceCustomer').innerHTML = `
      <strong>${AG.esc(order.customer_name)}</strong><br>
      ${AG.esc(order.address)}<br>
      ${AG.esc(order.city)}, ${AG.esc(order.state)} ${AG.esc(order.pincode)}<br>
      ${AG.esc(order.phone)}<br>
      ${AG.esc(order.email)}`;

    document.getElementById('invoiceMeta').innerHTML = `
      <span>Order no.</span><strong>${AG.esc(order.order_no)}</strong>
      <span>Placed on</span><strong>${AG.esc(dt(order.created_at))}</strong>
      <span>Status</span><strong>${AG.esc(order.status_label)}</strong>
      <span>Payment</span><strong>${AG.esc(paymentLabel(order))}</strong>
      ${order.coupon_code ? `<span>Coupon</span><strong>${AG.esc(order.coupon_code)}</strong>` : ''}
      ${order.notes ? `<span>Notes</span><strong>${AG.esc(order.notes)}</strong>` : ''}`;

    document.getElementById('invoiceItems').innerHTML = order.items
      .map(
        (item) => `
        <tr>
          <td>
            <div class="item-name">${AG.esc(item.title)}</div>
            <div class="item-sub">${AG.esc(item.slug)} · Colour colouring book</div>
          </td>
          <td class="num">${money(item.price)}</td>
          <td class="num">${item.qty}</td>
          <td class="num">${money(item.line_total)}</td>
        </tr>`
      )
      .join('');

    document.getElementById('invoiceTotals').innerHTML = `
      <div class="row"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
      ${Number(order.discount) > 0 ? `<div class="row"><span>Coupon discount ${order.coupon_code ? `(${AG.esc(order.coupon_code)})` : ''}</span><span>− ${money(order.discount)}</span></div>` : ''}
      <div class="row"><span>Shipping</span><span>${Number(order.shipping) === 0 ? 'FREE' : money(order.shipping)}</span></div>
      ${Number(order.cod_fee) > 0 ? `<div class="row"><span>COD handling fee</span><span>${money(order.cod_fee)}</span></div>` : ''}
      <div class="row total"><span>Total</span><span>${money(order.total)}</span></div>`;

    const paidNote = document.getElementById('invoicePaidNote');
    if (order.payment_status === 'paid') {
      paidNote.innerHTML = `<p class="alert alert-success" style="margin-top:18px;display:block"><strong>Payment received.</strong> ${order.payment_method === 'cod' ? 'Cash collected on delivery.' : `Thank you — your online payment of ${money(order.total)} has been confirmed.`}</p>`;
    } else if (order.status === 'cancelled') {
      paidNote.innerHTML = '<p class="alert alert-error" style="margin-top:18px;display:block"><strong>This order was cancelled.</strong> If money was deducted, it will be refunded to the original payment method as per our refund policy.</p>';
    } else if (order.payment_method === 'cod') {
      paidNote.innerHTML = `<p class="alert alert-info" style="margin-top:18px;display:block"><strong>Cash on Delivery.</strong> Please keep ${money(order.total)} ready at the time of delivery.</p>`;
    } else {
      paidNote.innerHTML = `<p class="alert alert-info" style="margin-top:18px;display:block"><strong>Payment pending.</strong> <a href="/payment?order=${encodeURIComponent(order.order_no)}&key=${encodeURIComponent(key)}">Complete your payment securely →</a></p>`;
    }

    document.getElementById('receiptTimeline').innerHTML = order.timeline
      .map(
        (step) => `
        <div class="timeline-item ${step.done ? 'done' : ''} ${step.current ? 'current' : ''}">
          <strong>${AG.esc(step.label)}</strong>
          <span>${AG.esc(step.detail)}</span>
        </div>`
      )
      .join('');

    document.getElementById('receiptAddress').innerHTML = `
      <strong>Delivery address</strong><br>
      ${AG.esc(order.customer_name)} · ${AG.esc(order.phone)}<br>
      ${AG.esc(order.address)}, ${AG.esc(order.city)}, ${AG.esc(order.state)} ${AG.esc(order.pincode)}`;

    const trackLink = document.getElementById('trackLink');
    trackLink.href = `/track-order?order=${encodeURIComponent(order.order_no)}&phone=${encodeURIComponent(order.phone)}`;

    document.getElementById('printReceipt').addEventListener('click', () => window.print());
  }

  async function load(phone) {
    const query = new URLSearchParams();
    if (key) query.set('key', key);
    if (phone) query.set('phone', phone);
    try {
      const data = await AG.api(`/api/orders/${encodeURIComponent(orderNo)}/receipt?${query.toString()}`);
      if (data.order && !key) key = '';
      render(data.order);
    } catch (error) {
      if (error.status === 403) {
        gate.hidden = false;
        content.hidden = true;
        errorBox.hidden = true;
        document.getElementById('receiptPhone').value = phone || phoneParam || '';
        if (phone) {
          gateError.textContent = error.message;
          gateError.hidden = false;
        }
        return;
      }
      if (error.status === 404) {
        showError('Receipt not found', 'We could not find this order. Please check the link in your confirmation email or contact support.');
        return;
      }
      showError('We could not load this receipt', error.message || 'Please try again in a moment.');
    }
  }

  gateForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const phone = document.getElementById('receiptPhone').value.replace(/\D/g, '');
    if (phone.length < 10) {
      gateError.textContent = 'Please enter the 10-digit mobile number used on the order.';
      gateError.hidden = false;
      return;
    }
    gateError.hidden = true;
    load(phone);
  });

  load();
})();
