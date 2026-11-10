'use strict';

// ---------------------------------------------------------------------------
// Design library B: animals and India pride pages.
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
  sparkle,
  ladybug,
  grassTuft,
} = require('./art-primitives');

function waveLine(y, amp = 16, start = 50, end = 550) {
  let d = `M ${start} ${y}`;
  for (let x = start; x < end; x += 20) {
    d += ` Q ${x + 10} ${round(y - amp)} ${x + 20} ${y}`;
  }
  return d;
}

function bubbles(c, spots) {
  return spots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
}

/* -------------------------------------------------------------------- animals */

function cat(c) {
  let inner = '';
  inner += `<path d="M 372 630 C 470 640, 500 560, 468 500 C 490 556, 448 584, 404 578"/>`;
  inner += `<path d="M 228 680 C 190 604, 202 486, 300 466 C 398 486, 410 604, 372 680 Z"/>`;
  inner += `<path d="M 230 556 q 24 14 48 0 M 370 556 q -24 14 -48 0 M 246 612 q 26 14 52 0 M 354 612 q -26 14 -52 0"/>`;
  inner += `<circle cx="300" cy="382" r="102"/>`;
  inner += `<path d="M 222 320 L 198 206 L 284 272 Z M 378 320 L 402 206 L 316 272 Z"/>`;
  inner += `<path d="M 228 300 L 216 240 L 260 274 Z M 372 300 L 384 240 L 340 274 Z"/>`;
  inner += `<circle cx="264" cy="372" r="11" fill="${c.C}" stroke="none"/><circle cx="336" cy="372" r="11" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 300 404 L 286 422 L 314 422 Z"/>`;
  inner += `<path d="M 300 422 Q 282 444 266 428 M 300 422 Q 318 444 334 428"/>`;
  inner += `<path d="M 268 424 L 206 410 M 268 438 L 204 442 M 332 424 L 394 410 M 332 438 L 396 442"/>`;
  inner += `<path d="M 250 680 q 10 -18 20 0 M 330 680 q 10 -18 20 0"/>`;
  inner += `<circle cx="472" cy="650" r="52"/>`;
  inner += `<path d="M 430 626 C 460 604, 500 630, 494 654 M 424 654 C 456 682, 498 660, 500 636 M 448 690 C 470 664, 500 678, 506 650"/>`;
  inner += `<path d="M 60 706 H 540"/>`;
  inner += `<path d="M 90 170 q 18 -18 36 0 q 18 -18 36 0"/>`;
  return pen(c, inner);
}

function dog(c) {
  let inner = '';
  inner += `<path d="M 220 680 C 186 610, 198 500, 300 482 C 402 500, 414 610, 380 680 Z"/>`;
  inner += `<circle cx="300" cy="390" r="98"/>`;
  inner += `<path d="M 210 330 C 160 336, 150 430, 196 466 C 220 482, 232 440, 226 404 Z"/>`;
  inner += `<path d="M 390 330 C 440 336, 450 430, 404 466 C 380 482, 368 440, 374 404 Z"/>`;
  inner += `<circle cx="266" cy="378" r="10" fill="${c.C}" stroke="none"/><circle cx="334" cy="378" r="10" fill="${c.C}" stroke="none"/>`;
  inner += `<ellipse cx="300" cy="416" rx="20" ry="14"/>`;
  inner += `<path d="M 300 430 L 300 442 Q 300 454 286 450 M 300 442 Q 300 454 314 450"/>`;
  inner += `<path d="M 300 460 Q 286 480 272 466 M 300 460 Q 314 480 328 466"/>`;
  inner += `<path d="M 244 470 Q 300 500 356 470"/>`;
  inner += `<path d="M 258 478 L 252 502 M 342 478 L 348 502"/>`;
  inner += `<path d="M 258 508 Q 300 536 342 508"/>`;
  inner += `<circle cx="300" cy="522" r="12"/>`;
  inner += `<path d="M 220 582 q 80 30 160 0"/>`;
  inner += `<path d="M 246 650 q 10 -20 20 0 M 334 650 q 10 -20 20 0"/>`;
  inner += `<path d="M 82 630 C 110 600, 150 604, 166 634 C 150 660, 104 660, 82 630 Z"/>`;
  inner += `<circle cx="96" cy="618" r="12"/><circle cx="152" cy="618" r="12"/>`;
  inner += `<path d="M 60 706 H 540"/>`;
  inner += grassTuft(c, 470, 700, 34);
  return pen(c, inner);
}

function elephant(c) {
  let inner = '';
  inner += `<path d="M 132 470 C 116 350, 220 300, 322 318 C 424 336, 480 418, 456 520 C 438 596, 386 630, 300 630 C 208 630, 148 574, 132 470 Z"/>`;
  inner += `<circle cx="252" cy="366" r="88"/>`;
  inner += `<path d="M 196 326 C 144 288, 88 320, 96 400 C 104 474, 168 490, 204 446"/>`;
  inner += `<path d="M 300 330 C 352 292, 412 326, 404 404 C 396 476, 334 492, 296 448"/>`;
  inner += `<path d="M 220 432 C 200 480, 214 548, 262 560 C 288 566, 300 548, 294 530 C 286 508, 256 514, 256 480"/>`;
  inner += `<path d="M 258 552 C 282 566, 302 584, 306 608"/>`;
  inner += `<path d="M 210 448 C 194 470, 192 506, 210 522"/>`;
  inner += `<path d="M 236 426 C 250 442, 270 446, 286 436"/>`;
  inner += `<circle cx="214" cy="372" r="8" fill="${c.C}" stroke="none"/><circle cx="286" cy="372" r="8" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 214 410 q 12 12 24 0 M 272 410 q 12 12 24 0"/>`;
  inner += `<path d="M 300 466 C 344 452, 398 468, 430 506 C 442 522, 440 560, 420 578 C 392 602, 340 590, 300 560"/>`;
  inner += `<path d="M 318 490 q 20 18 0 36 q -20 -18 0 -36 M 360 500 q 20 18 0 36 q -20 -18 0 -36 M 396 520 q 16 16 0 32 q -16 -16 0 -32"/>`;
  inner += `<path d="M 180 612 L 172 700 M 252 622 L 248 704 M 356 622 L 360 704 M 428 596 L 440 700"/>`;
  inner += `<path d="M 120 706 H 500"/>`;
  inner += `<circle cx="478" cy="168" r="34"/>`;
  inner += cloudSvg(c, 116, 180, 34);
  return pen(c, inner);
}

