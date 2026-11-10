'use strict';

// ---------------------------------------------------------------------------
// Design gallery: merges every design module and maps each book theme to a
// pool of distinct, full-page colouring designs.
// ---------------------------------------------------------------------------

const nature = require('./art-designs-nature');
const animals = require('./art-designs-animals');
const cartoons = require('./art-designs-cartoons');
const travel = require('./art-designs-travel');

const DESIGNS = {
  ...nature,
  ...animals,
  ...cartoons,
  ...travel,
};

const THEME_POOLS = {
  mandala: [
    'mandalaPetals', 'mandalaRings', 'mandalaGeo', 'mandalaLotus', 'kaleidoscope',
    'paisleyDesign', 'swirls', 'mosaic', 'stars', 'bubbles', 'waves', 'hearts',
    'shapes', 'wreath', 'rangoli', 'snowflakes', 'fireworks', 'compass', 'ornament',
    'lantern', 'butterflyDesign', 'flowers', 'lotus', 'rose', 'sunDesign', 'seashell',
    'donut', 'rainbow', 'peacock',
  ],
  animals: [
    'cat', 'dog', 'elephant', 'lion', 'owl', 'bird', 'fish', 'turtle', 'octopus',
    'rabbit', 'panda', 'frog', 'deer', 'dino', 'whale', 'crab', 'seahorse', 'peacock',
    'tiger', 'bee', 'snail', 'butterflyDesign', 'mushrooms', 'tree', 'garden', 'banyan',
    'mountain', 'lotus', 'rainbow', 'sunDesign',
  ],
  kids: [
    'shapes', 'hearts', 'stars', 'bubbles', 'rainbow', 'fruits', 'watermelon',
    'strawberry', 'pineapple', 'grapes', 'cupcake', 'icecream', 'donut', 'sunDesign',
    'flowers', 'butterflyDesign', 'cat', 'dog', 'rabbit', 'panda', 'frog', 'dino',
    'unicorn', 'mermaid', 'superhero', 'robot', 'rocket', 'astronaut', 'princess',
    'clown', 'fairy', 'castle', 'tree', 'garden', 'beach', 'hotair', 'party', 'gift',
    'easter', 'snowflakes', 'moon', 'magic',
  ],
  floral: [
    'flowers', 'rose', 'sunflower', 'lotus', 'bouquet', 'wreath', 'potted', 'leaves',
    'tree', 'garden', 'butterflyDesign', 'bee', 'snail', 'mushrooms', 'cactus',
    'mandalaLotus', 'mandalaPetals', 'paisleyDesign', 'hearts', 'stars', 'sunDesign',
    'rainbow', 'mango', 'fruits', 'grapes', 'strawberry', 'pineapple', 'seashell',
    'snowflakes', 'lantern',
  ],
  fantasy: [
    'castle', 'dragon', 'unicorn', 'mermaid', 'fairy', 'princess', 'magic', 'moon',
    'rocket', 'astronaut', 'superhero', 'robot', 'snowflakes', 'stars', 'mushrooms',
    'owl', 'seahorse', 'whale', 'octopus', 'hotair', 'globe', 'gift', 'lantern',
    'fireworks', 'christmas', 'tree', 'garden', 'rainbow', 'butterflyDesign', 'flowers',
  ],
  stress: [
    'mosaic', 'swirls', 'kaleidoscope', 'paisleyDesign', 'mandalaPetals', 'mandalaRings',
    'mandalaGeo', 'mandalaLotus', 'stars', 'bubbles', 'waves', 'hearts', 'shapes',
    'snowflakes', 'rangoli', 'compass', 'leaves', 'wreath', 'lantern', 'fireworks',
    'flowers', 'rose', 'sunDesign', 'seashell', 'donut', 'ornament', 'butterflyDesign',
    'snail', 'lighthouse', 'tree',
  ],
  travel: [
    'plane', 'globe', 'lighthouse', 'beach', 'hotair', 'camper', 'sailboat', 'landmark',
    'compass', 'city', 'waves', 'mountain', 'cactus', 'seashell', 'sunDesign', 'tree',
    'garden', 'indiaGate', 'tiranga', 'diya', 'rangoli', 'mango', 'banyan', 'ganga',
    'christmas', 'fireworks', 'party', 'gift', 'lantern', 'snowflakes', 'moon', 'stars',
  ],
  festive: [
    'diya', 'rangoli', 'christmas', 'ornament', 'gift', 'lantern', 'fireworks', 'pumpkin',
    'easter', 'party', 'wreath', 'snowflakes', 'stars', 'hearts', 'cupcake', 'donut',
    'paisleyDesign', 'mandalaPetals', 'mandalaRings', 'flowers', 'lotus', 'sunDesign',
    'tree', 'castle', 'moon', 'hotair', 'rainbow', 'butterflyDesign', 'peacock', 'mango',
  ],
  cartoons: [
    'superhero', 'robot', 'mermaid', 'fairy', 'pirate', 'clown', 'princess', 'astronaut',
    'unicorn', 'castle', 'dragon', 'moon', 'magic', 'rocket', 'cat', 'dog', 'rabbit',
    'panda', 'frog', 'dino', 'owl', 'bird', 'fish', 'turtle', 'elephant', 'lion', 'deer',
    'snowflakes', 'stars', 'rainbow', 'party', 'gift',
  ],
  india: [
    'tiranga', 'ashokaChakra', 'indiaGate', 'peacock', 'tiger', 'lotus', 'mango', 'banyan',
    'ganga', 'elephant', 'rangoli', 'diya', 'mandalaLotus', 'mandalaPetals', 'mandalaRings',
    'mandalaGeo', 'kaleidoscope', 'paisleyDesign', 'flowers', 'rose', 'sunflower',
    'wreath', 'sunDesign', 'mountain', 'seashell', 'tree', 'garden', 'landmark', 'lantern',
    'fireworks', 'party', 'snowflakes',
  ],
};

