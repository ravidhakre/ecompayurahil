'use strict';

// ---------------------------------------------------------------------------
// Design library C: cartoon characters and fantasy pages.
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
  grassTuft,
} = require('./art-primitives');

function bubbles(c, spots) {
  return spots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
}

/* ---------------------------------------------------------------- cartoons */

function superhero(c) {
  let inner = '';
  inner += `<path d="M 198 420 C 140 440, 110 520, 130 610 C 170 590, 210 540, 236 470"/>`;
  inner += `<path d="M 400 420 C 458 440, 490 520, 470 610 C 430 590, 390 540, 364 470"/>`;
  inner += `<path d="M 246 400 C 246 330, 354 330, 354 400 L 342 520 L 258 520 Z"/>`;
  inner += `<circle cx="300" cy="292" r="60"/>`;
  inner += `<path d="M 250 282 Q 300 246 350 282 L 350 300 Q 300 270 250 300 Z"/>`;
  inner += `<circle cx="278" cy="296" r="7" fill="${c.C}" stroke="none"/><circle cx="322" cy="296" r="7" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 282 326 Q 300 340 318 326"/>`;
  inner += `<path d="M 270 352 Q 300 366 330 352"/>`;
  inner += `<path d="M 258 400 L 212 456 M 342 400 L 388 456"/>`;
  inner += `<path d="M 212 456 L 184 480 M 388 456 L 416 480"/>`;
  inner += `<path d="M 204 470 q 12 -14 24 0 M 380 470 q 12 -14 24 0"/>`;
  inner += `<path d="M 276 520 L 262 620 L 236 640 M 324 520 L 338 620 L 364 640"/>`;
  inner += `<path d="M 258 620 q 12 -14 24 0 M 326 620 q 12 -14 24 0"/>`;
  inner += starSvg(c, 300, 448, 34, 5);
  inner += `<path d="M 300 438 L 300 458 M 290 448 L 310 448"/>`;
  inner += cloudSvg(c, 110, 220, 38);
  inner += cloudSvg(c, 500, 240, 30);
  inner += starSvg(c, 120, 390, 14, 5) + starSvg(c, 486, 400, 12, 5);
  inner += `<path d="M 60 700 H 540"/>`;
  inner += `<path d="M 80 690 q 20 -14 40 0 q 20 14 40 0 M 440 690 q 20 -14 40 0 q 20 14 40 0"/>`;
  return pen(c, inner);
}

function robot(c) {
  let inner = `<rect x="212" y="216" width="176" height="132" rx="26"/>`;
  inner += `<circle cx="258" cy="274" r="20"/><circle cx="342" cy="274" r="20"/>`;
  inner += `<circle cx="258" cy="274" r="8" fill="${c.C}" stroke="none"/><circle cx="342" cy="274" r="8" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 266 316 H 334 M 276 316 V 300 M 296 316 V 300 M 316 316 V 300"/>`;
  inner += `<path d="M 300 216 L 300 180 M 300 180 L 274 162 M 300 180 L 326 162"/>`;
  inner += `<circle cx="300" cy="174" r="10"/>`;
  inner += `<rect x="222" y="366" width="156" height="164" rx="24"/>`;
  inner += `<rect x="252" y="396" width="96" height="58" rx="8"/>`;
  inner += `<path d="M 262 414 H 338 M 262 432 H 338"/>`;
  inner += `<circle cx="270" cy="478" r="12"/><circle cx="300" cy="478" r="12"/><circle cx="330" cy="478" r="12"/>`;
  inner += `<path d="M 258 506 H 342"/>`;
  inner += `<path d="M 222 400 L 168 436 L 152 520 M 378 400 L 432 436 L 448 520"/>`;
  inner += `<circle cx="150" cy="532" r="18"/><circle cx="450" cy="532" r="18"/>`;
  inner += `<path d="M 252 530 L 244 640 L 218 660 M 348 530 L 356 640 L 382 660"/>`;
  inner += `<path d="M 244 640 q 14 -16 28 0 M 328 640 q 14 -16 28 0"/>`;
  inner += `<circle cx="300" cy="370" r="6" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 60 700 H 540"/>`;
  inner += `<path d="M 80 690 q 20 -14 40 0 q 20 14 40 0 M 440 690 q 20 -14 40 0 q 20 14 40 0"/>`;
  inner += `<path d="M 110 280 h 40 v 40 h -40 Z M 450 300 h 36 v 36 h -36 Z"/>`;
  inner += `<circle cx="130" cy="300" r="8"/><circle cx="468" cy="318" r="8"/>`;
  return pen(c, inner);
}

