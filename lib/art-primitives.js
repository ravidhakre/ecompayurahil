'use strict';

// ---------------------------------------------------------------------------
// Shared SVG drawing primitives for the Art Guru colouring-book engine.
// Every primitive returns line art only (fill="none") so kids can colour it in.
// ---------------------------------------------------------------------------

function round(value) {
  return Math.round(value * 100) / 100;
}

function seeded(seed) {
  let t = (Number(seed) || 1) >>> 0;
  return function random() {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rnd, list) {
  return list[Math.floor(rnd() * list.length) % list.length];
}

function range(rnd, min, max) {
  return min + rnd() * (max - min);
}

// Wrap any fragment in a stroked, unfilled group.
function pen(c, inner, sw, stroke) {
  return `<g stroke="${stroke || c.C}" fill="none" stroke-width="${sw || c.sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
}

function dot(c, cx, cy, r, color) {
  return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" fill="${color || c.C}"/>`;
}

function ring(c, cx, cy, r, sw) {
  return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" fill="none" stroke="${c.C}" stroke-width="${sw || c.sw}"/>`;
}

/* ---------------------------------------------------------------- path data */

function starPath(cx, cy, r, points = 5, innerRatio = 0.45) {
  const total = points * 2;
  let d = '';
  for (let i = 0; i < total; i++) {
    const radius = i % 2 === 0 ? r : r * innerRatio;
    const angle = -Math.PI / 2 + (Math.PI * i) / points;
    const x = round(cx + Math.cos(angle) * radius);
    const y = round(cy + Math.sin(angle) * radius);
    d += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
  }
  return `${d}Z`;
}

function heartPath(cx, cy, s) {
  return (
    `M ${round(cx)} ${round(cy + s * 0.78)} ` +
    `C ${round(cx - s * 1.15)} ${round(cy + s * 0.04)}, ${round(cx - s * 0.82)} ${round(cy - s * 0.96)}, ${round(cx)} ${round(cy - s * 0.28)} ` +
    `C ${round(cx + s * 0.82)} ${round(cy - s * 0.96)}, ${round(cx + s * 1.15)} ${round(cy + s * 0.04)}, ${round(cx)} ${round(cy + s * 0.78)} Z`
  );
}

function cloudPath(cx, cy, s) {
  return (
    `M ${round(cx - s)} ${round(cy + s * 0.34)} ` +
    `C ${round(cx - s * 1.24)} ${round(cy - s * 0.22)}, ${round(cx - s * 0.62)} ${round(cy - s * 0.62)}, ${round(cx - s * 0.26)} ${round(cy - s * 0.34)} ` +
    `C ${round(cx - s * 0.16)} ${round(cy - s * 1.02)}, ${round(cx + s * 0.66)} ${round(cy - s * 0.94)}, ${round(cx + s * 0.66)} ${round(cy - s * 0.3)} ` +
    `C ${round(cx + s * 1.2)} ${round(cy - s * 0.24)}, ${round(cx + s * 1.24)} ${round(cy + s * 0.4)}, ${round(cx + s * 0.72)} ${round(cy + s * 0.4)} ` +
    `L ${round(cx - s * 0.86)} ${round(cy + s * 0.4)} Z`
  );
}

function leafBody(cx, cy, s) {
  return (
    `M ${round(cx)} ${round(cy + s)} ` +
    `C ${round(cx - s * 0.86)} ${round(cy + s * 0.46)}, ${round(cx - s * 0.8)} ${round(cy - s * 0.46)}, ${round(cx)} ${round(cy - s)} ` +
    `C ${round(cx + s * 0.8)} ${round(cy - s * 0.46)}, ${round(cx + s * 0.86)} ${round(cy + s * 0.46)}, ${round(cx)} ${round(cy + s)} Z`
  );
}

/* --------------------------------------------------------------- components */

function starSvg(c, cx, cy, r, points = 5, innerRatio = 0.45, extra = '') {
  return pen(c, `<path d="${starPath(cx, cy, r, points, innerRatio)}"/>${extra}`);
}

function heartSvg(c, cx, cy, s, extra = '') {
  return pen(c, `<path d="${heartPath(cx, cy, s)}"/>${extra}`);
}

function cloudSvg(c, cx, cy, s, extra = '') {
  return pen(c, `<path d="${cloudPath(cx, cy, s)}"/>${extra}`);
}

function leafSvg(c, cx, cy, s, rot = 0, extra = '') {
  return pen(
    c,
    `<g transform="rotate(${round(rot)} ${round(cx)} ${round(cy)})">` +
      `<path d="${leafBody(cx, cy, s)}"/>` +
      `<path d="M ${round(cx)} ${round(cy + s * 0.8)} L ${round(cx)} ${round(cy - s * 0.72)}"/>` +
      `<path d="M ${round(cx)} ${round(cy - s * 0.2)} L ${round(cx - s * 0.42)} ${round(cy - s * 0.52)} M ${round(cx)} ${round(cy + s * 0.18)} L ${round(cx + s * 0.42)} ${round(cy - s * 0.16)} M ${round(cx)} ${round(cy + s * 0.48)} L ${round(cx - s * 0.36)} ${round(cy + s * 0.14)}"/>` +
      `${extra}</g>`
  );
}

function flowerSvg(c, cx, cy, r, petals = 6, extra = '') {
  let inner = '';
  for (let i = 0; i < petals; i++) {
    const angle = (360 / petals) * i;
    inner +=
      `<g transform="rotate(${round(angle)} ${round(cx)} ${round(cy)})">` +
      `<path d="M ${round(cx)} ${round(cy)} C ${round(cx - r * 0.42)} ${round(cy - r * 0.34)}, ${round(cx - r * 0.34)} ${round(cy - r * 0.92)}, ${round(cx)} ${round(cy - r)} C ${round(cx + r * 0.34)} ${round(cy - r * 0.92)}, ${round(cx + r * 0.42)} ${round(cy - r * 0.34)}, ${round(cx)} ${round(cy)} Z"/>` +
      `<path d="M ${round(cx)} ${round(cy - r * 0.18)} L ${round(cx)} ${round(cy - r * 0.72)}"/>` +
      `</g>`;
  }
  inner += `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r * 0.22)}"/>`;
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6;
    inner += dot(c, cx + Math.cos(a) * r * 0.11, cy + Math.sin(a) * r * 0.11, r * 0.022);
  }
  return pen(c, `${inner}${extra}`);
}

