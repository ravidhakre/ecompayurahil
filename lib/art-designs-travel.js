'use strict';

// ---------------------------------------------------------------------------
// Design library D: travel and festive pages.
// ---------------------------------------------------------------------------

const {
  round,
  pen,
  dot,
  starPath,
  starSvg,
  cloudSvg,
  leafSvg,
  flowerSvg,
  sunSvg,
  butterflySvg,
  fishSvg,
  birdSvg,
  grassTuft,
} = require('./art-primitives');

function waveLine(y, amp = 16, start = 40, end = 560) {
  let d = `M ${start} ${y}`;
  for (let x = start; x < end; x += 20) {
    d += ` Q ${x + 10} ${round(y - amp)} ${x + 20} ${y}`;
  }
  return d;
}

function pine(c, cx, baseY, s) {
  let inner = `<path d="M ${cx} ${baseY} L ${cx} ${baseY - s * 0.3}"/>`;
  for (let i = 0; i < 3; i++) {
    const y = baseY - s * (0.2 + i * 0.26);
    const w = s * (0.5 - i * 0.1);
    inner += `<path d="M ${cx - w} ${y} L ${cx} ${y - s * 0.34} L ${cx + w} ${y} Z"/>`;
  }
  return inner;
}

/* -------------------------------------------------------------------- travel */

function plane(c) {
  let inner = `<path d="M 120 470 L 300 400 L 480 470 L 400 500 L 360 590 L 300 560 L 240 590 L 200 500 Z"/>`;
  inner += `<path d="M 300 400 L 300 560"/>`;
  inner += `<path d="M 300 430 C 256 430, 224 448, 210 476 M 300 430 C 344 430, 376 448, 390 476"/>`;
  inner += `<path d="M 300 400 L 260 330 L 340 330 Z"/>`;
  inner += `<path d="M 260 330 C 280 300, 320 300, 340 330"/>`;
  inner += `<path d="M 150 470 L 140 430 M 450 470 L 460 430 M 206 500 L 190 540 M 394 500 L 410 540"/>`;
  inner += cloudSvg(c, 100, 240, 42);
  inner += cloudSvg(c, 500, 270, 36);
  inner += cloudSvg(c, 460, 620, 32);
  inner += cloudSvg(c, 140, 650, 28);
  inner += sunSvg(c, 120, 150, 30, 10);
  inner += `<path d="M 60 700 H 540"/>`;
  inner += `<path d="M 80 690 q 20 -14 40 0 q 20 14 40 0 M 440 690 q 20 -14 40 0 q 20 14 40 0"/>`;
  inner += `<path d="M 380 180 q 18 -18 36 0 q 18 -18 36 0"/>`;
  return pen(c, inner);
}

function globe(c) {
  let inner = `<circle cx="300" cy="360" r="170"/>`;
  inner += `<path d="M 300 190 C 220 240, 220 480, 300 530 C 380 480, 380 240, 300 190 Z"/>`;
  inner += `<path d="M 130 360 H 470"/>`;
  inner += `<path d="M 160 280 Q 300 240 440 280 M 160 440 Q 300 480 440 440"/>`;
  inner += `<path d="M 190 260 C 230 300, 220 350, 250 390 C 270 416, 260 460, 230 490"/>`;
  inner += `<path d="M 360 250 C 390 290, 392 340, 366 380 C 350 406, 380 440, 408 458"/>`;
  inner += `<path d="M 270 540 L 240 640 L 360 640 L 330 540"/>`;
  inner += `<path d="M 220 660 H 380"/>`;
  inner += `<path d="M 300 530 V 640"/>`;
  inner += `<path d="M 150 500 C 210 560, 390 560, 450 500"/>`;
  inner += `<path d="M 380 180 C 440 120, 520 140, 520 190 C 520 240, 450 250, 420 210"/>`;
  inner += `<path d="M 420 210 L 400 240 L 430 260"/>`;
  inner += starSvg(c, 120, 180, 18, 5) + starSvg(c, 500, 340, 14, 5);
  inner += `<path d="M 70 700 H 530"/>`;
  return pen(c, inner);
}