function lion(c) {
  let inner = '';
  for (let i = 0; i < 18; i++) {
    const a = (360 / 18) * i;
    inner += `<g transform="rotate(${a} 300 370)"><path d="M 300 254 C 274 214, 326 214, 300 254 Z"/></g>`;
  }
  inner += `<circle cx="300" cy="370" r="116"/><circle cx="300" cy="370" r="96"/>`;
  inner += `<circle cx="258" cy="350" r="12" fill="${c.C}" stroke="none"/><circle cx="342" cy="350" r="12" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 300 378 L 284 398 L 316 398 Z"/>`;
  inner += `<path d="M 300 398 Q 280 424 262 404 M 300 398 Q 320 424 338 404"/>`;
  inner += `<path d="M 300 424 L 300 442 M 300 442 Q 282 462 264 446 M 300 442 Q 318 462 336 446"/>`;
  inner += `<path d="M 210 350 q 20 -14 40 0 M 350 350 q 20 -14 40 0"/>`;
  inner += `<path d="M 240 560 C 200 596, 190 660, 212 700 L 388 700 C 410 660, 400 596, 360 560"/>`;
  inner += `<path d="M 262 584 L 240 700 M 338 584 L 360 700"/>`;
  inner += `<path d="M 228 646 q 30 -12 44 18 M 372 646 q -30 -12 -44 18"/>`;
  inner += `<path d="M 60 710 H 540"/>`;
  inner += `<path d="M 80 160 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += grassTuft(c, 480, 704, 30);
  return pen(c, inner);
}

function owl(c) {
  let inner = `<path d="M 222 610 C 186 520, 196 350, 300 308 C 404 350, 414 520, 378 610 C 340 654, 260 654, 222 610 Z"/>`;
  inner += `<circle cx="256" cy="392" r="42"/><circle cx="344" cy="392" r="42"/>`;
  inner += `<circle cx="256" cy="392" r="21"/><circle cx="344" cy="392" r="21"/>`;
  inner += `<circle cx="256" cy="392" r="8" fill="${c.C}" stroke="none"/><circle cx="344" cy="392" r="8" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 300 426 L 284 450 L 316 450 Z"/><path d="M 300 450 L 300 468"/>`;
  inner += `<path d="M 228 340 L 246 314 L 264 346 M 372 340 L 354 314 L 336 346"/>`;
  inner += `<path d="M 232 474 q 22 26 44 0 q 22 26 44 0 q 22 26 44 0 q 22 26 44 0"/>`;
  inner += `<path d="M 236 516 q 22 26 44 0 q 22 26 44 0 q 22 26 44 0 q 22 26 44 0"/>`;
  inner += `<path d="M 240 558 q 22 26 44 0 q 22 26 44 0 q 22 26 44 0"/>`;
  inner += `<path d="M 216 472 C 180 510, 184 570, 224 598 M 384 472 C 420 510, 416 570, 376 598"/>`;
  inner += `<path d="M 200 622 L 400 632 M 220 644 L 380 654"/>`;
  inner += `<path d="M 262 654 L 252 690 M 338 654 L 348 690"/>`;
  inner += `<circle cx="478" cy="180" r="42"/><circle cx="464" cy="168" r="28"/>`;
  inner += starSvg(c, 120, 190, 18, 5) + starSvg(c, 158, 140, 10, 5) + starSvg(c, 460, 460, 12, 5);
  return pen(c, inner);
}

function bird(c) {
  let inner = birdSvg(c, 300, 350, 160);
  inner += `<path d="M 110 560 C 200 542, 400 542, 500 560"/>`;
  inner += leafSvg(c, 420, 520, 34, 30);
  inner += leafSvg(c, 190, 526, 30, -24);
  inner += flowerSvg(c, 130, 600, 34, 6);
  inner += flowerSvg(c, 470, 610, 30, 5);
  inner += flowerSvg(c, 300, 670, 28, 5);
  inner += `<path d="M 60 700 Q 200 672 300 694 Q 400 716 540 690"/>`;
  inner += `<circle cx="120" cy="160" r="30"/>`;
  inner += `<path d="M 410 160 q 16 -18 32 0 q 16 -18 32 0"/>`;
  return pen(c, inner);
}

