'use strict';

// ---------------------------------------------------------------------------
// Art Guru SVG artwork engine
// Generates premium-looking colouring book covers and inside line-art pages.
// Every page uses a distinct design from lib/art-designs.js, so a 25-page book
// shows 25 genuinely different scenes. Everything is deterministic, so a
// product always renders the same artwork.
// ---------------------------------------------------------------------------

const {
  PAGE_COUNT,
  pageDesigns,
  coverDesignFor,
  themeKey,
} = require('./art-designs');

const PALETTES = {
  sunset: { ink: '#4A2317', a: '#F97316', b: '#FBBF24', c: '#FB7185', paper: '#FFF7ED', soft: '#FFE8D1' },
  ocean: { ink: '#0B3B3C', a: '#0D9488', b: '#22D3EE', c: '#0EA5E9', paper: '#F0FDFA', soft: '#CCFBF1' },
  berry: { ink: '#3B0A2A', a: '#BE185D', b: '#F472B6', c: '#8B5CF6', paper: '#FFF1F7', soft: '#FCE7F3' },
  forest: { ink: '#123524', a: '#15803D', b: '#84CC16', c: '#0F766E', paper: '#F4FDF4', soft: '#DCFCE7' },
  saffron: { ink: '#452A08', a: '#D97706', b: '#FACC15', c: '#EA580C', paper: '#FFFBEB', soft: '#FEF3C7' },
  ink: { ink: '#111827', a: '#475569', b: '#94A3B8', c: '#0F172A', paper: '#F8FAFC', soft: '#E2E8F0' },
  lavender: { ink: '#2E1065', a: '#7C3AED', b: '#C4B5FD', c: '#EC4899', paper: '#FAF5FF', soft: '#EDE9FE' },
  terracotta: { ink: '#4A1D0C', a: '#C2410C', b: '#FB923C', c: '#A16207', paper: '#FFF7ED', soft: '#FED7AA' },
};

