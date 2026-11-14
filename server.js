'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {
  db,
  seeded,
  getSettings,
  getPublicSettings,
  normalizeProduct,
  setSetting,
} = require('./lib/db');
const { coverSvg, pageSvg, PALETTES, THEMES } = require('./lib/art');
const auth = require('./lib/auth');
const payu = require('./lib/payu');
const {
  escapeHtml,
  slugify,
  formatINR,
  sendJson,
  sendHtml,
  sendText,
  redirect,
  readJson,
  readForm,
  orderNumber,
  isEmail,
  isPhone,
  toInt,
  clamp,
  roundRupee,
  csvRow,
  statusLabel,
  formatDateTime,
} = require('./lib/util');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const VIEWS_DIR = path.join(ROOT, 'views');
const PORT = toInt(process.env.PORT, 3000);
const HOST = process.env.HOST || '0.0.0.0';
const ASSET_VERSION = Date.now().toString(36);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

const PAGE_META = {
  index: {
    title: 'Arts Book — Premium Colouring Books for Every Artist',
    description: 'Shop beautifully illustrated colouring books for adults and kids. Mandalas, animals, florals, travel and festive designs. Free shipping above ₹499, COD available.',
  },
  shop: {
    title: 'Shop All Colouring Books — Arts Book',
    description: 'Browse 50+ premium colouring books. Filter by category, price, rating and availability. Find your next creative escape.',
  },
  product: {
    title: 'Colouring Book — Arts Book',
    description: 'Premium colouring book with thick, bleed-resistant pages. See inside pages and order online with COD or secure payment.',
  },
  cart: { title: 'Your Cart — Arts Book', description: 'Review your Arts Book colouring books and proceed to checkout.' },
  checkout: { title: 'Secure Checkout — Arts Book', description: 'Complete your order with Cash on Delivery or secure online payment.' },
  payment: { title: 'Payment — Arts Book', description: 'Complete your Arts Book order securely.' },
  receipt: { title: 'Order Receipt — Arts Book', description: 'Your Arts Book order receipt and invoice.' },
  track: { title: 'Track Your Order — Arts Book', description: 'Track your Arts Book order with your order number and registered phone number.' },
  about: { title: 'Our Story — Arts Book', description: 'Arts Book is an Indian studio making beautiful colouring books for calm, creativity and connection.' },
  contact: { title: 'Contact Arts Book', description: 'Get in touch with Arts Book for orders, bulk gifting, collaborations and support.' },
  faq: { title: 'Frequently Asked Questions — Arts Book', description: 'Answers about shipping, payments, returns, paper quality and bulk orders.' },
  terms: { title: 'Terms & Conditions — Arts Book', description: 'Terms and conditions for shopping with Arts Book.' },
  privacy: { title: 'Privacy Policy — Arts Book', description: 'How Arts Book collects, uses and protects your personal information.' },
  shipping: { title: 'Shipping Policy — Arts Book', description: 'Arts Book shipping timelines, charges and delivery information.' },
  refund: { title: 'Return, Refund & Cancellation Policy — Arts Book', description: 'Arts Book cancellation policy (24 hours) and return & refund policy (7 days) with refund mode and timeline.' },
  notfound: { title: 'Page Not Found — Arts Book', description: 'The page you were looking for could not be found.' },
};

const NAV_COUNT = 0;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function applyTokens(html, extra = {}) {
  const s = getSettings();
  const publicSettings = getPublicSettings();
  const mapEmbed = s.map_embed
    ? `<iframe class="map-frame" src="${escapeHtml(s.map_embed)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Arts Book studio location"></iframe>`
    : `<div class="map-placeholder"><div class="map-pin">◉</div><strong>Studio map coming soon</strong><span>Our exact location will be shared here shortly. Call or email us for directions.</span></div>`;

  const tokens = {
    STORE_NAME: s.store_name,
    TRADE_NAME: s.trade_name || s.store_name,
    LEGAL_NAME: s.legal_name || '',
    TAGLINE: s.tagline,
    ANNOUNCEMENT: s.announcement,
    PHONE: s.phone,
    EMAIL: s.email,
    WHATSAPP: s.whatsapp,
    ADDRESS: s.address,
    CITY: s.city,
    STATE: s.state,
    PINCODE: s.pincode,
    COUNTRY: s.country,
    SUPPORT_HOURS: s.support_hours,
    INSTAGRAM: s.instagram,
    FACEBOOK: s.facebook,
    YOUTUBE: s.youtube,
    RETURNS_DAYS: s.returns_days,
    FREE_SHIPPING: formatINR(publicSettings.free_shipping_threshold),
    SHIPPING_FEE: formatINR(publicSettings.shipping_fee),
    COD_FEE: formatINR(publicSettings.cod_fee),
    GSTIN: s.gstin,
    ABOUT_SHORT: s.about_short,
    YEAR: new Date().getFullYear(),
    MAP_EMBED: mapEmbed,
    SETTINGS_JSON: JSON.stringify(publicSettings).replace(/</g, '\\u003c'),
    ...extra,
  };

  let out = html;
  for (const [key, value] of Object.entries(tokens)) {
    out = out.split(`{{${key}}}`).join(String(value == null ? '' : value));
  }
  return out;
}

function renderPage(name, extra = {}) {
  const file = path.join(VIEWS_DIR, 'pages', `${name}.html`);
  let page = fs.readFileSync(file, 'utf8');
  const head = fs.readFileSync(path.join(VIEWS_DIR, 'partials', 'head.html'), 'utf8');
  const header = fs.readFileSync(path.join(VIEWS_DIR, 'partials', 'header.html'), 'utf8');
  const footer = fs.readFileSync(path.join(VIEWS_DIR, 'partials', 'footer.html'), 'utf8');
  const meta = PAGE_META[name] || PAGE_META.notfound;
  const title = extra.title || meta.title;
  const description = extra.description || meta.description;
  const canonicalTag = extra.canonical
    ? `<link rel="canonical" href="${escapeHtml(extra.canonical)}">`
    : '';

  page = page.split('{{HEAD}}').join(head);
  page = page.split('{{HEADER}}').join(header);
  page = page.split('{{FOOTER}}').join(footer);
  page = applyTokens(page, {
    PAGE_TITLE: title,
    PAGE_DESCRIPTION: description,
    BODY_CLASS: extra.bodyClass || '',
    EXTRA_HEAD: extra.extraHead || '',
    CANONICAL_TAG: canonicalTag,
    ASSET_VER: ASSET_VERSION,
    ...extra.tokens,
  });

  const scripts = [];
  if (name === 'admin') {
    scripts.push(`<script src="/assets/js/admin.js?v=${ASSET_VERSION}"></script>`);
  } else {
    scripts.push(`<script src="/assets/js/app.js?v=${ASSET_VERSION}"></script>`);
    const pageScript = path.join(PUBLIC_DIR, 'assets', 'js', 'pages', `${name}.js`);
    if (fs.existsSync(pageScript)) scripts.push(`<script src="/assets/js/pages/${name}.js?v=${ASSET_VERSION}"></script>`);
  }

  return page + scripts.join('\n') + '\n</body>\n</html>';
}