function sunSvg(c, cx, cy, r, rays = 12, extra = '') {
  let inner = `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}"/>`;
  for (let i = 0; i < rays; i++) {
    const a = (Math.PI * 2 * i) / rays;
    const x1 = cx + Math.cos(a) * r * 1.2;
    const y1 = cy + Math.sin(a) * r * 1.2;
    const x2 = cx + Math.cos(a) * r * (i % 2 ? 1.52 : 1.72);
    const y2 = cy + Math.sin(a) * r * (i % 2 ? 1.52 : 1.72);
    inner += `<path d="M ${round(x1)} ${round(y1)} L ${round(x2)} ${round(y2)}"/>`;
    if (i % 2 === 0) {
      inner += `<path d="M ${round(x2 - Math.cos(a + 0.4) * r * 0.14)} ${round(y2 - Math.sin(a + 0.4) * r * 0.14)} L ${round(x2)} ${round(y2)} L ${round(x2 - Math.cos(a - 0.4) * r * 0.14)} ${round(y2 - Math.sin(a - 0.4) * r * 0.14)}"/>`;
    }
  }
  inner += `<circle cx="${round(cx - r * 0.3)}" cy="${round(cy - r * 0.12)}" r="${round(r * 0.035)}" fill="${c.C}" stroke="none"/>`;
  inner += `<circle cx="${round(cx + r * 0.3)}" cy="${round(cy - r * 0.12)}" r="${round(r * 0.035)}" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M ${round(cx - r * 0.3)} ${round(cy + r * 0.28)} Q ${round(cx)} ${round(cy + r * 0.52)} ${round(cx + r * 0.3)} ${round(cy + r * 0.28)}"/>`;
  return pen(c, `${inner}${extra}`);
}

