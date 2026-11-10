'use strict';

// ---------------------------------------------------------------------------
// Design library A: patterns, mandalas, nature and food.
// Each design is a full-page colouring scene drawn with thin ink lines.
// ---------------------------------------------------------------------------

const {
  round,
  pen,
  dot,
  ring,
  starPath,
  heartPath,
  cloudPath,
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
} = require('./art-primitives');

function spiralPath(cx, cy, r, turns = 3.2) {
  let d = '';
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns;
    const radius = r * t;
    const x = round(cx + Math.cos(angle) * radius);
    const y = round(cy + Math.sin(angle) * radius);
    d += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
  }
  return d;
}

function hexPath(cx, cy, r) {
  let d = '';
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 3;
    d += `${i === 0 ? 'M' : 'L'} ${round(cx + Math.cos(a) * r)} ${round(cy + Math.sin(a) * r)} `;
  }
  return `${d}Z`;
}

function pineTree(c, cx, baseY, s) {
  let inner = `<path d="M ${round(cx)} ${round(baseY)} L ${round(cx)} ${round(baseY - s * 0.32)}"/>`;
  for (let i = 0; i < 3; i++) {
    const y = baseY - s * (0.24 + i * 0.28);
    const w = s * (0.5 - i * 0.1);
    inner += `<path d="M ${round(cx - w)} ${round(y)} L ${round(cx)} ${round(y - s * 0.36)} L ${round(cx + w)} ${round(y)} Z"/>`;
  }
  return pen(c, inner);
}

function scallopRing(c, cx, cy, r, count) {
  let inner = '';
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    const a2 = (Math.PI * 2 * (i + 1)) / count;
    const x2 = cx + Math.cos(a2) * r;
    const y2 = cy + Math.sin(a2) * r;
    inner += `<path d="M ${round(x)} ${round(y)} Q ${round(cx + Math.cos(a + Math.PI / count) * (r - 26))} ${round(cy + Math.sin(a + Math.PI / count) * (r - 26))} ${round(x2)} ${round(y2)}"/>`;
  }
  return inner;
}

function petalRing(c, cx, cy, rIn, rOut, count, pointed = false) {
  let inner = '';
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count;
    const a1 = a - Math.PI / count + 0.1;
    const a2 = a + Math.PI / count - 0.1;
    const tipX = cx + Math.cos(a) * rOut;
    const tipY = cy + Math.sin(a) * rOut;
    const b1x = cx + Math.cos(a1) * rIn;
    const b1y = cy + Math.sin(a1) * rIn;
    const b2x = cx + Math.cos(a2) * rIn;
    const b2y = cy + Math.sin(a2) * rIn;
    if (pointed) {
      inner += `<path d="M ${round(b1x)} ${round(b1y)} L ${round(tipX)} ${round(tipY)} L ${round(b2x)} ${round(b2y)} Z"/>`;
    } else {
      inner += `<path d="M ${round(b1x)} ${round(b1y)} Q ${round(cx + Math.cos(a) * (rIn + (rOut - rIn) * 0.55) - Math.sin(a) * 22)} ${round(cy + Math.sin(a) * (rIn + (rOut - rIn) * 0.55) + Math.cos(a) * 22)} ${round(tipX)} ${round(tipY)} Q ${round(cx + Math.cos(a) * (rIn + (rOut - rIn) * 0.55) + Math.sin(a) * 22)} ${round(cy + Math.sin(a) * (rIn + (rOut - rIn) * 0.55) - Math.cos(a) * 22)} ${round(b2x)} ${round(b2y)} Z"/>`;
    }
    inner += `<path d="M ${round(cx + Math.cos(a) * (rIn + 8))} ${round(cy + Math.sin(a) * (rIn + 8))} L ${round(cx + Math.cos(a) * (rOut - 14))} ${round(cy + Math.sin(a) * (rOut - 14))}"/>`;
  }
  return inner;
}