function serveFile(res, filePath, req, options = {}) {
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;
  const ext = path.extname(filePath).toLowerCase();
  const etag = `W/"${stat.size}-${Math.floor(stat.mtimeMs)}"`;
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304);
    res.end();
    return true;
  }
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': options.cache || 'public, max-age=300',
    ETag: etag,
  });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket.remoteAddress || '';
}

function getCategoryBySlug(slug) {
  return db.prepare('SELECT * FROM categories WHERE slug = ?').get(String(slug || ''));
}

function getProductBySlug(slug) {
  return normalizeProduct(
    db.prepare('SELECT * FROM products WHERE slug = ? AND active = 1').get(String(slug || ''))
  );
}

function getProductById(id) {
  return normalizeProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(toInt(id)));
}

function listCategories() {
  return db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category = c.name AND p.active = 1) AS count
       FROM categories c ORDER BY c.sort_order, c.id`
    )
    .all();
}

function productQuery(params) {
  const where = ['active = 1'];
  const args = [];

  const q = String(params.get('q') || params.get('search') || '').trim();
  if (q) {
    const like = `%${q}%`;
    where.push('(title LIKE ? OR description LIKE ? OR category LIKE ? OR badge LIKE ?)');
    args.push(like, like, like, like);
  }

  const catParam = String(params.get('category') || '').trim();
  if (catParam) {
    const cat = getCategoryBySlug(catParam);
    where.push('category = ?');
    args.push(cat ? cat.name : catParam);
  }

  const min = Number(params.get('min'));
  const max = Number(params.get('max'));
  if (Number.isFinite(min) && min > 0) {
    where.push('price >= ?');
    args.push(min);
  }
  if (Number.isFinite(max) && max > 0) {
    where.push('price <= ?');
    args.push(max);
  }

  const rating = Number(params.get('rating'));
  if (Number.isFinite(rating) && rating > 0) {
    where.push('rating >= ?');
    args.push(rating);
  }

  if (params.get('in_stock') === '1') where.push('stock > 0');
  if (params.get('featured') === '1') where.push('featured = 1');
  if (params.get('bestseller') === '1') where.push('bestseller = 1');
  if (params.get('badge')) {
    where.push('badge = ?');
    args.push(String(params.get('badge')));
  }

  const sort = String(params.get('sort') || 'curated');
  const sorts = {
    curated: 'featured DESC, bestseller DESC, rating DESC, id ASC',
    newest: 'id DESC',
    'price-asc': 'price ASC',
    'price-desc': 'price DESC',
    rating: 'rating DESC, reviews DESC',
    discount: '(mrp - price) DESC',
    popular: 'reviews DESC, rating DESC',
    name: 'title ASC',
  };
  const orderBy = sorts[sort] || sorts.curated;

  const page = Math.max(1, toInt(params.get('page'), 1));
  const limit = clamp(toInt(params.get('limit'), 12), 1, 60);
  const offset = (page - 1) * limit;

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = Number(db.prepare(`SELECT COUNT(*) AS c FROM products ${whereSql}`).get(...args).c);
  const rows = db
    .prepare(`SELECT * FROM products ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
    .all(...args, limit, offset)
    .map(normalizeProduct);

  return {
    products: rows,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
    sort,
    categories: listCategories(),
  };
}

function calculateCoupon(subtotal, code) {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) return { code: '', discount: 0, coupon: null };
  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(normalized);
  if (!coupon) throw Object.assign(new Error('This coupon code is not valid.'), { status: 400 });
  if (subtotal < coupon.min_order) {
    throw Object.assign(new Error(`This coupon needs a minimum order of ${formatINR(coupon.min_order)}.`), { status: 400 });
  }
  let discount = coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.max_discount > 0) discount = Math.min(discount, coupon.max_discount);
  discount = Math.min(discount, subtotal);
  return { code: coupon.code, discount, coupon };
}