function mermaid(c) {
  let inner = `<circle cx="300" cy="270" r="66"/>`;
  inner += `<path d="M 236 250 C 204 300, 210 380, 246 410 M 364 250 C 396 300, 390 380, 354 410"/>`;
  inner += `<path d="M 252 240 C 260 196, 340 196, 348 240 C 356 284, 340 304, 300 304 C 260 304, 244 284, 252 240 Z"/>`;
  inner += `<circle cx="278" cy="268" r="8" fill="${c.C}" stroke="none"/><circle cx="322" cy="268" r="8" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 280 300 Q 300 316 320 300"/>`;
  inner += `<path d="M 266 340 C 260 380, 340 380, 334 340"/>`;
  inner += `<path d="M 252 356 C 216 364, 200 400, 228 424 C 246 440, 264 430, 270 414 M 348 356 C 384 364, 400 400, 372 424 C 354 440, 336 430, 330 414"/>`;
  inner += `<path d="M 268 408 C 236 452, 238 508, 274 548 C 300 578, 326 596, 330 634 C 332 660, 310 682, 286 672 C 268 664, 270 644, 288 646 C 302 648, 308 634, 298 622 C 278 598, 256 572, 252 534"/>`;
  inner += `<path d="M 332 408 C 364 452, 362 508, 326 548 C 300 578, 274 596, 270 634 C 268 660, 290 682, 314 672 C 332 664, 330 644, 312 646 C 298 648, 292 634, 302 622 C 322 598, 344 572, 348 534"/>`;
  inner += `<path d="M 274 470 q 26 16 52 0 M 268 506 q 32 18 64 0 M 276 542 q 24 16 48 0 M 290 578 q 18 14 36 0"/>`;
  inner += `<path d="M 260 378 q 40 24 80 0"/>`;
  inner += bubbles(c, [[400, 220, 14], [440, 270, 9], [170, 300, 10], [430, 330, 6]]);
  inner += fishSvg(c, 460, 430, 40, true);
  inner += `<path d="M 70 700 Q 180 676 300 696 Q 420 716 530 690"/>`;
  inner += `<path d="M 90 690 q 20 -14 40 0 q 20 14 40 0"/>`;
  inner += `<circle cx="120" cy="180" r="26"/>`;
  return pen(c, inner);
}

function fairy(c) {
  let inner = `<circle cx="300" cy="300" r="64"/>`;
  inner += `<path d="M 240 280 C 200 260, 180 300, 208 330 M 360 280 C 400 260, 420 300, 392 330"/>`;
  inner += `<circle cx="278" cy="296" r="7" fill="${c.C}" stroke="none"/><circle cx="322" cy="296" r="7" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 284 326 Q 300 338 316 326"/>`;
  inner += `<path d="M 240 300 C 230 240, 250 214, 270 210 M 360 300 C 370 240, 350 214, 330 210"/>`;
  inner += `<path d="M 266 364 C 230 348, 190 360, 174 398 C 158 438, 190 470, 230 452 C 258 438, 272 410, 266 384 Z"/>`;
  inner += `<path d="M 334 364 C 370 348, 410 360, 426 398 C 442 438, 410 470, 370 452 C 342 438, 328 410, 334 384 Z"/>`;
  inner += `<path d="M 220 392 q 20 -16 34 4 M 346 396 q 16 -18 34 -4"/>`;
  inner += `<path d="M 266 364 C 250 420, 350 420, 334 364"/>`;
  inner += `<path d="M 250 420 C 224 480, 230 550, 268 600 C 286 624, 314 624, 332 600 C 370 550, 376 480, 350 420 Z"/>`;
  inner += `<path d="M 274 460 q 26 18 52 0 M 262 506 q 38 20 76 0 M 270 552 q 30 16 60 0"/>`;
  inner += `<path d="M 266 590 L 256 650 M 334 590 L 344 650"/>`;
  inner += `<path d="M 252 650 q 12 -14 24 0 M 324 650 q 12 -14 24 0"/>`;
  inner += `<path d="M 360 420 L 420 360"/>`;
  inner += starSvg(c, 430, 348, 26, 5);
  inner += `<path d="M 420 366 L 428 380 M 414 372 L 400 382"/>`;
  inner += `<path d="M 120 600 C 140 560, 176 556, 196 588 C 176 616, 140 620, 120 600 Z"/>`;
  inner += flowerSvg(c, 460, 620, 34, 6);
  inner += starSvg(c, 120, 200, 18, 5) + starSvg(c, 470, 220, 14, 5) + starSvg(c, 150, 450, 12, 5);
  inner += `<path d="M 70 700 Q 180 676 300 696 Q 420 716 530 690"/>`;
  return pen(c, inner);
}

