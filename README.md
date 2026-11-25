# Sizzle & Serve — a tiny kitchen rush

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/k1ubbh0ppers/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/k1ubbh0ppers/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

An original 2D cooking game for the make.fun best-cooking-game bounty
(`best-cooking-game-20261125-0137`). You run a small kitchen for one 150-second
service: read the order board, grab ingredients, chop, grill, plate and serve
before customers walk out.

## How to play

- **Move:** WASD / arrow keys, or click anywhere to walk there (click a station
  to walk over and use it).
- **Use a station:** E or Space. Hold E at the chopping board to chop.
- **Flow:** take a bun / patty / cheese / tomato / lettuce / onion from the
  crates on the left → chop tomato, lettuce and onion on the board → grill raw
  patties (watch the bar: a cooked patty left too long burns) → stack
  ingredients on a plate at the plating counter → serve at the window on the
  right. Bin mistakes in the trash.
- **Scoring:** each dish pays its base price plus a tip for serving fast, plus
  10 per combo level for consecutive serves. A wrong plate costs 20 points; a
  walked-out customer resets your combo.
- **Menu:** Classic Burger, Garden Salad, Double Stack, Veggie Stack.
- **End:** when the day timer hits 0:00 the service ends; press R for another.

## Files

- `game/index.html` — the page; everything else is plain ES modules, no build
  step, no network request (all art is drawn with canvas paths, all sounds are
  tiny WebAudio blips).
- `game/src/config.js` — ingredients, recipes, kitchen layout, tuning.
- `game/src/state.js` — game state, order spawning, scoring, serving.
- `game/src/input.js` — keyboard and mouse input.
- `game/src/actions.js` — station interactions, movement, chopping, grilling.
- `game/src/render.js` — all drawing: kitchen, chef, food, order board, HUD.
- `game/src/shots.js` — deterministic staged scenes for the screenshots
  (`?shot=cover|play|serve|end`).
- `game/src/main.js` — game loop, screen flow, sounds.
- `main.ts` — the make.fun hand-in program: copies `game/` and `screenshots/`
  to `/output` and writes `/output/dossier.json` with the vendored library.
- `vendor/makefun-game.ts` — the kit's library, unchanged.
- `screenshots/` — 4 real renders of the game in a browser (cover first).

## Play it locally

```sh
cd game && python3 -m http.server 8000
# open http://localhost:8000 in desktop Chrome
```

## Build the hand-in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=r9rev335&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
