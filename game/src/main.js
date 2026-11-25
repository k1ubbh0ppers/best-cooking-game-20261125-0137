// Sizzle & Serve — entry point: game loop, screen flow, tiny synth sounds.
// The game is plain ES modules under game/src, loaded by game/index.html.

import { VIEW } from './config.js';
import { createState, resetService, tickTimers } from './state.js';
import { createInput, moveVector, consumePress } from './input.js';
import {
  handleClick, interact, nearestStation, updateChopping, updateGrill, updateMovement,
} from './actions.js';
import { render } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const state = createState(20261125);
const input = createInput(canvas);

let audio = null;
function blip(freq, seconds = 0.08, type = 'sine') {
  if (state.muted) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') void audio.resume();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + seconds);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + seconds);
  } catch {
    // Sound is garnish; a browser without audio still plays the game.
  }
}
function fanfare() {
  blip(523, 0.09);
  setTimeout(() => blip(659, 0.09), 90);
  setTimeout(() => blip(784, 0.16), 180);
}

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
let shotMode = false;
if (shotName) {
  stageShot(shotName, state);
  shotMode = true;
  render(ctx, state, null);
}

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

let last = performance.now();
let interactCooldown = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  interactCooldown = Math.max(0, interactCooldown - dt);

  if (state.screen === 'title') {
    if (consumePress(input, 'enter') || input.click) {
      input.click = null;
      resetService(state);
      blip(440, 0.08);
      setStatus('Service started. Take an order and cook!');
    }
  } else if (state.screen === 'play') {
    if (consumePress(input, 'pause')) {
      state.screen = 'paused';
    } else {
      if (input.click) {
        handleClick(state, input.click);
        input.click = null;
      }
      if (input.interactPressed && interactCooldown <= 0) {
        input.interactPressed = false;
        interactCooldown = 0.18;
        const station = nearestStation(state.chef);
        const before = state.served;
        const beforeScore = state.score;
        interact(state, station);
        if (state.served > before) fanfare();
        else if (state.score !== beforeScore || state.chef.holding !== null) blip(600, 0.06);
      } else {
        input.interactPressed = false;
      }
      updateMovement(state, dt, moveVector(input));
      updateChopping(state, dt, input.interactHeld);
      updateGrill(state);
      tickTimers(state, dt);
      const near = nearestStation(state.chef);
      if (near && state.screen === 'play') {
        setStatus(`Near the ${near.label.toLowerCase()}. Press E to use it.`);
      }
    }
  } else if (state.screen === 'paused') {
    if (consumePress(input, 'pause') || consumePress(input, 'enter')) {
      state.screen = 'play';
    }
  } else if (state.screen === 'over') {
    if (consumePress(input, 'restart') || consumePress(input, 'enter')) {
      resetService(state);
      blip(440, 0.08);
    }
  }

  render(ctx, state, state.screen === 'play' ? nearestStation(state.chef) : null);
  requestAnimationFrame(frame);
}

if (!shotMode) {
  setStatus('Sizzle and Serve. Press Enter to start the service.');
  requestAnimationFrame(frame);
}