function priceOrder(rawItems, couponCode, paymentMethod, settings = getSettings()) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw Object.assign(new Error('Your cart is empty.'), { status: 400 });
  }
  const items = [];
  for (const raw of rawItems) {
    const slug = String(raw.slug || '');
    const qty = clamp(toInt(raw.qty, 1), 1, 10);
    const product = getProductBySlug(slug);
    if (!product) throw Object.assign(new Error('One of the products in your cart is no longer available.'), { status: 400 });
    if (product.stock < qty) {
      throw Object.assign(new Error(`Only ${product.stock} copies of "${product.title}" are available right now.`), { status: 400 });
    }
    items.push({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      qty,
      lineTotal: product.price * qty,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const { code, discount } = calculateCoupon(subtotal, couponCode);
  const threshold = Number(settings.free_shipping_threshold) || 0;
  const shipping = subtotal >= threshold ? 0 : Number(settings.shipping_fee) || 0;
  const codFee = paymentMethod === 'cod' ? Number(settings.cod_fee) || 0 : 0;
  const total = Math.max(0, subtotal - discount + shipping + codFee);

  return { items, subtotal, discount, couponCode: code, shipping, codFee, total };
}

function createOrder({ customer, items, couponCode, paymentMethod }) {
  const settings = getSettings();
  const priced = priceOrder(items, couponCode, paymentMethod, settings);
  const orderNo = orderNumber();
  const now = new Date().toISOString();

  db.exec('BEGIN IMMEDIATE');
  try {
    for (const item of priced.items) {
      const result = db
        .prepare('UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ? AND stock >= ?')
        .run(item.qty, now, item.productId, item.qty);
      if (Number(result.changes) !== 1) {
        throw Object.assign(new Error(`"${item.title}" just went out of stock. Please update your cart.`), { status: 409 });
      }
    }

    const result = db
      .prepare(
        `INSERT INTO orders
         (order_no, customer_name, email, phone, address, city, state, pincode, notes,
          subtotal, discount, shipping, cod_fee, total, coupon_code, payment_method,
          payment_status, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'placed', ?, ?)`
      )
      .run(
        orderNo,
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.city,
        customer.state,
        customer.pincode,
        customer.notes || '',
        priced.subtotal,
        priced.discount,
        priced.shipping,
        priced.codFee,
        priced.total,
        priced.couponCode,
        paymentMethod,
        now,
        now
      );

    const orderId = Number(result.lastInsertRowid);
    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, title, slug, price, qty, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const item of priced.items) {
      insertItem.run(orderId, item.productId, item.title, item.slug, item.price, item.qty, item.lineTotal);
    }

    db.exec('COMMIT');
    return { orderId, orderNo, ...priced };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function getOrderByNo(orderNo) {
  return db.prepare('SELECT * FROM orders WHERE order_no = ?').get(String(orderNo || ''));
}

function getOrderItems(orderId) {
  return db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id').all(orderId);
}

function orderPayload(order, includeSettings = false) {
  if (!order) return null;
  const items = getOrderItems(order.id);
  const payload = {
    ...order,
    status_label: statusLabel(order.status),
    items,
    receipt_key: auth.receiptKey(order.order_no),
    timeline: buildTimeline(order),
  };
  if (includeSettings) payload.settings = getPublicSettings();
  return payload;
}

function buildTimeline(order) {
  const stages = [
    { key: 'placed', label: 'Order placed', detail: 'We received your order.' },
    { key: 'confirmed', label: 'Confirmed', detail: 'Your order is confirmed and being prepared.' },
    { key: 'packed', label: 'Packed', detail: 'Your books are packed with care.' },
    { key: 'shipped', label: 'Shipped', detail: 'Handed over to our delivery partner.' },
    { key: 'delivered', label: 'Delivered', detail: 'Enjoy your new colouring books!' },
  ];
  const current = stages.findIndex((s) => s.key === order.status);
  if (order.status === 'cancelled') {
    return [{ key: 'cancelled', label: 'Order cancelled', detail: 'This order was cancelled.', done: true, current: true }];
  }
  return stages.map((s, i) => ({
    ...s,
    done: current >= i,
    current: current === i,
  }));
}

function restockOrder(order) {
  if (!order || Number(order.restocked) === 1 || order.status === 'delivered') return;
  const items = getOrderItems(order.id);
  const now = new Date().toISOString();
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const item of items) {
      if (item.product_id) {
        db.prepare('UPDATE products SET stock = stock + ?, updated_at = ? WHERE id = ?').run(item.qty, now, item.product_id);
      }
    }
    db.prepare('UPDATE orders SET restocked = 1, updated_at = ? WHERE id = ?').run(now, order.id);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function updateOrderPayment(orderNo, { paymentStatus, status, txnid, mihpayid }) {
  const order = getOrderByNo(orderNo);
  if (!order) return null;
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE orders SET payment_status = COALESCE(?, payment_status),
      status = COALESCE(?, status), payu_txnid = COALESCE(?, payu_txnid),
      payu_mihpayid = COALESCE(?, payu_mihpayid), updated_at = ? WHERE id = ?`
  ).run(paymentStatus || null, status || null, txnid || null, mihpayid || null, now, order.id);
  if (status === 'cancelled') restockOrder(order);
  return getOrderByNo(orderNo);
}

// ---------------------------------------------------------------------------
// API handlers
// ---------------------------------------------------------------------------

async function handleApi(req, res, url) {
  const p = url.pathname;
  const method = req.method;

  // ---- public catalogue ----
  if (p === '/api/products' && method === 'GET') {
    return sendJson(res, 200, { ok: true, ...productQuery(url.searchParams) });
  }

  if (p === '/api/categories' && method === 'GET') {
    return sendJson(res, 200, { ok: true, categories: listCategories() });
  }

  let m = p.match(/^\/api\/products\/([^/]+)$/);
  if (m && method === 'GET') {
    const product = getProductBySlug(decodeURIComponent(m[1]));
    if (!product) return sendJson(res, 404, { ok: false, error: 'Product not found.' });
    const related = db
      .prepare('SELECT * FROM products WHERE active = 1 AND category = ? AND id != ? ORDER BY bestseller DESC, rating DESC LIMIT 4')
      .all(product.category, product.id)
      .map(normalizeProduct);
    const inside = Array.from({ length: 25 }, (_, i) => `/art/${product.id}/page/${i + 1}.svg`);
    return sendJson(res, 200, { ok: true, product, related, inside });
  }

  if (p === '/api/settings' && method === 'GET') {
    return sendJson(res, 200, { ok: true, settings: getPublicSettings() });
  }

  if (p === '/api/newsletter' && method === 'POST') {
    const body = await readJson(req);
    const email = String(body.email || '').trim().toLowerCase();
    if (!isEmail(email)) return sendJson(res, 400, { ok: false, error: 'Please enter a valid email address.' });
    db.prepare('INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)').run(email, new Date().toISOString());
    return sendJson(res, 200, { ok: true, message: 'You are on the list. Welcome to Arts Book!' });
  }

  if (p === '/api/contact' && method === 'POST') {
    const body = await readJson(req);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const subject = String(body.subject || 'General enquiry').trim();
    const message = String(body.message || '').trim();
    if (name.length < 2) return sendJson(res, 400, { ok: false, error: 'Please enter your name.' });
    if (!isEmail(email)) return sendJson(res, 400, { ok: false, error: 'Please enter a valid email address.' });
    if (phone && !isPhone(phone)) return sendJson(res, 400, { ok: false, error: 'Please enter a valid phone number.' });
    if (message.length < 10) return sendJson(res, 400, { ok: false, error: 'Please write a slightly longer message.' });
    db.prepare(
      'INSERT INTO messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, email, phone, subject.slice(0, 120), message.slice(0, 4000), new Date().toISOString());
    return sendJson(res, 200, {
      ok: true,
      message: 'Thank you! Your message has reached our studio. We usually reply within one working day.',
    });
  }

  if (p === '/api/coupon/validate' && method === 'POST') {
    const body = await readJson(req);
    const subtotal = Number(body.subtotal) || 0;
    const code = String(body.code || '');
    if (!code.trim()) return sendJson(res, 400, { ok: false, error: 'Enter a coupon code.' });
    const result = calculateCoupon(subtotal, code);
    return sendJson(res, 200, {
      ok: true,
      code: result.code,
      discount: result.discount,
      message: `${result.code} applied. You saved ${formatINR(result.discount)}.`,
    });
  }

  // ---- orders ----
  if (p === '/api/orders' && method === 'POST') {
    const body = await readJson(req);
    const c = body.customer || {};
    const customer = {
      name: String(c.name || '').trim().slice(0, 100),
      email: String(c.email || '').trim().toLowerCase().slice(0, 160),
      phone: String(c.phone || '').trim().slice(0, 20),
      address: String(c.address || '').trim().slice(0, 500),
      city: String(c.city || '').trim().slice(0, 80),
      state: String(c.state || '').trim().slice(0, 80),
      pincode: String(c.pincode || '').trim().slice(0, 10),
      notes: String(c.notes || '').trim().slice(0, 500),
    };
    const paymentMethod = body.payment_method === 'payu' ? 'payu' : 'cod';
    if (customer.name.length < 2) return sendJson(res, 400, { ok: false, error: 'Please enter your full name.' });
    if (!isEmail(customer.email)) return sendJson(res, 400, { ok: false, error: 'Please enter a valid email address.' });
    if (!isPhone(customer.phone)) return sendJson(res, 400, { ok: false, error: 'Please enter a valid 10-digit phone number.' });
    if (customer.address.length < 10) return sendJson(res, 400, { ok: false, error: 'Please enter your complete delivery address.' });
    if (customer.city.length < 2) return sendJson(res, 400, { ok: false, error: 'Please enter your city.' });
    if (customer.state.length < 2) return sendJson(res, 400, { ok: false, error: 'Please enter your state.' });
    if (!/^\d{5,6}$/.test(customer.pincode)) return sendJson(res, 400, { ok: false, error: 'Please enter a valid pincode.' });

    const order = createOrder({
      customer,
      items: body.items,
      couponCode: body.coupon_code,
      paymentMethod,
    });
    const key = auth.receiptKey(order.orderNo);
    return sendJson(res, 201, {
      ok: true,
      order_no: order.orderNo,
      total: order.total,
      payment_method: paymentMethod,
      receipt_key: key,
      receipt_url: `/receipt/${order.orderNo}?key=${key}`,
      payment_url: paymentMethod === 'payu' ? `/payment?order=${order.orderNo}&key=${key}` : `/receipt/${order.orderNo}?key=${key}`,
      message: paymentMethod === 'cod' ? 'Order placed. Please keep the exact amount ready for delivery.' : 'Order created. Please complete payment.',
    });
  }

  m = p.match(/^\/api\/orders\/([^/]+)\/track$/);
  if (m && method === 'GET') {
    const orderNo = decodeURIComponent(m[1]);
    const phone = String(url.searchParams.get('phone') || '').replace(/\D/g, '');
    const order = getOrderByNo(orderNo);
    if (!order || phone.length < 10 || order.phone.replace(/\D/g, '').slice(-10) !== phone.slice(-10)) {
      return sendJson(res, 404, { ok: false, error: 'We could not find an order with those details. Please check and try again.' });
    }
    return sendJson(res, 200, { ok: true, order: orderPayload(order) });
  }

  m = p.match(/^\/api\/orders\/([^/]+)\/receipt$/);
  if (m && method === 'GET') {
    const orderNo = decodeURIComponent(m[1]);
    const order = getOrderByNo(orderNo);
    if (!order) return sendJson(res, 404, { ok: false, error: 'Order not found.' });
    const key = String(url.searchParams.get('key') || '');
    const phone = String(url.searchParams.get('phone') || '').replace(/\D/g, '');
    const isAdmin = Boolean(auth.getSession(req));
    const keyOk = key && key === auth.receiptKey(order.order_no);
    const phoneOk = phone.length >= 10 && order.phone.replace(/\D/g, '').slice(-10) === phone.slice(-10);
    if (!isAdmin && !keyOk && !phoneOk) {
      return sendJson(res, 403, { ok: false, error: 'This receipt link is not valid. Please contact support.' });
    }
    return sendJson(res, 200, { ok: true, order: orderPayload(order, true) });
  }

  // ---- PayU ----
  if (p === '/api/payu/initiate' && method === 'POST') {
    const body = await readJson(req);
    const order = getOrderByNo(body.orderNo || body.order_no);
    if (!order) return sendJson(res, 404, { ok: false, error: 'Order not found.' });
    if (order.payment_method !== 'payu') return sendJson(res, 400, { ok: false, error: 'This order is not an online payment order.' });
    if (order.payment_status === 'paid') return sendJson(res, 200, { ok: true, alreadyPaid: true, receiptUrl: `/receipt/${order.order_no}?key=${auth.receiptKey(order.order_no)}` });
    if (order.status === 'cancelled') return sendJson(res, 400, { ok: false, error: 'This order was cancelled. Please place a new order.' });
    const items = getOrderItems(order.id);
    if (!payu.isConfigured()) {
      return sendJson(res, 200, {
        ok: true,
        demo: true,
        orderNo: order.order_no,
        amount: order.total,
        key: auth.receiptKey(order.order_no),
        name: order.customer_name,
        email: order.email,
        phone: order.phone,
      });
    }
    const request = payu.buildRequest(order, items);
    return sendJson(res, 200, { ok: true, demo: false, mode: payu.PAYU_MODE, ...request });
  }

  if (p === '/api/payu/demo' && method === 'POST') {
    const body = await readJson(req);
    const order = getOrderByNo(body.orderNo || body.order_no);
    if (!order) return sendJson(res, 404, { ok: false, error: 'Order not found.' });
    if (body.key !== auth.receiptKey(order.order_no)) return sendJson(res, 403, { ok: false, error: 'Invalid payment token.' });
    if (order.payment_status === 'paid') return sendJson(res, 200, { ok: true, alreadyPaid: true });
    if (body.outcome === 'success') {
      updateOrderPayment(order.order_no, { paymentStatus: 'paid', status: 'confirmed', txnid: `DEMO-${order.order_no}`, mihpayid: `DEMO-${Date.now()}` });
      return sendJson(res, 200, {
        ok: true,
        paid: true,
        receipt_url: `/receipt/${order.order_no}?key=${auth.receiptKey(order.order_no)}`,
      });
    }
    updateOrderPayment(order.order_no, { paymentStatus: 'failed', status: 'cancelled', txnid: `DEMO-${order.order_no}` });
    return sendJson(res, 200, { ok: true, paid: false, message: 'Payment failed. Your order has been cancelled and any stock reserved is released.' });
  }

  // ---- admin ----
  if (p === '/api/admin/login' && method === 'POST') {
    const ip = clientIp(req);
    if (auth.loginRateLimited(ip)) {
      return sendJson(res, 429, { ok: false, error: 'Too many attempts. Please wait 15 minutes and try again.' });
    }
    const body = await readJson(req);
    if (!auth.checkPassword(body.password)) {
      auth.recordLogin(ip, false);
      return sendJson(res, 401, { ok: false, error: 'Incorrect password.' });
    }
    auth.recordLogin(ip, true);
    auth.createSession(res);
    return sendJson(res, 200, { ok: true, email: auth.ADMIN_EMAIL });
  }

  if (p === '/api/admin/logout' && method === 'POST') {
    auth.clearSession(res);
    return sendJson(res, 200, { ok: true });
  }

  if (p === '/api/admin/me' && method === 'GET') {
    const session = auth.getSession(req);
    return sendJson(res, 200, { ok: true, authenticated: Boolean(session), email: session ? session.email : null });
  }

  if (p.startsWith('/api/admin/')) {
    const session = auth.requireAdmin(req, res);
    if (!session) return;
    await handleAdminApi(req, res, url);
    return;
  }

  return sendJson(res, 404, { ok: false, error: 'API route not found.' });
}

async function handleAdminApi(req, res, url) {
  const p = url.pathname;
  const method = req.method;

  if (p === '/api/admin/stats' && method === 'GET') {
    const stats = db
      .prepare(
        `SELECT
          COUNT(*) AS orders,
          COALESCE(SUM(total), 0) AS revenue,
          COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) AS cancelled,
          COALESCE(SUM(CASE WHEN status IN ('placed','confirmed','packed') THEN 1 ELSE 0 END), 0) AS open_orders,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) AS paid_revenue
         FROM orders`
      )
      .get();
    const products = db.prepare('SELECT COUNT(*) AS c FROM products WHERE active = 1').get().c;
    const lowStock = db.prepare('SELECT COUNT(*) AS c FROM products WHERE active = 1 AND stock <= 10').get().c;
    const customers = db.prepare('SELECT COUNT(DISTINCT phone) AS c FROM orders').get().c;
    const messages = db.prepare("SELECT COUNT(*) AS c FROM messages WHERE status = 'new'").get().c;
    const recent = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 6').all().map((o) => ({ ...o, status_label: statusLabel(o.status) }));
    const lowStockProducts = db
      .prepare('SELECT id, title, stock, price FROM products WHERE active = 1 AND stock <= 10 ORDER BY stock ASC LIMIT 6')
      .all();
    const top = db
      .prepare(
        `SELECT oi.title, SUM(oi.qty) AS units, SUM(oi.line_total) AS revenue
         FROM order_items oi JOIN orders o ON o.id = oi.order_id
         WHERE o.status != 'cancelled' GROUP BY oi.title ORDER BY units DESC LIMIT 5`
      )
      .all();

    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    const grouped = db
      .prepare("SELECT substr(created_at,1,10) AS day, COUNT(*) AS orders, SUM(total) AS revenue FROM orders WHERE status != 'cancelled' GROUP BY day")
      .all();
    const byDay = days.map((day) => {
      const row = grouped.find((g) => g.day === day);
      return { day, orders: row ? Number(row.orders) : 0, revenue: row ? Number(row.revenue) : 0 };
    });

    return sendJson(res, 200, {
      ok: true,
      stats: {
        orders: Number(stats.orders),
        revenue: Number(stats.revenue),
        paid_revenue: Number(stats.paid_revenue),
        cancelled: Number(stats.cancelled),
        open_orders: Number(stats.open_orders),
        products: Number(products),
        low_stock: Number(lowStock),
        customers: Number(customers),
        new_messages: Number(messages),
      },
      recent,
      lowStockProducts,
      topProducts: top,
      byDay,
    });
  }

  if (p === '/api/admin/products' && method === 'GET') {
    const q = String(url.searchParams.get('q') || '').trim();
    const status = String(url.searchParams.get('status') || 'all');
    const where = [];
    const args = [];
    if (q) {
      where.push('(title LIKE ? OR category LIKE ? OR slug LIKE ?)');
      args.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (status === 'active') where.push('active = 1');
    if (status === 'inactive') where.push('active = 0');
    if (status === 'low') where.push('stock <= 10 AND active = 1');
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = db
      .prepare(`SELECT * FROM products ${whereSql} ORDER BY id DESC`)
      .all(...args)
      .map(normalizeProduct);
    return sendJson(res, 200, { ok: true, products: rows, categories: listCategories() });
  }

  if (p === '/api/admin/products' && method === 'POST') {
    const body = await readJson(req);
    const product = saveProduct(body, null);
    return sendJson(res, 201, { ok: true, product });
  }

  let m = p.match(/^\/api\/admin\/products\/(\d+)$/);
  if (m && method === 'PUT') {
    const id = toInt(m[1]);
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) return sendJson(res, 404, { ok: false, error: 'Product not found.' });
    const body = await readJson(req);
    const product = saveProduct(body, existing);
    return sendJson(res, 200, { ok: true, product });
  }

  if (m && method === 'DELETE') {
    const id = toInt(m[1]);
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) return sendJson(res, 404, { ok: false, error: 'Product not found.' });
    const referenced = db.prepare('SELECT COUNT(*) AS c FROM order_items WHERE product_id = ?').get(id).c;
    if (Number(referenced) > 0) {
      db.prepare('UPDATE products SET active = 0, updated_at = ? WHERE id = ?').run(new Date().toISOString(), id);
      return sendJson(res, 200, { ok: true, deactivated: true, message: 'This product has past orders, so it was hidden from the store instead of deleted.' });
    }
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return sendJson(res, 200, { ok: true, deleted: true });
  }

  if (p === '/api/admin/orders' && method === 'GET') {
    const q = String(url.searchParams.get('q') || '').trim();
    const status = String(url.searchParams.get('status') || '');
    const payment = String(url.searchParams.get('payment') || '');
    const from = String(url.searchParams.get('from') || '');
    const to = String(url.searchParams.get('to') || '');
    const where = [];
    const args = [];
    if (q) {
      where.push('(order_no LIKE ? OR customer_name LIKE ? OR phone LIKE ? OR email LIKE ?)');
      const like = `%${q}%`;
      args.push(like, like, like, like);
    }
    if (status) {
      where.push('status = ?');
      args.push(status);
    }
    if (payment) {
      where.push('payment_status = ?');
      args.push(payment);
    }
    if (from) {
      where.push('substr(created_at,1,10) >= ?');
      args.push(from);
    }
    if (to) {
      where.push('substr(created_at,1,10) <= ?');
      args.push(to);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = db
      .prepare(`SELECT * FROM orders ${whereSql} ORDER BY id DESC LIMIT 300`)
      .all(...args)
      .map((o) => ({ ...o, status_label: statusLabel(o.status) }));
    return sendJson(res, 200, { ok: true, orders: rows });
  }

  m = p.match(/^\/api\/admin\/orders\/(\d+)$/);
  if (m && method === 'GET') {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(toInt(m[1]));
    if (!order) return sendJson(res, 404, { ok: false, error: 'Order not found.' });
    return sendJson(res, 200, { ok: true, order: orderPayload(order) });
  }

  if (m && method === 'PATCH') {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(toInt(m[1]));
    if (!order) return sendJson(res, 404, { ok: false, error: 'Order not found.' });
    const body = await readJson(req);
    const allowedStatus = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
    const allowedPayment = ['pending', 'paid', 'failed', 'refunded'];
    const status = allowedStatus.includes(body.status) ? body.status : null;
    const paymentStatus = allowedPayment.includes(body.payment_status) ? body.payment_status : null;
    if (!status && !paymentStatus) return sendJson(res, 400, { ok: false, error: 'Nothing to update.' });
    const now = new Date().toISOString();
    db.prepare(
      `UPDATE orders SET status = COALESCE(?, status), payment_status = COALESCE(?, payment_status), updated_at = ? WHERE id = ?`
    ).run(status, paymentStatus, now, order.id);
    if (status === 'cancelled') {
      restockOrder(order);
    }
    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
    return sendJson(res, 200, { ok: true, order: orderPayload(updated) });
  }

  if (p === '/api/admin/reports' && method === 'GET') {
    return sendJson(res, 200, { ok: true, report: buildReport(url.searchParams) });
  }

  if (p === '/api/admin/reports.csv' && method === 'GET') {
    const report = buildReport(url.searchParams);
    const rows = [
      csvRow(['Arts Book Sales Report', `${report.from} to ${report.to}`]),
      csvRow([]),
      csvRow(['Summary']),
      csvRow(['Orders', report.totals.orders]),
      csvRow(['Gross sales', report.totals.gross]),
      csvRow(['Discounts', report.totals.discounts]),
      csvRow(['Shipping collected', report.totals.shipping]),
      csvRow(['COD fees', report.totals.cod_fees]),
      csvRow(['Net revenue', report.totals.revenue]),
      csvRow(['Average order value', report.totals.aov]),
      csvRow([]),
      csvRow(['Day', 'Orders', 'Revenue']),
      ...report.byDay.map((d) => csvRow([d.day, d.orders, d.revenue])),
      csvRow([]),
      csvRow(['Top products', 'Units', 'Revenue']),
      ...report.topProducts.map((t) => csvRow([t.title, t.units, t.revenue])),
      csvRow([]),
      csvRow(['Order status', 'Count']),
      ...report.byStatus.map((s) => csvRow([s.status, s.count])),
    ];
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="art-guru-report-${report.from}-to-${report.to}.csv"`,
      'Cache-Control': 'no-store',
    });
    res.end('\ufeff' + rows.join('\r\n'));
    return;
  }

  if (p === '/api/admin/messages' && method === 'GET') {
    const messages = db.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT 300').all();
    return sendJson(res, 200, { ok: true, messages });
  }

  m = p.match(/^\/api\/admin\/messages\/(\d+)$/);
  if (m && method === 'PATCH') {
    const body = await readJson(req);
    const status = body.status === 'read' ? 'read' : body.status === 'new' ? 'new' : 'read';
    db.prepare('UPDATE messages SET status = ? WHERE id = ?').run(status, toInt(m[1]));
    return sendJson(res, 200, { ok: true });
  }

  if (p === '/api/admin/settings' && method === 'GET') {
    return sendJson(res, 200, { ok: true, settings: getSettings() });
  }

  if (p === '/api/admin/settings' && method === 'PUT') {
    const body = await readJson(req);
    const allowed = [
      'store_name', 'tagline', 'announcement', 'phone', 'email', 'whatsapp', 'address', 'city', 'state',
      'pincode', 'country', 'support_hours', 'instagram', 'facebook', 'youtube', 'map_embed', 'gstin',
      'shipping_fee', 'free_shipping_threshold', 'cod_fee', 'returns_days', 'order_prefix', 'about_short',
    ];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        setSetting(key, String(body[key] == null ? '' : body[key]).slice(0, 5000));
      }
    }
    return sendJson(res, 200, { ok: true, settings: getSettings() });
  }

  if (p === '/api/admin/coupons' && method === 'GET') {
    return sendJson(res, 200, { ok: true, coupons: db.prepare('SELECT * FROM coupons ORDER BY id DESC').all() });
  }

  if (p === '/api/admin/coupons' && method === 'POST') {
    const body = await readJson(req);
    const coupon = saveCoupon(body, null);
    return sendJson(res, 201, { ok: true, coupon });
  }

  m = p.match(/^\/api\/admin\/coupons\/(\d+)$/);
  if (m && method === 'PUT') {
    const existing = db.prepare('SELECT * FROM coupons WHERE id = ?').get(toInt(m[1]));
    if (!existing) return sendJson(res, 404, { ok: false, error: 'Coupon not found.' });
    const body = await readJson(req);
    const coupon = saveCoupon(body, existing);
    return sendJson(res, 200, { ok: true, coupon });
  }
  if (m && method === 'DELETE') {
    db.prepare('DELETE FROM coupons WHERE id = ?').run(toInt(m[1]));
    return sendJson(res, 200, { ok: true });
  }

  if (p === '/api/admin/subscribers' && method === 'GET') {
    return sendJson(res, 200, { ok: true, subscribers: db.prepare('SELECT * FROM subscribers ORDER BY id DESC LIMIT 500').all() });
  }

  return sendJson(res, 404, { ok: false, error: 'Admin API route not found.' });
}

