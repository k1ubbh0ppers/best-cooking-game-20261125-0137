// Sizzle & Serve — actions: what happens when the chef uses a station, and the
// per-frame updates for movement, chopping and grilling.

import {
  BURN_TIME, CHEF_RADIUS, CHEF_SPEED, CHOP_TIME, GRILL_TIME, INTERACT_RANGE,
  INGREDIENTS, STATIONS, clamp,
} from './config.js';
import { addHint, addPopup, isPlate, servePlate } from './state.js';

export function stationCentre(station) {
  return { x: station.x + station.w / 2, y: station.y + station.h / 2 };
}

export function nearestStation(chef) {
  let best = null;
  let bestDistance = Infinity;
  for (const station of STATIONS) {
    const centre = stationCentre(station);
    const distance = Math.hypot(chef.x - centre.x, chef.y - centre.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = station;
    }
  }
  return bestDistance <= INTERACT_RANGE + Math.max(best.w, best.h) / 2 ? best : null;
}

function stationAtPoint(x, y) {
  for (const station of STATIONS) {
    if (x >= station.x - 8 && x <= station.x + station.w + 8
      && y >= station.y - 8 && y <= station.y + station.h + 8) return station;
  }
  return null;
}

/** Move the chef toward a click: a station click walks to its front, else to the point. */
export function handleClick(state, click) {
  const station = stationAtPoint(click.x, click.y);
  if (station) {
    const centre = stationCentre(station);
    const dx = state.chef.x - centre.x;
    const dy = state.chef.y - centre.y;
    const length = Math.hypot(dx, dy) || 1;
    const reach = Math.max(station.w, station.h) / 2 + CHEF_RADIUS + 18;
    state.chef.moveTarget = {
      x: centre.x + (dx / length) * reach,
      y: centre.y + (dy / length) * reach,
      stationId: station.id,
    };
  } else {
    state.chef.moveTarget = { x: clamp(click.x, 170, 1260), y: clamp(click.y, 130, 780), stationId: null };
  }
}

export function updateMovement(state, dt, vector) {
  const chef = state.chef;
  let vx = 0;
  let vy = 0;
  if (vector) {
    vx = vector.x;
    vy = vector.y;
    chef.moveTarget = null;
  } else if (chef.moveTarget) {
    const dx = chef.moveTarget.x - chef.x;
    const dy = chef.moveTarget.y - chef.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 6) {
      if (chef.moveTarget.stationId) {
        const station = STATIONS.find((item) => item.id === chef.moveTarget.stationId);
        if (station) interact(state, station);
      }
      chef.moveTarget = null;
    } else {
      vx = dx / distance;
      vy = dy / distance;
    }
  }
  if (vx !== 0 || vy !== 0) {
    chef.moving = true;
    if (vx !== 0) chef.dir = vx > 0 ? 1 : -1;
    chef.x = clamp(chef.x + vx * CHEF_SPEED * dt, 170, 1262);
    chef.y = clamp(chef.y + vy * CHEF_SPEED * dt, 132, 782);
    // Keep the chef out of the counters: push out of any station rect they overlap.
    for (const station of STATIONS) {
      if (chef.x > station.x - CHEF_RADIUS && chef.x < station.x + station.w + CHEF_RADIUS
        && chef.y > station.y - CHEF_RADIUS && chef.y < station.y + station.h + CHEF_RADIUS) {
        const pushLeft = chef.x - (station.x - CHEF_RADIUS);
        const pushRight = station.x + station.w + CHEF_RADIUS - chef.x;
        const pushTop = chef.y - (station.y - CHEF_RADIUS);
        const pushBottom = station.y + station.h + CHEF_RADIUS - chef.y;
        const smallest = Math.min(pushLeft, pushRight, pushTop, pushBottom);
        if (smallest === pushLeft) chef.x = station.x - CHEF_RADIUS;
        else if (smallest === pushRight) chef.x = station.x + station.w + CHEF_RADIUS;
        else if (smallest === pushTop) chef.y = station.y - CHEF_RADIUS;
        else chef.y = station.y + station.h + CHEF_RADIUS;
      }
    }
  } else {
    chef.moving = false;
  }
}

/** Hold-to-chop: while E is held near the board, a raw item on it becomes chopped. */
export function updateChopping(state, dt, interactHeld) {
  const board = state.board;
  if (!board.item) return;
  const info = INGREDIENTS[board.item];
  if (!info || !info.chopsTo) return;
  const station = STATIONS.find((item) => item.id === 'board');
  const centre = stationCentre(station);
  const near = Math.hypot(state.chef.x - centre.x, state.chef.y - centre.y)
    <= INTERACT_RANGE + station.w / 2;
  if (near && interactHeld) {
    board.progress += dt;
    if (board.progress >= CHOP_TIME) {
      board.item = info.chopsTo;
      board.progress = 0;
      addPopup(state, centre.x, station.y - 12, 'CHOPPED!', '#2f9e44');
    }
  }
}

