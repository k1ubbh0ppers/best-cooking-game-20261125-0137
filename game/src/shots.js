// Sizzle & Serve — screenshot scenes. Each scene builds a real game state (the same
// state the live game uses) and poses it mid-service, so a screenshot is a true
// render of the game's own code, not a mock-up. Scenes are deterministic: fixed
// seeds and fixed values, so the same URL always gives the same frame.

import { RECIPES } from './config.js';
import { createState, addPopup } from './state.js';

function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id);
}

function makeOrder(id, recipeId, patience) {
  return {
    id,
    recipe: recipeById(recipeId),
    patience,
    maxPatience: 45,
    bornAt: 0,
  };
}

/**
 * Pose `state` as the named scene and return the screen the renderer should draw.
 * Scenes: 'cover' | 'play' | 'serve' | 'end'. Anything else is the cover.
 */
export function stageShot(name, state) {
  const fresh = createState(20261125);
  Object.keys(fresh).forEach((key) => { state[key] = fresh[key]; });
  state.screen = 'play';

  if (name === 'play') {
    state.elapsed = 88;
    state.dayLeft = 62;
    state.score = 540;
    state.served = 5;
    state.combo = 4;
    state.bestCombo = 4;
    state.orders = [
      makeOrder(5, 'classic', 8),
      makeOrder(6, 'double', 31),
    ];
    state.chef.x = 700;
    state.chef.y = 300;
    state.chef.holding = 'patty';
    state.plate = { items: ['bun', 'patty', 'cheese', 'lettuceChopped'] };
    state.grill = [
      { item: 'pattyRaw', progress: 4.2 },
      { item: null, progress: 0 },
    ];
    state.board = { item: 'tomato', progress: 0.9 };
    addPopup(state, 700, 240, 'GRILLED!', '#2f9e44');
    return;
  }

  if (name === 'serve') {
    state.elapsed = 110;
    state.dayLeft = 40;
    state.score = 700;
    state.served = 7;
    state.combo = 2;
    state.bestCombo = 5;
    state.orders = [
      makeOrder(7, 'classic', 22),
      makeOrder(8, 'garden', 38),
    ];
    state.chef.x = 1040;
    state.chef.y = 330;
    state.chef.dir = 1;
    state.chef.holding = { plate: ['bun', 'patty', 'cheese', 'lettuceChopped'] };
    state.plate = { items: [] };
    state.grill = [
      { item: 'patty', progress: 2.0 },
      { item: null, progress: 0 },
    ];
    state.board = { item: 'lettuceChopped', progress: 0 };
    addPopup(state, 1000, 250, '+160  CLASSIC BURGER!', '#2f9e44');
    return;
  }

  if (name === 'end') {
    state.elapsed = 150;
    state.dayLeft = 0;
    state.score = 1240;
    state.served = 9;
    state.failed = 2;
    state.missed = 1;
    state.combo = 0;
    state.bestCombo = 5;
    state.orders = [];
    state.screen = 'over';
    state.chef.x = 640;
    state.chef.y = 430;
    return;
  }

  // 'cover' (default): the busiest, most readable frame — three tickets on the
  // board, a plate mid-assembly, a patty on the grill, chopping in progress,
  // and the chef carrying chopped tomato across the kitchen.
  state.elapsed = 45;
  state.dayLeft = 105;
  state.score = 320;
  state.served = 3;
  state.combo = 2;
  state.bestCombo = 3;
  state.orders = [
    makeOrder(2, 'classic', 30),
    makeOrder(3, 'garden', 18),
    makeOrder(4, 'double', 38),
  ];
  state.chef.x = 640;
  state.chef.y = 430;
  state.chef.dir = 1;
  state.chef.holding = 'tomatoChopped';
  state.plate = { items: ['bun', 'patty', 'cheese'] };
  state.grill = [
    { item: 'pattyRaw', progress: 3.6 },
    { item: 'patty', progress: 1.5 },
  ];
  state.board = { item: 'lettuce', progress: 0.75 };
}