function lighthouse(c) {
  let inner = `<path d="M 240 620 L 270 260 L 330 260 L 360 620 Z"/>`;
  inner += `<path d="M 254 520 L 346 520 M 262 430 L 338 430 M 266 350 L 334 350"/>`;
  inner += `<path d="M 262 300 H 338 L 352 260 H 248 Z"/>`;
  inner += `<rect x="270" y="200" width="60" height="60" rx="6"/>`;
  inner += `<path d="M 280 200 V 260 M 300 200 V 260 M 320 200 V 260"/>`;
  inner += `<path d="M 270 200 L 250 178 L 350 178 L 330 200 Z"/>`;
  inner += `<path d="M 300 178 V 152"/>`;
  inner += `<circle cx="300" cy="146" r="8"/>`;
  inner += `<path d="M 350 220 L 430 180 M 250 240 L 170 200"/>`;
  inner += `<path d="M 100 610 C 130 560, 190 550, 230 600 C 190 620, 130 630, 100 610 Z"/>`;
  inner += `<path d="M 380 610 C 420 550, 480 560, 510 610 C 470 630, 420 632, 380 610 Z"/>`;
  inner += `<path d="M 120 680 Q 200 650 300 676 Q 400 702 490 674"/>`;
  inner += waveLine(660, 16);
  inner += waveLine(700, 12);
  inner += `<path d="M 420 150 q 18 -18 36 0 q 18 -18 36 0 M 90 300 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += `<circle cx="480" cy="110" r="30"/>`;
  inner += `<path d="M 60 700 H 540"/>`;
  return pen(c, inner);
}

function beach(c) {
  let inner = `<path d="M 40 500 Q 160 476 300 500 Q 440 524 560 492"/>`;
  inner += `<path d="M 40 540 Q 160 516 300 540 Q 440 564 560 532"/>`;
  inner += `<path d="M 40 600 Q 160 576 300 600 Q 440 624 560 592"/>`;
  inner += `<path d="M 110 620 C 100 500, 120 400, 180 350"/>`;
  inner += `<path d="M 180 350 C 130 310, 90 330, 70 370 M 180 350 C 230 300, 290 300, 320 340 M 180 350 C 170 290, 210 260, 260 260 M 180 350 C 220 360, 260 390, 270 430"/>`;
  inner += `<path d="M 120 390 C 150 380, 175 390, 188 410 M 150 330 C 180 320, 205 330, 220 350"/>`;
  inner += `<path d="M 360 560 L 360 420 L 470 470 L 360 500"/>`;
  inner += `<path d="M 360 500 L 470 470 M 360 560 L 390 580 M 330 560 L 360 560"/>`;
  inner += `<path d="M 350 420 Q 410 380 470 470"/>`;
  inner += `<circle cx="300" cy="620" r="54"/>`;
  inner += `<path d="M 246 620 Q 300 570 354 620 M 300 566 V 674"/>`;
  inner += `<path d="M 390 600 L 410 560 L 430 600 L 450 560 L 470 600 L 450 640 L 410 640 Z"/>`;
  inner += `<path d="M 400 610 H 460 M 420 600 V 630"/>`;
  inner += sunSvg(c, 490, 160, 38, 12);
  inner += cloudSvg(c, 110, 170, 30);
  inner += `<path d="M 90 690 q 20 -14 40 0 q 20 14 40 0 M 420 690 q 20 -14 40 0 q 20 14 40 0"/>`;
  return pen(c, inner);
}

function hotair(c) {
  let inner = `<path d="M 300 170 C 200 170, 140 260, 160 370 C 176 456, 240 500, 270 540 L 330 540 C 360 500, 424 456, 440 370 C 460 260, 400 170, 300 170 Z"/>`;
  inner += `<path d="M 300 170 V 540"/>`;
  inner += `<path d="M 255 190 C 235 280, 240 420, 268 520 M 345 190 C 365 280, 360 420, 332 520"/>`;
  inner += `<path d="M 200 300 Q 300 250 400 300 M 180 370 Q 300 320 420 370 M 190 440 Q 300 390 410 440"/>`;
  inner += `<path d="M 270 540 L 258 600 L 342 600 L 330 540"/>`;
  inner += `<path d="M 250 600 L 246 660 L 354 660 L 350 600 Z"/>`;
  inner += `<path d="M 260 620 H 340 M 248 640 H 352"/>`;
  inner += `<path d="M 270 600 L 254 570 M 330 600 L 346 570"/>`;
  inner += cloudSvg(c, 110, 250, 36);
  inner += cloudSvg(c, 490, 300, 30);
  inner += cloudSvg(c, 120, 660, 30);
  inner += cloudSvg(c, 500, 670, 34);
  inner += `<path d="M 390 180 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += `<circle cx="480" cy="160" r="30"/>`;
  inner += `<path d="M 50 700 Q 160 676 280 696 Q 400 716 550 690"/>`;
  return pen(c, inner);
}