function mandala(c, style) {
  const cx = c.cx;
  const cy = c.cy;
  const R = 212;
  let inner = '';
  inner += `<circle cx="${cx}" cy="${cy}" r="${R}"/><circle cx="${cx}" cy="${cy}" r="${R - 16}"/>`;
  inner += scallopRing(c, cx, cy, R - 16, style.outer || 24);
  inner += petalRing(c, cx, cy, R - 54, R - 18, style.petals || 12, style.pointed);
  inner += `<circle cx="${cx}" cy="${cy}" r="${R - 62}"/>`;
  if (style.diamonds) {
    for (let i = 0; i < (style.diamonds || 16); i++) {
      const a = (Math.PI * 2 * i) / style.diamonds;
      const x = cx + Math.cos(a) * (R - 82);
      const y = cy + Math.sin(a) * (R - 82);
      inner += `<path d="M ${round(x)} ${round(y - 12)} L ${round(x + 9)} ${round(y)} L ${round(x)} ${round(y + 12)} L ${round(x - 9)} ${round(y)} Z"/>`;
    }
  }
  if (style.circles) {
    for (let i = 0; i < style.circles; i++) {
      const a = (Math.PI * 2 * i) / style.circles;
      inner += `<circle cx="${round(cx + Math.cos(a) * (R - 112))}" cy="${round(cy + Math.sin(a) * (R - 112))}" r="9"/>`;
    }
  }
  inner += petalRing(c, cx, cy, 22, R - 128, style.innerPetals || 8, true);
  inner += `<circle cx="${cx}" cy="${cy}" r="26"/><circle cx="${cx}" cy="${cy}" r="10"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    inner += dot(c, cx + Math.cos(a) * 18, cy + Math.sin(a) * 18, 2.2);
  }
  return pen(c, inner);
}

function mandalaPetals(c) {
  return mandala(c, { outer: 28, petals: 14, innerPetals: 10, circles: 16, diamonds: 0 });
}

function mandalaRings(c) {
  return mandala(c, { outer: 20, petals: 10, innerPetals: 6, diamonds: 20, pointed: true });
}

function mandalaGeo(c) {
  const cx = c.cx;
  const cy = c.cy;
  let inner = '';
  inner += `<circle cx="${cx}" cy="${cy}" r="210"/><circle cx="${cx}" cy="${cy}" r="192"/>`;
  for (let i = 0; i < 3; i++) {
    const r = 168 - i * 46;
    inner += `<path d="${starPath(cx, cy, r, 8 + i * 2, 0.62)}"/>`;
  }
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12;
    inner += `<path d="M ${round(cx + Math.cos(a) * 64)} ${round(cy + Math.sin(a) * 64)} L ${round(cx + Math.cos(a + Math.PI / 12) * 132)} ${round(cy + Math.sin(a + Math.PI / 12) * 132)} L ${round(cx + Math.cos(a) * 182)} ${round(cy + Math.sin(a) * 182)} L ${round(cx + Math.cos(a - Math.PI / 12) * 132)} ${round(cy + Math.sin(a - Math.PI / 12) * 132)} Z"/>`;
  }
  inner += `<circle cx="${cx}" cy="${cy}" r="48"/>`;
  inner += `<path d="${starPath(cx, cy, 34, 6, 0.55)}"/>`;
  return pen(c, inner);
}

function mandalaLotus(c) {
  const cx = c.cx;
  const cy = c.cy + 30;
  let inner = '';
  const layers = [
    { rIn: 40, rOut: 196, count: 16, pointed: true },
    { rIn: 34, rOut: 158, count: 12 },
    { rIn: 26, rOut: 118, count: 10, pointed: true },
    { rIn: 18, rOut: 78, count: 8 },
  ];
  layers.forEach((layer) => {
    inner += petalRing(c, cx, cy, layer.rIn, layer.rOut, layer.count, layer.pointed);
  });
  inner += `<circle cx="${cx}" cy="${cy}" r="22"/>`;
  inner += `<circle cx="${cx}" cy="${cy}" r="8"/>`;
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI * 2 * i) / 4;
    inner += dot(c, cx + Math.cos(a) * 15, cy + Math.sin(a) * 15, 2);
  }
  return pen(c, inner);
}

/* ------------------------------------------------------------------ designs */

function shapes(c) {
  const tiles = [
    { x: 168, y: 244, type: 0 },
    { x: 300, y: 244, type: 1 },
    { x: 432, y: 244, type: 2 },
    { x: 168, y: 410, type: 3 },
    { x: 300, y: 410, type: 4 },
    { x: 432, y: 410, type: 5 },
    { x: 168, y: 576, type: 6 },
    { x: 300, y: 576, type: 7 },
    { x: 432, y: 576, type: 8 },
  ];
  let inner = '';
  tiles.forEach((t) => {
    const { x, y, type } = t;
    inner += `<rect x="${x - 62}" y="${y - 62}" width="124" height="124" rx="18"/>`;
    if (type === 0) {
      inner += `<circle cx="${x}" cy="${y}" r="40"/><circle cx="${x}" cy="${y}" r="24"/><circle cx="${x}" cy="${y}" r="8"/>`;
    } else if (type === 1) {
      inner += `<rect x="${x - 38}" y="${y - 38}" width="76" height="76" rx="6"/><path d="M ${x - 38} ${y - 38} L ${x + 38} ${y + 38} M ${x + 38} ${y - 38} L ${x - 38} ${y + 38} M ${x} ${y - 38} L ${x} ${y + 38} M ${x - 38} ${y} L ${x + 38} ${y}"/>`;
    } else if (type === 2) {
      inner += `<path d="M ${x} ${y - 44} L ${x + 42} ${y + 34} L ${x - 42} ${y + 34} Z"/><path d="M ${x} ${y - 20} L ${x + 22} ${y + 18} L ${x - 22} ${y + 18} Z"/>`;
    } else if (type === 3) {
      inner += `<path d="${starPath(x, y, 43, 5, 0.45)}"/><path d="${starPath(x, y, 24, 5, 0.45)}"/>`;
    } else if (type === 4) {
      inner += `<path d="${heartPath(x, y, 42)}"/><path d="${heartPath(x, y, 22)}"/>`;
    } else if (type === 5) {
      inner += `<path d="${hexPath(x, y, 42)}"/><path d="${hexPath(x, y, 26)}"/><circle cx="${x}" cy="${y}" r="10"/>`;
    } else if (type === 6) {
      inner += `<path d="M ${x} ${y - 44} L ${x + 40} ${y} L ${x} ${y + 44} L ${x - 40} ${y} Z"/><path d="M ${x} ${y - 24} L ${x + 22} ${y} L ${x} ${y + 24} L ${x - 22} ${y} Z"/>`;
    } else if (type === 7) {
      inner += flowerSvg(c, x, y, 40, 6);
    } else {
      inner += `<circle cx="${x}" cy="${y}" r="42"/><circle cx="${x}" cy="${y}" r="29"/><circle cx="${x}" cy="${y}" r="16"/><circle cx="${x}" cy="${y}" r="5"/>`;
    }
    inner += dot(c, x - 48, y + 48, 3);
    inner += dot(c, x + 48, y - 48, 3);
  });
  return pen(c, inner);
}

function hearts(c) {
  let inner = heartCluster(c, c.cx, c.cy, 150, 7);
  inner += heartSvg(c, 90, 150, 26);
  inner += heartSvg(c, 512, 170, 22);
  inner += heartSvg(c, 84, 650, 20);
  inner += heartSvg(c, 516, 638, 24);
  inner += flowerSvg(c, 130, 700, 22, 5);
  inner += flowerSvg(c, 470, 704, 22, 5);
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12;
    inner += dot(c, 300 + Math.cos(a) * 210, 400 + Math.sin(a) * 210, 2.6);
  }
  return pen(c, inner);
}

function stars(c) {
  let inner = `<path d="${starPath(c.cx, c.cy, 178, 5, 0.46)}"/><path d="${starPath(c.cx, c.cy, 126, 5, 0.46)}"/><path d="${starPath(c.cx, c.cy, 74, 5, 0.46)}"/><circle cx="${c.cx}" cy="${c.cy}" r="18"/>`;
  const small = [
    [110, 160, 30, 5],
    [492, 150, 24, 5],
    [86, 520, 22, 5],
    [510, 546, 28, 5],
    [130, 690, 18, 5],
    [474, 694, 20, 5],
    [300, 132, 18, 7],
    [300, 682, 16, 7],
  ];
  small.forEach(([x, y, r, p]) => {
    inner += `<path d="${starPath(x, y, r, p, 0.48)}"/>`;
  });
  for (let i = 0; i < 18; i++) {
    const a = (Math.PI * 2 * i) / 18;
    inner += dot(c, 300 + Math.cos(a) * 240, 412 + Math.sin(a) * 240, i % 2 ? 2 : 3);
  }
  return pen(c, inner);
}

function bubbles(c) {
  const list = [
    [180, 230, 64],
    [350, 180, 42],
    [460, 300, 56],
    [140, 420, 46],
    [300, 380, 78],
    [470, 500, 38],
    [180, 590, 54],
    [340, 610, 44],
    [470, 680, 24],
    [90, 300, 24],
  ];
  let inner = '';
  list.forEach(([x, y, r], i) => {
    inner += `<circle cx="${x}" cy="${y}" r="${r}"/>`;
    if (i % 2 === 0) {
      inner += `<path d="${spiralPath(x, y, r * 0.78, 2.2)}"/>`;
    } else {
      inner += `<circle cx="${x}" cy="${y}" r="${round(r * 0.58)}"/><circle cx="${x}" cy="${y}" r="${round(r * 0.26)}"/>`;
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI * 2 * k) / 6;
        inner += dot(c, x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, 2.4);
      }
    }
    inner += `<path d="M ${round(x - r * 0.5)} ${round(y - r * 0.55)} Q ${round(x - r * 0.2)} ${round(y - r * 0.82)} ${round(x + r * 0.1)} ${round(y - r * 0.72)}"/>`;
  });
  return pen(c, inner);
}

function mosaic(c) {
  let inner = '';
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 6; col++) {
      const x = 78 + col * 89;
      const y = 156 + row * 78;
      const w = 78;
      const h = 67;
      inner += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`;
      const mode = (row * 6 + col) % 7;
      if (mode === 0) {
        inner += `<path d="M ${x + 8} ${y + h / 2} H ${x + w - 8} M ${x + w / 2} ${y + 8} V ${y + h - 8}"/>`;
      } else if (mode === 1) {
        for (let k = 1; k < 4; k++) inner += `<path d="M ${x + 6} ${round(y + (h / 4) * k)} H ${x + w - 6}"/>`;
      } else if (mode === 2) {
        for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) inner += dot(c, x + 18 + q * 21, y + 18 + r * 17, 3.2);
      } else if (mode === 3) {
        inner += `<path d="M ${x + 8} ${y + h - 8} L ${x + w - 8} ${y + 8} M ${x + 8} ${y + 8} L ${x + w - 8} ${y + h - 8}"/>`;
      } else if (mode === 4) {
        inner += `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="23"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="12"/>`;
      } else if (mode === 5) {
        inner += `<path d="M ${x + 6} ${y + h / 2} q 10 -18 20 0 q 10 18 20 0 q 10 -18 20 0"/>`;
      } else {
        inner += `<path d="M ${x + w / 2} ${y + 10} L ${x + w - 12} ${y + h - 12} L ${x + 12} ${y + h - 12} Z"/><path d="M ${x + w / 2} ${y + 24} L ${x + w - 24} ${y + h - 20} L ${x + 24} ${y + h - 20} Z"/>`;
      }
    }
  }
  return pen(c, inner);
}

