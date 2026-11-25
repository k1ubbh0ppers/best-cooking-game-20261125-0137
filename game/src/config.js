// Sizzle & Serve — game configuration: ingredients, recipes, kitchen layout, tuning.
// Every value here is original to this game; nothing is copied from another game.

export const VIEW = { width: 1280, height: 800 };
export const DAY_LENGTH = 150; // seconds per service
export const CHEF_SPEED = 270; // px per second
export const CHEF_RADIUS = 22;
export const INTERACT_RANGE = 105; // how close the chef must stand to use a station
export const CHOP_TIME = 1.5; // seconds of holding E at the board
export const GRILL_TIME = 6; // seconds for a raw patty to cook
export const BURN_TIME = 8; // seconds after cooked before a patty burns
export const ORDER_PATIENCE = 45; // seconds an order waits before the customer walks out
export const MAX_ORDERS = 3;

// Ingredient catalogue. `chopsTo` names the chopped form; `needsGrill` marks raw meat.
export const INGREDIENTS = {
  bun: { name: 'Bun', short: 'BUN', color: '#e8b96a', dark: '#c98f3d' },
  pattyRaw: { name: 'Raw Patty', short: 'PATTY', color: '#e58a8a', dark: '#c25e5e', needsGrill: true },
  patty: { name: 'Grilled Patty', short: 'PATTY', color: '#8a5a33', dark: '#5f3c1e' },
  pattyBurnt: { name: 'Burnt Patty', short: 'BURNT', color: '#3a2a22', dark: '#241812' },
  cheese: { name: 'Cheese', short: 'CHEESE', color: '#f7c948', dark: '#d9a41f' },
  tomato: { name: 'Tomato', short: 'TOMATO', color: '#e5484d', dark: '#b02a2e', chopsTo: 'tomatoChopped' },
  tomatoChopped: { name: 'Chopped Tomato', short: 'TOMATO', color: '#e5484d', dark: '#b02a2e' },
  lettuce: { name: 'Lettuce', short: 'LETTUCE', color: '#5cb85c', dark: '#3d8b3d', chopsTo: 'lettuceChopped' },
  lettuceChopped: { name: 'Chopped Lettuce', short: 'LETTUCE', color: '#7ed07e', dark: '#4a9a4a' },
  onion: { name: 'Onion', short: 'ONION', color: '#c9a7d4', dark: '#9a76a8', chopsTo: 'onionChopped' },
  onionChopped: { name: 'Chopped Onion', short: 'ONION', color: '#dcc6e8', dark: '#a887b8' },
};

// The menu: four original dishes, each a multiset of ingredients on one plate.
export const RECIPES = [
  { id: 'classic', name: 'Classic Burger', needs: ['bun', 'patty', 'cheese', 'lettuceChopped'], base: 100 },
  { id: 'garden', name: 'Garden Salad', needs: ['lettuceChopped', 'tomatoChopped', 'onionChopped'], base: 90 },
  { id: 'double', name: 'Double Stack', needs: ['bun', 'patty', 'patty', 'cheese', 'tomatoChopped'], base: 140 },
  { id: 'veggie', name: 'Veggie Stack', needs: ['bun', 'lettuceChopped', 'tomatoChopped', 'onionChopped', 'cheese'], base: 120 },
];

// Kitchen stations. Rects are in canvas pixels; the floor starts below the order board.
export const STATIONS = [
  { id: 'crate-bun', kind: 'crate', gives: 'bun', label: 'BUNS', x: 24, y: 150, w: 132, h: 76 },
  { id: 'crate-patty', kind: 'crate', gives: 'pattyRaw', label: 'PATTIES', x: 24, y: 242, w: 132, h: 76 },
  { id: 'crate-cheese', kind: 'crate', gives: 'cheese', label: 'CHEESE', x: 24, y: 334, w: 132, h: 76 },
  { id: 'crate-tomato', kind: 'crate', gives: 'tomato', label: 'TOMATOES', x: 24, y: 426, w: 132, h: 76 },
  { id: 'crate-lettuce', kind: 'crate', gives: 'lettuce', label: 'LETTUCE', x: 24, y: 518, w: 132, h: 76 },
  { id: 'crate-onion', kind: 'crate', gives: 'onion', label: 'ONIONS', x: 24, y: 610, w: 132, h: 76 },
  { id: 'board', kind: 'board', label: 'CHOPPING BOARD', x: 300, y: 150, w: 200, h: 96 },
  { id: 'grill', kind: 'grill', label: 'GRILL', x: 580, y: 150, w: 260, h: 104 },
  { id: 'assembly', kind: 'assembly', label: 'PLATING COUNTER', x: 520, y: 648, w: 280, h: 92 },
  { id: 'window', kind: 'window', label: 'SERVING WINDOW', x: 1096, y: 250, w: 160, h: 150 },
  { id: 'trash', kind: 'trash', label: 'TRASH', x: 1112, y: 600, w: 128, h: 92 },
];

// Small deterministic RNG so staged screenshots always look the same.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function sameMultiset(a, b) {
  if (a.length !== b.length) return false;
  const count = new Map();
  for (const item of a) count.set(item, (count.get(item) ?? 0) + 1);
  for (const item of b) {
    const left = count.get(item) ?? 0;
    if (left === 0) return false;
    count.set(item, left - 1);
  }
  return true;
}