function camper(c) {
  let inner = `<path d="M 110 460 L 110 340 L 210 340 L 240 260 L 380 260 L 400 340 L 480 340 L 480 460 Z"/>`;
  inner += `<path d="M 240 260 L 380 260 L 400 340 L 210 340 Z"/>`;
  inner += `<path d="M 240 300 H 374 M 238 320 H 390"/>`;
  inner += `<rect x="130" y="370" width="90" height="62" rx="6"/>`;
  inner += `<path d="M 150 370 V 432 M 175 370 V 432 M 200 370 V 432"/>`;
  inner += `<rect x="400" y="370" width="64" height="62" rx="6"/>`;
  inner += `<path d="M 432 370 V 432"/>`;
  inner += `<path d="M 280 370 L 320 370 L 340 420 L 280 420 Z"/>`;
  inner += `<path d="M 260 260 L 300 260 L 300 300 L 260 300 Z"/>`;
  inner += `<circle cx="180" cy="480" r="42"/><circle cx="180" cy="480" r="20"/>`;
  inner += `<circle cx="420" cy="480" r="42"/><circle cx="420" cy="480" r="20"/>`;
  inner += `<path d="M 60 520 H 540"/>`;
  inner += `<path d="M 60 540 H 540"/>`;
  inner += `<path d="M 80 540 L 100 580 M 180 540 L 200 580 M 280 540 L 300 580 M 380 540 L 400 580 M 480 540 L 500 580"/>`;
  inner += `<path d="M 40 580 Q 160 556 300 580 Q 440 604 560 572"/>`;
  inner += pine(c, 90, 500, 70) + pine(c, 500, 500, 60);
  inner += `<path d="M 70 430 L 170 430 L 150 360 L 90 360 Z M 90 360 L 120 310 L 150 360"/>`;
  inner += `<circle cx="490" cy="140" r="34"/>`;
  inner += cloudSvg(c, 120, 160, 34);
  return pen(c, inner);
}

function sailboat(c) {
  let inner = `<path d="M 160 470 L 440 470 L 390 560 L 210 560 Z"/>`;
  inner += `<path d="M 300 470 L 300 190"/>`;
  inner += `<path d="M 300 200 L 440 430 L 300 430 Z"/>`;
  inner += `<path d="M 288 230 L 170 430 L 288 430 Z"/>`;
  inner += `<path d="M 300 200 L 300 430 M 288 230 L 288 430"/>`;
  inner += `<path d="M 300 190 L 340 170 L 300 150 Z"/>`;
  inner += `<path d="M 210 560 L 240 610 L 360 610 L 390 560"/>`;
  inner += waveLine(630, 18);
  inner += waveLine(680, 14);
  inner += `<path d="M 400 630 q 18 -18 36 0 q 18 -18 36 0 M 100 650 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += sunSvg(c, 490, 160, 36, 12);
  inner += cloudSvg(c, 120, 180, 32);
  inner += `<path d="M 120 280 q 18 -18 36 0 q 18 -18 36 0 M 380 120 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += fishSvg(c, 470, 640, 34, true);
  return pen(c, inner);
}

function landmark(c) {
  let inner = `<path d="M 300 210 C 250 230, 240 300, 260 340 L 340 340 C 360 300, 350 230, 300 210 Z"/>`;
  inner += `<path d="M 300 210 V 170"/><circle cx="300" cy="162" r="8"/>`;
  inner += `<path d="M 300 300 C 270 306, 262 330, 270 340 M 300 300 C 330 306, 338 330, 330 340"/>`;
  inner += `<path d="M 180 340 L 180 600 L 420 600 L 420 340"/>`;
  inner += `<path d="M 180 340 Q 300 380 420 340"/>`;
  inner += `<path d="M 180 380 Q 300 410 420 380"/>`;
  inner += `<path d="M 240 600 L 240 430 C 240 370, 360 370, 360 430 L 360 600"/>`;
  inner += `<path d="M 262 600 L 262 440 C 262 400, 338 400, 338 440 L 338 600"/>`;
  inner += `<path d="M 180 430 H 240 M 360 430 H 420"/>`;
  inner += `<path d="M 130 600 L 130 380 L 170 380 L 170 600 M 430 600 L 430 380 L 470 380 L 470 600"/>`;
  inner += `<path d="M 130 380 L 150 340 L 170 380 M 430 380 L 450 340 L 470 380"/>`;
  inner += `<path d="M 142 410 V 580 M 158 410 V 580 M 442 410 V 580 M 458 410 V 580"/>`;
  inner += `<path d="M 100 600 H 500 M 80 620 H 520 M 60 640 H 540"/>`;
  inner += `<path d="M 80 640 Q 180 620 300 640 Q 420 660 520 640"/>`;
  inner += `<path d="M 120 690 Q 200 660 300 686 Q 400 712 490 684"/>`;
  inner += `<path d="M 150 700 H 450"/>`;
  inner += sunSvg(c, 480, 160, 34, 12);
  inner += cloudSvg(c, 110, 180, 34);
  inner += `<path d="M 90 300 q 30 -20 60 0 q 30 20 60 0"/>`;
  return pen(c, inner);
}