function saveProduct(body, existing) {
  const title = String(body.title || '').trim();
  if (title.length < 2) throw Object.assign(new Error('Product title is required.'), { status: 400 });
  const mrp = roundRupee(body.mrp);
  const price = roundRupee(body.price);
  if (mrp < 1 || price < 1) throw Object.assign(new Error('MRP and selling price are required.'), { status: 400 });
  if (price > mrp) throw Object.assign(new Error('Selling price cannot be greater than MRP.'), { status: 400 });
  const category = String(body.category || '').trim();
  if (!category) throw Object.assign(new Error('Please choose a category.'), { status: 400 });
  const cat = db.prepare('SELECT * FROM categories WHERE name = ?').get(category);
  const theme = String(body.theme || (cat ? cat.theme : 'mandala')).trim();
  const palette = PALETTES[body.palette] ? body.palette : 'sunset';

  let slug = slugify(body.slug || title) || `book-${Date.now()}`;
  const clash = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
  if (clash && (!existing || clash.id !== existing.id)) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const now = new Date().toISOString();
  const values = {
    slug,
    title,
    category,
    theme,
    palette,
    art_variant: clamp(toInt(body.art_variant, 0), 0, 5),
    mrp,
    price,
    stock: Math.max(0, toInt(body.stock, 0)),
    pages: Math.max(1, toInt(body.pages, 25)),
    age_group: String(body.age_group || '8+ years').slice(0, 40),
    description: String(body.description || '').slice(0, 4000),
    badge: String(body.badge || '').slice(0, 30),
    featured: body.featured ? 1 : 0,
    bestseller: body.bestseller ? 1 : 0,
    rating: clamp(Number(body.rating) || 4.7, 1, 5),
    reviews: Math.max(0, toInt(body.reviews, 0)),
    image_url: String(body.image_url || '').trim().slice(0, 500),
    active: body.active === 0 || body.active === false ? 0 : 1,
    updated_at: now,
  };

  if (existing) {
    db.prepare(
      `UPDATE products SET slug = ?, title = ?, category = ?, theme = ?, palette = ?, art_variant = ?,
       mrp = ?, price = ?, stock = ?, pages = ?, age_group = ?, description = ?, badge = ?,
       featured = ?, bestseller = ?, rating = ?, reviews = ?, image_url = ?, active = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      values.slug, values.title, values.category, values.theme, values.palette, values.art_variant,
      values.mrp, values.price, values.stock, values.pages, values.age_group, values.description,
      values.badge, values.featured, values.bestseller, values.rating, values.reviews, values.image_url,
      values.active, values.updated_at, existing.id
    );
    return getProductById(existing.id);
  }

  const result = db
    .prepare(
      `INSERT INTO products
       (slug, title, category, theme, palette, art_variant, mrp, price, stock, pages, age_group,
        description, badge, featured, bestseller, rating, reviews, image_url, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      values.slug, values.title, values.category, values.theme, values.palette, values.art_variant,
      values.mrp, values.price, values.stock, values.pages, values.age_group, values.description,
      values.badge, values.featured, values.bestseller, values.rating, values.reviews, values.image_url,
      values.active, now, now
    );
  return getProductById(Number(result.lastInsertRowid));
}

function saveCoupon(body, existing) {
  const code = String(body.code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (code.length < 3) throw Object.assign(new Error('Coupon code must be at least 3 characters.'), { status: 400 });
  const type = body.type === 'fixed' ? 'fixed' : 'percent';
  const value = Math.max(1, toInt(body.value, 0));
  if (type === 'percent' && value > 80) throw Object.assign(new Error('Percentage discount cannot exceed 80%.'), { status: 400 });
  const minOrder = Math.max(0, toInt(body.min_order, 0));
  const maxDiscount = Math.max(0, toInt(body.max_discount, 0));
  const active = body.active === 0 || body.active === false ? 0 : 1;
  if (existing) {
    db.prepare('UPDATE coupons SET code = ?, type = ?, value = ?, min_order = ?, max_discount = ?, active = ? WHERE id = ?').run(
      code, type, value, minOrder, maxDiscount, active, existing.id
    );
    return db.prepare('SELECT * FROM coupons WHERE id = ?').get(existing.id);
  }
  try {
    const result = db
      .prepare('INSERT INTO coupons (code, type, value, min_order, max_discount, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(code, type, value, minOrder, maxDiscount, active, new Date().toISOString());
    return db.prepare('SELECT * FROM coupons WHERE id = ?').get(Number(result.lastInsertRowid));
  } catch {
    throw Object.assign(new Error('A coupon with this code already exists.'), { status: 400 });
  }
}

function buildReport(params) {
  const today = new Date();
  const defaultFrom = new Date(today.getTime() - 29 * 86400000);
  const from = String(params.get('from') || defaultFrom.toISOString().slice(0, 10));
  const to = String(params.get('to') || today.toISOString().slice(0, 10));

  const rows = db
    .prepare("SELECT * FROM orders WHERE substr(created_at,1,10) BETWEEN ? AND ?")
    .all(from, to);
  const valid = rows.filter((o) => o.status !== 'cancelled');
  const totals = {
    orders: valid.length,
    gross: valid.reduce((s, o) => s + Number(o.subtotal), 0),
    discounts: valid.reduce((s, o) => s + Number(o.discount), 0),
    shipping: valid.reduce((s, o) => s + Number(o.shipping), 0),
    cod_fees: valid.reduce((s, o) => s + Number(o.cod_fee), 0),
    revenue: valid.reduce((s, o) => s + Number(o.total), 0),
    units: db
      .prepare(
        `SELECT COALESCE(SUM(oi.qty),0) AS c FROM order_items oi JOIN orders o ON o.id = oi.order_id
         WHERE o.status != 'cancelled' AND substr(o.created_at,1,10) BETWEEN ? AND ?`
      )
      .get(from, to).c,
  };
  totals.aov = totals.orders ? Math.round(totals.revenue / totals.orders) : 0;

  const dayMap = new Map();
  for (const o of valid) {
    const day = String(o.created_at).slice(0, 10);
    const entry = dayMap.get(day) || { day, orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += Number(o.total);
    dayMap.set(day, entry);
  }
  const byDay = [...dayMap.values()].sort((a, b) => a.day.localeCompare(b.day));

  const statusMap = new Map();
  for (const o of rows) statusMap.set(o.status, (statusMap.get(o.status) || 0) + 1);
  const byStatus = [...statusMap.entries()].map(([status, count]) => ({ status, label: statusLabel(status), count }));

  const paymentMap = new Map();
  for (const o of valid) {
    const key = `${o.payment_method}:${o.payment_status}`;
    paymentMap.set(key, (paymentMap.get(key) || 0) + 1);
  }
  const byPayment = [...paymentMap.entries()].map(([key, count]) => {
    const [method, paymentStatus] = key.split(':');
    return { method, payment_status: paymentStatus, count };
  });

  const topProducts = db
    .prepare(
      `SELECT oi.title, SUM(oi.qty) AS units, SUM(oi.line_total) AS revenue
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE o.status != 'cancelled' AND substr(o.created_at,1,10) BETWEEN ? AND ?
       GROUP BY oi.title ORDER BY units DESC LIMIT 8`
    )
    .all(from, to);

  const byCategory = db
    .prepare(
      `SELECT COALESCE(p.category, 'Other') AS category, SUM(oi.qty) AS units, SUM(oi.line_total) AS revenue
       FROM order_items oi JOIN orders o ON o.id = oi.order_id LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.status != 'cancelled' AND substr(o.created_at,1,10) BETWEEN ? AND ?
       GROUP BY category ORDER BY revenue DESC`
    )
    .all(from, to);

  return { from, to, totals, byDay, byStatus, byPayment, topProducts, byCategory, orders: rows };
}

// ---------------------------------------------------------------------------
// page + static routing
// ---------------------------------------------------------------------------

async function handleRequest(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch {
    return sendText(res, 400, 'Bad request');
  }

  // Vercel rewrites can deliver the destination URL (e.g. /api/index) instead
  // of the original path. When configured with ?__path=/<original> we restore it.
  if (process.env.VERCEL && url.searchParams.has('__path')) {
    const restored = url.searchParams.get('__path') || '/';
    url.searchParams.delete('__path');
    const qs = url.searchParams.toString();
    req.url = restored + (qs ? `?${qs}` : '');
    url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return sendText(res, 400, 'Bad request');
  }

  // Temporary diagnostics endpoint (helps debug serverless boot issues).
  if (pathname === '/diag') {
    const os = require('node:os');
    const info = { node: process.version, vercel: Boolean(process.env.VERCEL), cwd: process.cwd() };
    try { require('node:sqlite'); info.sqlite = 'ok'; } catch (e) { info.sqlite = 'ERR: ' + e.message; }
    try { require('node:fs').writeFileSync(os.tmpdir() + '/ag-write-test', 'ok'); info.tmp = 'writable'; } catch (e) { info.tmp = 'ERR: ' + e.message; }
    if (require('./lib/db').dbInitError) info.dbInitError = String(require('./lib/db').dbInitError.message || require('./lib/db').dbInitError);
    try { info.products = db.prepare('SELECT COUNT(*) AS c FROM products').get().c; info.db = 'ok'; } catch (e) { info.db = 'ERR: ' + e.message; }
    return sendJson(res, 200, info);
  }

  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);

  // static assets
  if (pathname.startsWith('/assets/')) {
    const filePath = path.join(PUBLIC_DIR, pathname.replace(/^\/assets\//, 'assets/'));
    if (!filePath.startsWith(PUBLIC_DIR)) return sendText(res, 403, 'Forbidden');
    const ok = serveFile(res, filePath, req, { cache: 'public, max-age=3600' });
    if (!ok) return sendText(res, 404, 'Not found');
    return;
  }

  if (pathname === '/favicon.ico') {
    const ok = serveFile(res, path.join(PUBLIC_DIR, 'assets', 'favicon.svg'), req, { cache: 'public, max-age=86400' });
    if (!ok) return sendText(res, 404, 'Not found');
    return;
  }

  if (pathname === '/robots.txt') {
    return sendText(
      res,
      200,
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\n\nSitemap: ${url.origin}/sitemap.xml\n`,
      'text/plain; charset=utf-8'
    );
  }

  if (pathname === '/sitemap.xml') {
    const products = db.prepare('SELECT slug, updated_at FROM products WHERE active = 1').all();
    const pages = ['', '/shop', '/about', '/contact', '/faq', '/track-order', '/terms-and-conditions', '/privacy-policy', '/shipping-policy', '/refund-cancellation'];
    const urls = [
      ...pages.map((p) => `<url><loc>${url.origin}${p || '/'}</loc><changefreq>weekly</changefreq><priority>${p === '' ? '1.0' : '0.6'}</priority></url>`),
      ...products.map((p) => `<url><loc>${url.origin}/product/${encodeURIComponent(p.slug)}</loc><lastmod>${String(p.updated_at).slice(0, 10)}</lastmod><priority>0.8</priority></url>`),
    ];
    return sendText(res, 200, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`, 'application/xml; charset=utf-8');
  }

  // generated artwork (collection cover by theme)
  let m = pathname.match(/^\/art\/theme\/([a-z]+)\/cover\.svg$/);
  if (m) {
    const theme = m[1];
    if (!THEMES[theme]) return sendText(res, 404, 'Artwork not found');
    const themeIndex = Object.keys(THEMES).indexOf(theme);
    const svg = coverSvg({
      id: 900 + themeIndex,
      title: `${THEMES[theme].label} Collection`,
      theme,
      palette: 'sunset',
      pages: 25,
      art_variant: 0,
      badge: '',
    });
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    });
    return res.end(svg);
  }

  // generated artwork
  m = pathname.match(/^\/art\/(\d+)\/cover\.svg$/);
  if (m) {
    const product = getProductById(m[1]);
    if (!product) return sendText(res, 404, 'Artwork not found');
    const svg = coverSvg(product);
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    });
    return res.end(svg);
  }
  m = pathname.match(/^\/art\/(\d+)\/page\/(\d+)\.svg$/);
  if (m) {
    const product = getProductById(m[1]);
    if (!product) return sendText(res, 404, 'Artwork not found');
    const page = clamp(toInt(m[2], 1), 1, 999);
    const svg = pageSvg(product, page);
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    });
    return res.end(svg);
  }

  if (pathname === '/manifest.webmanifest') {
    return sendJson(res, 200, {
      name: 'Arts Book', short_name: 'Arts Book', start_url: '/', display: 'standalone',
      background_color: '#fbf6ee', theme_color: '#1f3d33',
      icons: [{ src: '/assets/logo-mark.svg', sizes: 'any', type: 'image/svg+xml' }],
    });
  }

  // API
  if (pathname.startsWith('/api/')) {
    try {
      await handleApi(req, res, url);
    } catch (error) {
      const status = error.status || 500;
      if (status >= 500) console.error('[api]', error);
      if (!res.headersSent) sendJson(res, status, { ok: false, error: status >= 500 ? 'Something went wrong. Please try again.' : error.message });
    }
    return;
  }

  // PayU callbacks
  if (pathname === '/payu/success' || pathname === '/payu/failure') {
    try {
      if (req.method !== 'POST') return redirect(res, '/');
      const form = await readForm(req);
      const data = Object.fromEntries(form.entries());
      const order = getOrderByNo(data.txnid);
      if (!order) return redirect(res, '/');
      const key = auth.receiptKey(order.order_no);

      if (!payu.isConfigured()) {
        return redirect(res, `/receipt/${order.order_no}?key=${key}`);
      }

      const valid = payu.verifyResponseHash(data);
      if (!valid) {
        console.error('[payu] hash verification failed for', data.txnid);
        return redirect(res, `/payment?order=${order.order_no}&key=${key}&status=invalid`);
      }

      if (pathname === '/payu/success' && data.status === 'success') {
        updateOrderPayment(order.order_no, {
          paymentStatus: 'paid',
          status: 'confirmed',
          txnid: data.txnid,
          mihpayid: data.mihpayid || '',
        });
        return redirect(res, `/receipt/${order.order_no}?key=${key}&paid=1`);
      }

      updateOrderPayment(order.order_no, {
        paymentStatus: 'failed',
        status: 'cancelled',
        txnid: data.txnid,
      });
      return redirect(res, `/payment?order=${order.order_no}&key=${key}&status=failed`);
    } catch (error) {
      console.error('[payu]', error);
      return redirect(res, '/');
    }
  }

  // pages
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendText(res, 405, 'Method not allowed');
  }

  try {
    if (pathname === '/' || pathname === '/index.html') {
      return sendHtml(res, 200, renderPage('index'));
    }
    if (pathname === '/shop' || pathname === '/collections') {
      return sendHtml(res, 200, renderPage('shop'));
    }
    if (pathname === '/cart') return sendHtml(res, 200, renderPage('cart'));
    if (pathname === '/checkout') return sendHtml(res, 200, renderPage('checkout'));
    if (pathname === '/payment') return sendHtml(res, 200, renderPage('payment'));
    if (pathname === '/track-order') return sendHtml(res, 200, renderPage('track'));
    if (pathname === '/about') return sendHtml(res, 200, renderPage('about'));
    if (pathname === '/contact') return sendHtml(res, 200, renderPage('contact'));
    if (pathname === '/faq') return sendHtml(res, 200, renderPage('faq'));
    if (pathname === '/terms-and-conditions') return sendHtml(res, 200, renderPage('terms'));
    if (pathname === '/privacy-policy') return sendHtml(res, 200, renderPage('privacy'));
    if (pathname === '/shipping-policy') return sendHtml(res, 200, renderPage('shipping'));
    if (pathname === '/refund-cancellation') return sendHtml(res, 200, renderPage('refund'));
    if (pathname === '/admin') {
      res.setHeader('Cache-Control', 'no-store');
      return sendHtml(
        res,
        200,
        renderPage('admin', {
          title: 'Admin — Arts Book',
          bodyClass: 'admin-body',
          extraHead: '<link rel="stylesheet" href="/assets/css/admin.css">\n  <meta name="robots" content="noindex, nofollow">',
        })
      );
    }

    m = pathname.match(/^\/product\/([^/]+)$/);
    if (m) {
      const product = getProductBySlug(m[1]);
      if (!product) {
        return sendHtml(res, 404, renderPage('notfound'));
      }
      return sendHtml(
        res,
        200,
        renderPage('product', {
          title: `${product.title} — Arts Book`,
          description: `${product.title}. ${product.description.slice(0, 150)}`,
        })
      );
    }

    m = pathname.match(/^\/receipt\/([^/]+)$/);
    if (m) {
      const order = getOrderByNo(m[1]);
      if (!order) return sendHtml(res, 404, renderPage('notfound'));
      return sendHtml(res, 200, renderPage('receipt', { title: `Order ${order.order_no} — Arts Book` }));
    }

    if (pathname === '/login' || pathname === '/signin') return redirect(res, '/admin');
    if (pathname === '/order-tracking') return redirect(res, '/track-order');
    if (pathname === '/terms') return redirect(res, '/terms-and-conditions');
    if (pathname === '/privacy') return redirect(res, '/privacy-policy');
    if (pathname === '/shipping') return redirect(res, '/shipping-policy');
    if (pathname === '/refund') return redirect(res, '/refund-cancellation');

    return sendHtml(res, 404, renderPage('notfound'));
  } catch (error) {
    console.error('[page]', error);
    return sendText(res, 500, 'Something went wrong while loading this page.');
  }
}