function pirate(c) {
  let inner = `<circle cx="300" cy="310" r="76"/>`;
  inner += `<path d="M 224 290 C 228 248, 372 248, 376 290 C 340 270, 260 270, 224 290 Z"/>`;
  inner += `<path d="M 220 278 C 250 236, 350 236, 380 278 L 400 246 L 200 246 Z"/>`;
  inner += `<path d="M 264 306 C 264 288, 300 288, 300 306 C 300 324, 264 324, 264 306 Z" fill="${c.C}" stroke="none"/>`;
  inner += `<circle cx="338" cy="306" r="8" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 272 346 Q 300 362 328 346"/>`;
  inner += `<path d="M 246 360 C 230 392, 236 420, 260 430 M 354 360 C 370 392, 364 420, 340 430"/>`;
  inner += `<path d="M 246 386 C 266 414, 334 414, 354 386 C 350 438, 250 438, 246 386 Z"/>`;
  inner += `<path d="M 246 438 C 220 480, 214 550, 238 610 L 362 610 C 386 550, 380 480, 354 438 Z"/>`;
  inner += `<path d="M 300 438 V 610"/>`;
  inner += `<path d="M 262 480 L 246 610 M 338 480 L 354 610"/>`;
  inner += `<path d="M 270 494 q 12 -12 24 0 q 12 -12 24 0"/>`;
  inner += `<path d="M 238 520 L 194 560 M 362 520 L 406 560"/>`;
  inner += `<path d="M 406 560 L 426 540 L 436 556 L 420 582"/>`;
  inner += `<path d="M 258 610 L 252 680 M 342 610 L 348 680"/>`;
  inner += `<path d="M 238 680 q 16 -16 32 0 M 330 680 q 16 -16 32 0"/>`;
  inner += `<rect x="378" y="640" width="116" height="60" rx="8"/>`;
  inner += `<path d="M 378 640 H 494 M 436 640 V 700 M 378 670 H 494"/>`;
  inner += `<path d="M 500 660 L 540 640 L 530 680 Z"/>`;
  inner += `<path d="M 70 700 Q 180 676 300 696 Q 420 716 530 690"/>`;
  inner += `<path d="M 100 190 q 18 -18 36 0 q 18 -18 36 0"/>`;
  return pen(c, inner);
}

function clown(c) {
  let inner = `<circle cx="300" cy="330" r="92"/>`;
  inner += `<path d="M 208 320 C 180 300, 180 260, 212 250 M 392 320 C 420 300, 420 260, 388 250"/>`;
  inner += `<path d="M 238 250 C 220 190, 380 190, 362 250"/>`;
  inner += `<path d="M 246 246 L 234 190 L 366 190 L 354 246 Z"/>`;
  inner += `<circle cx="300" cy="178" r="18"/>`;
  inner += `<circle cx="266" cy="320" r="10" fill="${c.C}" stroke="none"/><circle cx="334" cy="320" r="10" fill="${c.C}" stroke="none"/>`;
  inner += `<circle cx="300" cy="348" r="16" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 248 368 Q 300 424 352 368"/>`;
  inner += `<path d="M 252 370 Q 300 400 348 370"/>`;
  inner += `<path d="M 254 288 q 16 -16 32 0 M 314 288 q 16 -16 32 0"/>`;
  inner += `<path d="M 228 416 C 180 440, 170 520, 196 560 L 404 560 C 430 520, 420 440, 372 416 Z"/>`;
  inner += `<path d="M 258 440 L 238 560 M 342 440 L 362 560"/>`;
  inner += `<path d="M 260 430 L 300 470 L 340 430 L 320 420 L 300 450 L 280 420 Z"/>`;
  inner += `<circle cx="300" cy="446" r="14"/>`;
  inner += `<path d="M 210 480 C 190 540, 190 600, 210 650 M 390 480 C 410 540, 410 600, 390 650"/>`;
  inner += `<circle cx="206" cy="662" r="18"/><circle cx="394" cy="662" r="18"/>`;
  inner += `<path d="M 240 560 L 232 650 L 210 676 M 360 560 L 368 650 L 390 676"/>`;
  inner += `<path d="M 110 700 H 490"/>`;
  inner += `<path d="M 120 250 C 110 210, 130 188, 150 198 C 170 208, 160 240, 140 250 Z"/>`;
  inner += `<path d="M 140 250 L 150 350"/>`;
  inner += `<path d="M 460 260 C 450 220, 470 198, 490 208 C 510 218, 500 250, 480 260 Z"/>`;
  inner += `<path d="M 480 260 L 470 350"/>`;
  return pen(c, inner);
}

