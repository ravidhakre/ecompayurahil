/* ==========================================================================
   Arts Book — shared storefront script
   ========================================================================== */
(function () {
  'use strict';

  const AG = (window.AG = window.AG || {});
  const SETTINGS = (window.AG_SETTINGS = window.AG_SETTINGS || {});
  AG.settings = SETTINGS;

  const CART_KEY = 'ag_cart_v1';
  const COUPON_KEY = 'ag_coupon_v1';
  const WISH_KEY = 'ag_wishlist_v1';
  const MAX_QTY = 10;

  /* ---------------------------------------------------------------- basics */

  AG.esc = function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  AG.money = function money(value) {
    const n = Math.round(Number(value) || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);
  };

  AG.debounce = function debounce(fn, wait) {
    let timer;
    return function debounced() {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  AG.stars = function stars(rating) {
    const r = Number(rating) || 0;
    const full = Math.round(r);
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  };

  AG.query = function query(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  };

  AG.api = async function api(path, options) {
    const opts = options || {};
    const config = {
      method: opts.method || 'GET',
      headers: Object.assign({ Accept: 'application/json' }, opts.headers || {}),
      credentials: 'same-origin',
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
    if (!response.ok || data.ok === false) {
      const err = new Error(data.error || 'Something went wrong. Please try again.');
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  };

  /* ---------------------------------------------------------------- storage */

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* storage can be unavailable in private mode */
    }
  }

  AG.getCart = function getCart() {
    const items = readJson(CART_KEY, []);
    return Array.isArray(items) ? items.filter((item) => item && item.slug) : [];
  };

  AG.setCart = function setCart(items) {
    writeJson(CART_KEY, Array.isArray(items) ? items : []);
    AG.updateCartCount();
    document.dispatchEvent(new CustomEvent('ag:cart-changed', { detail: AG.getCart() }));
  };

  AG.cartCount = function cartCount() {
    return AG.getCart().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  };

  AG.cartSubtotal = function cartSubtotal() {
    return AG.getCart().reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  };

  AG.updateCartCount = function updateCartCount() {
    const count = AG.cartCount();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = String(count);
      el.classList.toggle('is-empty', count === 0);
    });
  };

  AG.snapshotProduct = function snapshotProduct(product) {
    return {
      slug: product.slug,
      title: product.title,
      price: Number(product.price) || 0,
      mrp: Number(product.mrp) || 0,
      cover: product.cover || product.image_url || '',
      category: product.category || '',
      stock: Number(product.stock) || 0,
      pages: Number(product.pages) || 0,
    };
  };

  AG.addToCart = function addToCart(product, qty) {
    const quantity = Math.max(1, Math.min(MAX_QTY, Number(qty) || 1));
    const items = AG.getCart();
    const found = items.find((item) => item.slug === product.slug);
    const limit = Math.max(1, Math.min(MAX_QTY, Number(product.stock) || MAX_QTY));
    if (found) {
      found.qty = Math.min(limit, Number(found.qty) + quantity);
      found.price = Number(product.price) || found.price;
      found.mrp = Number(product.mrp) || found.mrp;
      found.stock = Number(product.stock) || found.stock;
      found.cover = product.cover || found.cover;
    } else {
      items.push(Object.assign(AG.snapshotProduct(product), { qty: Math.min(limit, quantity) }));
    }
    AG.setCart(items);
    AG.toast(`${product.title} added to your cart`, 'success');
    return AG.cartCount();
  };

  AG.addToCartBySlug = async function addToCartBySlug(slug, qty, button) {
    if (!slug) return;
    if (button) {
      button.disabled = true;
      const old = button.innerHTML;
      button.dataset.oldHtml = old;
      button.innerHTML = '<span class="btn-spinner"></span> Adding…';
    }
    try {
      const data = await AG.api(`/api/products/${encodeURIComponent(slug)}`);
      AG.addToCart(data.product, qty || 1);
    } catch (error) {
      AG.toast(error.message, 'error');
    } finally {
      if (button) {
        button.disabled = false;
        if (button.dataset.oldHtml) button.innerHTML = button.dataset.oldHtml;
      }
    }
  };

  AG.updateQty = function updateQty(slug, qty) {
    const items = AG.getCart();
    const item = items.find((entry) => entry.slug === slug);
    if (!item) return;
    const next = Math.max(0, Math.min(MAX_QTY, Number(qty) || 0));
    if (next === 0) {
      AG.setCart(items.filter((entry) => entry.slug !== slug));
      return;
    }
    item.qty = next;
    AG.setCart(items);
  };

  AG.removeFromCart = function removeFromCart(slug) {
    AG.setCart(AG.getCart().filter((item) => item.slug !== slug));
  };

  AG.clearCart = function clearCart() {
    AG.setCart([]);
  };

  AG.getCoupon = function getCoupon() {
    const code = readJson(COUPON_KEY, '');
    return typeof code === 'string' ? code : '';
  };

  AG.setCoupon = function setCoupon(code) {
    if (code) writeJson(COUPON_KEY, String(code).trim().toUpperCase());
    else localStorage.removeItem(COUPON_KEY);
  };

  AG.clearCoupon = function clearCoupon() {
    localStorage.removeItem(COUPON_KEY);
  };

  AG.getWishlist = function getWishlist() {
    const list = readJson(WISH_KEY, []);
    return Array.isArray(list) ? list : [];
  };

  AG.toggleWishlist = function toggleWishlist(slug) {
    const list = AG.getWishlist();
    const idx = list.indexOf(slug);
    let added = false;
    if (idx === -1) {
      list.push(slug);
      added = true;
    } else {
      list.splice(idx, 1);
    }
    writeJson(WISH_KEY, list);
    document.querySelectorAll(`[data-wish="${slug}"]`).forEach((btn) => {
      btn.classList.toggle('active', added);
      btn.setAttribute('aria-pressed', String(added));
    });
    AG.toast(added ? 'Saved to your wishlist' : 'Removed from your wishlist', 'success');
    return added;
  };

  AG.awish = function isWished(slug) {
    return AG.getWishlist().indexOf(slug) !== -1;
  };

  /* ---------------------------------------------------------------- toasts */

  AG.toast = function toast(message, type) {
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return;
    const node = document.createElement('div');
    node.className = `toast ${type || ''}`.trim();
    const icon = type === 'success' ? '✓' : type === 'error' ? '!' : '✦';
    node.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span><span>${AG.esc(message)}</span>`;
    wrap.appendChild(node);
    setTimeout(() => {
      node.classList.add('hide');
      setTimeout(() => node.remove(), 340);
    }, 4200);
  };

  /* ---------------------------------------------------------------- product cards */

  AG.productCard = function productCard(product, options) {
    const opts = options || {};
    const wished = AG.awish(product.slug);
    const out = Number(product.stock) <= 0;
    const badge = out
      ? '<span class="product-badge sale">Sold out</span>'
      : product.badge
        ? `<span class="product-badge">${AG.esc(product.badge)}</span>`
        : product.discount
          ? `<span class="product-badge sale">${product.discount}% off</span>`
          : '';
    return `
      <article class="product-card ${opts.className || ''}" data-product="${AG.esc(product.slug)}">
        <div class="product-media">
          <a href="/product/${encodeURIComponent(product.slug)}" aria-label="View ${AG.esc(product.title)}">
            <img src="${AG.esc(product.cover)}" alt="${AG.esc(product.title)} colouring book cover" loading="lazy" width="600" height="800">
          </a>
          ${badge}
          <button class="product-wish ${wished ? 'active' : ''}" type="button" data-wish="${AG.esc(product.slug)}" aria-label="Save ${AG.esc(product.title)} to wishlist" aria-pressed="${wished}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
          </button>
          <button class="quick-add" type="button" data-add-to-cart="${AG.esc(product.slug)}" ${out ? 'disabled' : ''}>
            ${out ? 'Out of stock' : 'Quick add'}
          </button>
        </div>
        <div class="product-info">
          <span class="product-cat">${AG.esc(product.category || '')}</span>
          <h3 class="product-title"><a href="/product/${encodeURIComponent(product.slug)}">${AG.esc(product.title)}</a></h3>
          <div class="product-rating"><span class="stars">${AG.stars(product.rating)}</span><span>${Number(product.rating).toFixed(1)} · ${product.reviews || 0} reviews</span></div>
          <div class="product-price">
            <strong>${AG.money(product.price)}</strong>
            <s>${AG.money(product.mrp)}</s>
            ${product.discount ? `<span class="off">${product.discount}% off</span>` : ''}
          </div>
          ${Number(product.stock) > 0 && Number(product.stock) <= 10 ? `<p class="product-stock-low">Only ${product.stock} left</p>` : ''}
        </div>
      </article>`;
  };

  AG.skeletonCards = function skeletonCards(count) {
    return Array.from({ length: count || 4 }).map(() => `
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton-media shimmer"></div>
        <div class="skeleton-line shimmer"></div>
        <div class="skeleton-line short shimmer"></div>
      </div>`).join('');
  };

  /* ---------------------------------------------------------------- init */

  function initHeader() {
    const header = document.getElementById('siteHeader');
    const onScroll = () => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 8);
      const back = document.getElementById('backToTop');
      if (back) back.classList.toggle('show', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const navToggle = document.getElementById('navToggle');
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('drawerBackdrop');
    const drawerClose = document.getElementById('drawerClose');

    function setDrawer(open) {
      if (!drawer || !backdrop) return;
      drawer.classList.toggle('open', open);
      backdrop.classList.toggle('open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      if (navToggle) navToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('no-scroll', open);
    }

    if (navToggle) navToggle.addEventListener('click', () => setDrawer(true));
    if (drawerClose) drawerClose.addEventListener('click', () => setDrawer(false));
    if (backdrop) backdrop.addEventListener('click', () => setDrawer(false));

    const searchToggle = document.getElementById('searchToggle');
    const searchPanel = document.getElementById('searchPanel');
    const searchClose = document.getElementById('searchClose');

    function setSearch(open) {
      if (!searchPanel) return;
      searchPanel.hidden = !open;
      if (searchToggle) searchToggle.setAttribute('aria-expanded', String(open));
      if (open) {
        const input = document.getElementById('headerSearch');
        if (input) setTimeout(() => input.focus(), 80);
      }
    }

    if (searchToggle) searchToggle.addEventListener('click', () => setSearch(searchPanel.hidden));
    if (searchClose) searchClose.addEventListener('click', () => setSearch(false));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setSearch(false);
        setDrawer(false);
      }
      if (event.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        event.preventDefault();
        setSearch(true);
      }
    });

    const back = document.getElementById('backToTop');
    if (back) back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const path = window.location.pathname;
    const activeMap = {
      '/shop': 'shop',
      '/collections': 'shop',
      '/about': 'about',
      '/contact': 'contact',
      '/track-order': 'track',
    };
    let active = activeMap[path] || (path === '/' ? 'home' : '');
    if (path === '/shop' && AG.query('sort') === 'newest') active = 'new';
    document.querySelectorAll('[data-nav]').forEach((link) => {
      link.classList.toggle('active', link.dataset.nav === active);
    });

    document.querySelectorAll('.product-wish').forEach((btn) => {
      btn.classList.toggle('active', AG.awish(btn.dataset.wish));
    });
  }

  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  async function initNewsletters() {
    document.querySelectorAll('[data-newsletter-form]').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = String(new FormData(form).get('email') || '').trim();
        const note = form.querySelector('[data-form-note]');
        const button = form.querySelector('button[type="submit"]');
        if (!email) return;
        if (button) button.disabled = true;
        try {
          const data = await AG.api('/api/newsletter', { method: 'POST', body: { email } });
          if (note) note.textContent = data.message || 'You are on the list.';
          form.reset();
          AG.toast(data.message || 'Subscribed successfully', 'success');
        } catch (error) {
          if (note) note.textContent = error.message;
          AG.toast(error.message, 'error');
        } finally {
          if (button) button.disabled = false;
        }
      });
    });
  }

  function initGlobalActions() {
    document.addEventListener('click', (event) => {
      const wish = event.target.closest('[data-wish]');
      if (wish) {
        event.preventDefault();
        AG.toggleWishlist(wish.dataset.wish);
        return;
      }

      const add = event.target.closest('[data-add-to-cart]');
      if (add && !add.disabled) {
        event.preventDefault();
        const qtyEl = document.getElementById('qtyInput');
        const qty = qtyEl && qtyEl.closest('[data-product-page]') ? qtyEl.value : 1;
        AG.addToCartBySlug(add.getAttribute('data-add-to-cart'), qty, add);
      }
    });
  }

  function init() {
    initHeader();
    initReveal();
    initNewsletters();
    initGlobalActions();
    AG.updateCartCount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
