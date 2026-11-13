/* ==========================================================================
   Arts Book — admin studio script
   ========================================================================== */
(function () {
  'use strict';

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  const state = {
    authed: false,
    view: 'dashboard',
    products: [],
    categories: [],
    orders: [],
    coupons: [],
    messages: [],
    subscribers: [],
    settings: {},
    settingsLoaded: false,
    currentOrder: null,
    loaded: {},
    orderFilters: { q: '', status: '', payment: '', from: '', to: '' },
    productFilters: { q: '', status: 'all' },
  };

  const VIEW_META = {
    dashboard: { eyebrow: 'Studio overview', title: 'Dashboard' },
    orders: { eyebrow: 'Fulfilment', title: 'Orders' },
    products: { eyebrow: 'Catalogue', title: 'Products' },
    reports: { eyebrow: 'Analytics', title: 'Reports' },
    coupons: { eyebrow: 'Promotions', title: 'Coupons' },
    messages: { eyebrow: 'Inbox', title: 'Messages' },
    subscribers: { eyebrow: 'Audience', title: 'Subscribers' },
    settings: { eyebrow: 'Configuration', title: 'Settings' },
  };

  /* ---------------------------------------------------------------- utils */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function money(value) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  function compactMoney(value) {
    const n = Number(value) || 0;
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
    return `₹${Math.round(n)}`;
  }

  function dt(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(date);
  }

  function dtShort(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  function isoDate(d) {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  }

  function todayISO() {
    return isoDate(new Date());
  }

  function daysAgoISO(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return isoDate(d);
  }

  function toast(message, type) {
    const el = $('#adminToast');
    if (!el) return;
    el.textContent = message;
    el.className = `admin-toast ${type || 'success'}`;
    el.hidden = false;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { el.hidden = true; }, 3600);
  }

  function statusChip(status, label) {
    return `<span class="status-chip ${esc(status)}">${esc(label || status)}</span>`;
  }

  function payChip(status) {
    return `<span class="pay-chip ${esc(status)}">${esc(status)}</span>`;
  }

  async function api(path, options) {
    const opts = options || {};
    const config = {
      method: opts.method || 'GET',
      headers: Object.assign({ Accept: 'application/json' }, opts.headers || {}),
      credentials: 'same-origin',
      cache: 'no-store',
    };
    if (opts.body !== undefined) {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(opts.body);
    }

    const response = await fetch(path, config);
    let data = null;
    try {
      data = await response.json();
    } catch (error) {
      data = { ok: false, error: 'The server returned an unexpected response.' };
    }

    if (response.status === 401 && state.authed && path !== '/api/admin/login') {
      showLogin();
      const err = new Error('Your session expired. Please sign in again.');
      err.status = 401;
      throw err;
    }
    if (!response.ok || data.ok === false) {
      const err = new Error((data && data.error) || 'Something went wrong. Please try again.');
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  /* ---------------------------------------------------------------- auth */

  function setLoginBusy(busy) {
    const btn = $('#loginBtn');
    if (!btn) return;
    btn.disabled = busy;
    btn.innerHTML = busy
      ? '<span class="ag-spin" aria-hidden="true"></span><span>Signing in…</span>'
      : '<span>Sign in to studio</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  }

  function showLogin(expired) {
    state.authed = false;
    state.loaded = {};
    const app = $('#adminApp');
    const login = $('#loginScreen');
    if (app) app.hidden = true;
    if (login) login.hidden = false;
    const error = $('#loginError');
    if (error) {
      error.hidden = !expired;
      error.textContent = expired ? 'Your session expired. Please sign in again.' : '';
    }
    const password = $('#adminPassword');
    if (password) {
      password.value = '';
      setTimeout(() => password.focus(), 60);
    }
  }

  function showApp(email) {
    state.authed = true;
    const login = $('#loginScreen');
    const app = $('#adminApp');
    if (login) login.hidden = true;
    if (app) app.hidden = false;
    const emailEl = $('#sidebarEmail');
    if (emailEl && email) emailEl.textContent = email;
    const dateEl = $('#topbarDate');
    if (dateEl) {
      dateEl.textContent = new Intl.DateTimeFormat('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      }).format(new Date());
    }
    if (!location.hash) history.replaceState(null, '', '#dashboard');
    navigate(location.hash.replace('#', '') || 'dashboard', true);
  }

  async function bootAuth() {
    try {
      const data = await api('/api/admin/me');
      if (data.authenticated) {
        showApp(data.email);
      } else {
        showLogin();
      }
    } catch (error) {
      showLogin();
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const error = $('#loginError');
    if (error) error.hidden = true;
    const password = $('#adminPassword').value;
    if (!password) {
      if (error) { error.textContent = 'Please enter the admin password.'; error.hidden = false; }
      return;
    }
    setLoginBusy(true);
    try {
      const data = await api('/api/admin/login', { method: 'POST', body: { password } });
      state.authed = true;
      toast('Welcome back to the studio.');
      showApp(data.email);
    } catch (err) {
      if (error) { error.textContent = err.message; error.hidden = false; }
      const input = $('#adminPassword');
      if (input) { input.focus(); input.select(); }
    } finally {
      setLoginBusy(false);
    }
  }

  async function logout() {
    try {
      await api('/api/admin/logout', { method: 'POST' });
    } catch (error) {
      /* session is cleared client-side regardless */
    }
    showLogin();
    toast('Signed out.');
  }

  /* ---------------------------------------------------------------- navigation */

  function currentViewFromHash() {
    const candidate = (location.hash || '').replace('#', '').trim();
    return VIEW_META[candidate] ? candidate : 'dashboard';
  }

  function setActiveView(view) {
    state.view = view;
    $$('.admin-view').forEach((section) => {
      section.classList.toggle('active', section.dataset.view === view);
    });
    $$('[data-view-link]').forEach((link) => {
      link.classList.toggle('active', link.dataset.viewLink === view);
    });
    const meta = VIEW_META[view] || VIEW_META.dashboard;
    const eyebrow = $('#topbarEyebrow');
    const title = $('#topbarTitle');
    if (eyebrow) eyebrow.textContent = meta.eyebrow;
    if (title) title.textContent = meta.title;
    document.title = `${meta.title} — Arts Book Admin`;
    closeSidebar();
  }

  function navigate(view, force) {
    if (!state.authed) return;
    const target = VIEW_META[view] ? view : 'dashboard';
    setActiveView(target);
    if (!force && state.loaded[target]) return;
    loadView(target);
  }

  async function loadView(view, force) {
    try {
      if (view === 'dashboard') await loadDashboard();
      else if (view === 'orders') await loadOrders();
      else if (view === 'products') await loadProducts();
      else if (view === 'reports') await loadReports();
      else if (view === 'coupons') await loadCoupons();
      else if (view === 'messages') await loadMessages();
      else if (view === 'subscribers') await loadSubscribers();
      else if (view === 'settings') await loadSettings();
      state.loaded[view] = true;
    } catch (error) {
      if (error.status !== 401) toast(error.message, 'error');
    }
  }

  function openSidebar() {
    const sidebar = $('#adminSidebar');
    const backdrop = $('#sidebarBackdrop');
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.hidden = false;
  }

  function closeSidebar() {
    const sidebar = $('#adminSidebar');
    const backdrop = $('#sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.hidden = true;
  }

  /* ---------------------------------------------------------------- dashboard */

  function statCard(opts) {
    return `
      <article class="stat-card ${opts.tone || ''}">
        <div class="stat-top">
          <span class="stat-label">${esc(opts.label)}</span>
          <span class="stat-ico" aria-hidden="true">${opts.icon || '◆'}</span>
        </div>
        <div class="stat-value">${opts.value}</div>
        <div class="stat-foot">${opts.foot || ''}</div>
      </article>`;
  }

  async function loadDashboard() {
    const grid = $('#statGrid');
    if (grid) grid.innerHTML = '<div class="empty-admin" style="grid-column:1/-1"><strong>Loading studio data…</strong><span>One moment.</span></div>';
    const data = await api('/api/admin/stats');
    const s = data.stats;

    if (grid) {
      grid.innerHTML = [
        statCard({
          tone: 'ink',
          label: 'Net revenue',
          icon: '₹',
          value: money(s.revenue),
          foot: `${s.orders} order${s.orders === 1 ? '' : 's'} · ${s.open_orders} open`,
        }),
        statCard({
          label: 'Paid online',
          icon: '✓',
          value: money(s.paid_revenue),
          foot: `Across ${s.customers} customer${s.customers === 1 ? '' : 's'}`,
        }),
        statCard({
          label: 'Catalogue',
          icon: '▥',
          value: String(s.products),
          foot: `${s.low_stock} title${s.low_stock === 1 ? '' : 's'} low on stock`,
        }),
        statCard({
          tone: s.low_stock > 0 ? 'accent' : '',
          label: 'Needs attention',
          icon: '!',
          value: String(s.new_messages),
          foot: `New message${s.new_messages === 1 ? '' : 's'} · ${s.cancelled} cancelled`,
        }),
      ].join('');
    }

    const badgeOrders = $('#badgeOrders');
    if (badgeOrders) {
      badgeOrders.textContent = String(s.open_orders || 0);
      badgeOrders.hidden = !s.open_orders;
    }
    const badgeMessages = $('#badgeMessages');
    if (badgeMessages) {
      badgeMessages.textContent = String(s.new_messages || 0);
      badgeMessages.hidden = !s.new_messages;
    }

    const days = data.byDay || [];
    const max = Math.max(...days.map((d) => Number(d.revenue) || 0), 1);
    const chart = $('#revenueChart');
    if (chart) {
      chart.innerHTML = days.length
        ? days.map((d) => {
            const pct = Math.max(2, Math.round((Number(d.revenue) / max) * 100));
            return `<div class="mini-bar" data-label="${esc(d.day.slice(5))} · ${esc(money(d.revenue))}" title="${esc(d.day)} — ${esc(money(d.revenue))}">
              <span style="height:${pct}%"></span>
            </div>`;
          }).join('')
        : '<div class="empty-admin" style="width:100%;border:0;background:none"><strong>No sales yet</strong><span>Your rhythm chart will appear here.</span></div>';
    }
    const total = days.reduce((sum, d) => sum + (Number(d.revenue) || 0), 0);
    const chartTotal = $('#chartTotal');
    if (chartTotal) chartTotal.innerHTML = `<strong>${esc(money(total))}</strong> total`;
    const revenueTag = $('#revenueTag');
    if (revenueTag) revenueTag.textContent = `${days.length} days`;

    const low = $('#lowStockList');
    if (low) {
      low.innerHTML = (data.lowStockProducts || []).length
        ? data.lowStockProducts.map((p) => `
          <div class="low-stock-item">
            <img class="low-stock-thumb" src="/art/${Number(p.id)}/cover.svg" alt="" loading="lazy" width="34" height="44">
            <div><strong>${esc(p.title)}</strong><span>${esc(money(p.price))} · #${Number(p.id)}</span></div>
            <span class="stock-pill ${p.stock <= 3 ? '' : 'ok'}">${Number(p.stock)} left</span>
          </div>`).join('')
        : '<div class="empty-admin"><strong>Stock looks healthy</strong><span>No active title is below 10 copies.</span></div>';
    }

    const recent = $('#recentOrders');
    if (recent) {
      recent.innerHTML = (data.recent || []).length
        ? data.recent.map((o) => `
          <tr>
            <td><a href="#" class="order-link" data-order-id="${Number(o.id)}">${esc(o.order_no)}</a></td>
            <td><div class="cust-cell"><strong>${esc(o.customer_name)}</strong><span>${esc(o.phone)}</span></div></td>
            <td class="num-cell">${esc(money(o.total))}</td>
            <td>${statusChip(o.status, o.status_label)}</td>
          </tr>`).join('')
        : '<tr><td colspan="4"><div class="empty-admin"><strong>No orders yet</strong><span>New purchases will appear here.</span></div></td></tr>';
    }

    const top = $('#topProducts');
    if (top) {
      const maxUnits = Math.max(...(data.topProducts || []).map((p) => Number(p.units) || 0), 1);
      top.innerHTML = (data.topProducts || []).length
        ? data.topProducts.map((p, i) => `
          <div class="top-product">
            <span class="top-rank">${String(i + 1).padStart(2, '0')}</span>
            <div>
              <strong>${esc(p.title)}</strong>
              <div class="top-track"><span style="width:${Math.max(6, Math.round((Number(p.units) / maxUnits) * 100))}%"></span></div>
            </div>
            <em>${Number(p.units)} sold</em>
          </div>`).join('')
        : '<div class="empty-admin"><strong>No sales data</strong><span>Top sellers will show after the first order.</span></div>';
    }
  }

  /* ---------------------------------------------------------------- products */

  function setOptions(select, items, placeholder) {
    if (!select) return;
    const current = select.value;
    select.innerHTML = (placeholder ? `<option value="">${esc(placeholder)}</option>` : '') +
      items.map((item) => `<option value="${esc(item.value)}">${esc(item.label)}</option>`).join('');
    if (items.some((item) => String(item.value) === current)) select.value = current;
  }

  async function loadProducts() {
    const tbody = $('#productsBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7"><div class="empty-admin"><strong>Loading library…</strong><span>Fetching titles.</span></div></td></tr>';
    const params = new URLSearchParams();
    if (state.productFilters.q) params.set('q', state.productFilters.q);
    if (state.productFilters.status && state.productFilters.status !== 'all') params.set('status', state.productFilters.status);
    const data = await api(`/api/admin/products?${params.toString()}`);
    state.products = data.products || [];
    state.categories = data.categories || [];

    const categorySelect = $('#pCategory');
    if (categorySelect) {
      const current = categorySelect.value;
      categorySelect.innerHTML = state.categories.map((c) => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');
      if (current) categorySelect.value = current;
    }

    const count = $('#productCount');
    if (count) count.textContent = `${state.products.length} title${state.products.length === 1 ? '' : 's'} shown`;
    const tag = $('#productTag');
    if (tag) tag.textContent = state.productFilters.status === 'all' ? 'Full library' : state.productFilters.status;

    if (tbody) {
      tbody.innerHTML = state.products.length
        ? state.products.map((p) => `
          <tr>
            <td>
              <div class="book-cell">
                <img class="book-thumb" src="${esc(p.cover)}" alt="" loading="lazy" width="34" height="44">
                <div><strong>${esc(p.title)}</strong><span>#${Number(p.id)} · ${esc(p.slug)}</span></div>
              </div>
            </td>
            <td>${esc(p.category)}</td>
            <td><span class="num-cell">${esc(money(p.price))}</span><br><span style="font-size:9px;color:var(--muted);text-decoration:line-through">${esc(money(p.mrp))}</span></td>
            <td><span class="stock-pill ${p.stock <= 10 ? '' : 'ok'}">${Number(p.stock)}</span></td>
            <td>${Number(p.rating).toFixed(1)} <span style="color:var(--gold)">★</span></td>
            <td>${p.active ? '<span class="status-chip delivered">Live</span>' : '<span class="status-chip cancelled">Hidden</span>'}</td>
            <td>
              <div class="row-actions">
                <a class="row-btn" href="/product/${encodeURIComponent(p.slug)}" target="_blank" rel="noopener">View</a>
                <button type="button" class="row-btn" data-edit-product="${Number(p.id)}">Edit</button>
                <button type="button" class="row-btn danger" data-delete-product="${Number(p.id)}">Delete</button>
              </div>
            </td>
          </tr>`).join('')
        : '<tr><td colspan="7"><div class="empty-admin"><strong>No products found</strong><span>Try a different search or add a new title.</span></div></td></tr>';
    }
  }

  function openProductModal(product) {
    const form = $('#productForm');
    if (!form) return;
    form.reset();
    const error = $('#productError');
    if (error) error.hidden = true;
    $('#productId').value = product ? product.id : '';

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value == null ? '' : value;
    };
    set('pTitle', product ? product.title : '');
    set('pSlug', product ? product.slug : '');
    set('pCategory', product ? product.category : (state.categories[0] ? state.categories[0].name : ''));
    set('pTheme', product ? product.theme : '');
    set('pPalette', product ? product.palette : 'sunset');
    set('pVariant', product ? product.art_variant : 0);
    set('pMrp', product ? product.mrp : '');
    set('pPrice', product ? product.price : '');
    set('pStock', product ? product.stock : 20);
    set('pPages', product ? product.pages : 25);
    set('pAge', product ? product.age_group : '8+ years');
    set('pBadge', product ? product.badge : '');
    set('pRating', product ? product.rating : 4.8);
    set('pReviews', product ? product.reviews : 0);
    set('pImage', product ? product.image_url : '');
    set('pDescription', product ? product.description : '');
    $('#pFeatured').checked = Boolean(product && product.featured);
    $('#pBestseller').checked = Boolean(product && product.bestseller);
    $('#pActive').checked = product ? Boolean(product.active) : true;

    $('#productModalKicker').textContent = product ? `Editing #${product.id}` : 'New title';
    $('#productModalTitle').textContent = product ? 'Edit product' : 'Add product';
    $('#productSaveBtn').textContent = product ? 'Save changes' : 'Create product';
    openModal('productModal');
    setTimeout(() => $('#pTitle').focus(), 80);
  }

  async function submitProduct(event) {
    event.preventDefault();
    const form = $('#productForm');
    const error = $('#productError');
    if (error) error.hidden = true;
    const fd = new FormData(form);
    const body = {};
    fd.forEach((value, key) => { body[key] = value; });
    body.featured = $('#pFeatured').checked;
    body.bestseller = $('#pBestseller').checked;
    body.active = $('#pActive').checked;

    const id = body.id;
    delete body.id;
    if (Number(body.price) > Number(body.mrp)) {
      if (error) { error.textContent = 'Selling price cannot be greater than MRP.'; error.hidden = false; }
      return;
    }

    const button = $('#productSaveBtn');
    const old = button.textContent;
    button.disabled = true;
    button.textContent = 'Saving…';
    try {
      if (id) {
        await api(`/api/admin/products/${id}`, { method: 'PUT', body });
        toast('Product updated.');
      } else {
        await api('/api/admin/products', { method: 'POST', body });
        toast('Product added to the library.');
      }
      closeModal('productModal');
      state.loaded.dashboard = false;
      await loadProducts();
    } catch (err) {
      if (error) { error.textContent = err.message; error.hidden = false; }
    } finally {
      button.disabled = false;
      button.textContent = old;
    }
  }

  async function deleteProduct(id) {
    const product = state.products.find((p) => Number(p.id) === Number(id));
    const name = product ? product.title : 'this product';
    if (!window.confirm(`Remove “${name}” from the store? Products with past orders are hidden instead of deleted.`)) return;
    try {
      const data = await api(`/api/admin/products/${id}`, { method: 'DELETE' });
      toast(data.message || 'Product removed.', 'success');
      state.loaded.dashboard = false;
      await loadProducts();
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  /* ---------------------------------------------------------------- orders */

  function orderQuery() {
    const params = new URLSearchParams();
    Object.entries(state.orderFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }

  async function loadOrders() {
    const tbody = $('#ordersBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="8"><div class="empty-admin"><strong>Loading orders…</strong><span>Fetching the queue.</span></div></td></tr>';
    const data = await api(`/api/admin/orders?${orderQuery()}`);
    state.orders = data.orders || [];

    const count = $('#orderCount');
    if (count) count.textContent = `${state.orders.length} order${state.orders.length === 1 ? '' : 's'} in this view`;
    const open = state.orders.filter((o) => ['placed', 'confirmed', 'packed'].includes(o.status)).length;
    const tag = $('#orderQueueTag');
    if (tag) tag.textContent = `${open} open`;

    if (!tbody) return;
    tbody.innerHTML = state.orders.length
      ? state.orders.map((o) => `
        <tr>
          <td><a href="#" class="order-link" data-order-id="${Number(o.id)}">${esc(o.order_no)}</a></td>
          <td><div class="cust-cell"><strong>${esc(o.customer_name)}</strong><span>${esc(o.phone)}</span></div></td>
          <td class="date-cell">${esc(dtShort(o.created_at))}</td>
          <td>${esc(o.payment_method === 'cod' ? 'COD' : 'PayU')}</td>
          <td class="num-cell">${esc(money(o.total))}</td>
          <td>${payChip(o.payment_status)}</td>
          <td>${statusChip(o.status, o.status_label)}</td>
          <td>
            <div class="row-actions">
              <button type="button" class="row-btn" data-order-id="${Number(o.id)}">Open</button>
            </div>
          </td>
        </tr>`).join('')
      : '<tr><td colspan="8"><div class="empty-admin"><strong>No orders match</strong><span>Clear the filters to see the full queue.</span></div></td></tr>';
  }

  async function openOrder(id) {
    const body = $('#orderDetail');
    if (!body) return;
    body.innerHTML = '<div class="empty-admin"><strong>Loading order…</strong><span>One moment.</span></div>';
    openModal('orderModal');
    try {
      const data = await api(`/api/admin/orders/${id}`);
      state.currentOrder = data.order;
      renderOrderDetail(data.order);
    } catch (error) {
      body.innerHTML = `<div class="empty-admin"><strong>Could not load this order</strong><span>${esc(error.message)}</span></div>`;
    }
  }

  function renderOrderDetail(order) {
    const body = $('#orderDetail');
    if (!body) return;
    const statuses = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
    const payments = ['pending', 'paid', 'failed', 'refunded'];
    const receiptUrl = order.receipt_key
      ? `/receipt/${encodeURIComponent(order.order_no)}?key=${encodeURIComponent(order.receipt_key)}`
      : `/receipt/${encodeURIComponent(order.order_no)}`;

    $('#orderModalKicker').textContent = order.payment_method === 'cod' ? 'Cash on delivery' : 'Online payment';
    $('#orderModalTitle').textContent = order.order_no;

    body.innerHTML = `
      <div class="order-detail-head">
        <div>
          <h3>${esc(order.order_no)}</h3>
          <p>Placed ${esc(dt(order.created_at))} · ${esc(order.payment_method === 'cod' ? 'Cash on Delivery' : 'PayU online')}</p>
        </div>
        <div class="order-status-row">
          ${statusChip(order.status, order.status_label)}
          ${payChip(order.payment_status)}
        </div>
      </div>

      <div class="order-detail-grid">
        <div class="detail-box">
          <strong class="label">Customer</strong>
          <strong>${esc(order.customer_name)}</strong><br>
          <a href="tel:${esc(order.phone)}">${esc(order.phone)}</a><br>
          <a href="mailto:${esc(order.email)}">${esc(order.email)}</a>
        </div>
        <div class="detail-box">
          <strong class="label">Delivery address</strong>
          ${esc(order.address)}<br>
          ${esc(order.city)}, ${esc(order.state)} ${esc(order.pincode)}
        </div>
      </div>

      ${order.notes ? `<div class="detail-box" style="margin-bottom:18px"><strong class="label">Order notes</strong>${esc(order.notes)}</div>` : ''}

      <table class="order-detail-table">
        <thead><tr><th>Book</th><th class="num">Price</th><th class="num">Qty</th><th class="num">Total</th></tr></thead>
        <tbody>
          ${(order.items || []).map((item) => `
            <tr>
              <td><strong>${esc(item.title)}</strong><br><span style="font-size:9.5px;color:var(--muted)">${esc(item.slug)}</span></td>
              <td class="num">${esc(money(item.price))}</td>
              <td class="num">${Number(item.qty)}</td>
              <td class="num">${esc(money(item.line_total))}</td>
            </tr>`).join('')}
        </tbody>
      </table>

      <div class="order-totals">
        <div class="row"><span>Subtotal</span><span>${esc(money(order.subtotal))}</span></div>
        ${Number(order.discount) > 0 ? `<div class="row"><span>Discount ${order.coupon_code ? `(${esc(order.coupon_code)})` : ''}</span><span>− ${esc(money(order.discount))}</span></div>` : ''}
        <div class="row"><span>Shipping</span><span>${Number(order.shipping) === 0 ? 'FREE' : esc(money(order.shipping))}</span></div>
        ${Number(order.cod_fee) > 0 ? `<div class="row"><span>COD fee</span><span>${esc(money(order.cod_fee))}</span></div>` : ''}
        <div class="row total"><span>Total</span><span>${esc(money(order.total))}</span></div>
      </div>

      <div class="detail-box" style="margin-bottom:18px">
        <strong class="label">Payment reference</strong>
        ${order.payu_txnid ? `PayU txn: ${esc(order.payu_txnid)}${order.payu_mihpayid ? ` · ${esc(order.payu_mihpayid)}` : ''}` : 'No online transaction reference.'}
      </div>

      <div class="order-update">
        <div class="admin-field">
          <label for="orderStatusUpdate">Order status</label>
          <select id="orderStatusUpdate">
            ${statuses.map((s) => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div class="admin-field">
          <label for="orderPaymentUpdate">Payment status</label>
          <select id="orderPaymentUpdate">
            ${payments.map((s) => `<option value="${s}" ${s === order.payment_status ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
          </select>
        </div>
        <button type="button" class="admin-btn admin-btn-accent" id="orderUpdateBtn">Update order</button>
        <a class="admin-btn admin-btn-ghost" href="${esc(receiptUrl)}" target="_blank" rel="noopener">Receipt</a>
      </div>`;

    const updateBtn = $('#orderUpdateBtn');
    if (updateBtn) {
      updateBtn.addEventListener('click', async () => {
        const status = $('#orderStatusUpdate').value;
        const paymentStatus = $('#orderPaymentUpdate').value;
        if (status === 'cancelled' && order.status !== 'cancelled') {
          if (!window.confirm('Cancel this order and release its reserved stock?')) return;
        }
        updateBtn.disabled = true;
        const old = updateBtn.textContent;
        updateBtn.textContent = 'Updating…';
        try {
          const data = await api(`/api/admin/orders/${order.id}`, {
            method: 'PATCH',
            body: { status, payment_status: paymentStatus },
          });
          state.currentOrder = data.order;
          renderOrderDetail(data.order);
          toast('Order updated.');
          state.loaded.dashboard = false;
          await loadOrders();
        } catch (error) {
          toast(error.message, 'error');
          updateBtn.disabled = false;
          updateBtn.textContent = old;
        }
      });
    }
  }

  /* ---------------------------------------------------------------- reports */

  function initReportDates() {
    const from = $('#reportFrom');
    const to = $('#reportTo');
    if (from && !from.value) from.value = daysAgoISO(29);
    if (to && !to.value) to.value = todayISO();
  }

  async function loadReports() {
    initReportDates();
    const fromInput = $('#reportFrom');
    const toInput = $('#reportTo');
    const from = fromInput && fromInput.value ? fromInput.value : daysAgoISO(29);
    const to = toInput && toInput.value ? toInput.value : todayISO();

    const stats = $('#reportStats');
    if (stats) {
      stats.innerHTML = '<div class="empty-admin" style="grid-column:1/-1"><strong>Building report…</strong><span>Crunching the numbers.</span></div>';
    }
    const data = await api(`/api/admin/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    const r = data.report;

    const csv = $('#downloadCsvBtn');
    if (csv) csv.href = `/api/admin/reports.csv?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`;

    if (stats) {
      stats.innerHTML = [
        statCard({ tone: 'ink', label: 'Net revenue', icon: '₹', value: money(r.totals.revenue), foot: `${esc(r.from)} → ${esc(r.to)}` }),
        statCard({ label: 'Orders', icon: '▤', value: String(r.totals.orders), foot: `AOV ${esc(money(r.totals.aov))}` }),
        statCard({ label: 'Units sold', icon: '▥', value: String(r.totals.units), foot: `${esc(money(r.totals.discounts))} discounts` }),
        statCard({ label: 'Gross sales', icon: '◔', value: money(r.totals.gross), foot: `${esc(money(r.totals.shipping))} shipping` }),
      ].join('');
    }

    const bars = $('#reportBars');
    if (bars) {
      if (!r.byDay.length) {
        bars.innerHTML = '<div class="empty-admin" style="width:100%;border:0;background:none"><strong>No sales in this range</strong><span>Try a wider date window.</span></div>';
      } else {
        const max = Math.max(...r.byDay.map((d) => Number(d.revenue) || 0), 1);
        bars.innerHTML = r.byDay.map((d) => {
          const pct = Math.max(2, Math.round((Number(d.revenue) / max) * 100));
          return `<div class="report-bar-wrap" data-label="${esc(d.day.slice(5))} · ${esc(money(d.revenue))} · ${Number(d.orders)} orders">
            <div class="report-bar" style="height:${pct}%"></div>
          </div>`;
        }).join('');
      }
    }
    const axis = $('#reportAxis');
    if (axis) {
      axis.innerHTML = r.byDay.length
        ? `<span>${esc(r.byDay[0].day)}</span><span>${esc(r.byDay[r.byDay.length - 1].day)}</span>`
        : '';
    }

    const statusList = $('#reportStatus');
    if (statusList) {
      const max = Math.max(...r.byStatus.map((s) => Number(s.count) || 0), 1);
      statusList.innerHTML = r.byStatus.length
        ? r.byStatus.map((s) => `
          <div class="donut-row">
            <span>${esc(s.label || s.status)}</span>
            <div class="track"><i style="width:${Math.max(4, Math.round((Number(s.count) / max) * 100))}%"></i></div>
            <em>${Number(s.count)}</em>
          </div>`).join('')
        : '<div class="empty-admin"><strong>No statuses</strong><span>No orders in this range.</span></div>';
    }

    const paymentList = $('#reportPayments');
    if (paymentList) {
      const max = Math.max(...r.byPayment.map((p) => Number(p.count) || 0), 1);
      paymentList.innerHTML = r.byPayment.length
        ? r.byPayment.map((p) => `
          <div class="donut-row payment">
            <span>${esc(p.method === 'cod' ? 'COD' : 'PayU')} · ${esc(p.payment_status)}</span>
            <div class="track"><i style="width:${Math.max(4, Math.round((Number(p.count) / max) * 100))}%"></i></div>
            <em>${Number(p.count)}</em>
          </div>`).join('')
        : '<div class="empty-admin"><strong>No payments</strong><span>No payments in this range.</span></div>';
    }

    const products = $('#reportProducts');
    if (products) {
      products.innerHTML = r.topProducts.length
        ? r.topProducts.map((p) => `<tr><td>${esc(p.title)}</td><td class="num">${Number(p.units)}</td><td class="num">${esc(money(p.revenue))}</td></tr>`).join('')
        : '<tr><td colspan="3"><div class="empty-admin"><strong>No product sales</strong><span>Nothing sold in this range.</span></div></td></tr>';
    }

    const categories = $('#reportCategories');
    if (categories) {
      categories.innerHTML = r.byCategory.length
        ? r.byCategory.map((c) => `<tr><td>${esc(c.category)}</td><td class="num">${Number(c.units)}</td><td class="num">${esc(money(c.revenue))}</td></tr>`).join('')
        : '<tr><td colspan="3"><div class="empty-admin"><strong>No category sales</strong><span>Nothing sold in this range.</span></div></td></tr>';
    }
  }

  /* ---------------------------------------------------------------- coupons */

  async function loadCoupons() {
    const tbody = $('#couponsBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7"><div class="empty-admin"><strong>Loading coupons…</strong><span>One moment.</span></div></td></tr>';
    const data = await api('/api/admin/coupons');
    state.coupons = data.coupons || [];
    if (!tbody) return;
    tbody.innerHTML = state.coupons.length
      ? state.coupons.map((c) => `
        <tr>
          <td><strong style="letter-spacing:.04em">${esc(c.code)}</strong></td>
          <td>${c.type === 'percent' ? 'Percentage' : 'Flat amount'}</td>
          <td class="num-cell">${c.type === 'percent' ? `${Number(c.value)}%` : esc(money(c.value))}</td>
          <td class="num-cell">${Number(c.min_order) ? esc(money(c.min_order)) : '—'}</td>
          <td class="num-cell">${Number(c.max_discount) ? esc(money(c.max_discount)) : 'No cap'}</td>
          <td>${c.active ? '<span class="status-chip delivered">Active</span>' : '<span class="status-chip cancelled">Paused</span>'}</td>
          <td>
            <div class="row-actions">
              <button type="button" class="row-btn" data-edit-coupon="${Number(c.id)}">Edit</button>
              <button type="button" class="row-btn danger" data-delete-coupon="${Number(c.id)}">Delete</button>
            </div>
          </td>
        </tr>`).join('')
      : '<tr><td colspan="7"><div class="empty-admin"><strong>No coupons</strong><span>Create your first discount code.</span></div></td></tr>';
  }

  function openCouponModal(coupon) {
    const form = $('#couponForm');
    if (!form) return;
    form.reset();
    const error = $('#couponError');
    if (error) error.hidden = true;
    $('#couponId').value = coupon ? coupon.id : '';
    $('#cCode').value = coupon ? coupon.code : '';
    $('#cType').value = coupon ? coupon.type : 'percent';
    $('#cValue').value = coupon ? coupon.value : '';
    $('#cMin').value = coupon ? coupon.min_order : 0;
    $('#cMax').value = coupon ? coupon.max_discount : 0;
    $('#cActive').checked = coupon ? Boolean(coupon.active) : true;
    $('#couponModalTitle').textContent = coupon ? 'Edit coupon' : 'New coupon';
    $('#couponSaveBtn').textContent = coupon ? 'Save changes' : 'Create coupon';
    openModal('couponModal');
    setTimeout(() => $('#cCode').focus(), 80);
  }

  async function submitCoupon(event) {
    event.preventDefault();
    const form = $('#couponForm');
    const error = $('#couponError');
    if (error) error.hidden = true;
    const fd = new FormData(form);
    const body = {};
    fd.forEach((value, key) => { body[key] = value; });
    body.active = $('#cActive').checked;
    const id = body.id;
    delete body.id;

    const button = $('#couponSaveBtn');
    const old = button.textContent;
    button.disabled = true;
    button.textContent = 'Saving…';
    try {
      if (id) {
        await api(`/api/admin/coupons/${id}`, { method: 'PUT', body });
        toast('Coupon updated.');
      } else {
        await api('/api/admin/coupons', { method: 'POST', body });
        toast('Coupon created.');
      }
      closeModal('couponModal');
      await loadCoupons();
    } catch (err) {
      if (error) { error.textContent = err.message; error.hidden = false; }
    } finally {
      button.disabled = false;
      button.textContent = old;
    }
  }

  async function deleteCoupon(id) {
    if (!window.confirm('Delete this coupon code? It will stop working immediately.')) return;
    try {
      await api(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      toast('Coupon deleted.');
      await loadCoupons();
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  /* ---------------------------------------------------------------- messages */

  async function loadMessages() {
    const list = $('#messagesList');
    if (list) list.innerHTML = '<div class="empty-admin" style="grid-column:1/-1"><strong>Loading messages…</strong><span>Opening the inbox.</span></div>';
    const data = await api('/api/admin/messages');
    state.messages = data.messages || [];
    const unread = state.messages.filter((m) => m.status === 'new').length;
    const tag = $('#messageTag');
    if (tag) tag.textContent = `${unread} unread`;
    const badge = $('#badgeMessages');
    if (badge) {
      badge.textContent = String(unread);
      badge.hidden = !unread;
    }
    if (!list) return;
    list.innerHTML = state.messages.length
      ? state.messages.map((m) => `
        <article class="message-card ${m.status === 'new' ? 'unread' : ''}">
          <div class="message-top">
            <div>
              <strong>${esc(m.name)}</strong>
              <span>${esc(m.email)}${m.phone ? ` · ${esc(m.phone)}` : ''}</span>
            </div>
            ${m.status === 'new' ? '<span class="message-badge">New</span>' : ''}
          </div>
          <div class="message-subject">${esc(m.subject || 'General enquiry')}</div>
          <div class="message-body">${esc(m.message)}</div>
          <div class="message-foot">
            <span>${esc(dt(m.created_at))}</span>
            <div class="row-actions">
              <a class="row-btn" href="mailto:${esc(m.email)}">Reply</a>
              ${m.status === 'new' ? `<button type="button" class="row-btn" data-read-message="${Number(m.id)}">Mark read</button>` : ''}
            </div>
          </div>
        </article>`).join('')
      : '<div class="empty-admin" style="grid-column:1/-1"><strong>Inbox is empty</strong><span>Contact form enquiries will show up here.</span></div>';
  }

  async function markMessageRead(id) {
    try {
      await api(`/api/admin/messages/${id}`, { method: 'PATCH', body: { status: 'read' } });
      const message = state.messages.find((m) => Number(m.id) === Number(id));
      if (message) message.status = 'read';
      await loadMessages();
      toast('Marked as read.');
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  /* ---------------------------------------------------------------- subscribers */

  async function loadSubscribers() {
    const tbody = $('#subscribersBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="4"><div class="empty-admin"><strong>Loading subscribers…</strong><span>One moment.</span></div></td></tr>';
    const data = await api('/api/admin/subscribers');
    state.subscribers = data.subscribers || [];
    const count = $('#subscriberCount');
    if (count) count.textContent = `${state.subscribers.length} subscriber${state.subscribers.length === 1 ? '' : 's'} on the list`;
    if (!tbody) return;
    tbody.innerHTML = state.subscribers.length
      ? state.subscribers.map((s) => `
        <tr>
          <td><strong>${esc(s.email)}</strong></td>
          <td>Website newsletter</td>
          <td class="date-cell">${esc(dtShort(s.created_at))}</td>
          <td><span class="status-chip delivered">Subscribed</span></td>
        </tr>`).join('')
      : '<tr><td colspan="4"><div class="empty-admin"><strong>No subscribers yet</strong><span>The footer newsletter form feeds this list.</span></div></td></tr>';
  }

  function exportSubscribers() {
    if (!state.subscribers.length) {
      toast('There are no subscribers to export.', 'error');
      return;
    }
    const lines = [['Email', 'Joined']].concat(
      state.subscribers.map((s) => [s.email, s.created_at])
    );
    const csv = lines
      .map((row) => row.map((value) => `"${String(value == null ? '' : value).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `art-guru-subscribers-${todayISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  /* ---------------------------------------------------------------- settings */

  async function loadSettings() {
    const data = await api('/api/admin/settings');
    state.settings = data.settings || {};
    state.settingsLoaded = true;
    const form = $('#settingsForm');
    if (!form) return;
    Object.entries(state.settings).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field && field.type !== 'submit' && field.type !== 'button') field.value = value == null ? '' : value;
    });
    const saved = $('#settingsSavedAt');
    if (saved) saved.textContent = 'Changes apply to the live storefront immediately.';
  }

  async function submitSettings(event) {
    event.preventDefault();
    const form = $('#settingsForm');
    const fd = new FormData(form);
    const body = {};
    fd.forEach((value, key) => { body[key] = value; });
    const buttons = $$('button[type="submit"]', form).concat($$('button[form="settingsForm"]'));
    buttons.forEach((b) => { b.disabled = true; });
    try {
      const data = await api('/api/admin/settings', { method: 'PUT', body });
      state.settings = data.settings || state.settings;
      toast('Settings saved. Storefront updated.');
      const saved = $('#settingsSavedAt');
      if (saved) {
        saved.textContent = `Saved at ${new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date())}.`;
      }
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      buttons.forEach((b) => { b.disabled = false; });
    }
  }

  /* ---------------------------------------------------------------- modals */

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('no-scroll');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = true;
    if (!$$('.admin-modal:not([hidden])').length) document.body.classList.remove('no-scroll');
  }

  function closeTopModal() {
    const open = $$('.admin-modal:not([hidden])').pop();
    if (open) closeModal(open.id);
  }

  /* ---------------------------------------------------------------- wiring */

  function wireEvents() {
    $('#loginForm').addEventListener('submit', handleLogin);
    const passwordToggle = $('#passwordToggle');
    if (passwordToggle) {
      passwordToggle.addEventListener('click', () => {
        const input = $('#adminPassword');
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        passwordToggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      });
    }

    const logoutBtn = $('#logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const menuToggle = $('#menuToggle');
    if (menuToggle) menuToggle.addEventListener('click', openSidebar);
    const backdrop = $('#sidebarBackdrop');
    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    window.addEventListener('hashchange', () => {
      if (state.authed) navigate(currentViewFromHash());
    });

    const refreshBtn = $('#refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        state.loaded = {};
        navigate(state.view, true);
        toast('Refreshed.');
      });
    }

    // dashboard order links
    $('#viewDashboard').addEventListener('click', (event) => {
      const link = event.target.closest('[data-order-id]');
      if (!link) return;
      event.preventDefault();
      openOrder(Number(link.dataset.orderId));
    });

    // orders
    const orderFilters = $('#orderFilters');
    if (orderFilters) {
      orderFilters.addEventListener('submit', (event) => {
        event.preventDefault();
        const fd = new FormData(orderFilters);
        state.orderFilters = {
          q: String(fd.get('q') || '').trim(),
          status: String(fd.get('status') || ''),
          payment: String(fd.get('payment') || ''),
          from: String(fd.get('from') || ''),
          to: String(fd.get('to') || ''),
        };
        loadOrders().catch((error) => toast(error.message, 'error'));
      });
      orderFilters.addEventListener('reset', () => {
        setTimeout(() => {
          state.orderFilters = { q: '', status: '', payment: '', from: '', to: '' };
          loadOrders().catch((error) => toast(error.message, 'error'));
        }, 0);
      });
    }
    $('#viewOrders').addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-order-id]');
      if (!trigger) return;
      event.preventDefault();
      openOrder(Number(trigger.dataset.orderId));
    });

    // products
    const addProduct = $('#addProductBtn');
    if (addProduct) addProduct.addEventListener('click', () => openProductModal(null));
    const productFilters = $('#productFilters');
    if (productFilters) {
      productFilters.addEventListener('submit', (event) => {
        event.preventDefault();
        const fd = new FormData(productFilters);
        state.productFilters = {
          q: String(fd.get('q') || '').trim(),
          status: String(fd.get('status') || 'all'),
        };
        loadProducts().catch((error) => toast(error.message, 'error'));
      });
      productFilters.addEventListener('reset', () => {
        setTimeout(() => {
          state.productFilters = { q: '', status: 'all' };
          loadProducts().catch((error) => toast(error.message, 'error'));
        }, 0);
      });
    }
    $('#viewProducts').addEventListener('click', (event) => {
      const edit = event.target.closest('[data-edit-product]');
      if (edit) {
        const product = state.products.find((p) => Number(p.id) === Number(edit.dataset.editProduct));
        if (product) openProductModal(product);
        return;
      }
      const del = event.target.closest('[data-delete-product]');
      if (del) deleteProduct(Number(del.dataset.deleteProduct));
    });
    $('#productForm').addEventListener('submit', submitProduct);
    const categorySelect = $('#pCategory');
    if (categorySelect) {
      categorySelect.addEventListener('change', () => {
        const themeInput = $('#pTheme');
        const cat = state.categories.find((c) => c.name === categorySelect.value);
        if (themeInput && !themeInput.value && cat) themeInput.value = cat.theme || '';
      });
    }

    // reports
    const reportFilters = $('#reportFilters');
    if (reportFilters) {
      reportFilters.addEventListener('submit', (event) => {
        event.preventDefault();
        state.loaded.reports = false;
        loadReports().catch((error) => toast(error.message, 'error'));
      });
    }

    // coupons
    const addCoupon = $('#addCouponBtn');
    if (addCoupon) addCoupon.addEventListener('click', () => openCouponModal(null));
    $('#viewCoupons').addEventListener('click', (event) => {
      const edit = event.target.closest('[data-edit-coupon]');
      if (edit) {
        const coupon = state.coupons.find((c) => Number(c.id) === Number(edit.dataset.editCoupon));
        if (coupon) openCouponModal(coupon);
        return;
      }
      const del = event.target.closest('[data-delete-coupon]');
      if (del) deleteCoupon(Number(del.dataset.deleteCoupon));
    });
    $('#couponForm').addEventListener('submit', submitCoupon);

    // messages
    $('#viewMessages').addEventListener('click', (event) => {
      const read = event.target.closest('[data-read-message]');
      if (read) markMessageRead(Number(read.dataset.readMessage));
    });

    // subscribers
    const exportBtn = $('#exportSubscribersBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportSubscribers);

    // settings
    $('#settingsForm').addEventListener('submit', submitSettings);

    // modals
    document.addEventListener('click', (event) => {
      const closer = event.target.closest('[data-close-modal]');
      if (closer) {
        event.preventDefault();
        closeModal(closer.dataset.closeModal);
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeTopModal();
        closeSidebar();
      }
    });
  }

  /* ---------------------------------------------------------------- boot */

  function boot() {
    wireEvents();
    const dateEl = $('#topbarDate');
    if (dateEl) {
      dateEl.textContent = new Intl.DateTimeFormat('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      }).format(new Date());
    }
    initReportDates();
    bootAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