function princess(c) {
  let inner = `<circle cx="300" cy="286" r="62"/>`;
  inner += `<path d="M 240 270 C 214 240, 214 210, 238 198 L 252 240 L 300 188 L 348 240 L 362 198 C 386 210, 386 240, 360 270"/>`;
  inner += `<path d="M 244 224 L 256 188 L 276 210 L 300 170 L 324 210 L 344 188 L 356 224"/>`;
  inner += `<circle cx="300" cy="182" r="7"/><circle cx="260" cy="196" r="6"/><circle cx="340" cy="196" r="6"/>`;
  inner += `<circle cx="278" cy="284" r="7" fill="${c.C}" stroke="none"/><circle cx="322" cy="284" r="7" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 282 310 Q 300 324 318 310"/>`;
  inner += `<path d="M 242 250 C 210 300, 214 370, 242 410 M 358 250 C 390 300, 386 370, 358 410"/>`;
  inner += `<path d="M 262 348 C 230 360, 220 392, 244 414 C 262 430, 282 416, 286 398 M 338 348 C 370 360, 380 392, 356 414 C 338 430, 318 416, 314 398"/>`;
  inner += `<path d="M 264 412 C 232 480, 212 560, 196 660 L 404 660 C 388 560, 368 480, 336 412 Z"/>`;
  inner += `<path d="M 300 420 V 660"/>`;
  inner += `<path d="M 264 470 q 36 18 72 0 M 246 530 q 54 22 108 0 M 224 590 q 76 26 152 0"/>`;
  inner += `<path d="M 260 660 q 40 -24 80 0"/>`;
  inner += flowerSvg(c, 140, 600, 36, 6);
  inner += flowerSvg(c, 460, 600, 36, 6);
  inner += butterflySvg(c, 450, 300, 50);
  inner += starSvg(c, 120, 220, 16, 5) + starSvg(c, 480, 210, 14, 5);
  inner += `<path d="M 70 700 Q 180 676 300 696 Q 420 716 530 690"/>`;
  return pen(c, inner);
}

function astronaut(c) {
  let inner = `<circle cx="300" cy="290" r="94"/>`;
  inner += `<circle cx="300" cy="290" r="76"/>`;
  inner += `<path d="M 240 292 C 250 250, 350 250, 360 292 C 350 330, 250 330, 240 292 Z"/>`;
  inner += `<circle cx="278" cy="288" r="8" fill="${c.C}" stroke="none"/><circle cx="322" cy="288" r="8" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 284 312 Q 300 324 316 312"/>`;
  inner += `<path d="M 236 250 q 18 -16 36 0 M 328 250 q 18 -16 36 0"/>`;
  inner += `<path d="M 228 376 C 200 400, 194 470, 218 520 L 382 520 C 406 470, 400 400, 372 376 Z"/>`;
  inner += `<rect x="244" y="410" width="112" height="70" rx="10"/>`;
  inner += `<path d="M 258 428 H 342 M 258 448 H 342 M 258 468 H 320"/>`;
  inner += `<circle cx="278" cy="500" r="9"/><circle cx="322" cy="500" r="9"/>`;
  inner += `<path d="M 228 410 L 182 440 L 168 520 M 372 410 L 418 440 L 432 520"/>`;
  inner += `<circle cx="166" cy="532" r="18"/><circle cx="434" cy="532" r="18"/>`;
  inner += `<path d="M 252 520 L 244 630 L 220 660 M 348 520 L 356 630 L 380 660"/>`;
  inner += `<path d="M 244 630 q 14 -16 28 0 M 328 630 q 14 -16 28 0"/>`;
  inner += `<path d="M 404 380 C 438 360, 458 376, 456 404 C 454 432, 424 444, 404 424"/>`;
  inner += `<path d="M 404 380 L 380 400 M 404 424 L 380 404"/>`;
  inner += `<circle cx="480" cy="200" r="42"/><ellipse cx="480" cy="200" rx="64" ry="16" transform="rotate(-18 480 200)"/>`;
  inner += starSvg(c, 120, 190, 18, 5) + starSvg(c, 150, 240, 10, 5) + starSvg(c, 460, 120, 10, 5);
  inner += `<circle cx="120" cy="470" r="30"/><circle cx="106" cy="460" r="10"/><circle cx="132" cy="480" r="7"/>`;
  inner += `<path d="M 70 700 H 530"/>`;
  return pen(c, inner);
}