function compass(c) {
  let inner = `<circle cx="300" cy="400" r="186"/><circle cx="300" cy="400" r="164"/><circle cx="300" cy="400" r="48"/>`;
  inner += `<path d="M 300 214 L 340 360 L 300 400 L 260 360 Z"/>`;
  inner += `<path d="M 300 586 L 260 440 L 300 400 L 340 440 Z"/>`;
  inner += `<path d="M 114 400 L 260 360 L 300 400 L 260 440 Z"/>`;
  inner += `<path d="M 486 400 L 340 440 L 300 400 L 340 360 Z"/>`;
  for (let i = 0; i < 24; i++) {
    const a = (Math.PI * 2 * i) / 24;
    const r1 = i % 6 === 0 ? 146 : 156;
    inner += `<path d="M ${round(300 + Math.cos(a) * r1)} ${round(400 + Math.sin(a) * r1)} L ${round(300 + Math.cos(a) * 164)} ${round(400 + Math.sin(a) * 164)}"/>`;
  }
  inner += `<text x="300" y="196" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="${c.C}" stroke="none">N</text>`;
  inner += `<text x="300" y="632" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="${c.C}" stroke="none">S</text>`;
  inner += `<text x="94" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="${c.C}" stroke="none">W</text>`;
  inner += `<text x="506" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="${c.C}" stroke="none">E</text>`;
  inner += `<path d="M 60 120 Q 180 80 300 110 Q 420 140 540 100"/>`;
  inner += `<path d="M 80 690 Q 200 660 300 686 Q 400 712 520 684"/>`;
  inner += `<circle cx="300" cy="400" r="18"/><circle cx="300" cy="400" r="6"/>`;
  inner += starSvg(c, 110, 160, 14, 5) + starSvg(c, 490, 660, 12, 5);
  return pen(c, inner);
}