function fish(c) {
  let inner = fishSvg(c, 290, 350, 142);
  inner += bubbles(c, [[450, 220, 12], [484, 258, 8], [420, 280, 6], [140, 230, 8]]);
  inner += `<path d="M 90 700 C 96 630, 108 580, 124 540 C 132 600, 128 650, 122 700 Z"/>`;
  inner += `<path d="M 480 700 C 474 620, 462 570, 446 528 C 438 594, 444 650, 450 700 Z"/>`;
  inner += `<path d="M 130 700 C 140 664, 162 640, 184 628 C 176 664, 168 684, 160 700 Z"/>`;
  inner += `<path d="M 446 700 C 436 664, 414 640, 392 628 C 400 664, 408 684, 416 700 Z"/>`;
  inner += `<path d="M 190 420 q 18 -16 36 0 q 18 -16 36 0 M 380 430 q 18 -16 36 0 q 18 -16 36 0"/>`;
  inner += `<path d="M 340 700 C 348 660, 370 630, 400 618 C 390 660, 380 684, 374 700 Z"/>`;
  inner += `<path d="M 348 520 L 336 486 L 358 498 L 368 466 L 380 500 L 402 492 L 390 526 Z"/>`;
  inner += `<path d="M 430 640 C 450 620, 470 624, 480 640 C 470 660, 446 660, 430 640 Z"/>`;
  inner += `<path d="M 70 700 Q 180 676 300 696 Q 420 716 530 690"/>`;
  inner += `<circle cx="430" cy="170" r="30"/>`;
  return pen(c, inner);
}

function turtle(c) {
  let inner = `<ellipse cx="300" cy="400" rx="176" ry="136"/>`;
  inner += `<ellipse cx="300" cy="400" rx="138" ry="100"/>`;
  inner += `<path d="M 300 300 L 352 328 L 352 392 L 300 420 L 248 392 L 248 328 Z"/>`;
  inner += `<path d="M 300 420 L 300 500 M 248 392 L 206 430 L 218 478 M 352 392 L 394 430 L 382 478"/>`;
  inner += `<path d="M 176 350 L 128 320 L 112 356 L 158 386 M 424 350 L 472 320 L 488 356 L 442 386"/>`;
  inner += `<circle cx="110" cy="400" r="48"/><circle cx="92" cy="384" r="8" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 76 410 q 18 10 30 0"/>`;
  inner += `<path d="M 160 500 C 180 470, 420 470, 440 500 C 420 530, 180 530, 160 500 Z"/>`;
  inner += `<path d="M 210 280 C 240 248, 360 248, 390 280"/>`;
  inner += waveLine(620, 18);
  inner += waveLine(660, 14);
  inner += bubbles(c, [[100, 220, 10], [136, 258, 7], [470, 230, 12], [504, 270, 8]]);
  inner += `<path d="M 492 560 q 16 -16 32 0 q 16 -16 32 0"/>`;
  return pen(c, inner);
}

function octopus(c) {
  let inner = `<path d="M 190 420 C 190 318, 240 260, 300 260 C 360 260, 410 318, 410 420 C 410 470, 384 500, 354 512 L 246 512 C 216 500, 190 470, 190 420 Z"/>`;
  inner += `<circle cx="256" cy="384" r="18"/><circle cx="344" cy="384" r="18"/>`;
  inner += `<circle cx="256" cy="384" r="8" fill="${c.C}" stroke="none"/><circle cx="344" cy="384" r="8" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 272 432 Q 300 454 328 432"/>`;
  inner += `<path d="M 226 478 C 190 520, 196 580, 234 610 C 252 624, 268 606, 252 586 C 224 554, 232 518, 256 500"/>`;
  inner += `<path d="M 272 510 C 244 560, 250 620, 286 650 C 308 668, 326 646, 302 624 C 270 594, 276 556, 300 530"/>`;
  inner += `<path d="M 320 512 C 348 558, 344 616, 312 646 C 292 664, 274 642, 298 620 C 328 590, 324 552, 302 526"/>`;
  inner += `<path d="M 368 476 C 406 516, 402 578, 364 608 C 344 622, 328 600, 346 582 C 376 550, 368 516, 344 498"/>`;
  for (let i = 0; i < 4; i++) {
    inner += `<circle cx="${222 + i * 12}" cy="${540 + i * 18}" r="5"/><circle cx="${378 - i * 12}" cy="${540 + i * 18}" r="5"/>`;
  }
  inner += `<path d="M 300 260 q 16 -24 34 -30 M 300 260 q -16 -24 -34 -30"/>`;
  inner += `<circle cx="336" cy="226" r="7"/><circle cx="264" cy="226" r="7"/>`;
  inner += `<path d="M 80 700 C 88 640, 100 600, 116 570 C 122 620, 112 668, 108 700 Z"/>`;
  inner += `<path d="M 500 700 C 492 640, 480 600, 464 570 C 458 620, 468 668, 472 700 Z"/>`;
  inner += bubbles(c, [[140, 260, 9], [170, 300, 6], [450, 250, 11], [480, 296, 7]]);
  return pen(c, inner);
}

function rabbit(c) {
  let inner = `<ellipse cx="300" cy="560" rx="138" ry="132"/>`;
  inner += `<circle cx="300" cy="384" r="96"/>`;
  inner += `<path d="M 248 312 C 220 220, 218 140, 252 128 C 286 140, 284 240, 276 314 Z"/>`;
  inner += `<path d="M 352 312 C 380 220, 382 140, 348 128 C 314 140, 316 240, 324 314 Z"/>`;
  inner += `<path d="M 258 300 C 238 230, 240 168, 258 158 C 278 172, 274 248, 268 302 Z"/>`;
  inner += `<path d="M 342 300 C 362 230, 360 168, 342 158 C 322 172, 326 248, 332 302 Z"/>`;
  inner += `<circle cx="266" cy="378" r="9" fill="${c.C}" stroke="none"/><circle cx="334" cy="378" r="9" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 300 402 L 288 414 L 312 414 Z"/>`;
  inner += `<path d="M 300 414 L 300 426 Q 284 438 270 424 M 300 426 Q 316 438 330 424"/>`;
  inner += `<path d="M 300 440 Q 284 456 270 444 M 300 440 Q 316 456 330 444"/>`;
  inner += `<path d="M 250 430 L 200 420 M 250 442 L 198 448 M 350 430 L 400 420 M 350 442 L 402 448"/>`;
  inner += `<path d="M 236 640 q 14 -24 28 0 M 336 640 q 14 -24 28 0"/>`;
  inner += `<path d="M 300 660 q 20 -18 40 0 q -18 30 -40 0 Z"/>`;
  inner += `<path d="M 300 660 C 286 620, 286 588, 300 560 C 314 588, 314 620, 300 660 Z"/>`;
  inner += `<path d="M 300 590 q -20 -14 -34 0 M 300 614 q 20 -14 34 0"/>`;
  inner += flowerSvg(c, 120, 630, 38, 6);
  inner += flowerSvg(c, 480, 620, 34, 5);
  inner += `<circle cx="476" cy="180" r="30"/>`;
  return pen(c, inner);
}