/* ---------------------------------------------------------------- fantasy */

function unicorn(c) {
  let inner = `<circle cx="300" cy="320" r="96"/>`;
  inner += `<path d="M 264 240 L 300 140 L 336 240"/>`;
  inner += `<path d="M 266 236 L 300 160 L 334 236"/>`;
  inner += `<path d="M 300 160 q 12 -14 24 0 M 300 186 q 12 -14 24 0 M 300 212 q 12 -14 24 0"/>`;
  inner += `<path d="M 216 300 L 190 240 L 250 280 M 384 300 L 410 240 L 350 280"/>`;
  inner += `<circle cx="268" cy="322" r="8" fill="${c.C}" stroke="none"/><circle cx="332" cy="322" r="8" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 300 342 q 14 14 28 0"/>`;
  inner += `<path d="M 288 360 q 26 18 52 0"/>`;
  inner += `<path d="M 240 270 C 220 300, 226 350, 248 380 C 268 406, 284 420, 280 456 C 276 490, 248 500, 240 476 C 234 458, 252 448, 264 460"/>`;
  inner += `<path d="M 360 270 C 384 300, 376 350, 352 382 C 332 410, 316 424, 320 460 C 324 494, 352 500, 360 476 C 366 458, 348 448, 336 460"/>`;
  inner += `<path d="M 244 360 C 220 410, 220 480, 244 530 L 356 530 C 380 480, 380 410, 356 360"/>`;
  inner += `<path d="M 262 396 q 38 24 76 0 M 252 442 q 48 26 96 0 M 246 488 q 54 24 108 0"/>`;
  inner += `<path d="M 262 530 L 254 630 L 226 660 M 338 530 L 346 630 L 374 660"/>`;
  inner += `<path d="M 254 630 q 14 -16 28 0 M 326 630 q 14 -16 28 0"/>`;
  inner += `<path d="M 470 620 C 440 590, 430 540, 456 510 C 480 484, 520 496, 526 530 C 532 566, 504 586, 480 570"/>`;
  inner += `<path d="M 456 510 L 440 480 M 432 520 L 412 500 M 436 550 L 412 546"/>`;
  inner += `<path d="M 300 544 C 280 590, 280 630, 300 670 C 320 630, 320 590, 300 544 Z"/>`;
  inner += starSvg(c, 120, 180, 18, 5) + starSvg(c, 480, 200, 16, 5) + starSvg(c, 140, 480, 12, 5);
  inner += `<path d="M 70 700 Q 180 676 300 696 Q 420 716 530 690"/>`;
  return pen(c, inner);
}

