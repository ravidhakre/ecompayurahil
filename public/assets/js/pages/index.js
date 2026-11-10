(function () {
  'use strict';

  const AG = window.AG;

  /* ------------------------------------------------------------- hero slider */

  function initHero() {
    const section = document.getElementById('heroSection');
    if (!section) return;
    const slides = Array.from(section.querySelectorAll('.hero-slide'));
    const dots = Array.from(section.querySelectorAll('[data-hero-dot]'));
    const progress = section.querySelector('.hero-progress span');
    const prev = section.querySelector('[data-hero-prev]');
    const next = section.querySelector('[data-hero-next]');
    if (slides.length < 2) return;

    let current = 0;
    let timer = null;
    let paused = false;
    const DELAY = 6500;

    function restartProgress() {
      if (!progress) return;
      progress.classList.remove('run');
      void progress.offsetWidth;
      progress.classList.add('run');
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === current);
        slide.setAttribute('aria-hidden', String(i !== current));
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
        dot.setAttribute('aria-selected', String(i === current));
      });
      restartProgress();
    }

    function start() {
      stop();
      if (paused) return;
      timer = setInterval(() => show(current + 1), DELAY);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', () => {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', () => {
        show(current + 1);
        start();
      });
    }

    section.addEventListener('mouseenter', () => {
      paused = true;
      stop();
      if (progress) progress.classList.remove('run');
    });
    section.addEventListener('mouseleave', () => {
      paused = false;
      restartProgress();
      start();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    // swipe support
    let touchStartX = 0;
    section.addEventListener(
      'touchstart',
      (event) => {
        touchStartX = event.touches[0].clientX;
      },
      { passive: true }
    );
    section.addEventListener(
      'touchend',
      (event) => {
        const delta = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 45) {
          show(current + (delta < 0 ? 1 : -1));
          start();
        }
      },
      { passive: true }
    );

    show(0);
    start();
  }

  /* ------------------------------------------------------------- products */

  function renderGrid(id, products) {
    const grid = document.getElementById(id);
    if (!grid) return;
    if (!products || !products.length) {
      grid.innerHTML =
        '<div class="empty-state" style="grid-column:1/-1"><h2>Fresh pages coming soon</h2><p>Our next collection is at the printer. Check back shortly or explore the full shop.</p><a class="btn btn-ink" href="/shop">Browse the shop</a></div>';
      return;
    }
    grid.innerHTML = products.map((p) => AG.productCard(p)).join('');
  }

  function gridError(id) {
    const grid = document.getElementById(id);
    if (!grid) return;
    grid.innerHTML =
      '<div class="empty-state" style="grid-column:1/-1"><h2>We could not load this shelf</h2><p>Please refresh the page or visit the shop to see every book.</p><a class="btn btn-ink" href="/shop">Go to shop</a></div>';
  }

  async function loadProducts() {
    const calls = [
      AG.api('/api/products?sort=curated&limit=8').then((data) => {
        renderGrid('featuredGrid', data.products.slice(0, 8));
        document.querySelectorAll('[data-total-books]').forEach((el) => {
          el.textContent = data.total;
        });
      }),
      AG.api('/api/products?bestseller=1&sort=popular&limit=4').then((data) => {
        renderGrid('bestsellerGrid', data.products.slice(0, 4));
      }),
      AG.api('/api/products?sort=newest&limit=4').then((data) => {
        renderGrid('newGrid', data.products.slice(0, 4));
      }),
    ];
    const results = await Promise.allSettled(calls);
    const ids = ['featuredGrid', 'bestsellerGrid', 'newGrid'];
    results.forEach((result, i) => {
      if (result.status === 'rejected') gridError(ids[i]);
    });
  }

  function boot() {
    initHero();
    loadProducts();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