function panda(c) {
  let inner = `<ellipse cx="300" cy="560" rx="142" ry="126"/>`;
  inner += `<circle cx="300" cy="376" r="104"/>`;
  inner += `<circle cx="222" cy="292" r="34"/><circle cx="378" cy="292" r="34"/>`;
  inner += `<ellipse cx="260" cy="368" rx="28" ry="34"/><ellipse cx="340" cy="368" rx="28" ry="34"/>`;
  inner += `<circle cx="260" cy="368" r="10" fill="${c.C}" stroke="none"/><circle cx="340" cy="368" r="10" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 300 402 L 286 420 L 314 420 Z"/>`;
  inner += `<path d="M 300 420 Q 282 444 266 428 M 300 420 Q 318 444 334 428"/>`;
  inner += `<path d="M 232 582 C 250 550, 350 550, 368 582 C 350 620, 250 620, 232 582 Z"/>`;
  inner += `<path d="M 250 632 q 14 -22 28 0 M 322 632 q 14 -22 28 0"/>`;
  inner += `<path d="M 430 700 C 430 580, 438 470, 470 360 M 470 360 q -20 -24 -40 -10 M 470 360 q 20 -24 40 -10"/>`;
  inner += `<path d="M 470 440 q 30 -20 42 4 M 470 500 q -34 -22 -46 4 M 470 560 q 32 -20 44 2"/>`;
  inner += `<path d="M 120 700 C 120 620, 130 560, 154 510"/>`;
  inner += `<path d="M 154 510 q -20 -20 -38 -8 M 154 510 q 20 -20 38 -8"/>`;
  inner += `<path d="M 60 710 H 540"/>`;
  return pen(c, inner);
}

function frog(c) {
  let inner = `<ellipse cx="300" cy="470" rx="150" ry="112"/>`;
  inner += `<circle cx="238" cy="340" r="48"/><circle cx="362" cy="340" r="48"/>`;
  inner += `<circle cx="238" cy="340" r="22"/><circle cx="362" cy="340" r="22"/>`;
  inner += `<circle cx="238" cy="340" r="9" fill="${c.C}" stroke="none"/><circle cx="362" cy="340" r="9" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 272 430 Q 300 470 328 430"/>`;
  inner += `<path d="M 220 400 Q 300 430 380 400"/>`;
  inner += `<path d="M 190 530 C 150 560, 140 610, 168 640 C 194 664, 224 640, 208 612 C 192 584, 210 556, 232 546"/>`;
  inner += `<path d="M 410 530 C 450 560, 460 610, 432 640 C 406 664, 376 640, 392 612 C 408 584, 390 556, 368 546"/>`;
  inner += `<path d="M 250 574 q 10 -18 20 0 M 330 574 q 10 -18 20 0"/>`;
  inner += `<ellipse cx="300" cy="648" rx="180" ry="44"/>`;
  inner += `<path d="M 300 604 L 374 648 L 300 692 L 226 648 Z"/>`;
  inner += `<path d="M 150 648 Q 220 660 300 648 Q 380 660 450 648"/>`;
  inner += `<path d="M 430 380 q 16 -16 32 0 M 430 356 q 16 -16 32 0 M 430 332 q 16 -16 32 0"/>`;
  inner += `<path d="M 470 350 L 510 330 M 470 350 L 512 350 M 470 350 L 510 370"/>`;
  inner += `<path d="M 60 706 H 540"/>`;
  return pen(c, inner);
}

function deer(c) {
  let inner = `<circle cx="300" cy="410" r="104"/>`;
  inner += `<path d="M 220 360 C 196 300, 190 250, 210 230 C 234 240, 240 300, 246 348 Z"/>`;
  inner += `<path d="M 380 360 C 404 300, 410 250, 390 230 C 366 240, 360 300, 354 348 Z"/>`;
  inner += `<circle cx="266" cy="400" r="9" fill="${c.C}" stroke="none"/><circle cx="334" cy="400" r="9" fill="${c.C}" stroke="none"/>`;
  inner += `<ellipse cx="300" cy="446" rx="18" ry="12"/>`;
  inner += `<path d="M 300 458 L 300 470 Q 286 480 274 468 M 300 470 Q 314 480 326 468"/>`;
  inner += `<path d="M 262 320 C 230 240, 208 208, 170 198 M 338 320 C 370 240, 392 208, 430 198"/>`;
  inner += `<path d="M 214 252 L 190 224 M 238 284 L 210 268 M 386 252 L 410 224 M 362 284 L 390 268"/>`;
  inner += `<path d="M 170 198 q -24 -14 -28 -40 M 170 198 q 18 -18 10 -44 M 430 198 q 24 -14 28 -40 M 430 198 q -18 -18 -10 -44"/>`;
  inner += `<path d="M 258 498 C 236 550, 232 620, 248 680 M 342 498 C 364 550, 368 620, 352 680"/>`;
  inner += `<path d="M 300 514 L 300 668 M 262 600 q 20 16 38 0 M 338 600 q -20 16 -38 0"/>`;
  inner += `<path d="M 248 680 q -14 16 -34 8 M 352 680 q 14 16 34 8"/>`;
  inner += flowerSvg(c, 120, 620, 34, 6);
  inner += flowerSvg(c, 480, 620, 34, 6);
  inner += `<path d="M 60 706 H 540"/>`;
  return pen(c, inner);
}