function swirls(c) {
  let inner = '';
  inner += `<path d="${spiralPath(170, 280, 96, 3.4)}"/>`;
  inner += `<path d="${spiralPath(432, 400, 78, 3.8)}"/>`;
  inner += `<path d="${spiralPath(218, 590, 86, 3.2)}"/>`;
  inner += `<path d="M 40 180 C 130 120, 180 240, 270 190 C 360 140, 420 250, 560 190"/>`;
  inner += `<path d="M 40 470 C 120 410, 210 530, 300 470 C 390 410, 470 520, 560 460"/>`;
  inner += `<path d="M 40 690 C 150 630, 220 740, 320 680 C 400 630, 470 720, 560 670"/>`;
  for (let i = 0; i < 24; i++) {
    const x = 60 + ((i * 73) % 480);
    const y = 140 + ((i * 109) % 540);
    inner += dot(c, x, y, i % 3 === 0 ? 3.4 : 2.2);
  }
  return pen(c, inner);
}

function waves(c) {
  let inner = '';
  const bands = [
    { y: 190, amp: 20, h: 58, mode: 0 },
    { y: 290, amp: 26, h: 74, mode: 1 },
    { y: 404, amp: 18, h: 64, mode: 2 },
    { y: 510, amp: 24, h: 80, mode: 3 },
    { y: 630, amp: 20, h: 62, mode: 4 },
  ];
  bands.forEach((b) => {
    let top = `M 40 ${b.y}`;
    let bottom = `M 40 ${b.y + b.h}`;
    for (let x = 40; x <= 560; x += 20) {
      top += ` Q ${x + 10} ${round(b.y - b.amp)} ${x + 20} ${b.y}`;
      bottom += ` Q ${x + 10} ${round(b.y + b.h + b.amp)} ${x + 20} ${b.y + b.h}`;
    }
    inner += `<path d="${top}"/>`;
    inner += `<path d="${bottom}"/>`;
    for (let x = 60; x <= 540; x += 60) {
      if (b.mode === 0) inner += `<path d="M ${x} ${b.y + 14} q 15 -18 30 0 q 15 18 30 0"/>`;
      if (b.mode === 1) inner += `<circle cx="${x}" cy="${b.y + b.h / 2}" r="14"/><circle cx="${x}" cy="${b.y + b.h / 2}" r="6"/>`;
      if (b.mode === 2) inner += `<path d="M ${x - 12} ${b.y + b.h - 16} L ${x} ${b.y + 16} L ${x + 12} ${b.y + b.h - 16}"/>`;
      if (b.mode === 3) inner += `<path d="M ${x - 16} ${b.y + 24} q 16 14 32 0 q 16 -14 32 0 M ${x - 16} ${b.y + 48} q 16 14 32 0 q 16 -14 32 0"/>`;
      if (b.mode === 4) {
        for (let k = 0; k < 3; k++) inner += dot(c, x + (k % 2) * 16, b.y + 20 + k * 14, 3);
      }
    }
  });
  inner += `<circle cx="470" cy="140" r="36"/><circle cx="470" cy="140" r="22"/>`;
  inner += cloudSvg(c, 130, 142, 28);
  return pen(c, inner);
}