const THEMES = {
  mandala: { label: 'Mandala', motif: 'mandala' },
  animals: { label: 'Animals', motif: 'animal' },
  kids: { label: 'Kids', motif: 'kids' },
  floral: { label: 'Floral', motif: 'floral' },
  fantasy: { label: 'Fantasy', motif: 'fantasy' },
  stress: { label: 'Stress Relief', motif: 'paisley' },
  travel: { label: 'Travel', motif: 'travel' },
  festive: { label: 'Festive', motif: 'festive' },
  cartoons: { label: 'Toon Town', motif: 'cartoons' },
  india: { label: 'India Pride', motif: 'india' },
};

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function wrapTitle(title, maxChars = 15) {
  const words = String(title || 'Colouring Book').split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (!line.length) {
      line = word;
    } else if ((line + ' ' + word).length <= maxChars) {
      line += ' ' + word;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function titleLinesMax(theme) {
  if (theme === 'kids' || theme === 'fantasy' || theme === 'cartoons') return 14;
  return 16;
}

// Context object consumed by every design function.
function designContext(palette, sw) {
  return { C: palette.ink, cx: 300, cy: 400, sw: sw || 1.6 };
}

/* ------------------------------------------------------------------ cover */

function coverSvg(product) {
  const theme = themeKey(product.theme || 'mandala');
  const palette = PALETTES[product.palette] || PALETTES.sunset;
  const variant = Number(product.art_variant) || 0;
  const title = product.title || 'Colouring Book';
  const titleLines = wrapTitle(title, titleLinesMax(theme));
  const titleSize = titleLines.length >= 3 ? 42 : titleLines.length === 2 ? 48 : 54;
  const startY = titleLines.length >= 3 ? 148 : titleLines.length === 2 ? 160 : 182;
  const motifY = 438;
  const motifR = 158;
  const info = `${product.pages || PAGE_COUNT} pages • 100 GSM • A4`;
  const badge = product.badge ? String(product.badge).toUpperCase() : '';
  const design = coverDesignFor(theme, (Number(product.id) || 1) + variant * 3);

  const dots = [];
  for (const key of ['a', 'b', 'c', 'ink']) {
    dots.push(`<circle cx="${300 + (dots.length - 1.5) * 26}" cy="716" r="7" fill="${palette[key]}"/>`);
  }

  const titleSvg = titleLines
    .map((line, i) => `<text x="300" y="${startY + i * (titleSize + 6)}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${titleSize}" font-weight="700" fill="${palette.ink}">${esc(line)}</text>`)
    .join('');

  const medallion = design(designContext(palette, 2.4));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" role="img" aria-label="${esc(title)} cover">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.paper}"/>
      <stop offset="0.55" stop-color="${palette.soft}"/>
      <stop offset="1" stop-color="${palette.paper}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.4" fill="${palette.ink}" opacity="0.12"/>
    </pattern>
    <clipPath id="medallion">
      <circle cx="300" cy="${motifY}" r="${motifR}"/>
    </clipPath>
  </defs>
  <rect width="600" height="800" fill="url(#bg)"/>
  <rect width="600" height="800" fill="url(#dots)"/>
  <circle cx="548" cy="88" r="180" fill="${palette.a}" opacity="0.14"/>
  <circle cx="40" cy="742" r="170" fill="${palette.b}" opacity="0.2"/>
  <circle cx="330" cy="430" r="260" fill="${palette.c}" opacity="0.08"/>
  <rect x="24" y="24" width="552" height="752" rx="22" fill="none" stroke="${palette.a}" stroke-width="1.5" opacity="0.55"/>
  <rect x="34" y="34" width="532" height="732" rx="16" fill="none" stroke="${palette.ink}" stroke-width="0.6" opacity="0.18"/>

  <g transform="translate(46 52)">
    <circle cx="16" cy="16" r="15" fill="${palette.ink}"/>
    <path d="M10 22 C10 13, 13 8, 20 6 C22 12, 20 18, 10 22 Z" fill="${palette.b}"/>
    <path d="M10 22 C15 18, 18 14, 20 6" stroke="${palette.ink}" stroke-width="1" fill="none"/>
    <text x="42" y="15" font-family="Georgia, serif" font-size="18" font-weight="700" letter-spacing="2" fill="${palette.ink}">ART GURU</text>
    <text x="42" y="30" font-family="Arial, sans-serif" font-size="8" letter-spacing="3" fill="${palette.ink}" opacity="0.7">COLOUR • CREATE • CALM</text>
  </g>

  ${badge ? `<g transform="translate(432 48)"><rect width="120" height="28" rx="14" fill="${palette.a}"/><text x="60" y="19" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="1" fill="#fff">${esc(badge)}</text></g>` : ''}

  <text x="300" y="104" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" letter-spacing="4.5" fill="${palette.a}" font-weight="700">PREMIUM COLOURING BOOK</text>
  ${titleSvg}
  <g transform="translate(300 118)"><path d="M -45 0 H -8 M 8 0 H 45" stroke="${palette.a}" stroke-width="1.2"/><circle cx="0" cy="0" r="3" fill="${palette.a}"/></g>

  <circle cx="${300}" cy="${motifY}" r="${motifR + 34}" fill="url(#glow)"/>
  <circle cx="${300}" cy="${motifY}" r="${motifR + 12}" fill="#ffffff" opacity="0.65"/>
  <circle cx="${300}" cy="${motifY}" r="${motifR + 12}" fill="none" stroke="${palette.ink}" stroke-width="0.8" opacity="0.25"/>
  <g clip-path="url(#medallion)">
    <circle cx="300" cy="${motifY}" r="${motifR}" fill="#FFFDF7"/>
    <g transform="translate(300 ${motifY}) scale(0.44) translate(-300 -400)" opacity="0.95">
      ${medallion}
    </g>
  </g>
  <circle cx="300" cy="${motifY}" r="${motifR}" fill="none" stroke="${palette.a}" stroke-width="1.6" opacity="0.65"/>
  <circle cx="300" cy="${motifY}" r="${motifR - 7}" fill="none" stroke="${palette.ink}" stroke-width="0.6" opacity="0.18"/>

  <g transform="translate(300 ${motifY + motifR + 34})">
    <circle cx="-14" cy="0" r="3" fill="${palette.a}"/><circle cx="0" cy="0" r="3" fill="${palette.b}"/><circle cx="14" cy="0" r="3" fill="${palette.c}"/>
  </g>

  <text x="300" y="654" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" letter-spacing="2" fill="${palette.ink}" opacity="0.8">${esc(info)}</text>
  <text x="300" y="676" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-style="italic" fill="${palette.a}">unwind. colour. create.</text>
  <g>${dots.join('')}</g>
  <text x="300" y="752" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" letter-spacing="3" fill="${palette.ink}" opacity="0.55">ARTGURU.IN</text>
</svg>`;
}

/* ------------------------------------------------------------ inside page */

function pageSvg(product, page = 1) {
  const theme = themeKey(product.theme || 'mandala');
  const palette = PALETTES[product.palette] || PALETTES.sunset;
  const variant = Number(product.art_variant) || 0;
  const pageNum = Math.max(1, Math.floor(Number(page) || 1));
  const designs = pageDesigns(theme, variant, Number(product.id) || 1);
  const design = designs[(pageNum - 1) % designs.length];
  const artwork = design(designContext(palette, 1.6));
  const corner = [];

  for (const [x, y, sx, sy] of [
    [30, 30, 1, 1],
    [570, 30, -1, 1],
    [30, 770, 1, -1],
    [570, 770, -1, -1],
  ]) {
    corner.push(`<g transform="translate(${x} ${y}) scale(${sx} ${sy})" stroke="${palette.a}" stroke-width="1.2" fill="none"><path d="M 0 18 C 0 8, 8 0, 18 0"/><circle cx="24" cy="4" r="2" fill="${palette.a}"/><path d="M 4 24 L 10 24"/></g>`);
  }

  const themeLabel = (THEMES[theme] && THEMES[theme].label ? THEMES[theme].label : 'Colouring').toUpperCase();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" role="img" aria-label="${esc(product.title || 'Colouring page')} - inside page ${pageNum}">
  <defs>
    <clipPath id="pageArt"><rect x="32" y="86" width="536" height="656"/></clipPath>
  </defs>
  <rect width="600" height="800" fill="#FFFDF7"/>
  <rect x="18" y="18" width="564" height="764" rx="6" fill="none" stroke="${palette.soft}" stroke-width="2"/>
  <rect x="26" y="26" width="548" height="748" rx="4" fill="none" stroke="${palette.a}" stroke-width="0.7" opacity="0.35"/>
  ${corner.join('')}
  <text x="300" y="62" text-anchor="middle" font-family="Georgia, serif" font-size="13" letter-spacing="3" fill="${palette.ink}" opacity="0.65">ART GURU</text>
  <text x="300" y="84" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.5" letter-spacing="2.4" fill="${palette.a}">${esc(String(product.title || '').toUpperCase())} · ${esc(themeLabel)}</text>
  <g clip-path="url(#pageArt)">
    <g transform="translate(300 400) scale(0.9) translate(-300 -400)">
      ${artwork}
    </g>
  </g>
  <path d="M 55 742 H 545" stroke="${palette.soft}" stroke-width="1"/>
  <text x="55" y="762" font-family="Arial, sans-serif" font-size="8" letter-spacing="2" fill="${palette.ink}" opacity="0.5">ARTGURU.IN</text>
  <text x="545" y="762" text-anchor="end" font-family="Georgia, serif" font-size="10" fill="${palette.ink}" opacity="0.55">Page ${pageNum}</text>
</svg>`;
}

module.exports = { coverSvg, pageSvg, PALETTES, THEMES, PAGE_COUNT };
