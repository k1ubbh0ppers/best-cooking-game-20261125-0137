// Sizzle & Serve — render: every pixel of the kitchen, drawn with canvas paths.
// No image assets: food, counters and the chef are all drawn from shapes.

import {
  BURN_TIME, CHOP_TIME, DAY_LENGTH, GRILL_TIME, INGREDIENTS, RECIPES, STATIONS, VIEW,
} from './config.js';
import { isPlate } from './state.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, weight = '700', align = 'center') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** Draw one ingredient as a small readable icon at (x, y) with radius r. */
export function drawFood(ctx, id, x, y, r) {
  const info = INGREDIENTS[id];
  if (!info) return;
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ctx.fillStyle = info.dark;
    roundRect(ctx, -r, -r * 0.35, r * 2, r * 0.7, r * 0.3);
    ctx.fill();
    ctx.fillStyle = info.color;
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r * 0.95, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath(); ctx.arc(-r * 0.4, -r * 0.55, r * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.1, -r * 0.75, r * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.5, -r * 0.45, r * 0.09, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'pattyRaw' || id === 'patty' || id === 'pattyBurnt') {
    ctx.fillStyle = info.dark;
    roundRect(ctx, -r, -r * 0.45, r * 2, r * 0.9, r * 0.35);
    ctx.fill();
    ctx.fillStyle = info.color;
    roundRect(ctx, -r * 0.88, -r * 0.32, r * 1.76, r * 0.64, r * 0.28);
    ctx.fill();
    if (id === 'patty') {
      ctx.strokeStyle = info.dark;
      ctx.lineWidth = r * 0.12;
      for (const offset of [-0.5, 0, 0.5]) {
        ctx.beginPath();
        ctx.moveTo(offset * r, -r * 0.3);
        ctx.lineTo(offset * r, r * 0.3);
        ctx.stroke();
      }
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = info.color;
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.7);
    ctx.lineTo(r, r * 0.7);
    ctx.lineTo(r, -r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = info.dark;
    ctx.beginPath(); ctx.arc(0, r * 0.25, r * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.45, r * 0.4, r * 0.1, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'tomato' || id === 'tomatoChopped') {
    ctx.fillStyle = info.color;
    if (id === 'tomato') {
      ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7ed07e';
      ctx.beginPath(); ctx.arc(0, -r * 0.7, r * 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.35, r * 0.22, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = info.dark;
      ctx.lineWidth = r * 0.14;
      ctx.beginPath(); ctx.moveTo(0, -r * 0.8); ctx.lineTo(0, r * 0.8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-r * 0.7, 0); ctx.lineTo(r * 0.7, 0); ctx.stroke();
    }
  } else if (id === 'lettuce' || id === 'lettuceChopped') {
    ctx.fillStyle = info.color;
    ctx.beginPath();
    for (let i = 0; i <= 10; i += 1) {
      const angle = (i / 10) * Math.PI * 2;
      const radius = r * (i % 2 === 0 ? 0.95 : 0.7);
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = info.dark;
    ctx.lineWidth = r * 0.1;
    ctx.beginPath(); ctx.moveTo(0, -r * 0.5); ctx.lineTo(0, r * 0.5); ctx.stroke();
  } else if (id === 'onion' || id === 'onionChopped') {
    ctx.fillStyle = info.color;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = info.dark;
    ctx.lineWidth = r * 0.12;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function drawPlate(ctx, items, x, y, scale = 1) {
  const r = 34 * scale;
  ctx.fillStyle = '#dee2e6';
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.beginPath(); ctx.ellipse(x, y, r * 0.78, r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
  const shown = items.slice(0, 6);
  shown.forEach((item, i) => {
    const offset = (i - (shown.length - 1) / 2) * 20 * scale;
    drawFood(ctx, item, x + offset, y - 10 * scale - i * 2, 13 * scale);
  });
}

function drawOrderTicket(ctx, order, x, y, w, h) {
  const urgency = order.patience / order.maxPatience;
  ctx.fillStyle = '#fff9db';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = urgency < 0.3 ? '#e5484d' : '#e9c46a';
  ctx.lineWidth = urgency < 0.3 ? 3 : 2;
  ctx.stroke();
  text(ctx, `#${order.id}  ${order.recipe.name.toUpperCase()}`, x + 12, y + 16, 14, '#343a40', '800', 'left');
  order.recipe.needs.forEach((item, i) => {
    drawFood(ctx, item, x + 22 + i * 34, y + 46, 13);
  });
  // Patience bar.
  ctx.fillStyle = '#e9ecef';
  roundRect(ctx, x + 12, y + h - 16, w - 24, 8, 4);
  ctx.fill();
  ctx.fillStyle = urgency > 0.5 ? '#2f9e44' : urgency > 0.25 ? '#f08c00' : '#e5484d';
  roundRect(ctx, x + 12, y + h - 16, Math.max(8, (w - 24) * urgency), 8, 4);
  ctx.fill();
  text(ctx, `${Math.ceil(order.patience)}s`, x + w - 12, y + 16, 13, urgency < 0.3 ? '#e5484d' : '#868e96', '800', 'right');
}

function drawStation(ctx, station, state, highlight) {
  const { x, y, w, h } = station;
  ctx.save();
  if (highlight) {
    ctx.shadowColor = '#ffd43b';
    ctx.shadowBlur = 18;
  }
  if (station.kind === 'crate') {
    ctx.fillStyle = '#8d6b4a';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.fillStyle = '#a9805c';
    roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 6);
    ctx.fill();
    drawFood(ctx, station.gives, x + 26, y + h / 2, 17);
    text(ctx, station.label, x + 48, y + h / 2 - 8, 12, '#fff', '800', 'left');
    text(ctx, 'E: take', x + 48, y + h / 2 + 12, 11, '#ffe8cc', '600', 'left');
  } else if (station.kind === 'board') {
    ctx.fillStyle = '#5c4a33';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.fillStyle = '#d9b380';
    roundRect(ctx, x + 10, y + 10, w - 20, h - 20, 6);
    ctx.fill();
    if (state.board.item) {
      drawFood(ctx, state.board.item, x + w / 2, y + h / 2 - 6, 24);
      const info = INGREDIENTS[state.board.item];
      if (info && info.chopsTo) {
        ctx.fillStyle = '#e9ecef';
        roundRect(ctx, x + 30, y + h - 16, w - 60, 8, 4);
        ctx.fill();
        ctx.fillStyle = '#2f9e44';
        roundRect(ctx, x + 30, y + h - 16, (w - 60) * (state.board.progress / CHOP_TIME), 8, 4);
        ctx.fill();
        text(ctx, 'HOLD E TO CHOP', x + w / 2, y + h - 26, 11, '#5c4a33', '800');
      }
    } else {
      text(ctx, '— empty —', x + w / 2, y + h / 2, 13, '#8d6b4a', '600');
    }
    text(ctx, station.label, x + w / 2, y - 12, 12, '#6b4f2a', '800');
  } else if (station.kind === 'grill') {
    ctx.fillStyle = '#343a40';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.fillStyle = '#495057';
    roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 6);
    ctx.fill();
    ctx.strokeStyle = '#868e96';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 14, y + 8 + (i * (h - 16)) / 6);
      ctx.lineTo(x + w - 14, y + 8 + (i * (h - 16)) / 6);
      ctx.stroke();
    }
    state.grill.forEach((slot, i) => {
      const cx = x + 65 + i * 130;
      const cy = y + h / 2;
      if (slot.item) {
        drawFood(ctx, slot.item, cx, cy, 24);
        if (slot.item === 'pattyRaw') {
          const ratio = Math.min(1, slot.progress / GRILL_TIME);
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          roundRect(ctx, cx - 34, cy + 26, 68, 7, 3);
          ctx.fill();
          ctx.fillStyle = ratio > 0.85 ? '#2f9e44' : '#f08c00';
          roundRect(ctx, cx - 34, cy + 26, 68 * ratio, 7, 3);
          ctx.fill();
        } else if (slot.item === 'patty') {
          const ratio = Math.min(1, slot.progress / BURN_TIME);
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          roundRect(ctx, cx - 34, cy + 26, 68, 7, 3);
          ctx.fill();
          ctx.fillStyle = '#e5484d';
          roundRect(ctx, cx - 34, cy + 26, 68 * ratio, 7, 3);
          ctx.fill();
          text(ctx, 'READY!', cx, cy - 36, 12, '#51cf66', '800');
        } else {
          text(ctx, 'BURNT!', cx, cy - 36, 12, '#e5484d', '800');
        }
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
        text(ctx, 'slot', cx, cy, 11, '#adb5bd', '600');
      }
    });
    text(ctx, station.label, x + w / 2, y - 12, 12, '#6b4f2a', '800');
  } else if (station.kind === 'assembly') {
    ctx.fillStyle = '#7a5230';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.fillStyle = '#c89a6b';
    roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 6);
    ctx.fill();
    if (state.plate) {
      drawPlate(ctx, state.plate.items, x + w / 2, y + h / 2 + 6, 1);
      text(ctx, state.plate.items.length === 0 ? 'empty plate — E to take' : 'E: take plate', x + w / 2, y + h / 2 - 30, 11, '#5c4a33', '700');
    }
    text(ctx, station.label, x + w / 2, y - 12, 12, '#6b4f2a', '800');
  } else if (station.kind === 'window') {
    ctx.fillStyle = '#862e2e';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#f8e8c8';
    roundRect(ctx, x + 10, y + 10, w - 20, h - 70, 8);
    ctx.fill();
    text(ctx, 'SERVE', x + w / 2, y + 34, 20, '#862e2e', '800');
    text(ctx, 'HERE', x + w / 2, y + 58, 20, '#862e2e', '800');
    ctx.fillStyle = '#ffd43b';
    roundRect(ctx, x + 10, y + h - 52, w - 20, 40, 8);
    ctx.fill();
    text(ctx, 'E: serve plate', x + w / 2, y + h - 32, 13, '#5c3d00', '800');
    text(ctx, station.label, x + w / 2, y - 12, 12, '#6b4f2a', '800');
  } else if (station.kind === 'trash') {
    ctx.fillStyle = '#495057';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.fillStyle = '#343a40';
    roundRect(ctx, x + 14, y + 14, w - 28, h - 28, 6);
    ctx.fill();
    text(ctx, '🗑', x + w / 2, y + h / 2 - 8, 26, '#adb5bd');
    text(ctx, 'E: bin it', x + w / 2, y + h / 2 + 24, 12, '#dee2e6', '700');
    text(ctx, station.label, x + w / 2, y - 12, 12, '#6b4f2a', '800');
  }
  ctx.restore();
}

function drawChef(ctx, state) {
  const chef = state.chef;
  const bob = chef.moving ? Math.sin(state.elapsed * 14) * 2 : 0;
  ctx.save();
  ctx.translate(chef.x, chef.y + bob);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, 20, 24, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Body (apron) and head.
  ctx.fillStyle = '#f8f9fa';
  roundRect(ctx, -16, -6, 32, 30, 10);
  ctx.fill();
  ctx.fillStyle = '#1971c2';
  roundRect(ctx, -16, 6, 32, 18, 8);
  ctx.fill();
  ctx.fillStyle = '#ffd9b3';
  ctx.beginPath(); ctx.arc(0, -16, 15, 0, Math.PI * 2); ctx.fill();
  // Chef hat.
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, -15, -38, 30, 14, 7);
  ctx.fill();
  ctx.beginPath(); ctx.arc(-8, -36, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(8, -36, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -40, 9, 0, Math.PI * 2); ctx.fill();
  // Eyes look in the walking direction.
  ctx.fillStyle = '#212529';
  ctx.beginPath(); ctx.arc(chef.dir * 4 - 5, -17, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(chef.dir * 4 + 5, -17, 2, 0, Math.PI * 2); ctx.fill();
  // Held item floats above the hat.
  const holding = chef.holding;
  if (holding !== null) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath(); ctx.arc(0, -58, 19, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ced4da';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (isPlate(holding)) drawPlate(ctx, holding.plate, 0, -58, 0.55);
    else drawFood(ctx, holding, 0, -58, 13);
  }
  ctx.restore();
}

function formatClock(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function drawHud(ctx, state) {
  // Order board band.
  ctx.fillStyle = '#212529';
  ctx.fillRect(0, 0, VIEW.width, 118);
  ctx.fillStyle = '#f08c00';
  ctx.fillRect(0, 118, VIEW.width, 4);
  text(ctx, 'ORDER BOARD', 24, 22, 15, '#ffd43b', '800', 'left');
  for (let i = 0; i < 3; i += 1) {
    const order = state.orders[i];
    if (order) drawOrderTicket(ctx, order, 24 + i * 300, 34, 282, 74);
    else {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      roundRect(ctx, 24 + i * 300, 34, 282, 74, 10);
      ctx.fill();
      text(ctx, 'waiting for customers…', 24 + i * 300 + 141, 71, 13, '#868e96', '600');
    }
  }
  // Score, combo, timer on the right.
  const right = VIEW.width - 24;
  text(ctx, `SCORE  ${state.score}`, right, 26, 22, '#ffffff', '800', 'right');
  text(ctx, `SERVED ${state.served}   COMBO x${state.combo}`, right, 52, 14, '#ffd43b', '700', 'right');
  const clockColor = state.dayLeft < 30 ? '#ff6b6b' : '#ffffff';
  text(ctx, formatClock(state.dayLeft), right, 88, 26, clockColor, '800', 'right');
  const dayRatio = state.dayLeft / DAY_LENGTH;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  roundRect(ctx, right - 180, 104, 180, 6, 3);
  ctx.fill();
  ctx.fillStyle = dayRatio < 0.2 ? '#ff6b6b' : '#51cf66';
  roundRect(ctx, right - 180, 104, 180 * dayRatio, 6, 3);
  ctx.fill();
}

function drawFloor(ctx) {
  ctx.fillStyle = '#e9dcc3';
  ctx.fillRect(0, 122, VIEW.width, VIEW.height - 122);
  const tile = 64;
  for (let y = 122; y < VIEW.height; y += tile) {
    for (let x = 0; x < VIEW.width; x += tile) {
      if (((x / tile) + (y / tile)) % 2 === 0) {
        ctx.fillStyle = '#dfcfae';
        ctx.fillRect(x, y, tile, tile);
      }
    }
  }
  // Wall strip behind the top stations.
  ctx.fillStyle = '#97744f';
  ctx.fillRect(0, 122, VIEW.width, 10);
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(20,16,12,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff9db';
  roundRect(ctx, 340, 170, 600, 440, 18);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, title, 640, 230, 40, '#343a40', '800');
  let y = 300;
  for (const line of lines) {
    text(ctx, line, 640, y, 17, '#495057', '600');
    y += 34;
  }
}

export function render(ctx, state, highlightStation) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawFloor(ctx);
  for (const station of STATIONS) {
    drawStation(ctx, station, state, highlightStation === station);
  }
  drawChef(ctx, state);
  // Floating score popups.
  for (const popup of state.popups) {
    ctx.globalAlpha = Math.min(1, popup.life);
    text(ctx, popup.text, popup.x, popup.y, 20, popup.color, '800');
    ctx.globalAlpha = 1;
  }
  drawHud(ctx, state);
  // Hint line above the floor.
  state.hints.forEach((hint, i) => {
    ctx.globalAlpha = Math.min(1, hint.life);
    text(ctx, hint.text, 640, 760 - i * 24, 15, '#212529', '700');
    ctx.globalAlpha = 1;
  });

  if (state.screen === 'title') {
    drawOverlay(ctx, 'SIZZLE & SERVE', [
      'Run your own little kitchen: take orders, chop, grill, plate, serve!',
      '',
      'WASD / Arrows — move     E or Space — use a station (hold E to chop)',
      'Mouse — click to walk, click a station to walk over and use it',
      '',
      'Bun + grilled patty + cheese + chopped veg = a happy customer.',
      'Serve before the patience bar runs out. Burnt patties go in the bin.',
      '',
      'Press ENTER or click to start the service!',
    ], '#f08c00');
  } else if (state.screen === 'paused') {
    drawOverlay(ctx, 'PAUSED', ['Take a breath — the stove is off.', '', 'Press P to keep cooking.'], '#1971c2');
  } else if (state.screen === 'over') {
    const best = state.bestCombo;
    drawOverlay(ctx, 'SERVICE OVER!', [
      `Final score: ${state.score}`,
      `Dishes served: ${state.served}    Walk-outs: ${state.missed}    Wrong plates: ${state.failed}`,
      `Best combo: x${best}`,
      '',
      state.served >= 8 ? 'A rush-hour hero — the regulars will be back!' : 'A solid first service — the lunch rush awaits.',
      '',
      'Press R to run another service.',
    ], '#2f9e44');
  }
}

export { RECIPES };
