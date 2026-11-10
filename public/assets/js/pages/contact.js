(function () {
  'use strict';

  const AG = window.AG;
  const form = document.getElementById('contactForm');
  if (!form) return;
  const button = document.getElementById('contactBtn');
  const success = document.getElementById('contactSuccess');
  const errorBox = document.getElementById('contactError');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    success.hidden = true;
    errorBox.hidden = true;

    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim();
    const message = String(data.message || '').trim();

    if (name.length < 2) {
      errorBox.textContent = 'Please enter your name.';
      errorBox.hidden = false;
      document.getElementById('ctName').focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
      errorBox.textContent = 'Please enter a valid email address.';
      errorBox.hidden = false;
      document.getElementById('ctEmail').focus();
      return;
    }
    if (message.length < 10) {
      errorBox.textContent = 'Please write a slightly longer message so we can help properly.';
      errorBox.hidden = false;
      document.getElementById('ctMessage').focus();
      return;
    }

    button.disabled = true;
    const old = button.innerHTML;
    button.innerHTML = '<span class="btn-spinner"></span> Sending…';

    try {
      const result = await AG.api('/api/contact', { method: 'POST', body: data });
      success.textContent = result.message || 'Thank you! Your message has reached our studio.';
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.reset();
      AG.toast('Message sent — we will reply shortly.', 'success');
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.hidden = false;
    } finally {
      button.disabled = false;
      button.innerHTML = old;
    }
  });
})();
