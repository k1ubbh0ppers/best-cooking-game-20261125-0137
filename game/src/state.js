// Sizzle & Serve — game state: creating a fresh service, spawning orders, scoring serves.
// Pure state transitions live here; input and drawing live in their own files.

import {
  DAY_LENGTH, MAX_ORDERS, ORDER_PATIENCE, RECIPES, mulberry32, sameMultiset,
} from './config.js';

let orderCounter = 0;

export function createState(seed = 20261125) {
  orderCounter = 0;
  return {
    seed,
    random: mulberry32(seed),
    screen: 'title', // 'title' | 'play' | 'paused' | 'over'
    elapsed: 0,
    dayLeft: DAY_LENGTH,
    score: 0,
    served: 0,
    failed: 0,
    missed: 0,
    combo: 0,
    bestCombo: 0,
    orders: [],
    spawnIn: 1.5,
    chef: {
      x: 640, y: 430, dir: 1, moving: false,
      holding: null, // an ingredient id, or { plate: [ingredient ids] }
      moveTarget: null,
    },
    board: { item: null, progress: 0 }, // item on the chopping board
    grill: [
      { item: null, progress: 0 }, // item: 'pattyRaw' | 'patty' | 'pattyBurnt'
      { item: null, progress: 0 },
    ],
    plate: { items: [] }, // the plate resting on the plating counter, or null while carried
    popups: [], // { x, y, text, color, life }
    hints: [],
    muted: false,
  };
}

export function isPlate(holding) {
  return holding !== null && typeof holding === 'object' && Array.isArray(holding.plate);
}

export function holdingName(state) {
  const holding = state.chef.holding;
  if (holding === null) return 'empty hands';
  if (isPlate(holding)) return holding.plate.length === 0 ? 'an empty plate' : `a plate (${holding.plate.length} items)`;
  return holding;
}

function pickRecipe(state) {
  const index = Math.floor(state.random() * RECIPES.length);
  return RECIPES[index];
}

export function spawnOrder(state) {
  const recipe = pickRecipe(state);
  orderCounter += 1;
  state.orders.push({
    id: orderCounter,
    recipe,
    patience: ORDER_PATIENCE,
    maxPatience: ORDER_PATIENCE,
    bornAt: state.elapsed,
  });
}

export function nextSpawnDelay(state) {
  // The rush tightens as the service goes on: 14s at the start, 8s by the end.
  return Math.max(8, 14 - state.elapsed * 0.045);
}

export function addPopup(state, x, y, text, color) {
  state.popups.push({ x, y, text, color, life: 1.6 });
}

export function addHint(state, text) {
  state.hints.push({ text, life: 2.2 });
  if (state.hints.length > 2) state.hints.shift();
}

/**
 * Serve the plate the chef is holding at the window. Returns 'served' when the
 * plate matches an open ticket, 'wrong' when it does not, 'empty' with no plate.
 */
export function servePlate(state) {
  const holding = state.chef.holding;
  if (!isPlate(holding)) return 'empty';
  const plate = holding.plate;
  if (plate.length === 0) {
    addHint(state, 'The plate is empty — build a dish first!');
    return 'empty';
  }
  let matchIndex = -1;
  let matchLeft = Infinity;
  for (let i = 0; i < state.orders.length; i += 1) {
    const order = state.orders[i];
    if (sameMultiset(order.recipe.needs, plate) && order.patience < matchLeft) {
      matchIndex = i;
      matchLeft = order.patience;
    }
  }
  if (matchIndex === -1) {
    state.failed += 1;
    state.combo = 0;
    state.score = Math.max(0, state.score - 20);
    addPopup(state, 1150, 300, '-20  WRONG DISH', '#e5484d');
    addHint(state, 'No ticket matches that plate — it went in the bin.');
    state.chef.holding = null;
    return 'wrong';
  }
  const order = state.orders[matchIndex];
  state.orders.splice(matchIndex, 1);
  const tip = Math.round((order.patience / order.maxPatience) * 50);
  const comboBonus = state.combo * 10;
  const earned = order.recipe.base + tip + comboBonus;
  state.score += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  addPopup(state, 1150, 300, `+${earned}  ${order.recipe.name.toUpperCase()}!`, '#2f9e44');
  if (state.combo >= 3) addPopup(state, 1150, 340, `COMBO x${state.combo}`, '#f08c00');
  state.chef.holding = null;
  return 'served';
}

/** Advance timers that run on their own: orders, grill, day clock, popups. */
export function tickTimers(state, dt) {
  state.elapsed += dt;
  state.dayLeft = Math.max(0, state.dayLeft - dt);

  for (let i = state.orders.length - 1; i >= 0; i -= 1) {
    const order = state.orders[i];
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders.splice(i, 1);
      state.missed += 1;
      state.combo = 0;
      addPopup(state, 640, 120, 'A customer walked out!', '#e5484d');
    }
  }

  for (const slot of state.grill) {
    if (slot.item === 'pattyRaw' || slot.item === 'patty') slot.progress += dt;
  }

  if (state.orders.length < MAX_ORDERS) {
    state.spawnIn -= dt;
    if (state.spawnIn <= 0) {
      spawnOrder(state);
      state.spawnIn = nextSpawnDelay(state);
    }
  }

  for (let i = state.popups.length - 1; i >= 0; i -= 1) {
    const popup = state.popups[i];
    popup.life -= dt;
    popup.y -= 22 * dt;
    if (popup.life <= 0) state.popups.splice(i, 1);
  }
  for (let i = state.hints.length - 1; i >= 0; i -= 1) {
    state.hints[i].life -= dt;
    if (state.hints[i].life <= 0) state.hints.splice(i, 1);
  }

  if (state.dayLeft <= 0 && state.screen === 'play') {
    state.screen = 'over';
  }
}

export function resetService(state) {
  const fresh = createState(state.seed);
  Object.keys(fresh).forEach((key) => { state[key] = fresh[key]; });
  state.screen = 'play';
  spawnOrder(state);
  state.spawnIn = nextSpawnDelay(state);
}