const COVER_DESIGN_POOLS = {
  mandala: ['mandalaPetals', 'mandalaRings', 'mandalaGeo', 'mandalaLotus', 'kaleidoscope', 'paisleyDesign'],
  animals: ['peacock', 'lion', 'elephant', 'tiger', 'owl', 'bird'],
  kids: ['rainbow', 'superhero', 'unicorn', 'mermaid', 'rocket', 'dino'],
  floral: ['flowers', 'rose', 'sunflower', 'lotus', 'bouquet', 'wreath'],
  fantasy: ['unicorn', 'castle', 'dragon', 'moon', 'fairy', 'mermaid'],
  stress: ['kaleidoscope', 'mosaic', 'swirls', 'paisleyDesign', 'mandalaGeo', 'mandalaRings'],
  travel: ['globe', 'plane', 'lighthouse', 'beach', 'hotair', 'landmark'],
  festive: ['rangoli', 'diya', 'lantern', 'fireworks', 'christmas', 'ornament'],
  cartoons: ['superhero', 'robot', 'mermaid', 'fairy', 'pirate', 'clown', 'princess', 'astronaut'],
  india: ['ashokaChakra', 'tiranga', 'peacock', 'tiger', 'lotus', 'indiaGate', 'banyan', 'ganga'],
};

const COVER_DESIGNS = {
  mandala: 'mandalaPetals',
  animals: 'peacock',
  kids: 'rainbow',
  floral: 'flowers',
  fantasy: 'unicorn',
  stress: 'kaleidoscope',
  travel: 'globe',
  festive: 'rangoli',
  cartoons: 'superhero',
  india: 'ashokaChakra',
};

const PAGE_COUNT = 25;

function themeKey(theme) {
  const key = String(theme || '').toLowerCase();
  if (key === 'paisley') return 'stress';
  return THEME_POOLS[key] ? key : 'mandala';
}

function poolFor(theme) {
  return THEME_POOLS[themeKey(theme)];
}

function designNames(theme) {
  return poolFor(theme).slice();
}

function designFor(theme, pageIndex = 0) {
  const pool = poolFor(theme);
  const name = pool[((pageIndex % pool.length) + pool.length) % pool.length];
  return DESIGNS[name];
}

function coverDesignFor(theme, seed = 0) {
  const key = themeKey(theme);
  const pool = COVER_DESIGN_POOLS[key] || [COVER_DESIGNS[key]];
  const name = pool[Math.abs(Math.floor(Number(seed) || 0)) % pool.length];
  return DESIGNS[name] || DESIGNS[COVER_DESIGNS[key]] || DESIGNS.mandalaPetals;
}

// Returns exactly PAGE_COUNT distinct design functions for a book. A rotating
// start point keyed to the product keeps different titles in the same
// collection visually varied while every book still gets 25 unique pages.
function pageDesigns(theme, variant = 0, seed = 0) {
  const pool = poolFor(theme);
  const start = Math.abs((Number(variant) || 0) * 5 + (Number(seed) || 0) * 7) % pool.length;
  const out = [];
  for (let i = 0; i < PAGE_COUNT; i++) {
    out.push(DESIGNS[pool[(start + i) % pool.length]]);
  }
  return out;
}

module.exports = {
  DESIGNS,
  THEME_POOLS,
  COVER_DESIGNS,
  COVER_DESIGN_POOLS,
  PAGE_COUNT,
  themeKey,
  poolFor,
  designNames,
  designFor,
  coverDesignFor,
  pageDesigns,
};