function kaleidoscope(c) {
  const cx = c.cx;
  const cy = c.cy;
  let inner = `<circle cx="${cx}" cy="${cy}" r="214"/><circle cx="${cx}" cy="${cy}" r="198"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (360 / 12) * i;
    inner +=
      `<g transform="rotate(${a} ${cx} ${cy})">` +
      `<path d="M ${cx} ${cy - 54} L ${cx + 34} ${cy - 116} L ${cx} ${cy - 184} L ${cx - 34} ${cy - 116} Z"/>` +
      `<path d="M ${cx} ${cy - 122} L ${cx + 16} ${cy - 154} L ${cx} ${cy - 178} L ${cx - 16} ${cy - 154} Z"/>` +
      `<circle cx="${cx}" cy="${cy - 92}" r="7"/>` +
      `</g>`;
  }
  inner += `<circle cx="${cx}" cy="${cy}" r="82"/><circle cx="${cx}" cy="${cy}" r="54"/>`;
  inner += `<path d="${starPath(cx, cy, 44, 12, 0.6)}"/>`;
  inner += `<circle cx="${cx}" cy="${cy}" r="14"/>`;
  return pen(c, inner);
}

function paisleyDesign(c) {
  const cx = c.cx;
  const cy = c.cy;
  let inner = '';
  const shape = (x, y, s, sw) =>
    `<path d="M ${round(x)} ${round(y + s * 0.9)} C ${round(x - s * 0.82)} ${round(y + s * 0.4)}, ${round(x - s * 0.76)} ${round(y - s * 0.56)}, ${round(x)} ${round(y - s * 0.86)} C ${round(x + s * 0.76)} ${round(y - s * 0.56)}, ${round(x + s * 0.82)} ${round(y + s * 0.4)}, ${round(x)} ${round(y + s * 0.9)} Z"/>`;
  inner += shape(cx, cy, 188, 3);
  inner += shape(cx, cy, 142);
  inner += shape(cx, cy, 96);
  inner += `<path d="M ${cx} ${cy + 70} C ${cx - 52} ${cy + 30}, ${cx - 46} ${cy - 40}, ${cx} ${cy - 62} C ${cx + 46} ${cy - 40}, ${cx + 52} ${cy + 30}, ${cx} ${cy + 70} Z"/>`;
  inner += `<circle cx="${cx}" cy="${cy - 6}" r="20"/><circle cx="${cx}" cy="${cy - 6}" r="8"/>`;
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI * 2 * i) / 16;
    inner += dot(c, cx + Math.cos(a) * 162, cy + Math.sin(a) * 162, i % 2 ? 2.4 : 4);
  }
  inner += `<path d="M ${cx - 150} ${cy + 176} C ${cx - 190} ${cy + 120}, ${cx - 186} ${cy - 90}, ${cx - 92} ${cy - 154}"/>`;
  inner += `<path d="M ${cx + 150} ${cy + 176} C ${cx + 190} ${cy + 120}, ${cx + 186} ${cy - 90}, ${cx + 92} ${cy - 154}"/>`;
  inner += shape(120, 170, 34);
  inner += shape(486, 190, 30);
  inner += shape(106, 650, 28);
  inner += shape(500, 640, 34);
  return pen(c, inner);
}

/* -------------------------------------------------------------------- nature */

function tree(c) {
  let inner = treeSvg(c, 300, 650, 205);
  inner += sunSvg(c, 492, 160, 30, 10);
  inner += `<path d="M 54 674 H 546"/>`;
  inner += grassTuft(c, 100, 674, 30);
  inner += grassTuft(c, 210, 674, 24);
  inner += grassTuft(c, 400, 674, 26);
  inner += grassTuft(c, 510, 674, 30);
  inner += `<circle cx="212" cy="330" r="15"/><circle cx="386" cy="300" r="13"/><circle cx="330" cy="380" r="11"/><circle cx="246" cy="430" r="12"/>`;
  inner += leafSvg(c, 104, 220, 26, -30);
  inner += leafSvg(c, 498, 430, 24, 40);
  return pen(c, inner);
}

function flowers(c) {
  let inner = `<path d="M 50 690 Q 180 670 300 688 Q 430 706 550 684"/>`;
  const blooms = [
    [120, 360, 58, 6],
    [230, 300, 46, 5],
    [340, 380, 62, 7],
    [460, 310, 50, 6],
    [510, 470, 38, 5],
    [90, 500, 40, 5],
  ];
  blooms.forEach(([x, y, r, p], i) => {
    inner += `<path d="M ${x} ${y + r * 0.4} C ${x - 10} ${y + r * 1.3}, ${x + 14} ${y + r * 2.4}, ${x} ${690}"/>`;
    inner += leafSvg(c, x - 22, y + r * 1.5, 22, -35);
    inner += leafSvg(c, x + 24, y + r * 2, 20, 35);
    inner += flowerSvg(c, x, y, r, p);
    if (i % 2 === 0) inner += `<circle cx="${x}" cy="${y}" r="${round(r * 0.12)}"/>`;
  });
  inner += sunSvg(c, 492, 150, 28, 10);
  inner += `<path d="M 70 620 q 18 -16 36 0 q 18 16 36 0 M 420 630 q 18 -16 36 0 q 18 16 36 0"/>`;
  return pen(c, inner);
}

function sunDesign(c) {
  let inner = sunSvg(c, 300, 350, 125, 16);
  inner += cloudSvg(c, 120, 190, 38);
  inner += cloudSvg(c, 490, 220, 32);
  inner += cloudSvg(c, 120, 530, 30);
  inner += cloudSvg(c, 500, 540, 36);
  inner += `<path d="M 60 686 H 540"/>`;
  inner += flowerSvg(c, 120, 640, 30, 6);
  inner += flowerSvg(c, 480, 640, 30, 6);
  inner += grassTuft(c, 200, 686, 28);
  inner += grassTuft(c, 400, 686, 28);
  inner += `<path d="M 390 150 q 18 -18 36 0 q 18 -18 36 0"/>`;
  return pen(c, inner);
}

function mushrooms(c) {
  const shroom = (x, baseY, s) => {
    let out = `<path d="M ${round(x - s * 0.36)} ${round(baseY)} C ${round(x - s * 0.34)} ${round(baseY - s * 0.7)}, ${round(x + s * 0.34)} ${round(baseY - s * 0.7)}, ${round(x + s * 0.36)} ${round(baseY)} Z"/>`;
    out += `<path d="M ${round(x - s)} ${round(baseY - s * 0.62)} C ${round(x - s)} ${round(baseY - s * 1.3)}, ${round(x + s)} ${round(baseY - s * 1.3)}, ${round(x + s)} ${round(baseY - s * 0.62)} Q ${round(x)} ${round(baseY - s * 0.4)} ${round(x - s)} ${round(baseY - s * 0.62)} Z"/>`;
    for (let i = 0; i < 5; i++) {
      const a = -2.4 + i * 0.55;
      out += `<circle cx="${round(x + Math.cos(a) * s * 0.46)}" cy="${round(baseY - s * 0.9 + Math.sin(a) * s * 0.18)}" r="${round(s * 0.09)}"/>`;
    }
    out += `<path d="M ${round(x - s * 0.18)} ${round(baseY - s * 0.08)} q ${round(s * 0.18)} ${round(-s * 0.16)} ${round(s * 0.36)} 0"/>`;
    return out;
  };
  let inner = shroom(190, 650, 105) + shroom(410, 660, 86) + shroom(300, 540, 62);
  inner += `<path d="M 50 682 Q 200 664 330 684 Q 460 702 552 678"/>`;
  inner += grassTuft(c, 100, 682, 35);
  inner += grassTuft(c, 500, 680, 32);
  inner += ladybug(c, 478, 560, 24);
  inner += sunSvg(c, 100, 160, 30, 10);
  return pen(c, inner);
}

function leaves(c) {
  const specs = [
    [300, 420, 170, 0],
    [180, 320, 130, -46],
    [430, 330, 140, 44],
    [150, 560, 110, -24],
    [452, 570, 118, 26],
    [300, 610, 100, 0],
  ];
  let inner = '';
  specs.forEach(([x, y, s, rot]) => {
    inner += leafSvg(c, x, y, s, rot);
  });
  inner += `<path d="M 60 700 q 30 -20 60 0 q 30 20 60 0 M 420 704 q 30 -20 60 0 q 30 20 60 0"/>`;
  inner += dot(c, 92, 190, 3) + dot(c, 520, 210, 3) + dot(c, 96, 644, 3) + dot(c, 510, 660, 3);
  return pen(c, inner);
}

function cactus(c) {
  const potted = (x, baseY, s, pattern) => {
    let out = `<path d="M ${round(x - s * 0.46)} ${round(baseY - s * 0.46)} L ${round(x + s * 0.46)} ${round(baseY - s * 0.46)} L ${round(x + s * 0.34)} ${round(baseY)} L ${round(x - s * 0.34)} ${round(baseY)} Z"/>`;
    out += `<path d="M ${round(x - s * 0.42)} ${round(baseY - s * 0.36)} H ${round(x + s * 0.42)}"/>`;
    if (pattern === 0) {
      for (let i = 0; i < 3; i++) out += `<path d="M ${round(x - s * 0.28 + i * s * 0.28)} ${round(baseY - s * 0.34)} L ${round(x - s * 0.24 + i * s * 0.28)} ${round(baseY - s * 0.04)}"/>`;
    } else {
      out += `<path d="M ${round(x - s * 0.3)} ${round(baseY - s * 0.22)} q ${round(s * 0.12)} ${round(-s * 0.1)} ${round(s * 0.24)} 0 q ${round(s * 0.12)} ${round(s * 0.1)} ${round(s * 0.24)} 0"/>`;
    }
    out += `<path d="M ${round(x)} ${round(baseY - s * 0.46)} L ${round(x)} ${round(baseY - s * 1.2)}"/>`;
    out += `<path d="M ${round(x)} ${round(baseY - s * 0.86)} C ${round(x - s * 0.32)} ${round(baseY - s * 0.86)}, ${round(x - s * 0.36)} ${round(baseY - s * 1.06)}, ${round(x - s * 0.36)} ${round(baseY - s * 1.2)} L ${round(x - s * 0.22)} ${round(baseY - s * 1.2)} L ${round(x - s * 0.22)} ${round(baseY - s * 1.04)}"/>`;
    out += `<path d="M ${round(x)} ${round(baseY - s * 0.7)} C ${round(x + s * 0.3)} ${round(baseY - s * 0.7)}, ${round(x + s * 0.34)} ${round(baseY - s * 0.9)}, ${round(x + s * 0.34)} ${round(baseY - s * 1.04)} L ${round(x + s * 0.2)} ${round(baseY - s * 1.04)} L ${round(x + s * 0.2)} ${round(baseY - s * 0.88)}"/>`;
    out += `<path d="M ${round(x)} ${round(baseY - s * 1.18)} q ${round(s * 0.12)} ${round(-s * 0.14)} ${round(s * 0.24)} 0 q ${round(-s * 0.12)} ${round(s * 0.16)} ${round(-s * 0.24)} 0"/>`;
    return out;
  };
  let inner = potted(180, 680, 150, 0) + potted(410, 690, 120, 1) + potted(300, 600, 80, 0);
  inner += `<path d="M 60 706 H 540"/>`;
  inner += sunSvg(c, 100, 150, 30, 10);
  inner += dot(c, 500, 180, 3) + dot(c, 470, 700, 3) + dot(c, 80, 710, 3);
  return pen(c, inner);
}

function snowflakes(c) {
  const flake = (x, y, r) => {
    let out = '';
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6;
      const x2 = x + Math.cos(a) * r;
      const y2 = y + Math.sin(a) * r;
      out += `<path d="M ${round(x)} ${round(y)} L ${round(x2)} ${round(y2)}"/>`;
      const bx = x + Math.cos(a) * r * 0.62;
      const by = y + Math.sin(a) * r * 0.62;
      out += `<path d="M ${round(bx)} ${round(by)} L ${round(bx + Math.cos(a + 1) * r * 0.24)} ${round(by + Math.sin(a + 1) * r * 0.24)} M ${round(bx)} ${round(by)} L ${round(bx + Math.cos(a - 1) * r * 0.24)} ${round(by + Math.sin(a - 1) * r * 0.24)}"/>`;
      out += `<circle cx="${round(x2)}" cy="${round(y2)}" r="${round(r * 0.055)}"/>`;
    }
    out += `<circle cx="${round(x)}" cy="${round(y)}" r="${round(r * 0.16)}"/>`;
    return out;
  };
  let inner = flake(300, 400, 150) + flake(130, 210, 62) + flake(474, 230, 52) + flake(118, 610, 48) + flake(478, 610, 64);
  for (let i = 0; i < 14; i++) {
    const x = 70 + ((i * 83) % 460);
    const y = 140 + ((i * 117) % 540);
    inner += dot(c, x, y, i % 3 === 0 ? 3.4 : 2);
  }
  return pen(c, inner);
}

function butterflyDesign(c) {
  let inner = butterflySvg(c, 300, 390, 175);
  inner += `<path d="M 60 680 Q 180 656 300 676 Q 420 696 540 670"/>`;
  inner += flowerSvg(c, 130, 620, 48, 6);
  inner += flowerSvg(c, 470, 620, 44, 6);
  inner += flowerSvg(c, 300, 660, 36, 5);
  inner += `<path d="M 390 160 q 16 -18 32 0 q 16 -18 32 0"/>`;
  inner += dot(c, 120, 180, 3) + dot(c, 490, 200, 3) + dot(c, 90, 430, 3) + dot(c, 510, 440, 3);
  return pen(c, inner);
}

function bee(c) {
  let inner = `<ellipse cx="300" cy="420" rx="120" ry="82"/>`;
  inner += `<path d="M 230 348 C 210 280, 250 250, 300 344 M 310 344 C 330 270, 380 270, 380 360"/>`;
  inner += `<path d="M 300 348 C 290 270, 340 240, 370 330"/>`;
  inner += `<path d="M 220 390 C 260 370, 340 370, 380 390 M 210 430 C 260 410, 340 410, 390 430 M 220 470 C 260 450, 340 450, 380 470"/>`;
  inner += `<circle cx="190" cy="404" r="12"/><circle cx="190" cy="404" r="5"/>`;
  inner += `<path d="M 180 420 C 140 400, 130 430, 160 444 M 182 392 C 146 370, 134 396, 160 414"/>`;
  inner += `<circle cx="380" cy="412" r="6" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 408 420 q 26 -10 44 4 M 410 436 q 24 2 36 18"/>`;
  for (let r = 0; r < 2; r++) {
    for (let k = 0; k < 3; k++) {
      inner += `<path d="${hexPath(120 + k * 64 + r * 32, 600 + r * 52, 30)}"/>`;
    }
  }
  inner += flowerSvg(c, 470, 590, 40, 6);
  inner += flowerSvg(c, 510, 670, 30, 5);
  inner += `<path d="M 60 690 q 24 -16 48 0 q 24 16 48 0"/>`;
  return pen(c, inner);
}

