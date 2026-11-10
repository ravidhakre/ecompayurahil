(function () {
  'use strict';

  const AG = window.AG;
  const grid = document.getElementById('aboutGrid');
  if (!grid) return;

  AG.api('/api/products?sort=popular&limit=4')
    .then((data) => {
      grid.innerHTML = data.products.map((product) => AG.productCard(product)).join('');
    })
    .catch(() => {
      grid.innerHTML =
        '<div class="empty-state" style="grid-column:1/-1"><h2>Could not load the shelf</h2><p>Please visit the shop to browse every book.</p><a class="btn btn-ink" href="/shop">Go to shop</a></div>';
    });
})();