function city(c) {
  let inner = `<path d="M 50 620 L 50 420 L 120 420 L 120 620 Z"/>`;
  inner += `<path d="M 120 620 L 120 300 L 210 300 L 210 620 Z"/>`;
  inner += `<path d="M 210 620 L 210 470 L 270 470 L 270 620 Z"/>`;
  inner += `<path d="M 270 620 L 270 240 L 380 240 L 380 620 Z"/>`;
  inner += `<path d="M 380 620 L 380 390 L 460 390 L 460 620 Z"/>`;
  inner += `<path d="M 460 620 L 460 330 L 540 330 L 540 620 Z"/>`;
  inner += `<path d="M 270 240 L 300 200 L 330 220 L 360 190 L 380 240"/>`;
  inner += `<path d="M 30 620 H 570"/>`;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      if (row < 4) inner += `<rect x="${144 + col * 20}" y="${330 + row * 50}" width="12" height="20" rx="2"/>`;
      if (row < 2) inner += `<rect x="${298 + col * 20}" y="${280 + row * 52}" width="12" height="22" rx="2"/>`;
    }
  }
  inner += `<path d="M 60 460 H 110 M 130 350 H 200 M 470 430 H 530 M 470 490 H 530 M 470 550 H 530"/>`;
  inner += `<path d="M 390 450 H 450 M 390 510 H 450"/>`;
  inner += `<path d="M 60 660 Q 180 636 300 656 Q 420 676 540 652"/>`;
  inner += `<circle cx="480" cy="140" r="32"/>`;
  inner += cloudSvg(c, 120, 160, 34);
  inner += `<path d="M 90 250 q 18 -18 36 0 q 18 -18 36 0 M 380 130 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += `<path d="M 90 690 q 20 -14 40 0 q 20 14 40 0 M 420 690 q 20 -14 40 0 q 20 14 40 0"/>`;
  return pen(c, inner);
}

/* ------------------------------------------------------------------- festive */

function diya(c) {
  let inner = `<path d="M 170 600 C 170 560, 430 560, 430 600 C 430 650, 370 676, 300 676 C 230 676, 170 650, 170 600 Z"/>`;
  inner += `<path d="M 190 596 C 230 620, 370 620, 410 596"/>`;
  inner += `<path d="M 300 600 C 280 560, 286 524, 300 500 C 314 524, 320 560, 300 600 Z"/>`;
  inner += `<path d="M 300 576 C 290 552, 294 532, 300 522 C 306 532, 310 552, 300 576 Z"/>`;
  inner += `<path d="M 116 650 C 116 620, 220 620, 220 650 C 220 678, 176 690, 116 650 Z"/>`;
  inner += `<path d="M 206 648 C 196 622, 200 600, 208 586 C 216 600, 220 622, 206 648 Z"/>`;
  inner += `<path d="M 380 660 C 380 632, 484 632, 484 660 C 484 688, 440 700, 380 660 Z"/>`;
  inner += `<path d="M 470 658 C 460 632, 464 610, 472 596 C 480 610, 484 632, 470 658 Z"/>`;
  inner += `<path d="M 90 300 Q 180 260 270 300 Q 360 340 450 300 Q 510 278 550 300"/>`;
  inner += `<path d="M 90 340 Q 180 300 270 340 Q 360 380 450 340 Q 510 318 550 340"/>`;
  inner += `<path d="M 90 380 Q 180 340 270 380 Q 360 420 450 380 Q 510 358 550 380"/>`;
  inner += `<path d="M 60 710 H 540"/>`;
  inner += `<path d="M 80 700 q 20 -14 40 0 q 20 14 40 0 M 420 700 q 20 -14 40 0 q 20 14 40 0"/>`;
  inner += starSvg(c, 120, 180, 18, 5) + starSvg(c, 480, 180, 16, 5) + starSvg(c, 300, 120, 12, 5);
  inner += dot(c, 150, 470, 3) + dot(c, 450, 470, 3) + dot(c, 300, 440, 3);
  return pen(c, inner);
}

function rangoli(c) {
  const cx = 300;
  const cy = 400;
  let inner = `<circle cx="${cx}" cy="${cy}" r="208"/><circle cx="${cx}" cy="${cy}" r="190"/>`;
  for (let i = 0; i < 16; i++) {
    const a = (360 / 16) * i;
    inner += `<g transform="rotate(${a} ${cx} ${cy})">` +
      `<path d="M ${cx} ${cy - 48} C ${cx - 36} ${cy - 78}, ${cx - 30} ${cy - 148}, ${cx} ${cy - 170} C ${cx + 30} ${cy - 148}, ${cx + 36} ${cy - 78}, ${cx} ${cy - 48} Z"/>` +
      `<path d="M ${cx} ${cy - 116} C ${cx - 16} ${cy - 130}, ${cx - 14} ${cy - 152}, ${cx} ${cy - 162} C ${cx + 14} ${cy - 152}, ${cx + 16} ${cy - 130}, ${cx} ${cy - 116} Z"/>` +
      `<circle cx="${cx}" cy="${cy - 186}" r="7"/>` +
      `</g>`;
  }
  inner += `<circle cx="${cx}" cy="${cy}" r="112"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (360 / 12) * i;
    inner += `<g transform="rotate(${a} ${cx} ${cy})"><path d="M ${cx} ${cy - 36} L ${cx - 18} ${cy - 68} L ${cx} ${cy - 100} L ${cx + 18} ${cy - 68} Z"/></g>`;
  }
  inner += `<circle cx="${cx}" cy="${cy}" r="42"/>`;
  inner += `<path d="${starPath(cx, cy, 34, 8, 0.55)}"/>`;
  inner += `<circle cx="${cx}" cy="${cy}" r="10"/>`;
  for (let i = 0; i < 24; i++) {
    const a = (Math.PI * 2 * i) / 24;
    inner += dot(c, cx + Math.cos(a) * 199, cy + Math.sin(a) * 199, i % 2 ? 2.4 : 4);
  }
  inner += `<path d="M 50 700 H 550"/>`;
  inner += `<path d="M 70 690 q 20 -14 40 0 q 20 14 40 0 M 430 690 q 20 -14 40 0 q 20 14 40 0"/>`;
  return pen(c, inner);
}