function butterflySvg(c, cx, cy, s, extra = '') {
  const w = s * 0.66;
  const h = s * 0.54;
  let inner =
    `<path d="M ${round(cx)} ${round(cy)} C ${round(cx - w * 0.5)} ${round(cy - h * 1.2)}, ${round(cx - w * 1.26)} ${round(cy - h * 0.9)}, ${round(cx - w * 1.02)} ${round(cy - h * 0.12)} C ${round(cx - w * 0.9)} ${round(cy + h * 0.3)}, ${round(cx - w * 0.4)} ${round(cy + h * 0.14)}, ${round(cx - w * 0.12)} ${round(cy + h * 0.36)} L ${round(cx)} ${round(cy + h * 0.74)}"/>` +
    `<path d="M ${round(cx)} ${round(cy)} C ${round(cx + w * 0.5)} ${round(cy - h * 1.2)}, ${round(cx + w * 1.26)} ${round(cy - h * 0.9)}, ${round(cx + w * 1.02)} ${round(cy - h * 0.12)} C ${round(cx + w * 0.9)} ${round(cy + h * 0.3)}, ${round(cx + w * 0.4)} ${round(cy + h * 0.14)}, ${round(cx + w * 0.12)} ${round(cy + h * 0.36)} L ${round(cx)} ${round(cy + h * 0.74)}"/>` +
    `<ellipse cx="${round(cx)}" cy="${round(cy + h * 0.18)}" rx="${round(s * 0.07)}" ry="${round(s * 0.4)}"/>` +
    `<path d="M ${round(cx)} ${round(cy - h * 0.14)} C ${round(cx - s * 0.14)} ${round(cy - h * 0.56)}, ${round(cx - s * 0.24)} ${round(cy - h * 0.62)}, ${round(cx - s * 0.28)} ${round(cy - h * 0.84)}"/>` +
    `<path d="M ${round(cx)} ${round(cy - h * 0.14)} C ${round(cx + s * 0.14)} ${round(cy - h * 0.56)}, ${round(cx + s * 0.24)} ${round(cy - h * 0.62)}, ${round(cx + s * 0.28)} ${round(cy - h * 0.84)}"/>` +
    `<circle cx="${round(cx - s * 0.28)}" cy="${round(cy - h * 0.84)}" r="${round(s * 0.028)}"/>` +
    `<circle cx="${round(cx + s * 0.28)}" cy="${round(cy - h * 0.84)}" r="${round(s * 0.028)}"/>` +
    `<circle cx="${round(cx - w * 0.62)}" cy="${round(cy - h * 0.46)}" r="${round(s * 0.08)}"/>` +
    `<circle cx="${round(cx + w * 0.62)}" cy="${round(cy - h * 0.46)}" r="${round(s * 0.08)}"/>` +
    `<circle cx="${round(cx - w * 0.62)}" cy="${round(cy - h * 0.46)}" r="${round(s * 0.035)}" fill="${c.C}" stroke="none"/>` +
    `<circle cx="${round(cx + w * 0.62)}" cy="${round(cy - h * 0.46)}" r="${round(s * 0.035)}" fill="${c.C}" stroke="none"/>` +
    `<path d="M ${round(cx - w * 0.7)} ${round(cy + h * 0.04)} Q ${round(cx - w * 0.42)} ${round(cy - h * 0.16)} ${round(cx - w * 0.22)} ${round(cy + h * 0.06)} M ${round(cx + w * 0.7)} ${round(cy + h * 0.04)} Q ${round(cx + w * 0.42)} ${round(cy - h * 0.16)} ${round(cx + w * 0.22)} ${round(cy + h * 0.06)}"/>`;
  return pen(c, `${inner}${extra}`);
}