function dino(c) {
  let inner = `<path d="M 116 520 C 116 430, 190 380, 300 380 C 400 380, 470 420, 486 500 C 498 570, 456 630, 380 640 L 220 640 C 148 630, 116 576, 116 520 Z"/>`;
  inner += `<path d="M 300 380 C 292 310, 302 250, 350 220 C 384 200, 424 216, 432 252 C 440 288, 416 310, 388 304"/>`;
  inner += `<circle cx="356" cy="248" r="8" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 402 256 q 14 10 24 -2"/>`;
  inner += `<path d="M 432 252 q 14 -8 24 2"/>`;
  inner += `<path d="M 180 420 L 168 388 L 200 404 L 204 368 L 230 396 L 246 356 L 266 392 L 292 356 L 304 396 L 332 366 L 336 404 L 368 378 L 362 414"/>`;
  inner += `<path d="M 156 520 q 24 -18 48 0 q 24 18 48 0 q 24 -18 48 0 q 24 18 48 0 q 24 -18 48 0"/>`;
  inner += `<path d="M 210 570 q 26 -20 52 0 q 26 20 52 0 q 26 -20 52 0"/>`;
  inner += `<path d="M 250 646 L 242 700 M 280 646 L 280 700 M 320 646 L 320 700 M 350 646 L 358 700"/>`;
  inner += `<ellipse cx="150" cy="650" rx="52" ry="34"/>`;
  inner += `<ellipse cx="120" cy="620" rx="26" ry="18"/>`;
  inner += `<ellipse cx="412" cy="680" rx="42" ry="28"/>`;
  inner += `<ellipse cx="356" cy="692" rx="34" ry="22"/>`;
  inner += `<path d="M 60 710 H 540"/>`;
  inner += `<circle cx="480" cy="160" r="32"/>`;
  return pen(c, inner);
}

function whale(c) {
  let inner = `<path d="M 100 420 C 110 320, 210 280, 320 302 C 430 324, 500 380, 500 440 C 500 500, 430 548, 320 558 C 210 568, 110 520, 100 420 Z"/>`;
  inner += `<path d="M 500 440 C 532 410, 560 380, 572 340 C 552 360, 528 392, 500 410 M 500 440 C 532 456, 560 470, 574 502 C 548 490, 524 472, 496 464"/>`;
  inner += `<path d="M 260 486 C 300 520, 350 520, 390 488 M 280 528 C 316 548, 352 548, 380 530"/>`;
  inner += `<path d="M 280 336 C 270 296, 292 256, 330 260 C 358 264, 366 300, 344 320"/>`;
  inner += `<path d="M 330 260 C 326 220, 350 196, 380 210 C 400 220, 396 248, 374 252 C 392 224, 424 236, 430 264"/>`;
  inner += `<circle cx="210" cy="392" r="10" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 190 420 Q 210 438 232 420"/>`;
  inner += `<path d="M 300 430 C 340 400, 380 400, 410 430"/>`;
  inner += waveLine(620, 20);
  inner += waveLine(668, 16);
  inner += `<circle cx="480" cy="170" r="34"/>`;
  inner += `<path d="M 100 220 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += bubbles(c, [[150, 300, 8], [180, 260, 6], [450, 300, 7]]);
  return pen(c, inner);
}

function crab(c) {
  let inner = `<ellipse cx="300" cy="430" rx="128" ry="92"/>`;
  inner += `<path d="M 216 370 C 190 340, 158 340, 146 362 C 134 384, 156 408, 184 402"/>`;
  inner += `<path d="M 384 370 C 410 340, 442 340, 454 362 C 466 384, 444 408, 416 402"/>`;
  inner += `<path d="M 146 362 L 130 342 L 150 332 L 162 350 M 454 362 L 470 342 L 450 332 L 438 350"/>`;
  inner += `<circle cx="260" cy="330" r="18"/><circle cx="340" cy="330" r="18"/>`;
  inner += `<circle cx="260" cy="212" r="22"/><circle cx="340" cy="212" r="22"/>`;
  inner += `<circle cx="260" cy="212" r="9" fill="${c.C}" stroke="none"/><circle cx="340" cy="212" r="9" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 268 318 L 262 236 M 332 318 L 338 236"/>`;
  inner += `<path d="M 272 430 Q 300 462 328 430"/>`;
  inner += `<path d="M 200 480 C 180 520, 170 570, 180 610 M 244 500 C 236 548, 236 592, 248 626 M 300 508 L 300 640 M 356 500 C 364 548, 364 592, 352 626 M 400 480 C 420 520, 430 570, 420 610"/>`;
  inner += `<path d="M 60 690 Q 180 664 300 688 Q 420 712 540 684"/>`;
  inner += `<path d="M 110 640 L 100 600 L 124 614 L 134 582 L 148 616 L 170 606 L 158 646 Z"/>`;
  inner += `<path d="M 440 650 q 16 -16 32 0 q 16 -16 32 0"/>`;
  inner += `<circle cx="480" cy="180" r="32"/>`;
  return pen(c, inner);
}

