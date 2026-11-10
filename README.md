# Art Guru — Premium Colouring Books Store

A complete, production-ready ecommerce website for **Art Guru**, a premium drawing and
colouring-book studio. It includes a full storefront, a password-protected admin panel,
Cash on Delivery, PayU online payments, order tracking, invoices and a reporting dashboard.

Built with **zero external dependencies** — only Node.js core modules and the built-in
`node:sqlite` database. Artwork (covers and inside pages) is generated as deterministic SVG,
so there are no image assets to manage or optimise.

---

## Highlights

- **80 seeded products** across 10 curated categories, MRP ₹249–₹799
- Every product has **25 pages**, each with a genuinely different hand-drawn design, plus a full cover gallery
- **3 animated home banners** with sliding product + content
- Creative home sections: categories, editor's picks, promos, bestsellers, new arrivals
- Shop with **search, category/price/rating filters, sorting, pagination** and URL sync
- Product page with gallery, lightbox, pincode check, accordions, reviews and related books
- Persistent cart, wishlist, coupons and a free-shipping meter
- Checkout with **Cash on Delivery** or **PayU online payment**
- Secure post-payment **order receipt / invoice** page and order tracking
- Full admin panel: dashboard, orders, products, reports, coupons, messages,
  subscribers and store settings
- Policy pages with real content: Terms, Privacy, Shipping, Refund & Cancellation
- SEO metadata, security headers, responsive layout and print-ready invoices

---

## Requirements

- **Node.js v22.5 or newer** (v24 recommended; it ships `node:sqlite`)
- No `npm install` is required — there are no third-party packages

Check your version:

```bash
node -v
```

---

## Quick start

From the project folder:

```bash
npm start
```

or directly:

```bash
node server.js
```

Then open:

| Page | URL |
| --- | --- |
| Storefront | <http://localhost:3000> |
| Shop | <http://localhost:3000/shop> |
| Admin panel | <http://localhost:3000/admin> |
| Order tracking | <http://localhost:3000/track-order> |

On first run the database is created at `data/artguru.db` and seeded with 80 products,
10 categories, 3 coupons and store settings. Existing databases are topped up
automatically with any new collections and all books are normalised to 25 pages.

### Development mode

```bash
npm run dev
```

Uses Node's `--watch` flag to restart on file changes.

---

## Admin panel

- URL: `/admin`
- Default password: **`ArtGuru@2026`**
- Default email: `admin@artguru.in`

> **Change the password before going live.** Set the `ADMIN_PASSWORD` environment variable.

The admin session lasts 12 hours and is stored in an HMAC-signed, HTTP-only cookie.
After 5 failed logins from the same IP, login is rate-limited for 15 minutes.

Admin sections:

- **Dashboard** — net revenue, paid revenue, catalogue size, alerts, 14-day revenue chart,
  low stock, recent orders and top products
- **Orders** — search and filter, open an order, update status/payment, cancel with
  automatic stock release, open the customer receipt
- **Products** — search/filter, create, edit, hide or delete titles; covers and inside
  pages generate automatically
- **Reports** — date range, revenue/orders/units/AOV, daily sales, status and payment mix,
  top products, category sales and CSV download
- **Coupons** — percentage or flat codes with minimum order and maximum discount rules
- **Messages** — contact-form inbox with read/unread state and quick reply
- **Subscribers** — newsletter list with CSV export
- **Settings** — store identity, contact details, map embed, social links, shipping fee,
  free-shipping threshold, COD fee and return window

---

## Environment variables

Create the variables in your shell before starting, or use your host's dashboard.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `HOST` | `0.0.0.0` | Bind address |
| `NODE_ENV` | — | Set to `production` to mark cookies `Secure` (use with HTTPS) |
| `ADMIN_PASSWORD` | `ArtGuru@2026` | Admin panel password — **change this** |
| `ADMIN_EMAIL` | `admin@artguru.in` | Admin email shown in the panel |
| `ARTGURU_SECRET` | dev fallback | Secret used to sign admin sessions — **set a long random value** |
| `SESSION_SECRET` | — | Alternative name for the same secret |
| `PAYU_KEY` | — | PayU merchant key |
| `PAYU_SALT` | — | PayU merchant salt |
| `PAYU_MODE` | `test` | `test` or `live` |
| `APP_URL` | `http://localhost:3000` | Public base URL used for PayU callback URLs |

### PowerShell example

