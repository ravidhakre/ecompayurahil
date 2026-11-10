'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, 'artguru.db');

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  theme TEXT NOT NULL DEFAULT 'mandala',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'mandala',
  palette TEXT NOT NULL DEFAULT 'sunset',
  art_variant INTEGER NOT NULL DEFAULT 0,
  mrp INTEGER NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  pages INTEGER NOT NULL DEFAULT 64,
  age_group TEXT DEFAULT '8+ years',
  description TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  bestseller INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 4.7,
  reviews INTEGER NOT NULL DEFAULT 0,
  image_url TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  notes TEXT DEFAULT '',
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  shipping INTEGER NOT NULL DEFAULT 0,
  cod_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  coupon_code TEXT DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'placed',
  restocked INTEGER NOT NULL DEFAULT 0,
  payu_txnid TEXT DEFAULT '',
  payu_mihpayid TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER,
  title TEXT NOT NULL,
  slug TEXT DEFAULT '',
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  line_total INTEGER NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percent',
  value INTEGER NOT NULL,
  min_order INTEGER NOT NULL DEFAULT 0,
  max_discount INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS admin_logins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT DEFAULT '',
  success INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`);

const CATEGORY_SEED = [
  { name: 'Mandala Magic', slug: 'mandala-magic', theme: 'mandala', description: 'Intricate mandalas that turn colouring into meditation.' },
  { name: 'Animal Kingdom', slug: 'animal-kingdom', theme: 'animals', description: 'Wild, wonderful and waiting for your colours.' },
  { name: 'Little Artists', slug: 'little-artists', theme: 'kids', description: 'Playful pages made for tiny hands and big imaginations.' },
  { name: 'Floral Dreams', slug: 'floral-dreams', theme: 'floral', description: 'Blooming botanicals, petals and garden escapes.' },
  { name: 'Fantasy Worlds', slug: 'fantasy-worlds', theme: 'fantasy', description: 'Castles, moons and magical worlds to get lost in.' },
  { name: 'Stress Relief', slug: 'stress-relief', theme: 'stress', description: 'Slow, soothing patterns for a calmer mind.' },
  { name: 'Travel Diaries', slug: 'travel-diaries', theme: 'travel', description: 'Wanderlust on paper, one page at a time.' },
  { name: 'Festive Colours', slug: 'festive-colours', theme: 'festive', description: 'Celebrate Diwali, rangoli and every joyful moment.' },
  { name: 'Toon Town', slug: 'toon-town', theme: 'cartoons', description: 'Superheroes, robots, mermaids and cartoon friends with big, bold lines.' },
  { name: 'India Pride', slug: 'india-pride', theme: 'india', description: 'Tiranga, chakra, peacocks and iconic Indian symbols to colour with pride.' },
];

const PRODUCT_SEED = [
  // Mandala Magic (1-8)
  { title: 'Mandala Bliss', theme: 'mandala', art: 0, mrp: 499, pages: 25, age: '12+ years', badge: 'Bestseller', feat: 1, best: 1, rating: 4.9, reviews: 412 },
  { title: 'Sacred Circles', theme: 'mandala', art: 0, mrp: 349, pages: 25, age: '12+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 188 },
  { title: 'Zen Mandala Garden', theme: 'mandala', art: 0, mrp: 599, pages: 25, age: '12+ years', badge: 'Top Rated', feat: 1, best: 1, rating: 4.8, reviews: 264 },
  { title: 'Mandala Magic', theme: 'mandala', art: 0, mrp: 299, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.6, reviews: 154 },
  { title: 'Infinite Mandalas', theme: 'mandala', art: 0, mrp: 699, pages: 25, age: '12+ years', badge: '', feat: 0, best: 0, rating: 4.8, reviews: 302 },
  { title: 'Mandala Meditations', theme: 'mandala', art: 0, mrp: 449, pages: 25, age: '12+ years', badge: 'Gift Pick', feat: 0, best: 1, rating: 4.7, reviews: 221 },
  { title: 'Mandala Harmony', theme: 'mandala', art: 0, mrp: 549, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.5, reviews: 96 },
  { title: 'Cosmic Mandalas', theme: 'mandala', art: 0, mrp: 799, pages: 25, age: '12+ years', badge: 'Limited', feat: 0, best: 0, rating: 4.9, reviews: 178 },

  // Animal Kingdom (9-16)
  { title: 'Wild & Wonderful', theme: 'animals', art: 1, mrp: 499, pages: 25, age: '8+ years', badge: 'Bestseller', feat: 1, best: 1, rating: 4.8, reviews: 341 },
  { title: 'Jungle Friends', theme: 'animals', art: 2, mrp: 349, pages: 25, age: '5-8 years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 209 },
  { title: 'Majestic Birds', theme: 'animals', art: 2, mrp: 599, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.6, reviews: 147 },
  { title: 'Ocean Wonders', theme: 'animals', art: 3, mrp: 399, pages: 25, age: '8+ years', badge: 'New', feat: 0, best: 0, rating: 4.8, reviews: 118 },
  { title: 'Cute Pet Parade', theme: 'animals', art: 1, mrp: 299, pages: 25, age: '4-8 years', badge: '', feat: 0, best: 0, rating: 4.5, reviews: 167 },
  { title: 'Forest Creatures', theme: 'animals', art: 2, mrp: 549, pages: 25, age: '8+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 133 },
  { title: 'Butterfly Garden', theme: 'animals', art: 0, mrp: 449, pages: 25, age: '8+ years', badge: 'Top Rated', feat: 1, best: 0, rating: 4.9, reviews: 256 },
  { title: 'Animal Kingdom', theme: 'animals', art: 1, mrp: 699, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 188 },

  // Little Artists (17-24)
  { title: 'Little Artist Adventure', theme: 'kids', art: 1, mrp: 299, pages: 25, age: '3-6 years', badge: 'Bestseller', feat: 1, best: 1, rating: 4.9, reviews: 389 },
  { title: 'Dino Doodles', theme: 'kids', art: 0, mrp: 249, pages: 25, age: '3-6 years', badge: '', feat: 0, best: 1, rating: 4.8, reviews: 276 },
  { title: 'Unicorn Dreams', theme: 'kids', art: 1, mrp: 349, pages: 25, age: '4-8 years', badge: 'Top Rated', feat: 1, best: 1, rating: 4.9, reviews: 421 },
  { title: 'Space Explorers', theme: 'kids', art: 2, mrp: 399, pages: 25, age: '5-9 years', badge: 'New', feat: 0, best: 0, rating: 4.7, reviews: 132 },
  { title: 'Magical Mermaids', theme: 'kids', art: 1, mrp: 349, pages: 25, age: '5-9 years', badge: '', feat: 0, best: 0, rating: 4.8, reviews: 198 },
  { title: 'Farmyard Fun', theme: 'kids', art: 0, mrp: 249, pages: 25, age: '3-6 years', badge: '', feat: 0, best: 0, rating: 4.6, reviews: 144 },
  { title: 'Fairy Tale Castle', theme: 'kids', art: 1, mrp: 449, pages: 25, age: '5-9 years', badge: 'Gift Pick', feat: 0, best: 0, rating: 4.8, reviews: 165 },
  { title: 'Superhero Squad', theme: 'kids', art: 2, mrp: 299, pages: 25, age: '5-9 years', badge: '', feat: 0, best: 0, rating: 4.5, reviews: 103 },

  // Floral Dreams (25-32)
  { title: 'Blooming Beauty', theme: 'floral', art: 0, mrp: 499, pages: 25, age: '10+ years', badge: 'Bestseller', feat: 1, best: 1, rating: 4.9, reviews: 328 },
  { title: 'Flower Mandalas', theme: 'floral', art: 0, mrp: 449, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 192 },
  { title: 'Botanical Bliss', theme: 'floral', art: 0, mrp: 599, pages: 25, age: '12+ years', badge: '', feat: 0, best: 0, rating: 4.8, reviews: 213 },
  { title: 'Rose Garden', theme: 'floral', art: 0, mrp: 349, pages: 25, age: '8+ years', badge: '', feat: 0, best: 0, rating: 4.6, reviews: 121 },
  { title: 'Wildflower Wonders', theme: 'floral', art: 0, mrp: 399, pages: 25, age: '8+ years', badge: 'New', feat: 0, best: 0, rating: 4.7, reviews: 88 },
  { title: 'Floral Fantasy', theme: 'floral', art: 0, mrp: 699, pages: 25, age: '12+ years', badge: '', feat: 0, best: 0, rating: 4.8, reviews: 176 },
  { title: 'Tropical Blooms', theme: 'floral', art: 0, mrp: 549, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 143 },
  { title: 'Lotus & Lilies', theme: 'floral', art: 0, mrp: 299, pages: 25, age: '8+ years', badge: 'Gift Pick', feat: 0, best: 0, rating: 4.6, reviews: 109 },

  // Fantasy Worlds (33-40)
  { title: 'Dragon Realm', theme: 'fantasy', art: 0, mrp: 599, pages: 25, age: '10+ years', badge: 'Top Rated', feat: 1, best: 1, rating: 4.9, reviews: 287 },
  { title: 'Enchanted Forest', theme: 'fantasy', art: 1, mrp: 499, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.8, reviews: 201 },
  { title: 'Mythical Creatures', theme: 'fantasy', art: 0, mrp: 549, pages: 25, age: '12+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 166 },
  { title: 'Galaxy Dreams', theme: 'fantasy', art: 1, mrp: 399, pages: 25, age: '8+ years', badge: 'New', feat: 0, best: 0, rating: 4.8, reviews: 114 },
  { title: "Wizard's World", theme: 'fantasy', art: 0, mrp: 449, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.5, reviews: 97 },
  { title: 'Dreamscape', theme: 'fantasy', art: 1, mrp: 699, pages: 25, age: '12+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 152 },
  { title: 'Fairy Kingdom', theme: 'fantasy', art: 0, mrp: 349, pages: 25, age: '6-10 years', badge: 'Gift Pick', feat: 0, best: 0, rating: 4.8, reviews: 183 },
  { title: 'Mystic Moon', theme: 'fantasy', art: 1, mrp: 799, pages: 25, age: '12+ years', badge: 'Limited', feat: 0, best: 0, rating: 4.9, reviews: 134 },

  // Stress Relief (41-48)
  { title: 'Calm Colouring', theme: 'stress', art: 0, mrp: 499, pages: 25, age: '12+ years', badge: 'Bestseller', feat: 1, best: 1, rating: 4.9, reviews: 367 },
  { title: 'Mindful Patterns', theme: 'stress', art: 0, mrp: 349, pages: 25, age: '12+ years', badge: '', feat: 0, best: 0, rating: 4.8, reviews: 228 },
  { title: 'Stress-Free Zen', theme: 'stress', art: 0, mrp: 599, pages: 25, age: '12+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 195 },
  { title: 'Peaceful Paisleys', theme: 'stress', art: 0, mrp: 299, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.6, reviews: 118 },
  { title: 'Serenity Swirls', theme: 'stress', art: 0, mrp: 449, pages: 25, age: '12+ years', badge: 'New', feat: 0, best: 0, rating: 4.7, reviews: 84 },
  { title: 'Slow Sunday', theme: 'stress', art: 0, mrp: 399, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.8, reviews: 143 },
  { title: 'Breathe & Colour', theme: 'stress', art: 0, mrp: 549, pages: 25, age: '12+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 172 },
  { title: 'Calm Kaleidoscope', theme: 'stress', art: 0, mrp: 799, pages: 25, age: '12+ years', badge: 'Top Rated', feat: 0, best: 0, rating: 4.9, reviews: 156 },

  // Travel Diaries (49-56)
  { title: 'Wanderlust Colouring', theme: 'travel', art: 0, mrp: 499, pages: 25, age: '10+ years', badge: 'Bestseller', feat: 1, best: 1, rating: 4.8, reviews: 246 },
  { title: 'World Landmarks', theme: 'travel', art: 2, mrp: 599, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 164 },
  { title: 'Coastal Escapes', theme: 'travel', art: 1, mrp: 349, pages: 25, age: '8+ years', badge: '', feat: 0, best: 0, rating: 4.6, reviews: 112 },
  { title: 'Mountain Retreats', theme: 'travel', art: 0, mrp: 449, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.8, reviews: 139 },
  { title: 'City Skylines', theme: 'travel', art: 2, mrp: 399, pages: 25, age: '10+ years', badge: 'New', feat: 0, best: 0, rating: 4.7, reviews: 93 },
  { title: 'Desert Dreams', theme: 'travel', art: 1, mrp: 549, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.6, reviews: 101 },
  { title: 'Around the World', theme: 'travel', art: 2, mrp: 699, pages: 25, age: '12+ years', badge: '', feat: 0, best: 0, rating: 4.8, reviews: 187 },
  { title: 'Tropical Getaway', theme: 'travel', art: 0, mrp: 299, pages: 25, age: '8+ years', badge: 'Gift Pick', feat: 0, best: 0, rating: 4.7, reviews: 126 },

  // Festive Colours (57-64)
  { title: 'Diwali Delights', theme: 'festive', art: 0, mrp: 399, pages: 25, age: '8+ years', badge: 'Bestseller', feat: 1, best: 1, rating: 4.9, reviews: 298 },
  { title: 'Rangoli Radiance', theme: 'festive', art: 1, mrp: 349, pages: 25, age: '8+ years', badge: '', feat: 0, best: 0, rating: 4.8, reviews: 187 },
  { title: 'Festive Mandalas', theme: 'festive', art: 1, mrp: 549, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 142 },
  { title: 'Celebration Colours', theme: 'festive', art: 0, mrp: 299, pages: 25, age: '6-10 years', badge: '', feat: 0, best: 0, rating: 4.6, reviews: 108 },
  { title: 'Puja & Patterns', theme: 'festive', art: 1, mrp: 449, pages: 25, age: '10+ years', badge: 'New', feat: 0, best: 0, rating: 4.7, reviews: 76 },
  { title: 'Holi Splash', theme: 'festive', art: 0, mrp: 249, pages: 25, age: '5-9 years', badge: '', feat: 0, best: 0, rating: 4.5, reviews: 89 },
  { title: 'Christmas Cheer', theme: 'festive', art: 0, mrp: 499, pages: 25, age: '6-10 years', badge: 'Gift Pick', feat: 0, best: 0, rating: 4.8, reviews: 134 },
  { title: 'Eid Elegance', theme: 'festive', art: 1, mrp: 799, pages: 25, age: '10+ years', badge: 'Limited', feat: 0, best: 0, rating: 4.9, reviews: 119 },

  // Toon Town (65-72)
  { title: 'Toon Superheroes', theme: 'cartoons', art: 0, mrp: 349, pages: 25, age: '5-9 years', badge: 'Bestseller', feat: 1, best: 1, rating: 4.9, reviews: 214 },
  { title: 'Robot City', theme: 'cartoons', art: 1, mrp: 299, pages: 25, age: '5-9 years', badge: '', feat: 0, best: 0, rating: 4.8, reviews: 168 },
  { title: 'Mermaid Lagoon', theme: 'cartoons', art: 2, mrp: 399, pages: 25, age: '4-8 years', badge: 'New', feat: 1, best: 0, rating: 4.8, reviews: 143 },
  { title: 'Fairy Sparkle', theme: 'cartoons', art: 1, mrp: 349, pages: 25, age: '4-8 years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 121 },
  { title: 'Pirate Island', theme: 'cartoons', art: 0, mrp: 449, pages: 25, age: '6-10 years', badge: '', feat: 0, best: 1, rating: 4.7, reviews: 98 },
  { title: 'Clown Carnival', theme: 'cartoons', art: 2, mrp: 249, pages: 25, age: '3-6 years', badge: '', feat: 0, best: 0, rating: 4.6, reviews: 87 },
  { title: 'Princess Palace', theme: 'cartoons', art: 1, mrp: 549, pages: 25, age: '5-9 years', badge: 'Gift Pick', feat: 1, best: 1, rating: 4.9, reviews: 176 },
  { title: 'Space Cadets', theme: 'cartoons', art: 2, mrp: 399, pages: 25, age: '6-10 years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 109 },

  // India Pride (73-80)
  { title: 'Tiranga Colours', theme: 'india', art: 0, mrp: 349, pages: 25, age: '8+ years', badge: 'Bestseller', feat: 1, best: 1, rating: 4.9, reviews: 231 },
  { title: 'Ashoka Chakra', theme: 'india', art: 1, mrp: 299, pages: 25, age: '8+ years', badge: '', feat: 0, best: 0, rating: 4.8, reviews: 164 },
  { title: 'India Gate Dreams', theme: 'india', art: 2, mrp: 449, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 127 },
  { title: 'Peacock Pride', theme: 'india', art: 0, mrp: 549, pages: 25, age: '10+ years', badge: 'Top Rated', feat: 1, best: 0, rating: 4.9, reviews: 203 },
  { title: 'Royal Bengal Tiger', theme: 'india', art: 1, mrp: 499, pages: 25, age: '8+ years', badge: '', feat: 0, best: 1, rating: 4.8, reviews: 156 },
  { title: 'Lotus of India', theme: 'india', art: 0, mrp: 349, pages: 25, age: '10+ years', badge: '', feat: 0, best: 0, rating: 4.7, reviews: 118 },
  { title: 'Mango Magic', theme: 'india', art: 2, mrp: 299, pages: 25, age: '6-10 years', badge: '', feat: 0, best: 0, rating: 4.6, reviews: 94 },
  { title: 'Ganga Ghats', theme: 'india', art: 1, mrp: 599, pages: 25, age: '12+ years', badge: 'Limited', feat: 0, best: 0, rating: 4.9, reviews: 137 },
];

const PALETTE_ROTATION = ['sunset', 'ocean', 'berry', 'forest', 'saffron', 'lavender', 'terracotta', 'ink'];

const DESCRIPTION_BY_THEME = {
  mandala: 'A beautifully curated collection of intricate mandalas, each page designed to help you slow down, focus and find your flow. Printed single-sided on thick, bleed-resistant paper so your colours never spoil the next design.',
  animals: 'Meet a whole kingdom of creatures waiting for your palette. From majestic birds to playful pets, every illustration is drawn with clean, confident lines and just enough detail to keep your pencils busy for hours.',
  kids: 'Made for little hands and big imaginations. Big bold outlines, friendly characters and easy-to-colour spaces make this the perfect screen-free activity for curious young artists.',
  floral: 'Step into a garden that never wilts. Layered petals, graceful stems and botanical details invite you to experiment with colour, shading and your own creative twists.',
  fantasy: 'Open a door to castles, moons and magical creatures. Rich, imaginative scenes give experienced colourists plenty to explore while leaving room for your own story to unfold.',
  stress: 'A calming collection of soothing patterns designed for slow, mindful colouring. Let the repetitive lines quiet a busy mind and turn a few minutes a day into a small ritual of self-care.',
  travel: 'Wander without packing a bag. Landmarks, landscapes and little adventures from around the world are ready to be brought to life in your favourite colours.',
  festive: 'Celebrate the joy of the season with diyas, rangoli, ornaments and festive patterns. A thoughtful gift and a lovely way to add a little handmade warmth to your celebrations.',
  cartoons: 'Superheroes, robots, mermaids and friendly cartoon characters with bold, easy-to-colour outlines. Big personalities, playful scenes and plenty of fun for young artists.',
  india: 'Celebrate India with the tiranga, Ashoka Chakra, peacocks, tigers, lotus blooms and iconic landmarks. Beautifully detailed pages that make colouring a proud, joyful ritual.',
};

const AGE_BY_INDEX = ['8+ years', '10+ years', '12+ years', '6-10 years'];

function nowIso() {
  return new Date().toISOString();
}

function moneyNice(value) {
  const n = Math.round(Number(value) || 0);
  return Math.max(199, Math.round(n / 10) * 10 - 1);
}

const PRODUCT_INSERT_SQL = `
  INSERT INTO products
    (slug, title, category, theme, palette, art_variant, mrp, price, stock, pages, age_group,
     description, badge, featured, bestseller, rating, reviews, image_url, active, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 25, ?, ?, ?, ?, ?, ?, ?, '', 1, ?, ?)