function snail(c) {
  let inner = `<path d="M 100 620 C 100 540, 180 500, 300 500 C 420 500, 500 540, 500 620 Z"/>`;
  inner += `<path d="M 90 620 C 90 680, 200 700, 300 680 C 400 700, 510 680, 510 620"/>`;
  inner += `<path d="M 280 500 C 250 460, 220 460, 210 480"/>`;
  inner += `<circle cx="210" cy="500" r="34"/><circle cx="210" cy="500" r="20"/><circle cx="210" cy="500" r="8"/>`;
  inner += `<path d="M 180 480 C 150 440, 130 430, 112 440 M 200 470 C 190 430, 196 410, 214 400"/>`;
  inner += `<circle cx="112" cy="440" r="5" fill="${c.C}" stroke="none"/><circle cx="214" cy="400" r="5" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 240 600 C 300 560, 400 560, 450 610 M 260 640 C 320 610, 400 610, 470 650"/>`;
  inner += leafSvg(c, 450, 560, 60, 30);
  inner += grassTuft(c, 90, 700, 34) + grassTuft(c, 510, 700, 30);
  inner += sunSvg(c, 100, 160, 28, 10);
  return pen(c, inner);
}

function garden(c) {
  let inner = `<path d="M 60 660 H 540"/>`;
  inner += `<path d="M 80 660 L 80 560 L 110 560 L 110 660 M 140 660 L 140 560 L 170 560 L 170 660 M 200 660 L 200 560 L 230 560 L 230 660 M 260 660 L 260 560 L 290 560 L 290 660"/>`;
  inner += `<path d="M 70 600 H 300 M 70 626 H 300"/>`;
  inner += `<path d="M 320 700 C 380 660, 420 660, 470 620"/>`;
  const bloom = (x, y, r, p) => {
    let out = `<path d="M ${x} ${y + r} C ${x - 8} ${y + r * 2}, ${x + 10} ${y + r * 3}, ${x} ${690}"/>`;
    out += leafSvg(c, x - 16, y + r * 2, 20, -30);
    out += flowerSvg(c, x, y, r, p);
    return out;
  };
  inner += bloom(370, 520, 38, 6) + bloom(440, 470, 32, 5) + bloom(500, 540, 36, 6);
  inner += butterflySvg(c, 200, 360, 60);
  inner += sunSvg(c, 480, 160, 32, 12);
  inner += cloudSvg(c, 150, 170, 34);
  inner += `<path d="M 50 690 q 20 -14 40 0 q 20 14 40 0 M 470 694 q 22 -16 44 0 q 22 16 44 0"/>`;
  return pen(c, inner);
}

function mountain(c) {
  let inner = `<path d="M 40 620 L 170 300 L 300 620 Z M 210 620 L 360 240 L 520 620 Z M 420 620 L 500 420 L 570 620 Z"/>`;
  inner += `<path d="M 128 390 L 170 300 L 212 390 L 190 380 L 170 398 L 150 380 Z"/>`;
  inner += `<path d="M 300 370 L 360 240 L 420 370 L 390 358 L 360 380 L 330 356 Z"/>`;
  inner += `<path d="M 40 620 H 570"/>`;
  inner += pineTree(c, 100, 650, 70) + pineTree(c, 230, 664, 54) + pineTree(c, 470, 660, 64);
  inner += sunSvg(c, 470, 160, 34, 12);
  inner += cloudSvg(c, 130, 180, 38);
  inner += `<path d="M 70 700 q 22 -16 44 0 q 22 16 44 0 M 420 704 q 22 -16 44 0 q 22 16 44 0"/>`;
  return pen(c, inner);
}

function seashell(c) {
  const cx = 300;
  const baseY = 600;
  let inner = `<path d="M ${cx - 170} ${baseY} C ${cx - 190} ${baseY - 200}, ${cx - 90} ${baseY - 300}, ${cx} ${baseY - 300} C ${cx + 90} ${baseY - 300}, ${cx + 190} ${baseY - 200}, ${cx + 170} ${baseY} Q ${cx} ${baseY - 60} ${cx - 170} ${baseY} Z"/>`;
  for (let i = -4; i <= 4; i++) {
    inner += `<path d="M ${cx} ${baseY - 260} Q ${round(cx + i * 30)} ${baseY - 140} ${round(cx + i * 38)} ${baseY - 22}"/>`;
  }
  inner += `<path d="M ${cx - 120} ${baseY - 40} Q ${cx} ${baseY - 100} ${cx + 120} ${baseY - 40}"/>`;
  inner += `<path d="M 90 640 q 30 -20 60 0 q 30 20 60 0"/>`;
  inner += `<path d="M 400 660 q 30 -20 60 0 q 30 20 60 0"/>`;
  inner += `<path d="M 140 600 L 128 550 L 150 566 L 160 520 L 176 566 L 196 550 L 186 600 Z"/>`;
  inner += `<path d="M 430 540 L 470 600 L 500 545 L 480 600 M 450 570 L 480 600"/>`;
  inner += dot(c, 110, 620, 3) + dot(c, 220, 680, 3) + dot(c, 360, 690, 3) + dot(c, 500, 640, 3) + dot(c, 520, 690, 3);
  inner += `<circle cx="500" cy="180" r="30"/>`;
  return pen(c, inner);
}