```powershell
$env:PORT = "3000"
$env:NODE_ENV = "production"
$env:ADMIN_PASSWORD = "use-a-strong-password"
$env:ARTGURU_SECRET = "a-long-random-string"
$env:APP_URL = "https://www.artguru.in"
$env:PAYU_KEY = "your-payu-key"
$env:PAYU_SALT = "your-payu-salt"
$env:PAYU_MODE = "live"
node server.js
```

### Linux / macOS example

```bash
PORT=3000 \
NODE_ENV=production \
ADMIN_PASSWORD="use-a-strong-password" \
ARTGURU_SECRET="a-long-random-string" \
APP_URL="https://www.artguru.in" \
PAYU_KEY="your-payu-key" \
PAYU_SALT="your-payu-salt" \
PAYU_MODE="live" \
node server.js
```

---

## Payments

### Demo mode (default)

If `PAYU_KEY` and `PAYU_SALT` are **not** set, online payment runs in a safe demo mode.
The payment page shows simulated **Success** and **Failure** buttons so the complete
order → payment → receipt flow can be tested without a PayU account.

### Live / test PayU

1. Set `PAYU_KEY`, `PAYU_SALT` and `APP_URL`.
2. Set `PAYU_MODE=test` to use `https://test.payu.in/_payment`, or `PAYU_MODE=live`
   to use `https://secure.payu.in/_payment`.
3. In the PayU dashboard, configure the success and failure URLs:
   - Success: `https://your-domain.com/payu/success`
   - Failure: `https://your-domain.com/payu/failure`
4. Make sure `APP_URL` matches the public domain exactly (no trailing slash).

The server already:

- builds the SHA-512 request hash,
- verifies the SHA-512 response hash with a timing-safe comparison,
- marks the order paid only after a verified success response,
- records the PayU transaction id and payment id,
- shows the paid receipt after redirect.

### Cash on Delivery

COD orders are created immediately with `payment_status = pending`. The admin can mark
them paid when the courier collects the cash. If an order is cancelled from the admin
panel, reserved stock is released automatically exactly once.

---

## Order lifecycle

1. Customer adds books to the cart and applies an optional coupon.
2. Checkout collects delivery details and chooses **COD** or **PayU**.
3. The order is created and stock is reserved.
4. For online payment, the customer pays through PayU and lands on the receipt page.
5. The admin confirms, packs, ships and delivers from the Orders screen.
6. Customers can track an order with the order number + phone on `/track-order`.
7. Receipts are protected by a signed key: `/receipt/AG...?key=...`.

Stock is reserved at order creation, restored on cancellation, and never double-restored.

---

## Data and reset

- Database file: `data/artguru.db` (SQLite, WAL mode)
- Tables: `products`, `categories`, `orders`, `order_items`, `coupons`, `messages`,
  `subscribers`, `settings`
- To start fresh, stop the server and delete `data/artguru.db`
  (and `artguru.db-wal` / `artguru.db-shm` if present), then restart.
- The seed runs automatically whenever the `products` table is empty.

> Back up `data/artguru.db` regularly in production.

---

## Project structure

```
art-guru/
├─ server.js              HTTP server, routing, APIs, PayU callbacks
├─ package.json
├─ data/
│  └─ artguru.db          SQLite database (created on first run)
├─ lib/
│  ├─ art.js              Deterministic SVG cover / inside-page generator
│  ├─ auth.js             Signed admin sessions, rate limiting, receipt keys
│  ├─ db.js               Schema, seed data, settings, product helpers
│  ├─ payu.js             PayU hashing, request builder, mode handling
│  └─ util.js             Escaping, cookies, money, validation, CSV helpers
├─ public/
│  └─ assets/
│     ├─ css/             style.css, pages.css, admin.css
│     ├─ js/              app.js, admin.js, pages/*.js
│     ├─ logo.svg         Primary logo
│     ├─ logo-light.svg   Light logo for dark backgrounds
│     ├─ logo-mark.svg    Compact mark / app icon
│     └─ favicon.svg
└─ views/
   ├─ partials/           head.html, header.html, footer.html
   └─ pages/              All storefront + admin page templates
```

### Generated artwork

- Cover: `/art/:id/cover.svg`
- Inside page: `/art/:id/page/:page.svg`

Artwork is derived from each product's theme, palette and variant, so new products
automatically get a matching cover and inner pages without uploading images.

---

## Main routes

### Storefront

`/` · `/shop` · `/product/:slug` · `/cart` · `/checkout` · `/payment` ·
`/receipt/:orderNo` · `/track-order` · `/about` · `/contact` · `/faq` ·
`/terms-and-conditions` · `/privacy-policy` · `/shipping-policy` · `/refund-cancellation`

### Public APIs