function seahorse(c) {
  let inner = `<path d="M 330 260 C 258 250, 214 300, 224 370 C 232 430, 284 466, 280 522 C 274 586, 226 612, 200 590 C 178 570, 198 540, 218 552 C 236 564, 250 544, 246 520 C 240 486, 208 464, 200 420 C 190 360, 218 302, 278 286 C 270 258, 288 238, 310 244"/>`;
  inner += `<path d="M 300 250 C 318 218, 356 222, 366 250 C 376 278, 354 296, 330 288"/>`;
  inner += `<path d="M 366 250 L 404 258 L 370 272"/>`;
  inner += `<circle cx="336" cy="252" r="7" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 330 288 C 360 292, 380 280, 384 262"/>`;
  inner += `<path d="M 258 320 C 292 306, 330 314, 348 338 C 326 348, 288 342, 258 320 Z"/>`;
  inner += `<path d="M 234 380 C 262 366, 296 372, 310 394 M 226 430 C 256 416, 290 422, 304 444 M 240 480 C 266 468, 294 474, 306 494"/>`;
  inner += `<path d="M 320 320 C 334 356, 332 394, 314 424 M 306 450 C 292 486, 260 512, 236 528"/>`;
  inner += `<path d="M 272 560 q 14 12 28 0 M 240 596 q 12 10 24 0"/>`;
  inner += `<path d="M 210 552 q -8 -18 12 -20 M 278 286 q -10 -14 6 -22"/>`;
  inner += `<path d="M 80 700 C 88 620, 104 560, 128 520 C 134 600, 118 660, 112 700 Z"/>`;
  inner += `<path d="M 500 700 C 492 620, 476 560, 452 520 C 446 600, 462 660, 468 700 Z"/>`;
  inner += bubbles(c, [[120, 300, 10], [160, 250, 7], [450, 280, 9], [480, 340, 6], [150, 420, 6]]);
  return pen(c, inner);
}

function peacock(c) {
  let inner = '';
  for (let i = 0; i < 11; i++) {
    const a = -230 + i * 18;
    const rad = (a * Math.PI) / 180;
    const x = 300 + Math.cos(rad) * 190;
    const y = 470 + Math.sin(rad) * 190;
    inner += `<path d="M 300 470 L ${round(x)} ${round(y)}"/>`;
    inner += `<ellipse cx="${round(x)}" cy="${round(y)}" rx="26" ry="34" transform="rotate(${a + 90} ${round(x)} ${round(y)})"/>`;
    inner += `<ellipse cx="${round(x)}" cy="${round(y)}" rx="14" ry="20" transform="rotate(${a + 90} ${round(x)} ${round(y)})"/>`;
    inner += `<circle cx="${round(x)}" cy="${round(y)}" r="6"/>`;
  }
  inner += `<ellipse cx="300" cy="470" rx="48" ry="66"/>`;
  inner += `<path d="M 300 418 C 284 360, 288 320, 306 288 C 320 264, 350 260, 362 282 C 374 302, 360 324, 340 320"/>`;
  inner += `<circle cx="316" cy="286" r="6" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 360 280 L 392 288 L 362 302"/>`;
  inner += `<path d="M 352 266 L 360 236 M 366 270 L 384 246 M 374 286 L 398 274 M 346 270 L 330 246"/>`;
  inner += `<circle cx="360" cy="236" r="5"/><circle cx="384" cy="246" r="5"/><circle cx="398" cy="274" r="5"/><circle cx="330" cy="246" r="5"/>`;
  inner += `<path d="M 258 520 C 250 570, 260 610, 276 640 M 342 520 C 350 570, 340 610, 324 640"/>`;
  inner += `<path d="M 276 640 L 266 672 M 286 646 L 282 680 M 324 640 L 334 672 M 314 646 L 318 680"/>`;
  inner += `<path d="M 60 700 H 540"/>`;
  inner += `<circle cx="490" cy="170" r="30"/>`;
  inner += `<path d="M 90 170 q 18 -18 36 0 q 18 -18 36 0"/>`;
  return pen(c, inner);
}

function tiger(c) {
  let inner = `<circle cx="300" cy="390" r="116"/>`;
  inner += `<path d="M 210 330 L 186 220 L 272 280 Z M 390 330 L 414 220 L 328 280 Z"/>`;
  inner += `<circle cx="260" cy="378" r="11" fill="${c.C}" stroke="none"/><circle cx="340" cy="378" r="11" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 300 408 L 284 426 L 316 426 Z"/>`;
  inner += `<path d="M 300 426 Q 282 450 266 432 M 300 426 Q 318 450 334 432"/>`;
  inner += `<path d="M 246 346 q 14 10 28 0 M 326 346 q 14 10 28 0 M 240 420 l -22 -10 M 240 442 l -24 4 M 360 420 l 22 -10 M 360 442 l 24 4"/>`;
  inner += `<path d="M 256 290 q 8 16 0 30 M 300 280 q 8 16 0 30 M 344 290 q 8 16 0 30"/>`;
  inner += `<path d="M 300 486 C 250 486, 210 520, 200 580 C 192 640, 220 690, 280 700 L 320 700 C 380 690, 408 640, 400 580 C 390 520, 350 486, 300 486 Z"/>`;
  inner += `<path d="M 248 520 q 20 16 40 0 M 312 520 q 20 16 40 0 M 232 580 q 26 18 52 0 M 316 580 q 26 18 52 0"/>`;
  inner += `<path d="M 218 650 q 12 -18 24 0 M 358 650 q 12 -18 24 0"/>`;
  inner += `<path d="M 400 600 C 470 590, 500 540, 486 500 C 480 536, 448 554, 414 556"/>`;
  inner += `<path d="M 60 706 H 540"/>`;
  return pen(c, inner);
}

