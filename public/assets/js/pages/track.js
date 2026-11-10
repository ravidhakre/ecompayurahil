(function () {
  'use strict';

  const AG = window.AG;
  const form = document.getElementById('trackForm');
  const orderInput = document.getElementById('trackOrder');
  const phoneInput = document.getElementById('trackPhone');
  const button = document.getElementById('trackBtn');
  const errorBox = document.getElementById('trackError');
  const result = document.getElementById('trackResult');

  const params = new URLSearchParams(window.location.search);
  if (params.get('order')) orderInput.value = params.get('order').toUpperCase();
  if (params.get('phone')) phoneInput.value = params.get('phone');

  phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/[^\d+ ]/g, '').slice(0, 15);
  });

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

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    result.hidden = true;
  }

  function render(order) {
    errorBox.hidden = true;
    result.hidden = false;

    document.getElementById('trackOrderNo').textContent = order.order_no;
    document.getElementById('trackPlaced').textContent = `Placed on ${dt(order.created_at)} · ${order.items.reduce((sum, item) => sum + item.qty, 0)} book(s)`;
    const badge = document.getElementById('trackStatus');
    badge.textContent = order.status_label;
    badge.className = `status-badge ${order.status}`;

    document.getElementById('trackTimeline').innerHTML = order.timeline
      .map(
        (step) => `
        <div class="timeline-item ${step.done ? 'done' : ''} ${step.current ? 'current' : ''}">
          <strong>${AG.esc(step.label)}</strong>
          <span>${AG.esc(step.detail)}</span>
        </div>`
      )
      .join('');

    document.getElementById('trackItems').innerHTML =
      '<strong style="font-size:12px">Items in this order</strong>' +
      order.items
        .map(
          (item) => `
          <div class="track-item">
            <span>${AG.esc(item.title)} × ${item.qty}</span>
            <span>${AG.money(item.line_total)}</span>
          </div>`
        )
        .join('') +
      `<div class="track-item" style="border-top:1px solid var(--line);margin-top:8px;padding-top:12px;font-weight:800">
        <span>Order total</span><span>${AG.money(order.total)}</span>
      </div>`;

    document.getElementById('trackAddress').innerHTML = `
      <strong>Delivering to</strong><br>
      ${AG.esc(order.customer_name)} · ${AG.esc(order.phone)}<br>
      ${AG.esc(order.address)}, ${AG.esc(order.city)}, ${AG.esc(order.state)} ${AG.esc(order.pincode)}`;

    const receipt = document.getElementById('trackReceipt');
    receipt.href = `/receipt/${encodeURIComponent(order.order_no)}?phone=${encodeURIComponent(order.phone)}`;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const orderNo = orderInput.value.trim().toUpperCase();
    const phone = phoneInput.value.replace(/\D/g, '');
    if (!orderNo) {
      showError('Please enter your order number.');
      return;
    }
    if (phone.length < 10) {
      showError('Please enter the 10-digit phone number used on the order.');
      return;
    }

    button.disabled = true;
    const old = button.innerHTML;
    button.innerHTML = '<span class="btn-spinner"></span> Searching…';
    errorBox.hidden = true;

    try {
      const data = await AG.api(
        `/api/orders/${encodeURIComponent(orderNo)}/track?phone=${encodeURIComponent(phone)}`
      );
      render(data.order);
      const url = new URL(window.location.href);
      url.searchParams.set('order', orderNo);
      url.searchParams.set('phone', phone);
      window.history.replaceState(null, '', url.toString());
    } catch (error) {
      showError(error.message);
    } finally {
      button.disabled = false;
      button.innerHTML = old;
    }
  });

  if (orderInput.value && phoneInput.value && params.get('phone')) {
    form.dispatchEvent(new Event('submit', { cancelable: true }));
  }
})();