function christmas(c) {
  let inner = `<path d="M 300 180 L 390 320 L 350 320 L 430 460 L 380 460 L 470 620 L 130 620 L 220 460 L 170 460 L 250 320 L 210 320 Z"/>`;
  inner += `<path d="M 300 180 V 150"/>`;
  inner += starSvg(c, 300, 132, 28, 5);
  inner += `<path d="M 200 620 L 200 690 M 400 620 L 400 690 M 180 690 H 420"/>`;
  inner += `<circle cx="240" cy="400" r="18"/><circle cx="350" cy="430" r="16"/><circle cx="290" cy="500" r="20"/><circle cx="220" cy="555" r="16"/><circle cx="380" cy="570" r="18"/><circle cx="300" cy="600" r="14"/>`;
  inner += `<path d="M 240 382 V 418 M 222 400 H 258 M 350 414 V 446 M 334 430 H 366 M 290 480 V 520 M 270 500 H 310"/>`;
  inner += `<path d="M 120 600 L 210 600 L 210 690 L 120 690 Z"/><path d="M 165 600 V 690 M 120 640 H 210"/>`;
  inner += `<path d="M 390 620 L 470 620 L 470 700 L 390 700 Z"/><path d="M 430 620 V 700 M 390 660 H 470"/>`;
  inner += `<path d="M 165 600 L 135 570 L 195 570 Z M 430 620 L 400 590 L 460 590 Z"/>`;
  inner += `<path d="M 80 200 q 18 -18 36 0 q 18 -18 36 0 M 430 220 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += `<circle cx="110" cy="320" r="18"/><circle cx="490" cy="340" r="16"/>`;
  inner += `<path d="M 60 700 H 540"/>`;
  return pen(c, inner);
}

function ornament(c) {
  let inner = `<path d="M 150 100 Q 300 40 450 100"/>`;
  inner += `<path d="M 150 100 L 150 170 M 300 70 L 300 140 M 450 100 L 450 170"/>`;
  const ball = (x, y, r) => {
    let out = `<circle cx="${x}" cy="${y}" r="${r}"/>`;
    out += `<rect x="${x - 16}" y="${y - r - 22}" width="32" height="22" rx="4"/>`;
    out += `<path d="M ${x} ${y - r - 22} L ${x} ${y - r - 40}"/>`;
    out += `<path d="M ${x - r * 0.62} ${y - r * 0.4} Q ${x} ${y - r * 0.75} ${x + r * 0.62} ${y - r * 0.4}"/>`;
    out += `<path d="M ${x - r * 0.8} ${y + r * 0.1} Q ${x} ${y + r * 0.4} ${x + r * 0.8} ${y + r * 0.1}"/>`;
    out += `<path d="M ${x - r * 0.4} ${y + r * 0.55} Q ${x} ${y + r * 0.8} ${x + r * 0.4} ${y + r * 0.55}"/>`;
    out += dot(c, x - r * 0.3, y - r * 0.1, r * 0.07);
    out += dot(c, x + r * 0.3, y - r * 0.1, r * 0.07);
    return out;
  };
  inner += ball(150, 320, 82) + ball(300, 260, 96) + ball(450, 330, 72);
  inner += `<path d="M 300 356 V 560 M 150 402 V 610 M 450 402 V 590"/>`;
  inner += `<path d="M 300 560 L 270 600 L 330 600 Z M 150 610 L 130 650 L 170 650 Z M 450 590 L 430 630 L 470 630 Z"/>`;
  inner += `<path d="M 70 660 Q 180 630 300 656 Q 420 682 530 650"/>`;
  inner += `<path d="M 80 700 q 20 -14 40 0 q 20 14 40 0 M 420 700 q 20 -14 40 0 q 20 14 40 0"/>`;
  inner += starSvg(c, 80, 180, 18, 5) + starSvg(c, 520, 200, 16, 5);
  return pen(c, inner);
}

function gift(c) {
  let inner = `<rect x="130" y="420" width="340" height="250" rx="10"/>`;
  inner += `<path d="M 130 500 H 470 M 300 420 V 670"/>`;
  inner += `<path d="M 300 420 C 220 420, 180 390, 190 350 C 200 310, 260 320, 300 420 Z"/>`;
  inner += `<path d="M 300 420 C 380 420, 420 390, 410 350 C 400 310, 340 320, 300 420 Z"/>`;
  inner += `<circle cx="300" cy="420" r="20"/>`;
  inner += `<path d="M 170 420 L 150 380 L 210 380 L 230 420 M 370 420 L 390 380 L 450 380 L 430 420"/>`;
  inner += `<rect x="340" y="600" width="150" height="100" rx="8"/>`;
  inner += `<path d="M 340 640 H 490 M 415 600 V 700"/>`;
  inner += `<path d="M 415 600 C 370 600, 350 580, 358 560 C 366 540, 395 548, 415 600 Z M 415 600 C 460 600, 480 580, 472 560 C 464 540, 435 548, 415 600 Z"/>`;
  inner += `<rect x="80" y="560" width="120" height="120" rx="8"/>`;
  inner += `<path d="M 80 600 H 200 M 140 560 V 680"/>`;
  inner += `<path d="M 140 560 C 100 560, 84 540, 92 522 C 100 504, 122 514, 140 560 Z M 140 560 C 180 560, 196 540, 188 522 C 180 504, 158 514, 140 560 Z"/>`;
  inner += `<path d="M 60 700 H 540"/>`;
  inner += `<path d="M 100 300 l 12 24 26 -8 -14 22 20 18 -28 2 -2 28 -16 -22 -26 10 12 -26 -24 -14 28 -4 Z M 480 250 l 10 20 22 -6 -12 18 16 16 -24 2 -2 24 -14 -18 -22 8 10 -22 -20 -12 24 -4 Z"/>`;
  inner += starSvg(c, 220, 260, 18, 5) + starSvg(c, 440, 180, 14, 5) + starSvg(c, 90, 180, 12, 5);
  return pen(c, inner);
}

function lantern(c) {
  let inner = `<path d="M 100 120 Q 300 60 500 120"/>`;
  inner += `<path d="M 180 120 V 190 M 300 90 V 160 M 420 120 V 190"/>`;
  const lamp = (x, y, w, h) => {
    let out = `<path d="M ${x - w / 2} ${y} Q ${x - w / 2} ${y + h * 0.2} ${x - w * 0.4} ${y + h} L ${x + w * 0.4} ${y + h} Q ${x + w / 2} ${y + h * 0.2} ${x + w / 2} ${y} Z"/>`;
    out += `<path d="M ${x - w / 2} ${y} H ${x + w / 2} M ${x - w * 0.4} ${y + h} H ${x + w * 0.4}"/>`;
    out += `<path d="M ${x - w * 0.24} ${y + 10} V ${y + h - 10} M ${x} ${y + 6} V ${y + h - 6} M ${x + w * 0.24} ${y + 10} V ${y + h - 10}"/>`;
    out += `<path d="M ${x - w * 0.3} ${y + h * 0.4} H ${x + w * 0.3} M ${x - w * 0.26} ${y + h * 0.7} H ${x + w * 0.26}"/>`;
    out += `<path d="M ${x} ${y + h} V ${y + h + 34}"/>`;
    out += `<path d="M ${x - 10} ${y + h + 34} L ${x + 10} ${y + h + 34} L ${x} ${y + h + 50} Z"/>`;
    return out;
  };
  inner += lamp(180, 190, 100, 150) + lamp(300, 160, 116, 178) + lamp(420, 190, 96, 144);
  inner += `<path d="M 70 700 H 530"/>`;
  inner += `<path d="M 90 690 q 20 -14 40 0 q 20 14 40 0 M 430 690 q 20 -14 40 0 q 20 14 40 0"/>`;
  inner += `<path d="M 460 160 A 40 40 0 1 0 460 240 A 32 32 0 1 1 460 160"/>`;
  inner += starSvg(c, 100, 180, 14, 5) + starSvg(c, 500, 200, 12, 5) + starSvg(c, 90, 420, 12, 5) + starSvg(c, 510, 430, 14, 5);
  return pen(c, inner);
}

function fireworks(c) {
  const burst = (x, y, r) => {
    let out = `<circle cx="${x}" cy="${y}" r="10"/>`;
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI * 2 * i) / 16;
      out += `<path d="M ${round(x + Math.cos(a) * 18)} ${round(y + Math.sin(a) * 18)} L ${round(x + Math.cos(a) * r)} ${round(y + Math.sin(a) * r)}"/>`;
      out += dot(c, x + Math.cos(a) * (r + 12), y + Math.sin(a) * (r + 12), 3);
    }
    return out;
  };
  let inner = burst(180, 260, 80) + burst(420, 220, 68) + burst(300, 420, 100) + burst(130, 480, 54) + burst(470, 470, 58);
  inner += `<path d="M 50 620 H 550"/>`;
  inner += `<path d="M 70 620 L 70 560 L 110 560 L 110 620 M 130 620 L 130 520 L 170 520 L 170 620 M 190 620 L 190 580 L 230 580 L 230 620 M 370 620 L 370 540 L 410 540 L 410 620 M 430 620 L 430 570 L 470 570 L 470 620 M 490 620 L 490 500 L 530 500 L 530 620"/>`;
  inner += `<path d="M 70 575 H 110 M 130 545 H 170 M 190 600 H 230 M 370 570 H 410 M 430 600 H 470 M 490 540 H 530"/>`;
  inner += `<path d="M 60 700 H 540"/>`;
  inner += starSvg(c, 80, 150, 14, 5) + starSvg(c, 520, 160, 12, 5) + starSvg(c, 300, 130, 10, 5);
  return pen(c, inner);
}

function pumpkin(c) {
  let inner = `<path d="M 300 300 C 220 300, 150 380, 150 500 C 150 620, 220 680, 300 680 C 380 680, 450 620, 450 500 C 450 380, 380 300, 300 300 Z"/>`;
  inner += `<path d="M 300 300 V 680 M 220 330 C 190 400, 190 590, 230 660 M 380 330 C 410 400, 410 590, 370 660"/>`;
  inner += `<path d="M 300 300 C 290 270, 296 240, 310 220 C 330 230, 340 260, 330 292"/>`;
  inner += `<path d="M 310 220 C 340 200, 370 208, 386 230 C 360 244, 334 244, 310 236"/>`;
  inner += `<path d="M 240 450 L 274 470 L 240 490 Z"/>`;
  inner += `<path d="M 360 450 L 326 470 L 360 490 Z"/>`;
  inner += `<path d="M 300 470 L 282 510 L 318 510 Z"/>`;
  inner += `<path d="M 230 540 Q 260 520 290 540 Q 300 550 310 540 Q 340 520 370 540 Q 380 580 360 600 Q 330 620 300 600 Q 270 620 240 600 Q 220 580 230 540 Z"/>`;
  inner += `<path d="M 240 560 V 590 M 270 550 V 600 M 300 550 V 600 M 330 550 V 600 M 360 560 V 590"/>`;
  inner += `<path d="M 70 700 H 530"/>`;
  inner += `<path d="M 80 180 q 20 -16 40 0 q 20 16 40 0 M 420 180 q 20 -16 40 0 q 20 16 40 0"/>`;
  inner += `<path d="M 120 260 l 20 -10 l 20 10 l -10 20 l -20 4 Z M 440 280 l 18 -12 l 18 12 l -8 20 l -20 2 Z"/>`;
  inner += `<circle cx="470" cy="140" r="34"/><circle cx="492" cy="128" r="26"/>`;
  inner += grassTuft(c, 120, 700, 28) + grassTuft(c, 480, 700, 28);
  return pen(c, inner);
}

function easter(c) {
  const egg = (x, y, w, h, mode) => {
    let out = `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}"/>`;
    if (mode === 0) {
      out += `<path d="M ${x - w * 0.7} ${y - h * 0.2} Q ${x} ${y - h * 0.5} ${x + w * 0.7} ${y - h * 0.2} M ${x - w * 0.8} ${y + h * 0.25} Q ${x} ${y - h * 0.05} ${x + w * 0.8} ${y + h * 0.25}"/>`;
    } else if (mode === 1) {
      out += `<path d="M ${x - w * 0.7} ${y} L ${x} ${y - h * 0.45} L ${x + w * 0.7} ${y} L ${x} ${y + h * 0.45} Z"/>`;
    } else {
      for (let i = 0; i < 4; i++) out += dot(c, x - w * 0.5 + i * w * 0.34, y - h * 0.2 + (i % 2) * h * 0.35, 5);
    }
    return out;
  };
  let inner = egg(150, 380, 64, 88, 0) + egg(300, 330, 72, 98, 1) + egg(450, 390, 60, 82, 2);
  inner += egg(220, 560, 58, 76, 2) + egg(380, 570, 64, 84, 0);
  inner += `<path d="M 70 660 Q 180 630 300 656 Q 420 682 530 650"/>`;
  inner += `<path d="M 120 330 q 18 -18 36 0 q 18 -18 36 0 M 420 300 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += `<circle cx="480" cy="170" r="30"/>`;
  inner += flowerSvg(c, 110, 620, 34, 6);
  inner += flowerSvg(c, 490, 630, 30, 5);
  inner += `<path d="M 90 700 q 20 -14 40 0 q 20 14 40 0 M 420 700 q 20 -14 40 0 q 20 14 40 0"/>`;
  return pen(c, inner);
}

function party(c) {
  let inner = `<path d="M 240 660 L 300 280 L 360 660 Z"/>`;
  inner += `<path d="M 262 560 L 338 520 M 250 610 L 350 580 M 276 450 L 324 430"/>`;
  inner += `<path d="M 300 280 L 270 240 L 310 250 L 300 210 L 330 240 L 340 220 L 350 260"/>`;
  inner += `<circle cx="300" cy="190" r="14"/>`;
  inner += `<path d="M 240 660 Q 300 630 360 660"/>`;
  inner += `<path d="M 140 400 C 110 330, 120 260, 160 240 C 200 220, 230 280, 210 350 C 195 400, 170 420, 140 400 Z"/>`;
  inner += `<path d="M 140 400 L 160 520"/>`;
  inner += `<path d="M 430 380 C 400 310, 410 240, 450 220 C 490 200, 520 260, 500 330 C 485 380, 460 400, 430 380 Z"/>`;
  inner += `<path d="M 430 380 L 440 500"/>`;
  inner += `<path d="M 300 100 Q 180 80 80 130 M 300 100 Q 420 80 520 130"/>`;
  inner += `<path d="M 80 130 L 60 110 L 90 100 L 100 130 Z M 520 130 L 540 110 L 510 100 L 500 130 Z"/>`;
  inner += `<circle cx="120" cy="560" r="14"/><circle cx="470" cy="540" r="12"/><circle cx="200" cy="620" r="10"/><circle cx="400" cy="620" r="14"/>`;
  inner += `<path d="M 90 660 l 16 -12 l 16 12 l -6 18 l -20 0 Z M 460 660 l 16 -12 l 16 12 l -6 18 l -20 0 Z"/>`;
  inner += `<path d="M 60 700 H 540"/>`;
  inner += starSvg(c, 110, 180, 14, 5) + starSvg(c, 490, 180, 14, 5);
  return pen(c, inner);
}

module.exports = {
  plane,
  globe,
  lighthouse,
  beach,
  hotair,
  camper,
  sailboat,
  landmark,
  compass,
  city,
  diya,
  rangoli,
  christmas,
  ornament,
  gift,
  lantern,
  fireworks,
  pumpkin,
  easter,
  party,
};