/* --------------------------------------------------------------- India pride */

function tiranga(c) {
  let inner = `<path d="M 180 170 L 180 700"/>`;
  inner += `<path d="M 180 184 L 480 184 L 480 366 L 180 366 Z"/>`;
  inner += `<path d="M 180 244.7 L 480 244.7 M 180 305.3 L 480 305.3"/>`;
  inner += `<circle cx="330" cy="275" r="26"/><circle cx="330" cy="275" r="8"/>`;
  for (let i = 0; i < 24; i++) {
    const a = (Math.PI * 2 * i) / 24;
    inner += `<path d="M ${round(330 + Math.cos(a) * 8)} ${round(275 + Math.sin(a) * 8)} L ${round(330 + Math.cos(a) * 26)} ${round(275 + Math.sin(a) * 26)}"/>`;
  }
  inner += `<path d="M 180 184 q 18 10 36 0 q 18 -10 36 0 q 18 10 36 0 q 18 -10 36 0 q 18 10 36 0 q 18 -10 36 0 q 18 10 36 0 q 18 -10 36 0"/>`;
  inner += `<path d="M 180 366 q 18 10 36 0 q 18 -10 36 0 q 18 10 36 0 q 18 -10 36 0 q 18 10 36 0 q 18 -10 36 0 q 18 10 36 0 q 18 -10 36 0"/>`;
  inner += `<path d="M 130 700 H 290"/>`;
  inner += `<path d="M 148 672 q 30 -20 60 0 q 30 20 60 0"/>`;
  inner += sunSvg(c, 490, 190, 32, 12);
  inner += cloudSvg(c, 120, 330, 32);
  inner += `<path d="M 400 150 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += starSvg(c, 60, 520, 14, 5);
  inner += dot(c, 470, 440, 4) + dot(c, 420, 520, 4) + dot(c, 500, 600, 4);
  return pen(c, inner);
}

function ashokaChakra(c) {
  const cx = 300;
  const cy = 400;
  let inner = `<circle cx="${cx}" cy="${cy}" r="196"/><circle cx="${cx}" cy="${cy}" r="178"/>`;
  inner += `<circle cx="${cx}" cy="${cy}" r="46"/><circle cx="${cx}" cy="${cy}" r="22"/>`;
  for (let i = 0; i < 24; i++) {
    const a = (Math.PI * 2 * i) / 24;
    inner += `<path d="M ${round(cx + Math.cos(a) * 46)} ${round(cy + Math.sin(a) * 46)} L ${round(cx + Math.cos(a) * 178)} ${round(cy + Math.sin(a) * 178)}"/>`;
    inner += `<path d="M ${round(cx + Math.cos(a + 0.12) * 150)} ${round(cy + Math.sin(a + 0.12) * 150)} L ${round(cx + Math.cos(a) * 178)} ${round(cy + Math.sin(a) * 178)} L ${round(cx + Math.cos(a - 0.12) * 150)} ${round(cy + Math.sin(a - 0.12) * 150)}"/>`;
    inner += dot(c, cx + Math.cos(a + Math.PI / 24) * 188, cy + Math.sin(a + Math.PI / 24) * 188, 3);
  }
  inner += `<circle cx="${cx}" cy="${cy}" r="168" />`;
  for (let i = 0; i < 24; i++) {
    const a = (Math.PI * 2 * i) / 24 + Math.PI / 24;
    inner += `<circle cx="${round(cx + Math.cos(a) * 168)}" cy="${round(cy + Math.sin(a) * 168)}" r="5"/>`;
  }
  inner += `<path d="M 80 700 H 520"/>`;
  inner += `<path d="M 80 690 q 24 -16 48 0 q 24 16 48 0 M 424 690 q 24 -16 48 0 q 24 16 48 0"/>`;
  inner += `<circle cx="490" cy="160" r="30"/>`;
  return pen(c, inner);
}

function indiaGate(c) {
  let inner = `<path d="M 120 680 L 120 360 L 220 360 L 220 680 Z M 380 680 L 380 360 L 480 360 L 480 680 Z"/>`;
  inner += `<path d="M 220 680 L 220 420 C 220 330, 380 330, 380 420 L 380 680 Z"/>`;
  inner += `<path d="M 236 680 L 236 436 C 236 374, 364 374, 364 436 L 364 680 Z"/>`;
  inner += `<path d="M 120 360 L 300 280 L 480 360 Z"/>`;
  inner += `<path d="M 300 280 C 270 280, 258 250, 282 236 C 300 226, 318 236, 318 254"/>`;
  inner += `<path d="M 300 226 L 300 202"/><circle cx="300" cy="194" r="8"/>`;
  inner += `<path d="M 148 370 L 148 660 M 172 370 L 172 660 M 196 370 L 196 660 M 404 370 L 404 660 M 428 370 L 428 660 M 452 370 L 452 660"/>`;
  inner += `<path d="M 90 680 H 510 M 70 706 H 530"/>`;
  inner += `<path d="M 96 700 q 20 -14 40 0 q 20 -14 40 0 M 424 700 q 20 -14 40 0 q 20 -14 40 0"/>`;
  inner += `<path d="M 180 720 q 20 -14 40 0 q 20 14 40 0 q 20 -14 40 0 q 20 14 40 0"/>`;
  inner += sunSvg(c, 490, 160, 34, 12);
  inner += cloudSvg(c, 116, 190, 34);
  inner += `<path d="M 400 180 q 18 -18 36 0 q 18 -18 36 0"/>`;
  return pen(c, inner);
}

function banyan(c) {
  let inner = `<path d="M 260 700 C 256 600, 248 520, 230 460 L 300 420 L 370 460 C 352 520, 344 600, 340 700 Z"/>`;
  inner += `<path d="M 300 420 L 300 700 M 270 560 L 250 700 M 330 560 L 350 700"/>`;
  inner += `<path d="M 230 460 C 190 420, 176 340, 204 300 M 370 460 C 410 420, 424 340, 396 300"/>`;
  inner += `<path d="M 300 420 C 260 350, 240 280, 250 230 M 300 420 C 340 350, 360 280, 350 230"/>`;
  const blobs = [
    [300, 250, 150, 90],
    [180, 300, 130, 96],
    [420, 300, 130, 96],
    [120, 420, 100, 80],
    [480, 420, 100, 80],
  ];
  blobs.forEach(([x, y, rx, ry]) => {
    inner += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
  });
  inner += `<path d="M 120 440 C 130 560, 114 640, 120 700 M 180 430 C 190 540, 178 630, 182 700 M 420 430 C 410 540, 422 630, 418 700 M 480 440 C 470 560, 486 640, 480 700"/>`;
  inner += `<path d="M 300 380 C 290 500, 288 620, 300 700"/>`;
  inner += `<path d="M 60 700 H 540"/>`;
  inner += `<path d="M 80 180 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += `<circle cx="480" cy="170" r="30"/>`;
  inner += grassTuft(c, 110, 700, 30) + grassTuft(c, 490, 700, 30);
  return pen(c, inner);
}