function fishSvg(c, cx, cy, s, flip = false, extra = '') {
  const dir = flip ? -1 : 1;
  let inner =
    `<path d="M ${round(cx - dir * s * 0.72)} ${round(cy)} C ${round(cx - dir * s * 0.38)} ${round(cy - s * 0.56)}, ${round(cx + dir * s * 0.4)} ${round(cy - s * 0.54)}, ${round(cx + dir * s * 0.68)} ${round(cy)} C ${round(cx + dir * s * 0.4)} ${round(cy + s * 0.54)}, ${round(cx - dir * s * 0.38)} ${round(cy + s * 0.56)}, ${round(cx - dir * s * 0.72)} ${round(cy)} Z"/>` +
    `<path d="M ${round(cx + dir * s * 0.68)} ${round(cy)} L ${round(cx + dir * s * 0.98)} ${round(cy - s * 0.34)} L ${round(cx + dir * s * 0.94)} ${round(cy + s * 0.34)} Z"/>` +
    `<path d="M ${round(cx - dir * s * 0.06)} ${round(cy - s * 0.42)} Q ${round(cx + dir * s * 0.1)} ${round(cy - s * 0.72)} ${round(cx + dir * s * 0.28)} ${round(cy - s * 0.36)}"/>` +
    `<circle cx="${round(cx - dir * s * 0.42)}" cy="${round(cy - s * 0.1)}" r="${round(s * 0.055)}" fill="${c.C}" stroke="none"/>` +
    `<path d="M ${round(cx - dir * s * 0.46)} ${round(cy + s * 0.16)} Q ${round(cx - dir * s * 0.34)} ${round(cy + s * 0.28)} ${round(cx - dir * s * 0.22)} ${round(cy + s * 0.16)}"/>` +
    `<path d="M ${round(cx - dir * s * 0.18)} ${round(cy - s * 0.34)} Q ${round(cx - dir * s * 0.02)} ${round(cy)} ${round(cx - dir * s * 0.18)} ${round(cy + s * 0.34)}"/>` +
    `<path d="M ${round(cx + dir * s * 0.14)} ${round(cy - s * 0.38)} Q ${round(cx + dir * s * 0.3)} ${round(cy)} ${round(cx + dir * s * 0.14)} ${round(cy + s * 0.38)}"/>`;
  return pen(c, `${inner}${extra}`);
}

function birdSvg(c, cx, cy, s, extra = '') {
  let inner =
    `<path d="M ${round(cx - s * 0.08)} ${round(cy + s * 0.2)} C ${round(cx - s * 0.62)} ${round(cy + s * 0.2)}, ${round(cx - s * 0.78)} ${round(cy - s * 0.22)}, ${round(cx - s * 0.5)} ${round(cy - s * 0.42)} C ${round(cx - s * 0.72)} ${round(cy - s * 0.02)}, ${round(cx - s * 0.48)} ${round(cy + s * 0.3)}, ${round(cx - s * 0.1)} ${round(cy + s * 0.32)}"/>` +
    `<path d="M ${round(cx + s * 0.2)} ${round(cy + s * 0.22)} C ${round(cx + s * 0.64)} ${round(cy + s * 0.1)}, ${round(cx + s * 0.62)} ${round(cy - s * 0.42)}, ${round(cx + s * 0.18)} ${round(cy - s * 0.48)} L ${round(cx + s * 0.06)} ${round(cy - s * 0.7)} L ${round(cx - s * 0.04)} ${round(cy - s * 0.46)} C ${round(cx - s * 0.34)} ${round(cy - s * 0.36)}, ${round(cx - s * 0.36)} ${round(cy + s * 0.06)}, ${round(cx + s * 0.02)} ${round(cy + s * 0.14)} Z"/>` +
    `<path d="M ${round(cx - s * 0.02)} ${round(cy - s * 0.46)} C ${round(cx + s * 0.2)} ${round(cy - s * 0.42)}, ${round(cx + s * 0.38)} ${round(cy - s * 0.16)}, ${round(cx + s * 0.2)} ${round(cy)}"/>` +
    `<circle cx="${round(cx + s * 0.08)}" cy="${round(cy - s * 0.36)}" r="${round(s * 0.04)}" fill="${c.C}" stroke="none"/>` +
    `<path d="M ${round(cx - s * 0.06)} ${round(cy - s * 0.5)} L ${round(cx - s * 0.24)} ${round(cy - s * 0.56)} L ${round(cx - s * 0.05)} ${round(cy - s * 0.43)} Z"/>` +
    `<path d="M ${round(cx + s * 0.3)} ${round(cy + s * 0.22)} L ${round(cx + s * 0.46)} ${round(cy + s * 0.4)} M ${round(cx + s * 0.18)} ${round(cy + s * 0.24)} L ${round(cx + s * 0.26)} ${round(cy + s * 0.46)}"/>`;
  return pen(c, `${inner}${extra}`);
}