function rose(c) {
  const cx = 300;
  const cy = 360;
  let inner = '';
  inner += `<circle cx="${cx}" cy="${cy}" r="120"/>`;
  inner += `<path d="M ${cx} ${cy + 120} C ${cx - 10} ${cy + 240}, ${cx + 14} ${cy + 320}, ${cx} 680"/>`;
  inner += leafSvg(c, cx - 70, cy + 230, 60, -40);
  inner += leafSvg(c, cx + 74, cy + 300, 56, 40);
  inner += leafSvg(c, cx - 60, cy + 350, 44, -30);
  inner += `<path d="M ${cx} ${cy - 120} C ${cx - 60} ${cy - 104}, ${cx - 104} ${cy - 54}, ${cx - 108} ${cy} C ${cx - 112} ${cy + 70}, ${cx - 54} ${cy + 126}, ${cx} ${cy + 128} C ${cx + 64} ${cy + 126}, ${cx + 112} ${cy + 64}, ${cx + 104} ${cy} C ${cx + 96} ${cy - 60}, ${cx + 52} ${cy - 104}, ${cx} ${cy - 120} Z"/>`;
  inner += `<path d="M ${cx} ${cy - 72} C ${cx - 42} ${cy - 56}, ${cx - 64} ${cy - 16}, ${cx - 52} ${cy + 30} C ${cx - 40} ${cy + 74}, ${cx + 16} ${cy + 82}, ${cx + 44} ${cy + 46} C ${cx + 70} ${cy + 12}, ${cx + 52} ${cy - 36}, ${cx + 18} ${cy - 48} C ${cx - 10} ${cy - 58}, ${cx - 34} ${cy - 28}, ${cx - 20} ${cy - 4} C ${cx - 8} ${cy + 16}, ${cx + 18} ${cy + 12}, ${cx + 22} ${cy - 8}"/>`;
  inner += `<path d="M ${cx - 100} ${cy + 70} C ${cx - 140} ${cy + 40}, ${cx - 146} ${cy - 30}, ${cx - 110} ${cy - 70} M ${cx + 100} ${cy + 60} C ${cx + 142} ${cy + 26}, ${cx + 144} ${cy - 40}, ${cx + 108} ${cy - 78}"/>`;
  inner += dot(c, 120, 180, 3) + dot(c, 480, 200, 3) + dot(c, 90, 620, 3) + dot(c, 510, 640, 3);
  return pen(c, inner);
}

function sunflower(c) {
  const cx = 300;
  const cy = 360;
  let inner = `<path d="M ${cx} ${cy + 90} C ${cx - 12} ${cy + 220}, ${cx + 14} ${cy + 320}, ${cx} 690"/>`;
  inner += leafSvg(c, cx - 70, cy + 220, 62, -40);
  inner += leafSvg(c, cx + 72, cy + 310, 56, 40);
  for (let i = 0; i < 18; i++) {
    const a = (360 / 18) * i;
    inner += `<g transform="rotate(${a} ${cx} ${cy})"><path d="M ${cx} ${cy - 96} C ${cx - 30} ${cy - 150}, ${cx + 30} ${cy - 150}, ${cx} ${cy - 96} Z" transform="translate(0 ${-34})"/></g>`;
  }
  inner += `<circle cx="${cx}" cy="${cy}" r="86"/><circle cx="${cx}" cy="${cy}" r="68"/>`;
  for (let r = 0; r < 5; r++) {
    for (let k = 0; k < 5; k++) {
      inner += dot(c, cx - 48 + k * 24, cy - 48 + r * 24, 3.4);
    }
  }
  inner += `<path d="M ${cx - 90} ${cy + 30} C ${cx - 130} ${cy - 10}, ${cx - 126} ${cy - 70}, ${cx - 92} ${cy - 104} M ${cx + 90} ${cy + 24} C ${cx + 130} ${cy - 16}, ${cx + 124} ${cy - 74}, ${cx + 90} ${cy - 106}"/>`;
  inner += butterflySvg(c, 470, 600, 50);
  return pen(c, inner);
}

function lotus(c) {
  const cx = 300;
  const cy = 460;
  let inner = '';
  inner += `<path d="M 40 660 Q 150 640 300 656 Q 450 672 560 648"/>`;
  inner += `<path d="M ${cx - 190} ${cy + 20} C ${cx - 150} ${cy - 80}, ${cx - 70} ${cy - 90}, ${cx - 40} ${cy - 10} C ${cx - 90} ${cy + 30}, ${cx - 150} ${cy + 40}, ${cx - 190} ${cy + 20} Z"/>`;
  inner += `<path d="M ${cx + 190} ${cy + 20} C ${cx + 150} ${cy - 80}, ${cx + 70} ${cy - 90}, ${cx + 40} ${cy - 10} C ${cx + 90} ${cy + 30}, ${cx + 150} ${cy + 40}, ${cx + 190} ${cy + 20} Z"/>`;
  const petals = [
    { rIn: 20, rOut: 180, count: 10 },
    { rIn: 16, rOut: 142, count: 8 },
    { rIn: 12, rOut: 104, count: 7 },
    { rIn: 8, rOut: 68, count: 6 },
  ];
  petals.forEach((layer) => {
    inner += petalRing(c, cx, cy, layer.rIn, layer.rOut, layer.count, true);
  });
  inner += `<circle cx="${cx}" cy="${cy}" r="20"/><circle cx="${cx}" cy="${cy}" r="7"/>`;
  inner += `<path d="M 70 700 C 150 660, 220 660, 280 700 M 340 700 C 400 660, 470 660, 540 700"/>`;
  inner += `<path d="M 140 694 C 170 666, 210 666, 238 694 Z"/>`;
  inner += `<path d="M 380 700 C 410 670, 452 670, 484 700 Z"/>`;
  inner += `<circle cx="430" cy="330" r="16"/>`;
  inner += `<path d="M 430 346 L 424 383 M 430 346 L 438 383"/>`;
  inner += `<path d="M 424 352 C 396 338, 392 316, 410 310 M 438 352 C 464 338, 468 316, 450 310"/>`;
  inner += `<path d="M 90 250 q 18 -18 36 0 q 18 -18 36 0"/>`;
  return pen(c, inner);
}

function bouquet(c) {
  let inner = `<path d="M 220 520 L 250 690 L 350 690 L 380 520 Z"/>`;
  inner += `<path d="M 220 520 Q 300 570 380 520"/>`;
  inner += `<path d="M 250 560 L 236 690 M 300 580 L 300 690 M 352 560 L 366 690"/>`;
  inner += `<path d="M 300 590 L 260 650 L 300 620 Z M 300 590 L 340 650 L 300 620 Z"/>`;
  const stems = [
    [180, 300, 52, 6],
    [300, 250, 60, 7],
    [420, 300, 50, 6],
    [240, 410, 46, 5],
    [370, 410, 48, 5],
  ];
  stems.forEach(([x, y, r, p]) => {
    inner += `<path d="M ${x} ${y + r} C ${x - 8} ${y + r * 2}, ${x + 10} ${y + r * 3}, ${x - (x - 300) * 0.3} 540"/>`;
    inner += leafSvg(c, x - 20, y + r * 2.2, 22, -35);
  });
  stems.forEach(([x, y, r, p]) => {
    inner += flowerSvg(c, x, y, r, p);
  });
  inner += `<path d="M 60 700 H 540"/>`;
  inner += dot(c, 100, 170, 3) + dot(c, 500, 180, 3) + dot(c, 90, 620, 3) + dot(c, 510, 640, 3);
  return pen(c, inner);
}