function mango(c) {
  let inner = `<path d="M 300 620 C 210 610, 160 520, 180 430 C 198 348, 280 320, 300 380 C 320 320, 402 348, 420 430 C 440 520, 390 610, 300 620 Z"/>`;
  inner += `<path d="M 300 380 C 294 340, 296 300, 316 270"/>`;
  inner += `<path d="M 300 620 C 270 570, 260 500, 276 440 M 300 620 C 330 570, 340 500, 324 440"/>`;
  inner += `<path d="M 196 470 C 230 440, 270 450, 286 486 M 404 470 C 370 440, 330 450, 314 486"/>`;
  inner += leafSvg(c, 260, 300, 58, -40);
  inner += leafSvg(c, 352, 296, 54, 40);
  inner += `<path d="M 300 620 C 220 660, 180 690, 160 720 M 300 620 C 380 660, 420 690, 440 720"/>`;
  inner += `<path d="M 120 570 C 140 520, 160 490, 190 470 C 180 520, 160 550, 140 580 Z"/>`;
  inner += `<path d="M 480 570 C 460 520, 440 490, 410 470 C 420 520, 440 550, 460 580 Z"/>`;
  inner += `<path d="M 60 700 H 540"/>`;
  inner += dot(c, 100, 180, 3) + dot(c, 500, 190, 3) + dot(c, 90, 620, 3) + dot(c, 510, 640, 3);
  inner += `<circle cx="490" cy="180" r="30"/>`;
  return pen(c, inner);
}

function ganga(c) {
  let inner = `<path d="M 40 470 Q 140 440 240 466 Q 340 492 440 462 Q 500 446 560 462"/>`;
  inner += `<path d="M 40 520 Q 140 490 240 516 Q 340 542 440 512 Q 500 496 560 512"/>`;
  inner += `<path d="M 40 570 Q 140 540 240 566 Q 340 592 440 562 Q 500 546 560 562"/>`;
  inner += `<path d="M 40 620 Q 140 590 240 616 Q 340 642 440 612 Q 500 596 560 612"/>`;
  inner += `<path d="M 40 670 Q 140 640 240 666 Q 340 692 440 662 Q 500 646 560 662"/>`;
  inner += `<path d="M 120 540 L 300 470 L 400 490 L 390 570 L 140 600 Z"/>`;
  inner += `<path d="M 120 540 L 140 600 M 300 470 L 280 570 M 400 490 L 390 570"/>`;
  inner += `<path d="M 250 520 L 300 470 L 310 520 M 250 520 L 270 570"/>`;
  inner += `<path d="M 310 510 L 330 470 L 350 510"/>`;
  inner += `<circle cx="340" cy="520" r="10"/>`;
  inner += `<path d="M 330 530 L 340 560 M 350 530 L 340 560"/>`;
  inner += `<path d="M 60 420 L 60 330 L 100 330 L 100 420 M 100 420 L 100 360 L 140 360 L 140 420 M 140 420 L 140 300 L 180 300 L 180 420 M 180 420 L 180 340 L 220 340 L 220 420"/>`;
  inner += `<path d="M 140 300 L 160 270 L 180 300 M 180 340 L 200 310 L 220 340"/>`;
  inner += `<path d="M 400 420 L 400 330 L 440 330 L 440 420 M 440 420 L 440 300 L 480 300 L 480 420 M 480 420 L 480 350 L 520 350 L 520 420"/>`;
  inner += `<path d="M 440 300 L 460 270 L 480 300"/>`;
  inner += `<path d="M 240 420 L 240 370 L 300 370 L 300 420 M 300 420 L 300 340 L 360 340 L 360 420"/>`;
  inner += `<path d="M 300 340 L 330 300 L 360 340"/>`;
  inner += sunSvg(c, 490, 170, 32, 12);
  inner += `<path d="M 90 180 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += `<path d="M 80 700 H 540"/>`;
  return pen(c, inner);
}

module.exports = {
  cat,
  dog,
  elephant,
  lion,
  owl,
  bird,
  fish,
  turtle,
  octopus,
  rabbit,
  panda,
  frog,
  deer,
  dino,
  whale,
  crab,
  seahorse,
  peacock,
  tiger,
  tiranga,
  ashokaChakra,
  indiaGate,
  banyan,
  mango,
  ganga,
};