function treeSvg(c, cx, baseY, s, extra = '') {
  let inner =
    `<path d="M ${round(cx - s * 0.16)} ${round(baseY)} L ${round(cx - s * 0.1)} ${round(baseY - s * 0.52)} L ${round(cx - s * 0.3)} ${round(baseY - s * 0.84)} M ${round(cx + s * 0.16)} ${round(baseY)} L ${round(cx + s * 0.1)} ${round(baseY - s * 0.52)} L ${round(cx + s * 0.3)} ${round(baseY - s * 0.84)}"/>` +
    `<path d="M ${round(cx - s * 0.16)} ${round(baseY)} C ${round(cx - s * 0.04)} ${round(baseY - s * 0.16)}, ${round(cx + s * 0.04)} ${round(baseY - s * 0.16)}, ${round(cx + s * 0.16)} ${round(baseY)}"/>` +
    `<path d="M ${round(cx)} ${round(baseY)} L ${round(cx)} ${round(baseY - s * 0.94)}"/>` +
    `<path d="M ${round(cx)} ${round(baseY - s * 0.46)} C ${round(cx - s * 0.22)} ${round(baseY - s * 0.44)}, ${round(cx - s * 0.34)} ${round(baseY - s * 0.52)}, ${round(cx - s * 0.4)} ${round(baseY - s * 0.64)} M ${round(cx)} ${round(baseY - s * 0.62)} C ${round(cx + s * 0.2)} ${round(baseY - s * 0.6)}, ${round(cx + s * 0.32)} ${round(baseY - s * 0.68)}, ${round(cx + s * 0.38)} ${round(baseY - s * 0.78)}"/>`;
  const blobs = [
    [0, -1.04, 0.42],
    [-0.42, -0.9, 0.34],
    [0.42, -0.9, 0.34],
    [-0.24, -1.22, 0.28],
    [0.26, -1.22, 0.28],
  ];
  blobs.forEach(([dx, dy, r]) => {
    inner += `<path d="${cloudPath(cx + s * dx, baseY + s * dy, s * r)}"/>`;
  });
  inner += `<path d="M ${round(cx - s * 0.2)} ${round(baseY + s * 0.02)} Q ${round(cx)} ${round(baseY + s * 0.16)} ${round(cx + s * 0.2)} ${round(baseY + s * 0.02)}"/>`;
  return pen(c, `${inner}${extra}`);
}

function sparkle(c, cx, cy, r, color) {
  return (
    `<path d="M ${round(cx)} ${round(cy - r)} L ${round(cx + r * 0.24)} ${round(cy - r * 0.24)} L ${round(cx + r)} ${round(cy)} L ${round(cx + r * 0.24)} ${round(cy + r * 0.24)} L ${round(cx)} ${round(cy + r)} L ${round(cx - r * 0.24)} ${round(cy + r * 0.24)} L ${round(cx - r)} ${round(cy)} L ${round(cx - r * 0.24)} ${round(cy - r * 0.24)} Z" fill="none" stroke="${color || c.C}" stroke-width="${c.sw * 0.8}" stroke-linejoin="round"/>`
  );
}

