(function () {
  'use strict';

  const AG = window.AG;
  const slug = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() || '');
  const $ = (id) => document.getElementById(id);

  let product = null;
  let gallery = [];
  let galleryIndex = 0;
  let qty = 1;

  const REVIEWS = [
    {
      name: 'Ananya S.',
      city: 'Agra',
      initials: 'AS',
      text: 'The paper quality genuinely surprised me. Fine-liners, gel pens, even a light watercolour wash — no ghosting on the next page. The illustrations are gorgeous.',
    },
    {
      name: 'Rohit K.',
      city: 'Pune',
      initials: 'RK',
      text: 'Bought this as a gift and ended up ordering one for myself. Clean lines, lovely detail and it lies flat while you work. Exactly what a colouring book should be.',
    },
    {
      name: 'Meera P.',
      city: 'Mumbai',
      initials: 'MP',
      text: 'My evening ritual now: chai, a podcast and one page. The designs hit that sweet spot between relaxing and interesting. Already eyeing my next Arts Book book.',
    },
  ];

  function err(message) {
    const container = document.querySelector('main .container');
    if (!container) return;
    container.innerHTML = `
      <div class="empty-state" style="margin:60px 0">
        <div style="font-size:48px;margin-bottom:12px">🎨</div>
        <h2>We lost that page</h2>
        <p>${AG.esc(message)}</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <a class="btn btn-ink" href="/shop">Browse all books</a>
          <a class="btn btn-outline" href="/">Back home</a>
        </div>
      </div>`;
  }

  function pad(num) {
    return String(num).padStart(4, '0');
  }

  function categorySlug(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function renderGallery() {
    const mainImage = $('mainImage');
    const thumbRow = $('thumbRow');
    mainImage.querySelector('img').src = gallery[0].src;
    mainImage.querySelector('img').alt = gallery[0].alt;
    mainImage.querySelector('img').removeAttribute('style');
    mainImage.querySelector('.img-tag').textContent = gallery[0].label;
    thumbRow.innerHTML = gallery
      .map(
        (item, index) => `
        <button type="button" class="thumb ${index === 0 ? 'active' : ''}" data-gallery-index="${index}" aria-label="View ${AG.esc(item.label)}">
          <img src="${AG.esc(item.src)}" alt="${AG.esc(item.alt)}" loading="lazy" width="600" height="800">
        </button>`
      )
      .join('');

    thumbRow.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-gallery-index]');
      if (!btn) return;
      selectGallery(Number(btn.dataset.galleryIndex));
    });

    mainImage.addEventListener('click', () => openLightbox(galleryIndex));
    mainImage.style.cursor = 'zoom-in';
  }

  function selectGallery(index) {
    if (!gallery[index]) return;
    galleryIndex = index;
    const mainImage = $('mainImage');
    mainImage.querySelector('img').src = gallery[index].src;
    mainImage.querySelector('img').alt = gallery[index].alt;
    mainImage.querySelector('.img-tag').textContent = gallery[index].label;
    document.querySelectorAll('.thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }

  function openLightbox(index) {
    galleryIndex = Math.max(0, Math.min(gallery.length - 1, Number(index) || 0));
    const box = $('lightbox');
    box.hidden = false;
    document.body.classList.add('no-scroll');
    updateLightbox();
  }

  function closeLightbox() {
    $('lightbox').hidden = true;
    document.body.classList.remove('no-scroll');
  }

  function updateLightbox() {
    const item = gallery[galleryIndex];
    if (!item) return;
    $('lightboxImg').src = item.src;
    $('lightboxImg').alt = item.alt;
    $('lightboxCaption').textContent = item.label;
  }

  function shiftLightbox(delta) {
    galleryIndex = (galleryIndex + delta + gallery.length) % gallery.length;
    updateLightbox();
  }

  function renderProduct() {
    document.title = `${product.title} — Arts Book`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', `${product.title}. ${String(product.description || '').slice(0, 150)}`);

    $('productCrumb').textContent = product.title;
    $('productCategory').innerHTML = `<a href="/shop?category=${encodeURIComponent(categorySlug(product.category))}" style="color:inherit">${AG.esc(product.category)}</a>`;
    $('productTitle').textContent = product.title;
    $('productStars').textContent = AG.stars(product.rating);
    $('productRating').textContent = `${Number(product.rating).toFixed(1)} · ${product.reviews || 0} verified reviews`;
    $('productPrice').textContent = AG.money(product.price);
    $('productMrp').textContent = AG.money(product.mrp);
    $('productOff').textContent = product.discount ? `Save ${product.discount}%` : 'Studio price';
    $('productDesc').textContent = product.description;
    $('productPages').textContent = `${product.pages} pages`;
    $('productAge').textContent = product.age_group;
    $('skuText').textContent = `SKU AG-${pad(product.id)}`;

    const stockPill = $('stockPill');
    stockPill.classList.remove('low', 'out');
    if (product.stock <= 0) {
      stockPill.classList.add('out');
      stockPill.textContent = 'Sold out';
    } else if (product.stock <= 10) {
      stockPill.classList.add('low');
      stockPill.textContent = `Only ${product.stock} left in stock`;
    } else {
      stockPill.textContent = 'In stock · ready to ship';
    }

    const addBtn = $('addToCartBtn');
    const buyBtn = $('buyNowBtn');
    const mbbAdd = $('mbbAdd');
    if (product.stock <= 0) {
      [addBtn, buyBtn, mbbAdd].forEach((btn) => {
        btn.disabled = true;
        btn.textContent = 'Sold out';
      });
    }
    const maxQty = Math.max(1, Math.min(10, product.stock || 1));
    $('qtyInput').max = String(maxQty);

    $('insideBookTitle').textContent = product.title;
    $('mbbTitle').textContent = product.title;
    $('mbbPrice').textContent = AG.money(product.price);

    const wished = AG.awish(product.slug);
    const wishBtn = $('wishBtn');
    wishBtn.classList.toggle('active', wished);
    wishBtn.setAttribute('aria-pressed', String(wished));
    wishBtn.lastChild.textContent = wished ? ' Saved to wishlist' : ' Save for later';

    const ratingSummary = $('ratingSummary');
    if (ratingSummary) {
      ratingSummary.innerHTML = `<span class="rating-big">${Number(product.rating).toFixed(1)}</span><span class="stars">${AG.stars(product.rating)}</span><span class="muted small">${product.reviews || 0} reviews</span>`;
    }

    $('productReviews').innerHTML = REVIEWS.map(
      (review, i) => `
      <article class="testimonial-card ${i === 1 ? 'reveal reveal-delay-1' : i === 2 ? 'reveal reveal-delay-2' : 'reveal'}">
        <div class="testimonial-stars" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote>“${AG.esc(review.text)}”</blockquote>
        <div class="testimonial-author">
          <span class="author-avatar" aria-hidden="true">${review.initials}</span>
          <div><strong>${review.name}</strong><span>${review.city} · Verified buyer</span></div>
        </div>
      </article>`
    ).join('');

    renderInside();
    renderRelated();
  }

  function renderInside() {
    const grid = $('insideGrid');
    const pages = Array.from({ length: 25 }, (_, i) => i + 1);
    $('insidePageCount').textContent = `${pages.length} previews`;
    grid.innerHTML = pages
      .map(
        (page, i) => `
        <button type="button" class="inside-preview" data-gallery-index="${i + 1}" aria-label="View inside page ${page}">
          <img src="/art/${product.id}/page/${page}.svg" alt="${AG.esc(product.title)} inside colouring page ${page}" loading="lazy" width="600" height="800">
          <span>Page ${page}</span>
        </button>`
      )
      .join('');
    grid.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-gallery-index]');
      if (btn) openLightbox(Number(btn.dataset.galleryIndex));
    });
  }

  function renderRelated() {
    const grid = $('relatedGrid');
    const related = (product.related || []).slice(0, 4);
    if (!related.length) {
      $('relatedSection').hidden = true;
      return;
    }
    grid.innerHTML = related.map((item) => AG.productCard(item)).join('');
  }

  function initQty() {
    $('qtyMinus').addEventListener('click', () => {
      qty = Math.max(1, qty - 1);
      $('qtyInput').value = String(qty);
    });
    $('qtyPlus').addEventListener('click', () => {
      const max = Math.max(1, Math.min(10, product ? product.stock : 10));
      qty = Math.min(max, qty + 1);
      $('qtyInput').value = String(qty);
    });
  }

  function add(qtyToAdd) {
    if (!product) return;
    if (product.stock <= 0) {
      AG.toast('This book is currently sold out.', 'error');
      return;
    }
    AG.addToCart(product, qtyToAdd || qty);
  }

  function initActions() {
    $('addToCartBtn').addEventListener('click', () => add(qty));
    $('buyNowBtn').addEventListener('click', () => {
      if (!product) return;
      add(qty);
      window.location.href = '/checkout';
    });
    $('mbbAdd').addEventListener('click', () => add(qty));

    $('wishBtn').addEventListener('click', () => {
      if (!product) return;
      AG.toggleWishlist(product.slug);
      const wished = AG.awish(product.slug);
      $('wishBtn').classList.toggle('active', wished);
      $('wishBtn').setAttribute('aria-pressed', String(wished));
      $('wishBtn').lastChild.textContent = wished ? ' Saved to wishlist' : ' Save for later';
    });
  }

  function initPincode() {
    $('pincodeForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const input = $('pincodeInput');
      const result = $('pincodeResult');
      const value = input.value.replace(/\D/g, '').slice(0, 6);
      input.value = value;
      if (!/^[1-9]\d{5}$/.test(value)) {
        result.textContent = 'Please enter a valid 6-digit Indian pincode.';
        result.style.color = 'var(--danger)';
        return;
      }
      const days = 3 + (Number(value.slice(-1)) % 4);
      const date = new Date();
      date.setDate(date.getDate() + days);
      const label = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
      result.innerHTML = `✓ Delivering to <strong>${value}</strong> by <strong>${label}</strong> · COD available · Free shipping above {{FREE_SHIPPING}}`;
      result.style.color = 'var(--success)';
    });
  }

  function initLightbox() {
    $('lightboxClose').addEventListener('click', closeLightbox);
    $('lightboxPrev').addEventListener('click', () => shiftLightbox(-1));
    $('lightboxNext').addEventListener('click', () => shiftLightbox(1));
    $('lightbox').addEventListener('click', (event) => {
      if (event.target === $('lightbox')) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if ($('lightbox').hidden) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') shiftLightbox(-1);
      if (event.key === 'ArrowRight') shiftLightbox(1);
    });
  }

  function initMobileBar() {
    const bar = $('mobileBuybar');
    window.addEventListener(
      'scroll',
      () => {
        if (!product) return;
        bar.hidden = window.scrollY < 540;
      },
      { passive: true }
    );
  }

  async function boot() {
    try {
      const data = await AG.api(`/api/products/${encodeURIComponent(slug)}`);
      product = data.product;
      product.related = data.related || [];
      gallery = [
        {
          src: product.cover,
          alt: `${product.title} colouring book front cover`,
          label: 'Front cover',
        },
        ...Array.from({ length: 25 }, (_, i) => i + 1).map((page) => ({
          src: `/art/${product.id}/page/${page}.svg`,
          alt: `${product.title} inside colouring page ${page}`,
          label: `Inside page ${page}`,
        })),
      ];
      renderGallery();
      renderProduct();
      initQty();
      initActions();
      initPincode();
      initMobileBar();
    } catch (error) {
      err(error.status === 404 ? 'This colouring book may have sold out or moved. Explore the rest of the library instead.' : error.message);
    }
    initLightbox();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
