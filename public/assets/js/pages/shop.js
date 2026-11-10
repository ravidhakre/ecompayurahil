(function () {
  'use strict';

  const AG = window.AG;
  const form = document.getElementById('filterForm');
  const grid = document.getElementById('shopGrid');
  const pagination = document.getElementById('pagination');
  const resultsCount = document.getElementById('resultsCount');
  const chips = document.getElementById('activeChips');
  const searchInput = document.getElementById('shopSearch');
  const sortSelect = document.getElementById('sortSelect');
  const sidebar = document.getElementById('shopSidebar');
  const backdrop = document.getElementById('filterBackdrop');
  const mobileBtn = document.getElementById('mobileFilterBtn');
  const filterClose = document.getElementById('filterClose');
  const clearBtn = document.getElementById('clearFilters');
  const minInput = document.getElementById('minPrice');
  const maxInput = document.getElementById('maxPrice');

  const searchParams = new URLSearchParams(window.location.search);
  const state = {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    min: searchParams.get('min') || '',
    max: searchParams.get('max') || '',
    rating: searchParams.get('rating') || '',
    in_stock: searchParams.get('in_stock') === '1' ? '1' : '',
    bestseller: searchParams.get('bestseller') === '1' ? '1' : '',
    sort: searchParams.get('sort') || 'curated',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
  };

  let categories = [];
  let total = 0;
  let loading = false;
  let requestId = 0;

  function buildQuery() {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.category) params.set('category', state.category);
    if (state.min) params.set('min', state.min);
    if (state.max) params.set('max', state.max);
    if (state.rating) params.set('rating', state.rating);
    if (state.in_stock) params.set('in_stock', state.in_stock);
    if (state.bestseller) params.set('bestseller', state.bestseller);
    if (state.sort && state.sort !== 'curated') params.set('sort', state.sort);
    if (state.page > 1) params.set('page', state.page);
    return params;
  }

  function syncUrl() {
    const params = buildQuery();
    const next = params.toString();
    const url = `${window.location.pathname}${next ? `?${next}` : ''}`;
    window.history.replaceState(null, '', url);
  }

  function renderCategories() {
    const container = document.getElementById('categoryFilter');
    if (!container) return;
    const totalCount = categories.reduce((sum, cat) => sum + Number(cat.count || 0), 0);
    container.innerHTML = [
      `<label><input type="radio" name="category" value="" ${state.category ? '' : 'checked'}> All collections <span class="count">${totalCount}</span></label>`,
      ...categories.map(
        (cat) =>
          `<label><input type="radio" name="category" value="${AG.esc(cat.slug)}" ${state.category === cat.slug ? 'checked' : ''}> ${AG.esc(cat.name)} <span class="count">${cat.count}</span></label>`
      ),
    ].join('');
  }

  function syncForm() {
    searchInput.value = state.q;
    sortSelect.value = state.sort;
    minInput.value = state.min;
    maxInput.value = state.max;
    const categoryRadio = form.querySelector(`input[name="category"][value="${CSS.escape(state.category)}"]`);
    if (categoryRadio) categoryRadio.checked = true;
    const ratingRadio = form.querySelector(`input[name="rating"][value="${CSS.escape(state.rating)}"]`);
    if (ratingRadio) ratingRadio.checked = true;
    form.querySelectorAll('input[name="in_stock"], input[name="bestseller"]').forEach((input) => {
      input.checked = state[input.name] === '1';
    });
  }

  function categoryName(slug) {
    const found = categories.find((cat) => cat.slug === slug);
    return found ? found.name : slug;
  }

  function renderChips() {
    if (!chips) return;
    const list = [];
    if (state.q) list.push({ key: 'q', label: `“${state.q}”` });
    if (state.category) list.push({ key: 'category', label: categoryName(state.category) });
    if (state.min) list.push({ key: 'min', label: `Min ${AG.money(state.min)}` });
    if (state.max) list.push({ key: 'max', label: `Max ${AG.money(state.max)}` });
    if (state.rating) list.push({ key: 'rating', label: `${state.rating}★ & above` });
    if (state.in_stock) list.push({ key: 'in_stock', label: 'In stock' });
    if (state.bestseller) list.push({ key: 'bestseller', label: 'Bestsellers' });
    chips.innerHTML = list
      .map(
        (chip) =>
          `<span class="chip">${AG.esc(chip.label)} <button type="button" data-remove-filter="${chip.key}" aria-label="Remove ${AG.esc(chip.label)} filter">×</button></span>`
      )
      .join('');
  }

  function renderPagination(data) {
    if (!pagination) return;
    if (data.pages <= 1) {
      pagination.innerHTML = '';
      return;
    }
    const pages = [];
    const current = data.page;
    const last = data.pages;
    pages.push(
      `<button type="button" class="page-btn ${current <= 1 ? 'disabled' : ''}" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''} aria-label="Previous page">←</button>`
    );
    const numbers = new Set([1, last, current, current - 1, current + 1, current - 2, current + 2]);
    const sorted = [...numbers].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
    let previous = 0;
    sorted.forEach((n) => {
      if (previous && n - previous > 1) pages.push('<span class="page-gap">…</span>');
      pages.push(
        `<button type="button" class="page-btn ${n === current ? 'current' : ''}" data-page="${n}" ${n === current ? 'aria-current="page"' : ''}>${n}</button>`
      );
      previous = n;
    });
    pages.push(
      `<button type="button" class="page-btn ${current >= last ? 'disabled' : ''}" data-page="${current + 1}" ${current >= last ? 'disabled' : ''} aria-label="Next page">→</button>`
    );
    pagination.innerHTML = pages.join('');
  }

  function render(data) {
    total = data.total;
    document.querySelectorAll('[data-total-books]').forEach((el) => {
      el.textContent = data.total;
    });
    if (resultsCount) {
      resultsCount.textContent =
        data.total === 0
          ? 'No books match these filters'
          : `Showing ${(data.page - 1) * data.limit + 1}–${Math.min(data.total, data.page * data.limit)} of ${data.total} books`;
    }
    if (!data.products.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div style="font-size:44px;margin-bottom:10px">🎨</div>
          <h2>No books found</h2>
          <p>Try a broader search or clear a filter or two. The right book is in here somewhere.</p>
          <button type="button" class="btn btn-ink" data-clear-inline>Clear all filters</button>
        </div>`;
    } else {
      grid.innerHTML = data.products.map((p) => AG.productCard(p)).join('');
    }
    renderPagination(data);
    renderChips();
    syncUrl();
  }

  async function load() {
    const id = ++requestId;
    loading = true;
    grid.classList.add('is-loading');
    if (!grid.querySelector('.skeleton-card')) {
      grid.innerHTML = AG.skeletonCards(8);
    }
    try {
      const params = buildQuery();
      params.set('limit', '12');
      const data = await AG.api(`/api/products?${params.toString()}`);
      if (id !== requestId) return;
      categories = data.categories || categories;
      sortSelect.value = data.sort || state.sort;
      renderCategories();
      syncForm();
      render(data);
    } catch (error) {
      if (id !== requestId) return;
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h2>Could not load the library</h2><p>${AG.esc(error.message)}</p><button type="button" class="btn btn-ink" data-retry>Try again</button></div>`;
      if (resultsCount) resultsCount.textContent = 'Something went wrong';
      AG.toast(error.message, 'error');
    } finally {
      if (id === requestId) {
        loading = false;
        grid.classList.remove('is-loading');
      }
    }
  }

  function update(patch, options) {
    const opts = options || {};
    Object.assign(state, patch);
    if (opts.resetPage !== false) state.page = 1;
    load();
  }

  function setSidebar(open) {
    if (!sidebar) return;
    sidebar.classList.toggle('open', open);
    if (backdrop) backdrop.classList.toggle('open', open);
    document.body.classList.toggle('no-scroll', open);
  }

  form.addEventListener('change', (event) => {
    const target = event.target;
    if (!target.name) return;
    if (target.name === 'category' || target.name === 'rating') {
      update({ [target.name]: target.value });
    }
    if (target.name === 'in_stock' || target.name === 'bestseller') {
      update({ [target.name]: target.checked ? '1' : '' });
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    update({ min: minInput.value.trim(), max: maxInput.value.trim() });
    setSidebar(false);
  });

  searchInput.addEventListener(
    'input',
    AG.debounce(() => {
      update({ q: searchInput.value.trim() });
    }, 320)
  );

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      update({ q: searchInput.value.trim() });
    }
  });

  sortSelect.addEventListener('change', () => update({ sort: sortSelect.value }));

  clearBtn.addEventListener('click', () => {
    Object.assign(state, {
      q: '',
      category: '',
      min: '',
      max: '',
      rating: '',
      in_stock: '',
      bestseller: '',
      sort: 'curated',
      page: 1,
    });
    syncForm();
    load();
    setSidebar(false);
  });

  chips.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-remove-filter]');
    if (!btn) return;
    update({ [btn.dataset.removeFilter]: '' });
    syncForm();
  });

  pagination.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    const page = Number(btn.dataset.page);
    if (!page || page === state.page) return;
    state.page = page;
    load();
    window.scrollTo({ top: document.querySelector('.shop-layout').offsetTop - 100, behavior: 'smooth' });
  });

  grid.addEventListener('click', (event) => {
    if (event.target.closest('[data-clear-inline]')) {
      clearBtn.click();
    }
    if (event.target.closest('[data-retry]')) {
      load();
    }
  });

  if (mobileBtn) mobileBtn.addEventListener('click', () => setSidebar(true));
  if (filterClose) filterClose.addEventListener('click', () => setSidebar(false));
  if (backdrop) backdrop.addEventListener('click', () => setSidebar(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setSidebar(false);
  });

  syncForm();
  load();
})();