/** Grill slots cook on their own; a cooked patty left too long burns. */
export function updateGrill(state) {
  for (const slot of state.grill) {
    if (slot.item === 'pattyRaw' && slot.progress >= GRILL_TIME) {
      slot.item = 'patty';
      slot.progress = 0;
    } else if (slot.item === 'patty' && slot.progress >= BURN_TIME) {
      slot.item = 'pattyBurnt';
      slot.progress = 0;
    }
  }
}

function addToPlate(state, ingredient) {
  const holding = state.chef.holding;
  if (isPlate(holding)) {
    holding.plate.push(ingredient);
    return true;
  }
  if (state.plate) {
    state.plate.items.push(ingredient);
    return true;
  }
  return false;
}

/** One press of E (or Space) at the nearest station. */
export function interact(state, station) {
  const chef = state.chef;
  if (!station) return;
  const holding = chef.holding;

  if (station.kind === 'crate') {
    const ingredient = station.gives;
    if (isPlate(holding)) {
      addToPlate(state, ingredient);
      addPopup(state, chef.x, chef.y - 46, `+ ${INGREDIENTS[ingredient].name.toUpperCase()}`, '#495057');
    } else if (holding === null) {
      chef.holding = ingredient;
    } else {
      addHint(state, 'Hands full — serve or bin what you are holding first.');
    }
    return;
  }

  if (station.kind === 'board') {
    const board = state.board;
    if (board.item === null) {
      if (holding !== null && !isPlate(holding) && INGREDIENTS[holding].chopsTo) {
        board.item = holding;
        board.progress = 0;
        chef.holding = null;
      } else if (holding !== null && !isPlate(holding)) {
        addHint(state, 'Only tomato, lettuce and onion need chopping.');
      } else if (isPlate(holding)) {
        addHint(state, 'Put a tomato, lettuce or onion on the board to chop it.');
      } else {
        addHint(state, 'Bring a tomato, lettuce or onion to chop.');
      }
      return;
    }
    const info = INGREDIENTS[board.item];
    if (info.chopsTo && board.item !== info.chopsTo) {
      addHint(state, 'Hold E at the board to chop it.');
      return;
    }
    if (isPlate(holding)) {
      holding.plate.push(board.item);
      board.item = null;
      board.progress = 0;
    } else if (holding === null) {
      chef.holding = board.item;
      board.item = null;
      board.progress = 0;
    } else {
      addHint(state, 'Hands full — pick the chopped food up with empty hands.');
    }
    return;
  }

  if (station.kind === 'grill') {
    const cooked = state.grill.find((slot) => slot.item === 'patty');
    const rawSlot = state.grill.find((slot) => slot.item === null);
    const burnt = state.grill.find((slot) => slot.item === 'pattyBurnt');
    if (holding === 'pattyRaw' && rawSlot) {
      rawSlot.item = 'pattyRaw';
      rawSlot.progress = 0;
      chef.holding = null;
      return;
    }
    if (burnt) {
      addHint(state, 'That patty burnt! Pick it up and bin it.');
      if (holding === null) {
        chef.holding = 'pattyBurnt';
        burnt.item = null;
        burnt.progress = 0;
      }
      return;
    }
    if (cooked) {
      if (isPlate(holding)) {
        holding.plate.push('patty');
        cooked.item = null;
        cooked.progress = 0;
      } else if (holding === null) {
        chef.holding = 'patty';
        cooked.item = null;
        cooked.progress = 0;
      } else {
        addHint(state, 'Hands full — the grilled patty is ready when you are.');
      }
      return;
    }
    if (holding === 'pattyRaw') {
      addHint(state, 'Both grill slots are busy — wait a moment.');
    } else if (holding === null) {
      addHint(state, 'Bring a raw patty from the crate to grill it.');
    }
    return;
  }

  if (station.kind === 'assembly') {
    if (isPlate(holding)) {
      addHint(state, 'You already have the plate — add ingredients to it.');
      return;
    }
    if (holding !== null && !isPlate(holding)) {
      if (state.plate) {
        state.plate.items.push(holding);
        chef.holding = null;
      } else {
        addHint(state, 'Take a plate first, then add ingredients to it.');
      }
      return;
    }
    if (state.plate) {
      chef.holding = { plate: state.plate.items };
      state.plate = null;
    } else {
      chef.holding = { plate: [] };
      addHint(state, 'Fresh plate! Add ingredients, then serve at the window.');
    }
    return;
  }

  if (station.kind === 'window') {
    const result = servePlate(state);
    if (result === 'served') {
      state.plate = { items: [] };
    }
    return;
  }

  if (station.kind === 'trash') {
    if (isPlate(holding)) {
      holding.plate.length = 0;
      addHint(state, 'Plate emptied.');
    } else if (holding !== null) {
      addPopup(state, chef.x, chef.y - 46, 'BINNED', '#868e96');
      chef.holding = null;
    } else {
      addHint(state, 'Nothing to bin.');
    }
  }
}