`GET /api/products` · `GET /api/products/:slug` · `GET /api/categories` ·
`GET /api/settings` · `POST /api/coupons/validate` · `POST /api/orders` ·
`GET /api/orders/:orderNo/receipt` · `GET /api/orders/:orderNo/track` ·
`POST /api/contact` · `POST /api/newsletter` · `POST /api/payu/initiate` ·
`GET|POST /payu/success` · `GET|POST /payu/failure`

### Admin APIs (session required)

`POST /api/admin/login` · `POST /api/admin/logout` · `GET /api/admin/me` ·
`GET /api/admin/stats` · `GET|POST /api/admin/products` ·
`PUT|DELETE /api/admin/products/:id` · `GET /api/admin/orders` ·
`GET|PATCH /api/admin/orders/:id` · `GET /api/admin/reports` ·
`GET /api/admin/reports.csv` · `GET|POST /api/admin/coupons` ·
`PUT|DELETE /api/admin/coupons/:id` · `GET /api/admin/messages` ·
`PATCH /api/admin/messages/:id` · `GET /api/admin/subscribers` ·
`GET|PUT /api/admin/settings`

---

## Deployment notes

1. Use **Node.js 22.5+** and run `node server.js`.
2. Put the app behind **Nginx, Caddy or a cloud load balancer**.
3. Terminate **HTTPS** at the proxy. Set `NODE_ENV=production` so cookies are `Secure`.
4. Set a strong `ADMIN_PASSWORD` and a long random `ARTGURU_SECRET`.
5. Set `APP_URL` to the exact public HTTPS domain.
6. Keep `data/` on a persistent volume and back it up.
7. The server sets sensible security headers (`X-Content-Type-Options`,
   `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`).
8. The admin panel is marked `noindex, nofollow`.
9. For a process manager, use systemd, PM2 or your platform's runner.

### Example Nginx reverse proxy

```nginx
server {
    listen 443 ssl;
    server_name www.artguru.in;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option A: Fly.io (easiest + persistent SQLite)

1. Install `flyctl` and login: `fly auth login`
2. From project root run:
   ```bash
   fly launch --no-deploy
   fly volumes create artguru_data --size 3 -r bom
   fly secrets set ADMIN_PASSWORD='ArtGuru@2026' ARTGURU_SECRET='...' APP_URL='https://artguru.fly.dev'
   fly deploy
   ```
3. The SQLite file lives on the mounted volume at `/app/data`, so data persists across deploys.

### Option B: Render / Railway / VPS

- Render Web Service: choose Node 22+. Note that Render's free tier has an
  ephemeral filesystem, so use a paid **persistent disk** or switch to a hosted
  database (see below).
- Railway: attach a volume or use Railway's managed PostgreSQL.
- VPS (Hetzner/DigitalOcean): `git clone`, `npm install`, run with **PM2**, put
  **Nginx** in front, point a domain, and back up `data/artguru.db` daily.

### Option C: Docker / Docker Compose

```bash
docker compose up -d
```

This builds the image and mounts `./data` into the container. Set secrets in a
`.env` file or pass them with `-e` flags.

### Database choice

The default is **SQLite** (`node:sqlite`), which is fine for a single-node
production site with a persistent disk. If you expect high traffic, multiple
containers, or heavy admin use, migrate to **PostgreSQL** (Supabase, Neon,
Railway Postgres, or AWS RDS). SQLite is **not recommended** on serverless
platforms with ephemeral storage (Vercel, Netlify Functions).

**Firebase** is possible but would need a rewrite of `lib/db.js` to use
Firestore/Realtime DB. For this codebase, SQLite on persistent disk or
PostgreSQL are simpler and more reliable.

---

## Customisation checklist

Before launch, update these via **Admin → Settings**:

- Store name, tagline and announcement bar
- Phone, email, WhatsApp and support hours
- Full address, city, state, PIN and country
- Google Maps embed URL
- Instagram / Facebook / YouTube links
- Shipping fee, free-shipping threshold, COD fee and return window
- GSTIN / tax note and order prefix

Then verify:

- PayU test credentials and callback URLs
- `ADMIN_PASSWORD` and `ARTGURU_SECRET`
- `APP_URL` and HTTPS
- A test COD order and a test online order end to end

---

## Safety and privacy

- Admin sessions are HMAC-signed and HTTP-only.
- Receipt links require a signed key.
- PayU responses are verified before an order is marked paid.
- Customer data stays in your own SQLite database.
- No analytics, trackers or third-party scripts are loaded.

---

## License

Proprietary — built for Art Guru. All artwork and branding are original to this project.