// When run directly (local dev / VPS) start a listening HTTP server.
// When imported (Vercel serverless function) only export the handler.
if (require.main === module) {
  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.error('[server]', error);
      if (!res.headersSent) sendText(res, 500, 'Internal server error');
      else res.end();
    });
  });

  server.listen(PORT, HOST, () => {
    const settings = getSettings();
    console.log('');
    console.log('  Arts Book is running');
    console.log(`  Store:  http://localhost:${PORT}`);
    console.log(`  Admin:  http://localhost:${PORT}/admin`);
    console.log(`  Admin password: ${process.env.ADMIN_PASSWORD ? '(set via ADMIN_PASSWORD)' : 'ArtGuru@2026 (default — change it!)'}`);
    console.log(`  PayU:   ${payu.isConfigured() ? `${payu.PAYU_MODE} mode` : 'demo mode (PAYU_KEY / PAYU_SALT not set)'}`);
    console.log(`  Database: ${process.env.FIRESTORE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID ? 'Firebase Firestore' : path.join('data', 'artguru.db')}`);
    console.log('');
    if (seeded) console.log('  Seeded products, categories, coupons and store settings.');
  });
}

// Vercel's Node launcher requires the default export of the entry module to
// be a request-handler function (or an http.Server). Local runs
// (`node server.js`) still start a listening server via the require.main
// guard above. The named property keeps `require('../server.js')` destructuring
// in api/index.js working unchanged.
module.exports = handleRequest;
module.exports.handleRequest = handleRequest;
