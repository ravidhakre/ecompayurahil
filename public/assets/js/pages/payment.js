(function () {
  'use strict';

  const AG = window.AG;
  const body = document.getElementById('paymentBody');
  const params = new URLSearchParams(window.location.search);
  const orderNo = params.get('order') || '';
  const key = params.get('key') || '';
  const status = params.get('status') || '';

  function esc(value) {
    return AG.esc(value);
  }

  function statusPanel(icon, iconClass, title, message, actions) {
    return `
      <div class="payment-status">
        <span class="status-icon ${iconClass}">${icon}</span>
        <h1>${esc(title)}</h1>
        <p>${message}</p>
        <div class="btn-row">${actions || '<a class="btn btn-ink" href="/shop">Continue shopping</a>'}</div>
      </div>`;
  }

  function errorPanel(message) {
    body.innerHTML = statusPanel(
      '!',
      'fail',
      'We could not start the payment',
      esc(message || 'This payment link looks incomplete or has expired. Please return to checkout and try again.'),
      '<a class="btn btn-ink" href="/cart">Back to cart</a><a class="btn btn-outline" href="/contact">Contact support</a>'
    );
  }

  if (!orderNo || !key) {
    errorPanel('This payment link is missing an order reference.');
    return;
  }

  if (status === 'failed') {
    body.innerHTML = statusPanel(
      '!',
      'fail',
      'Payment did not go through',
      'No money has been deducted for this attempt. If your bank shows a pending charge, it will reverse automatically within 5–7 working days.',
      '<a class="btn btn-ink" href="/checkout">Try checkout again</a><a class="btn btn-outline" href="/contact">Contact support</a>'
    );
    return;
  }

  if (status === 'invalid') {
    errorPanel('We could not verify the payment response. If money was deducted, please contact us with your order number and we will fix it immediately.');
    return;
  }

  function renderMeta(data) {
    return `
      <div class="pay-amount">
        <span>Amount payable</span>
        <strong>${AG.money(data.amount)}</strong>
      </div>
      <div class="pay-order-meta">
        <div><span>Order number</span><strong>${esc(data.orderNo)}</strong></div>
        <div><span>Customer</span><strong>${esc(data.name || '')}</strong></div>
        <div><span>Email</span><strong style="word-break:break-all">${esc(data.email || '')}</strong></div>
        <div><span>Phone</span><strong>${esc(data.phone || '')}</strong></div>
      </div>`;
  }

  async function initiate() {
    try {
      const data = await AG.api('/api/payu/initiate', {
        method: 'POST',
        body: { orderNo, key },
      });
      if (data.alreadyPaid && data.receiptUrl) {
        window.location.href = data.receiptUrl;
        return;
      }
      if (data.demo) {
        renderDemo(data);
        return;
      }
      if (data.demo === false && data.action && data.fields) {
        renderLive(data);
        return;
      }
      errorPanel('The payment gateway returned an unexpected response. Please try again from checkout.');
    } catch (error) {
      if (error.data && error.data.error) {
        body.innerHTML = statusPanel(
          '!',
          'fail',
          'This order cannot be paid',
          esc(error.data.error),
          '<a class="btn btn-ink" href="/shop">Start a new order</a><a class="btn btn-outline" href="/contact">Contact support</a>'
        );
      } else {
        errorPanel(error.message);
      }
    }
  }

  function renderDemo(data) {
    const demoKey = data.key || key;
    body.innerHTML = `
      <div class="demo-banner">
        <strong>Demo mode is active.</strong> PayU credentials are not configured, so no real money will be charged.
        Use the buttons below to simulate a successful or failed payment, then verify the receipt page and admin order flow.
      </div>
      ${renderMeta(data)}
      <div class="pay-method-list" aria-hidden="true">
        <span>UPI</span><span>Cards</span><span>Net banking</span>
        <span>Wallets</span><span>EMI</span><span>PayU</span>
      </div>
      <div class="pay-actions">
        <button class="btn btn-accent btn-lg" type="button" id="demoPay">
          Pay ${AG.money(data.amount)} securely (demo) <span aria-hidden="true">→</span>
        </button>
        <button class="btn btn-outline" type="button" id="demoFail">Simulate a failed payment</button>
        <a class="btn btn-outline" href="/cart">Back to cart</a>
      </div>
      <p class="muted small" style="text-align:center;margin-top:14px">In production this button opens the real PayU payment page.</p>`;

    const payBtn = document.getElementById('demoPay');
    const failBtn = document.getElementById('demoFail');

    payBtn.addEventListener('click', async () => {
      payBtn.disabled = true;
      failBtn.disabled = true;
      payBtn.innerHTML = '<span class="btn-spinner"></span> Processing demo payment…';
      try {
        const result = await AG.api('/api/payu/demo', {
          method: 'POST',
          body: { orderNo, key: demoKey, outcome: 'success' },
        });
        if (result.alreadyPaid) {
          window.location.href = `/receipt/${encodeURIComponent(orderNo)}?key=${encodeURIComponent(demoKey)}&paid=1`;
          return;
        }
        body.innerHTML = statusPanel(
          '✓',
          'success',
          'Payment successful',
          'Your order is confirmed. Taking you to your receipt now…',
          `<a class="btn btn-ink" href="${esc(result.receipt_url || `/receipt/${encodeURIComponent(orderNo)}?key=${encodeURIComponent(demoKey)}`)}">View receipt</a>`
        );
        setTimeout(() => {
          window.location.href = result.receipt_url || `/receipt/${encodeURIComponent(orderNo)}?key=${encodeURIComponent(demoKey)}&paid=1`;
        }, 900);
      } catch (error) {
        errorPanel(error.message);
      }
    });

    failBtn.addEventListener('click', async () => {
      payBtn.disabled = true;
      failBtn.disabled = true;
      failBtn.innerHTML = '<span class="btn-spinner"></span> Processing…';
      try {
        await AG.api('/api/payu/demo', {
          method: 'POST',
          body: { orderNo, key: demoKey, outcome: 'failure' },
        });
      } catch (error) {
        /* The failure response is still shown below even if the API reports one. */
      }
      body.innerHTML = statusPanel(
        '!',
        'fail',
        'Payment failed (demo)',
        'This was a simulated failure. The order has been cancelled and reserved stock released. No money was charged.',
        '<a class="btn btn-ink" href="/shop">Shop again</a><a class="btn btn-outline" href="/contact">Contact support</a>'
      );
    });
  }

  function renderLive(data) {
    const fields = Object.entries(data.fields || {})
      .map(
        ([name, value]) =>
          `<input type="hidden" name="${esc(name)}" value="${esc(value)}">`
      )
      .join('');
    body.innerHTML = `
      <div class="alert alert-info">
        You are being redirected to <strong>PayU</strong> to complete this payment securely. Your card and UPI details are never stored by Arts Book.
      </div>
      ${renderMeta({ amount: data.fields.amount, orderNo, name: data.fields.firstname, email: data.fields.email, phone: data.fields.phone })}
      <div class="pay-method-list" aria-hidden="true">
        <span>UPI</span><span>Cards</span><span>Net banking</span>
        <span>Wallets</span><span>EMI</span><span>PayU</span>
      </div>
      <form id="payuForm" method="post" action="${esc(data.action)}" class="pay-actions">
        ${fields}
        <button class="btn btn-accent btn-lg" type="submit" id="payuSubmit">Proceed to PayU <span aria-hidden="true">→</span></button>
        <a class="btn btn-outline" href="/cart">Back to cart</a>
      </form>
      <p class="muted small" style="text-align:center;margin-top:14px">Clicking the button opens PayU's ${esc(data.mode || 'secure')} payment page.</p>`;
  }

  initiate();
})();
