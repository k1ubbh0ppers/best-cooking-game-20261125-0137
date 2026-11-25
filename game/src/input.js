// Sizzle & Serve — input: keyboard movement and interaction, mouse click-to-move.
// The canvas is fixed at 1280x800 and scaled by CSS, so mouse coordinates are
// translated back into game space with the canvas bounding rect.

export function createInput(canvas) {
  const input = {
    keys: new Set(),
    interactHeld: false,
    interactPressed: false,
    click: null, // { x, y } in game coordinates, consumed by the loop
    anyKeyPressed: false,
  };

  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
  };

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    input.anyKeyPressed = true;
    const action = KEYMAP[event.code];
    if (action) input.keys.add(action);
    if (event.code === 'KeyE' || event.code === 'Space') {
      if (!event.repeat) input.interactPressed = true;
      input.interactHeld = true;
    }
    if (event.code === 'Enter') input.keys.add('enter');
    if (event.code === 'KeyR') input.keys.add('restart');
    if (event.code === 'KeyP') input.keys.add('pause');
  });

  window.addEventListener('keyup', (event) => {
    const action = KEYMAP[event.code];
    if (action) input.keys.delete(action);
    if (event.code === 'KeyE' || event.code === 'Space') input.interactHeld = false;
  });

  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.click = {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 800,
    };
    input.anyKeyPressed = true;
  });

  window.addEventListener('blur', () => {
    input.keys.clear();
    input.interactHeld = false;
  });

  return input;
}

/** Read the held movement direction as a unit vector (or null when idle). */
export function moveVector(input) {
  let x = 0;
  let y = 0;
  if (input.keys.has('left')) x -= 1;
  if (input.keys.has('right')) x += 1;
  if (input.keys.has('up')) y -= 1;
  if (input.keys.has('down')) y += 1;
  if (x === 0 && y === 0) return null;
  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
}

export function consumePress(input, key) {
  if (!input.keys.has(key)) return false;
  input.keys.delete(key);
  return true;
}