`;

function seedSlug(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function insertSeedProduct(statement, item, index) {
  const cat = CATEGORY_SEED[Math.floor(index / 8)] || CATEGORY_SEED[CATEGORY_SEED.length - 1];
  const discount = 0.58 + ((index * 7) % 18) / 100; // 58% - 75% of MRP
  const price = moneyNice(item.mrp * discount);
  const palette = PALETTE_ROTATION[index % PALETTE_ROTATION.length];
  const description = DESCRIPTION_BY_THEME[item.theme] || DESCRIPTION_BY_THEME.mandala;
  const stock = 18 + ((index * 13) % 95);
  const createdAt = new Date(Date.now() - index * 86400000).toISOString();
  statement.run(
    seedSlug(item.title) || `book-${index + 1}`,
    item.title,
    cat.name,
    item.theme,
    palette,
    item.art,
    item.mrp,
    price,
    stock,
    item.age,
    description,
    item.badge || '',
    item.feat ? 1 : 0,
    item.best ? 1 : 0,
    item.rating,
    item.reviews,
    createdAt,
    createdAt
  );
}

function seed() {
  const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  if (productCount > 0) return false;

  const insertCategory = db.prepare(
    'INSERT INTO categories (name, slug, description, theme, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  CATEGORY_SEED.forEach((cat, i) => insertCategory.run(cat.name, cat.slug, cat.description, cat.theme, i));

  const insertProduct = db.prepare(PRODUCT_INSERT_SQL);
  PRODUCT_SEED.forEach((item, index) => insertSeedProduct(insertProduct, item, index));

  const insertCoupon = db.prepare(
    'INSERT INTO coupons (code, type, value, min_order, max_discount, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)'
  );
  insertCoupon.run('ART10', 'percent', 10, 499, 300, nowIso());
  insertCoupon.run('WELCOME50', 'fixed', 50, 299, 50, nowIso());
  insertCoupon.run('FESTIVE15', 'percent', 15, 799, 400, nowIso());

  return true;
}

// Idempotent top-up for databases created before new collections existed.
// Adds any missing categories/products and normalises every book to 25 pages.
function migrate() {
  const insertCategory = db.prepare(
    'INSERT OR IGNORE INTO categories (name, slug, description, theme, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  CATEGORY_SEED.forEach((cat, i) => insertCategory.run(cat.name, cat.slug, cat.description, cat.theme, i));

  const insertProduct = db.prepare(PRODUCT_INSERT_SQL.replace('INSERT INTO', 'INSERT OR IGNORE INTO'));
  PRODUCT_SEED.forEach((item, index) => insertSeedProduct(insertProduct, item, index));

  db.prepare('UPDATE products SET pages = 25 WHERE pages != 25').run();
}

const DEFAULT_SETTINGS = {
  store_name: 'Art Guru',
  tagline: 'Colour. Create. Calm.',
  announcement: 'Free shipping on orders above ₹499 · COD available · 7-day easy returns',
  phone: '+91 98765 43210',
  email: 'hello@artguru.in',
  whatsapp: '919876543210',
  address: 'Art Guru Studio, 2nd Floor, Creative House, Indiranagar',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
  country: 'India',
  support_hours: 'Mon–Sat, 10:00 AM – 6:00 PM IST',
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  youtube: 'https://youtube.com/',
  map_embed: '',
  gstin: 'GSTIN available on request',
  shipping_fee: '49',
  free_shipping_threshold: '499',
  cod_fee: '29',
  returns_days: '7',
  order_prefix: 'AG',
  about_short: 'Art Guru is a small Indian studio making beautiful colouring books for every kind of artist — from curious kids to grown-ups who colour to unwind.',
};

function seedSettings() {
  const insert = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) insert.run(key, value);
}

const seeded = seed();
migrate();
seedSettings();

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const out = { ...DEFAULT_SETTINGS };
  for (const row of rows) out[row.key] = row.value;
  return out;
}

function setSetting(key, value) {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(String(key), String(value == null ? '' : value));
}

function productArt(product) {
  return product.image_url || `/art/${product.id}/cover.svg`;
}

function normalizeProduct(row) {
  if (!row) return null;
  const mrp = Number(row.mrp) || 0;
  const price = Number(row.price) || 0;
  return {
    ...row,
    mrp,
    price,
    stock: Number(row.stock) || 0,
    pages: Number(row.pages) || 0,
    featured: Number(row.featured) || 0,
    bestseller: Number(row.bestseller) || 0,
    rating: Number(row.rating) || 0,
    reviews: Number(row.reviews) || 0,
    art_variant: Number(row.art_variant) || 0,
    active: Number(row.active) || 0,
    discount: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
    save: Math.max(0, mrp - price),
    cover: productArt(row),
  };
}

function getPublicSettings() {
  const s = getSettings();
  return {
    store_name: s.store_name,
    tagline: s.tagline,
    announcement: s.announcement,
    phone: s.phone,
    email: s.email,
    whatsapp: s.whatsapp,
    address: s.address,
    city: s.city,
    state: s.state,
    pincode: s.pincode,
    country: s.country,
    support_hours: s.support_hours,
    instagram: s.instagram,
    facebook: s.facebook,
    youtube: s.youtube,
    map_embed: s.map_embed,
    shipping_fee: Number(s.shipping_fee) || 0,
    free_shipping_threshold: Number(s.free_shipping_threshold) || 0,
    cod_fee: Number(s.cod_fee) || 0,
    returns_days: Number(s.returns_days) || 7,
    about_short: s.about_short,
  };
}

module.exports = {
  db,
  seed,
  migrate,
  seeded,
  getSettings,
  setSetting,
  getPublicSettings,
  normalizeProduct,
  productArt,
  DATA_DIR,
  DB_PATH,
  DEFAULT_SETTINGS,
  CATEGORY_SEED,
  PRODUCT_SEED,
};