function heartCluster(c, cx, cy, s, count = 7) {
  const spots = [
    [0, 0, 1],
    [-0.75, -0.35, 0.42],
    [0.75, -0.3, 0.46],
    [-0.55, 0.62, 0.34],
    [0.6, 0.66, 0.36],
    [-1.15, 0.55, 0.24],
    [1.15, 0.5, 0.25],
  ];
  let inner = '';
  for (let i = 0; i < Math.min(count, spots.length); i++) {
    const [dx, dy, sc] = spots[i];
    inner += `<path d="${heartPath(cx + s * dx, cy + s * dy, s * sc)}"/>`;
    if (i < 3) {
      inner += `<path d="${heartPath(cx + s * dx, cy + s * dy, s * sc * 0.55)}"/>`;
    }
  }
  return pen(c, inner);
}

function ladybug(c, cx, cy, s) {
  return pen(
    c,
    `<ellipse cx="${round(cx)}" cy="${round(cy)}" rx="${round(s)}" ry="${round(s * 0.78)}"/>` +
      `<path d="M ${round(cx)} ${round(cy - s * 0.76)} L ${round(cx)} ${round(cy + s * 0.74)}"/>` +
      `<circle cx="${round(cx)}" cy="${round(cy - s * 0.92)}" r="${round(s * 0.28)}"/>` +
      `<circle cx="${round(cx - s * 0.48)}" cy="${round(cy - s * 0.2)}" r="${round(s * 0.13)}"/>` +
      `<circle cx="${round(cx + s * 0.48)}" cy="${round(cy - s * 0.2)}" r="${round(s * 0.13)}"/>` +
      `<circle cx="${round(cx - s * 0.36)}" cy="${round(cy + s * 0.38)}" r="${round(s * 0.11)}"/>` +
      `<circle cx="${round(cx + s * 0.36)}" cy="${round(cy + s * 0.38)}" r="${round(s * 0.11)}"/>`
  );
}

function grassTuft(c, cx, baseY, s) {
  return pen(
    c,
    `<path d="M ${round(cx)} ${round(baseY)} C ${round(cx - s * 0.16)} ${round(baseY - s * 0.32)}, ${round(cx - s * 0.26)} ${round(baseY - s * 0.58)}, ${round(cx - s * 0.34)} ${round(baseY - s * 0.9)} M ${round(cx)} ${round(baseY)} C ${round(cx)} ${round(baseY - s * 0.4)}, ${round(cx + s * 0.02)} ${round(baseY - s * 0.7)}, ${round(cx + s * 0.08)} ${round(baseY - s * 1.06)} M ${round(cx)} ${round(baseY)} C ${round(cx + s * 0.18)} ${round(baseY - s * 0.34)}, ${round(cx + s * 0.28)} ${round(baseY - s * 0.6)}, ${round(cx + s * 0.38)} ${round(baseY - s * 0.86)}"/>`
  );
}

function cloudsAndBirds(c, rnd, y = 130) {
  let inner = cloudSvg(c, 105, y, 34) + cloudSvg(c, 500, y + 24, 28);
  const bx = 400 + rnd() * 80;
  inner += pen(
    c,
    `<path d="M ${round(bx - 20)} ${round(y - 38)} Q ${round(bx - 6)} ${round(y - 52)} ${round(bx + 4)} ${round(y - 38)} Q ${round(bx + 16)} ${round(y - 52)} ${round(bx + 30)} ${round(y - 38)}"/>`
  );
  return inner;
}

module.exports = {
  round,
  seeded,
  pick,
  range,
  pen,
  dot,
  ring,
  starPath,
  heartPath,
  cloudPath,
  leafBody,
  starSvg,
  heartSvg,
  cloudSvg,
  leafSvg,
  flowerSvg,
  sunSvg,
  butterflySvg,
  fishSvg,
  birdSvg,
  treeSvg,
  sparkle,
  heartCluster,
  ladybug,
  grassTuft,
  cloudsAndBirds,
};