function castle(c) {
  let inner = `<path d="M 120 680 L 120 360 L 180 360 L 180 320 L 220 320 L 220 360 L 260 360 L 260 680 Z"/>`;
  inner += `<path d="M 340 680 L 340 360 L 380 360 L 380 320 L 420 320 L 420 360 L 480 360 L 480 680 Z"/>`;
  inner += `<path d="M 260 680 L 260 300 L 340 300 L 340 680 Z"/>`;
  inner += `<path d="M 120 360 L 120 320 L 140 320 L 140 290 L 160 290 L 160 320 L 180 320"/>`;
  inner += `<path d="M 420 360 L 420 320 L 440 320 L 440 290 L 460 290 L 460 320 L 480 320"/>`;
  inner += `<path d="M 260 300 L 260 250 L 280 250 L 280 220 L 320 220 L 320 250 L 340 250 L 340 300"/>`;
  inner += `<path d="M 300 220 L 300 180 L 330 190 L 300 200"/>`;
  inner += `<path d="M 160 290 L 160 250 L 180 260 L 160 270 M 440 290 L 440 250 L 420 260 L 440 270"/>`;
  inner += `<path d="M 270 680 L 270 500 C 270 444, 330 444, 330 500 L 330 680 Z"/>`;
  inner += `<path d="M 282 680 L 282 508 C 282 470, 318 470, 318 508 L 318 680 Z"/>`;
  inner += `<path d="M 146 420 q 20 -18 40 0 v 40 h -40 Z M 414 420 q 20 -18 40 0 v 40 h -40 Z"/>`;
  inner += `<path d="M 166 420 v 40 M 434 420 v 40"/>`;
  inner += `<path d="M 286 360 q 14 -14 28 0 v 40 h -28 Z"/>`;
  inner += `<path d="M 290 360 v 40 M 310 360 v 40"/>`;
  inner += `<path d="M 160 520 q 20 -18 40 0 v 40 h -40 Z M 400 520 q 20 -18 40 0 v 40 h -40 Z"/>`;
  inner += `<path d="M 180 520 v 40 M 420 520 v 40"/>`;
  inner += `<path d="M 100 680 H 500 M 80 706 H 520"/>`;
  inner += `<path d="M 130 700 q 20 -14 40 0 q 20 14 40 0 M 390 700 q 20 -14 40 0 q 20 14 40 0"/>`;
  inner += cloudSvg(c, 110, 180, 36);
  inner += cloudSvg(c, 490, 200, 30);
  inner += `<circle cx="480" cy="150" r="30"/>`;
  inner += `<path d="M 60 620 L 40 706 H 90 Z M 540 620 L 560 706 H 510 Z"/>`;
  return pen(c, inner);
}

function dragon(c) {
  let inner = `<path d="M 130 520 C 130 440, 190 390, 280 390 C 350 390, 400 420, 430 470 C 450 500, 470 520, 500 500 C 520 486, 536 500, 528 522 C 516 552, 478 566, 448 548"/>`;
  inner += `<path d="M 280 390 C 280 330, 300 290, 350 280 C 380 274, 410 292, 412 322 C 414 350, 392 368, 366 362"/>`;
  inner += `<circle cx="372" cy="312" r="8" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 408 316 q 14 8 26 0 M 412 330 q 16 4 26 -6"/>`;
  inner += `<path d="M 350 280 L 338 250 L 362 264 L 366 236 L 384 262"/>`;
  inner += `<path d="M 170 420 L 130 350 L 200 380 L 196 314 L 246 370 L 262 310 L 300 378"/>`;
  inner += `<path d="M 160 500 L 120 480 L 156 460 L 118 430 L 166 430"/>`;
  inner += `<path d="M 210 410 C 260 380, 340 460, 300 520 C 250 590, 150 550, 190 470"/>`;
  inner += `<path d="M 214 470 q 30 -20 60 0 q 30 20 60 0"/>`;
  inner += `<path d="M 220 540 L 208 620 L 180 650 M 300 540 L 308 620 L 338 650 M 380 520 L 390 600 L 420 630"/>`;
  inner += `<path d="M 208 620 q 14 -16 28 0 M 308 620 q 14 -16 28 0 M 390 600 q 14 -16 28 0"/>`;
  inner += `<path d="M 380 470 C 420 440, 460 444, 486 470 C 464 488, 424 492, 380 470 Z"/>`;
  inner += cloudSvg(c, 110, 200, 36);
  inner += cloudSvg(c, 490, 220, 30);
  inner += `<circle cx="480" cy="160" r="30"/>`;
  inner += starSvg(c, 120, 280, 14, 5) + starSvg(c, 500, 330, 12, 5);
  inner += `<path d="M 60 700 H 540"/>`;
  return pen(c, inner);
}