function wreath(c) {
  const cx = 300;
  const cy = 410;
  let inner = `<circle cx="${cx}" cy="${cy}" r="170"/>`;
  for (let i = 0; i < 24; i++) {
    const a = (Math.PI * 2 * i) / 24;
    inner += leafSvg(c, cx + Math.cos(a) * 170, cy + Math.sin(a) * 170, 30, (a * 180) / Math.PI + 90);
  }
  const flowers = [
    [cx, cy - 262, 38, 6],
    [cx + 230, cy + 20, 34, 6],
    [cx - 236, cy + 30, 32, 5],
    [cx + 120, cy + 234, 30, 5],
    [cx - 130, cy + 232, 32, 6],
    [cx + 220, cy - 156, 26, 5],
    [cx - 216, cy - 166, 28, 5],
  ];
  flowers.forEach(([x, y, r, p]) => {
    inner += flowerSvg(c, x, y, r, p);
  });
  inner += `<path d="M ${cx - 60} ${cy + 282} C ${cx - 10} ${cy + 318}, ${cx + 10} ${cy + 318}, ${cx + 60} ${cy + 282} L ${cx + 42} ${cy + 262} L ${cx - 42} ${cy + 262} Z"/>`;
  inner += `<path d="M ${cx - 40} ${cy + 276} L ${cx - 80} ${cy + 300} M ${cx + 40} ${cy + 276} L ${cx + 80} ${cy + 300}"/>`;
  return pen(c, inner);
}

function potted(c) {
  let inner = `<path d="M 190 560 L 410 560 L 380 690 L 220 690 Z"/>`;
  inner += `<path d="M 178 560 H 422"/>`;
  inner += `<path d="M 220 592 H 380 M 228 630 H 372"/>`;
  for (let i = 0; i < 6; i++) {
    inner += `<circle cx="${round(240 + i * 24)}" cy="${round(664 + (i % 2) * 8)}" r="10"/>`;
  }
  const stems = [
    [300, 230, 62, 7],
    [210, 300, 46, 6],
    [390, 300, 46, 6],
    [250, 410, 36, 5],
    [350, 410, 36, 5],
  ];
  stems.forEach(([x, y, r, p]) => {
    inner += `<path d="M ${x} ${y + r} C ${x - 8} ${y + r * 2}, ${x + 8} ${y + r * 3}, ${300 + (x - 300) * 0.25} 560"/>`;
    inner += leafSvg(c, x - 18, y + r * 2, 24, -32);
    inner += flowerSvg(c, x, y, r, p);
  });
  inner += `<path d="M 60 710 H 540"/>`;
  inner += dot(c, 96, 190, 3) + dot(c, 504, 210, 3) + dot(c, 104, 520, 3) + dot(c, 500, 520, 3);
  return pen(c, inner);
}

function rainbow(c) {
  let inner = '';
  const colors = [190, 160, 130, 100, 70];
  colors.forEach((r, i) => {
    inner += `<path d="M ${300 - r} 560 A ${r} ${r} 0 0 1 ${300 + r} 560"/>`;
  });
  inner += cloudSvg(c, 110, 560, 50);
  inner += cloudSvg(c, 490, 560, 50);
  inner += sunSvg(c, 500, 170, 38, 12);
  inner += `<path d="M 60 680 H 540"/>`;
  inner += `<path d="M 90 680 q 20 -14 40 0 q 20 14 40 0 M 420 680 q 20 -14 40 0 q 20 14 40 0"/>`;
  inner += flowerSvg(c, 130, 640, 30, 5);
  inner += flowerSvg(c, 220, 660, 24, 5);
  inner += flowerSvg(c, 380, 660, 26, 5);
  inner += flowerSvg(c, 470, 640, 30, 5);
  inner += `<path d="M 150 200 q 18 -18 36 0 q 18 -18 36 0"/>`;
  return pen(c, inner);
}

/* ---------------------------------------------------------------------- food */

function fruits(c) {
  let inner = `<path d="M 110 470 L 490 470 L 460 690 L 140 690 Z"/>`;
  inner += `<path d="M 130 520 H 470 M 120 580 H 480 M 140 640 H 460"/>`;
  inner += `<path d="M 150 470 C 150 330, 450 330, 450 470"/>`;
  inner += `<path d="M 150 470 C 180 420, 420 420, 450 470"/>`;
  inner += `<circle cx="210" cy="430" r="56"/><path d="M 210 374 C 200 340, 224 330, 234 348"/>`;
  inner += `<circle cx="330" cy="420" r="62"/>`;
  inner += `<path d="M 392 380 C 442 370, 458 400, 448 430 C 438 458, 404 460, 392 432 Z"/>`;
  inner += `<path d="M 300 470 C 270 440, 240 440, 230 470 C 220 500, 250 530, 270 520 C 290 512, 300 490, 300 470 Z"/>`;
  inner += `<path d="M 170 520 C 150 500, 120 504, 118 530 C 116 556, 150 570, 168 550 C 184 532, 180 516, 170 520 Z"/>`;
  inner += `<circle cx="210" cy="410" r="6"/><circle cx="210" cy="440" r="6"/><circle cx="195" cy="425" r="6"/><circle cx="225" cy="425" r="6"/>`;
  inner += `<path d="M 330 420 L 330 480 M 300 420 L 360 420"/>`;
  inner += `<path d="M 250 620 q 20 -20 40 0 q 20 20 40 0 q 20 -20 40 0"/>`;
  inner += leafSvg(c, 330, 360, 26, -20);
  inner += `<circle cx="470" cy="180" r="30"/>`;
  inner += dot(c, 90, 200, 3) + dot(c, 510, 220, 3) + dot(c, 96, 620, 3) + dot(c, 504, 640, 3);
  return pen(c, inner);
}

function watermelon(c) {
  let inner = `<path d="M 80 560 L 520 560 A 220 220 0 0 0 80 560 Z"/>`;
  inner += `<path d="M 112 560 A 188 188 0 0 0 488 560"/>`;
  inner += `<path d="M 142 560 A 158 158 0 0 0 458 560"/>`;
  inner += `<path d="M 190 560 A 110 110 0 0 0 410 560"/>`;
  for (let i = 0; i < 12; i++) {
    const a = 0.35 + (i / 11) * 2.45;
    inner += `<path d="M ${round(300 + Math.cos(a) * 80)} ${round(560 + Math.sin(a) * -80)} q 8 14 16 0 q -8 -14 -16 0 Z"/>`;
  }
  inner += `<circle cx="300" cy="260" r="110"/><circle cx="300" cy="260" r="96"/>`;
  inner += `<path d="M 240 220 q 60 30 120 0 M 240 260 q 60 30 120 0 M 240 300 q 60 30 120 0"/>`;
  inner += `<path d="M 110 680 H 500"/>`;
  inner += `<path d="M 140 660 q 18 -16 36 0 q 18 16 36 0 M 420 664 q 18 -16 36 0 q 18 16 36 0"/>`;
  inner += `<path d="M 80 240 q 24 -16 48 0 q 24 16 48 0"/>`;
  return pen(c, inner);
}

function strawberry(c) {
  let inner = `<path d="M 300 690 C 180 620, 150 470, 210 400 C 250 354, 350 354, 390 400 C 450 470, 420 620, 300 690 Z"/>`;
  inner += `<path d="M 210 410 C 230 388, 270 380, 300 402 C 330 380, 370 388, 390 410"/>`;
  for (let r = 0; r < 5; r++) {
    for (let k = 0; k < 4; k++) {
      inner += dot(c, 248 + k * 36 + (r % 2) * 16, 448 + r * 42, 3.6);
    }
  }
  inner += `<path d="M 300 402 C 260 360, 230 330, 220 300 C 260 300, 290 330, 300 360 C 310 330, 340 300, 380 300 C 370 330, 340 360, 300 402 Z"/>`;
  inner += `<path d="M 300 360 L 300 300"/>`;
  inner += flowerSvg(c, 130, 580, 38, 5);
  inner += flowerSvg(c, 470, 600, 34, 6);
  inner += `<path d="M 70 700 H 530"/>`;
  inner += `<path d="M 100 690 q 20 -16 40 0 q 20 16 40 0"/>`;
  return pen(c, inner);
}