function moon(c) {
  let inner = `<path d="M 360 180 C 246 204, 184 314, 222 430 C 258 542, 386 584, 480 512 C 420 520, 348 468, 332 386 C 314 296, 372 222, 440 210 C 416 192, 388 182, 360 180 Z"/>`;
  inner += `<path d="M 356 260 C 308 278, 282 328, 298 380 C 312 428, 362 452, 406 434 C 374 430, 346 404, 340 368 C 332 326, 354 288, 384 270"/>`;
  inner += `<circle cx="338" cy="342" r="7" fill="${c.C}" stroke="none"/>`;
  inner += `<path d="M 320 382 Q 340 396 358 380"/>`;
  inner += `<path d="M 344 420 Q 360 432 376 418"/>`;
  inner += starSvg(c, 120, 190, 22, 5) + starSvg(c, 490, 170, 18, 5) + starSvg(c, 160, 470, 14, 5) + starSvg(c, 480, 500, 16, 5) + starSvg(c, 390, 130, 10, 5);
  inner += cloudSvg(c, 130, 570, 46);
  inner += cloudSvg(c, 470, 590, 38);
  inner += cloudSvg(c, 300, 650, 34);
  inner += `<path d="M 90 660 q 18 -18 36 0 q 18 -18 36 0 M 420 680 q 18 -18 36 0 q 18 -18 36 0"/>`;
  inner += dot(c, 110, 300, 4) + dot(c, 500, 300, 4) + dot(c, 90, 380, 3) + dot(c, 520, 400, 3);
  return pen(c, inner);
}

function magic(c) {
  let inner = `<circle cx="300" cy="360" r="110"/><circle cx="300" cy="360" r="90"/>`;
  inner += `<path d="M 238 460 L 220 550 L 380 550 L 362 460"/>`;
  inner += `<path d="M 220 550 L 190 600 L 410 600 L 380 550 Z"/>`;
  inner += `<path d="M 206 580 H 394"/>`;
  inner += `<path d="M 300 250 L 340 320 L 300 390 L 260 320 Z"/>`;
  inner += `<path d="M 300 278 L 320 320 L 300 362 L 280 320 Z"/>`;
  inner += `<path d="M 420 300 L 452 420 L 420 520 L 388 420 Z"/>`;
  inner += `<path d="M 400 330 H 440 M 394 380 H 446 M 392 430 H 448"/>`;
  inner += `<path d="M 420 300 L 420 270 M 410 280 L 430 260"/>`;
  inner += `<path d="M 160 430 L 130 560 L 190 560 Z"/>`;
  inner += `<path d="M 142 480 H 178 M 136 510 H 184"/>`;
  inner += `<path d="M 160 430 L 160 400"/>`;
  inner += `<path d="M 130 380 L 120 330 L 150 356 L 160 310 L 176 356 L 206 330 L 194 380 L 218 404 L 168 404 L 142 430 L 126 404 Z"/>`;
  inner += `<path d="M 90 660 H 510"/>`;
  inner += sparkle(c, 120, 230, 18) + sparkle(c, 500, 250, 16) + sparkle(c, 100, 610, 14) + sparkle(c, 500, 620, 16);
  inner += dot(c, 90, 310, 4) + dot(c, 520, 360, 4) + dot(c, 480, 150, 4);
  return pen(c, inner);
}

function rocket(c) {
  let inner = `<path d="M 300 170 C 360 220, 380 330, 356 470 L 244 470 C 220 330, 240 220, 300 170 Z"/>`;
  inner += `<circle cx="300" cy="310" r="42"/><circle cx="300" cy="310" r="30"/>`;
  inner += `<path d="M 244 380 L 186 470 L 240 470 M 356 380 L 414 470 L 360 470"/>`;
  inner += `<path d="M 258 470 C 258 520, 280 560, 300 590 C 320 560, 342 520, 342 470"/>`;
  inner += `<path d="M 272 470 C 272 510, 288 540, 300 560 C 312 540, 328 510, 328 470"/>`;
  inner += `<path d="M 300 470 L 300 560"/>`;
  inner += `<path d="M 264 210 q 36 -20 72 0"/>`;
  inner += `<circle cx="470" cy="240" r="44"/><ellipse cx="470" cy="240" rx="70" ry="16" transform="rotate(-18 470 240)"/>`;
  inner += `<circle cx="140" cy="500" r="30"/><circle cx="128" cy="490" r="9"/><circle cx="152" cy="510" r="6"/>`;
  inner += starSvg(c, 120, 230, 18, 5) + starSvg(c, 490, 390, 14, 5) + starSvg(c, 150, 330, 10, 5);
  inner += `<path d="M 70 700 H 530"/>`;
  inner += `<path d="M 90 690 q 20 -14 40 0 q 20 14 40 0 M 430 690 q 20 -14 40 0 q 20 14 40 0"/>`;
  return pen(c, inner);
}

module.exports = {
  superhero,
  robot,
  mermaid,
  fairy,
  pirate,
  clown,
  princess,
  astronaut,
  unicorn,
  castle,
  dragon,
  moon,
  magic,
  rocket,
};