function pineapple(c) {
  let inner = `<ellipse cx="300" cy="470" rx="130" ry="190"/>`;
  inner += `<path d="M 170 470 Q 300 560 430 470 M 180 410 Q 300 500 420 410 M 196 350 Q 300 440 404 350"/>`;
  inner += `<path d="M 230 310 Q 220 470 250 640 M 300 290 Q 300 470 300 650 M 370 310 Q 380 470 350 640"/>`;
  inner += `<path d="M 300 290 C 260 230, 220 200, 190 190 C 220 210, 250 230, 270 270 C 300 220, 330 190, 370 180 C 340 210, 320 240, 300 290 Z"/>`;
  inner += `<path d="M 300 290 C 280 210, 270 170, 280 140 C 300 180, 310 220, 300 290 Z"/>`;
  inner += `<path d="M 190 190 C 160 220, 150 260, 160 300 M 370 180 C 410 210, 420 250, 410 290"/>`;
  inner += `<path d="M 60 700 H 540"/>`;
  inner += fruitLeaf(c, 420, 320, 50, 50);
  inner += `<circle cx="470" cy="180" r="28"/>`;
  return pen(c, inner);
}

function fruitLeaf(c, x, y, s, rot) {
  return leafSvg(c, x, y, s, rot);
}

function grapes(c) {
  let inner = `<path d="M 300 250 C 280 200, 270 160, 300 130 C 330 160, 320 200, 300 250 Z"/>`;
  inner += `<path d="M 300 130 C 260 100, 220 100, 190 120"/>`;
  inner += leafSvg(c, 380, 200, 70, 40);
  inner += leafSvg(c, 210, 220, 56, -40);
  inner += `<path d="M 190 120 C 150 130, 150 180, 180 190 M 190 120 C 220 80, 260 80, 280 100"/>`;
  const rows = [
    [300, 330, 3],
    [255, 380, 4],
    [345, 380, 2],
    [300, 430, 4],
    [240, 480, 3],
    [360, 480, 3],
    [300, 530, 4],
    [250, 580, 3],
    [350, 580, 3],
    [300, 630, 2],
  ];
  rows.forEach(([x, y, count]) => {
    for (let i = 0; i < count; i++) {
      inner += `<circle cx="${x - (count - 1) * 24 + i * 48}" cy="${y}" r="28"/>`;
    }
  });
  inner += `<path d="M 300 130 C 320 90, 360 80, 390 100"/>`;
  inner += dot(c, 100, 180, 3) + dot(c, 500, 180, 3) + dot(c, 90, 620, 3) + dot(c, 510, 650, 3);
  return pen(c, inner);
}

function cupcake(c) {
  let inner = `<path d="M 190 470 L 410 470 L 380 690 L 220 690 Z"/>`;
  inner += `<path d="M 205 510 L 395 510 M 212 560 L 388 560 M 218 610 L 382 610 M 224 660 L 376 660"/>`;
  for (let i = 0; i < 5; i++) {
    inner += `<path d="M ${round(210 + i * 38)} 470 L ${round(230 + i * 32)} 690"/>`;
  }
  inner += `<path d="M 180 470 C 130 440, 160 380, 210 390 C 200 320, 280 300, 300 350 C 320 300, 400 320, 390 390 C 440 380, 470 440, 420 470 Z"/>`;
  inner += `<path d="M 200 420 C 220 380, 260 400, 280 380 C 300 360, 340 360, 360 390 C 380 420, 400 400, 410 430"/>`;
  inner += `<circle cx="300" cy="326" r="24"/><path d="M 300 302 C 290 280, 310 270, 320 286"/>`;
  inner += `<path d="M 240 500 q 14 -12 28 0 M 310 540 q 14 -12 28 0 M 260 600 q 14 -12 28 0 M 330 640 q 14 -12 28 0"/>`;
  inner += `<path d="M 60 710 H 540"/>`;
  inner += `<circle cx="470" cy="160" r="26"/>`;
  return pen(c, inner);
}

function icecream(c) {
  let inner = `<path d="M 230 440 L 300 690 L 370 440 Z"/>`;
  inner += `<path d="M 240 480 L 360 480 M 252 530 L 348 530 M 264 580 L 336 580 M 276 630 L 324 630"/>`;
  inner += `<path d="M 240 480 L 348 530 M 252 530 L 336 580 M 264 580 L 324 630 M 360 480 L 264 580"/>`;
  inner += `<circle cx="300" cy="380" r="76"/>`;
  inner += `<circle cx="236" cy="410" r="58"/>`;
  inner += `<circle cx="364" cy="410" r="58"/>`;
  inner += `<circle cx="300" cy="306" r="58"/>`;
  inner += `<path d="M 224 430 C 236 464, 264 470, 280 448 M 376 430 C 364 464, 336 470, 320 448"/>`;
  inner += `<circle cx="300" cy="286" r="22"/><path d="M 300 264 C 290 244, 310 234, 320 250"/>`;
  inner += `<path d="M 220 560 q 16 -14 32 0 q 16 14 32 0"/>`;
  inner += `<path d="M 60 710 H 540"/>`;
  inner += dot(c, 100, 180, 3) + dot(c, 500, 200, 3) + dot(c, 90, 620, 3) + dot(c, 510, 640, 3);
  return pen(c, inner);
}

function donut(c) {
  let inner = `<circle cx="300" cy="400" r="170"/><circle cx="300" cy="400" r="62"/>`;
  inner += `<path d="M 300 230 C 380 230, 470 300, 470 400 C 470 500, 380 570, 300 570 C 220 570, 130 500, 130 400 C 130 300, 220 230, 300 230 Z"/>`;
  inner += `<path d="M 140 400 C 160 350, 200 330, 230 350 C 250 310, 300 300, 330 330 C 370 300, 410 330, 420 360 C 450 370, 470 400, 450 430"/>`;
  let seed = 0;
  for (let i = 0; i < 20; i++) {
    const a = (Math.PI * 2 * i) / 20;
    const r = 108 + (i % 3) * 16;
    const x = 300 + Math.cos(a) * r;
    const y = 400 + Math.sin(a) * r;
    seed++;
    if (seed % 2 === 0) {
      inner += `<path d="M ${round(x - 8)} ${round(y)} q 8 -10 16 0"/>`;
    } else {
      inner += `<path d="M ${round(x - 7)} ${round(y - 7)} L ${round(x + 7)} ${round(y + 7)} M ${round(x + 7)} ${round(y - 7)} L ${round(x - 7)} ${round(y + 7)}"/>`;
    }
  }
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    inner += `<circle cx="${round(300 + Math.cos(a) * 230)}" cy="${round(400 + Math.sin(a) * 230)}" r="18"/>`;
  }
  inner += `<path d="M 60 710 H 540"/>`;
  return pen(c, inner);
}

module.exports = {
  mandalaPetals,
  mandalaRings,
  mandalaGeo,
  mandalaLotus,
  shapes,
  hearts,
  stars,
  bubbles,
  mosaic,
  swirls,
  waves,
  kaleidoscope,
  paisleyDesign,
  tree,
  flowers,
  sunDesign,
  mushrooms,
  leaves,
  cactus,
  snowflakes,
  butterflyDesign,
  bee,
  snail,
  garden,
  mountain,
  seashell,
  rose,
  sunflower,
  lotus,
  bouquet,
  wreath,
  potted,
  rainbow,
  fruits,
  watermelon,
  strawberry,
  pineapple,
  grapes,
  cupcake,
  icecream,
  donut,
};
