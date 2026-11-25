# BUILD LOG — Sizzle & Serve (best-cooking-game-20261125-0137)

- Built: 2026-11-25 ~10:40–11:00 CST (competition opened 2026-11-25T01:37Z)
- Builder: make.fun bounty build subagent for @k1ubbh0ppers
- Status: **built and locally verified; NOT submitted, NOT pushed anywhere**

## The game

**Sizzle & Serve** — an original top-down 2D cooking game, pure Canvas, zero
network requests, no libraries. One 150-second service: read the order board,
grab ingredients from the crates, chop (hold E), grill patties (they burn if
left), stack dishes on a plate, serve at the window before patience runs out.
Four original recipes (Classic Burger, Garden Salad, Double Stack, Veggie
Stack), score + tip + combo, wrong plates −20, walk-outs reset the combo,
title / pause / game-over screens, restart with R. Keyboard (WASD/arrows + E)
and mouse (click-to-move, click a station to walk over and use it). Sounds are
tiny synthesized WebAudio blips; all art is drawn with canvas paths.

## Files (all code written by hand in this session)

| Path | What it is |
|---|---|
| `game/index.html` (985 B) | Page; loads `./src/main.js` as a module |
| `game/src/config.js` | Ingredients, recipes, station layout, tuning, seeded RNG |
| `game/src/state.js` | State, order spawning, scoring, serving |
| `game/src/input.js` | Keyboard + mouse input |
| `game/src/actions.js` | Station interactions, movement, chopping, grilling |
| `game/src/render.js` | All drawing (kitchen, chef, food, order board, HUD) — revised 3× |
| `game/src/shots.js` | Deterministic staged scenes `?shot=cover\|play\|serve\|end` |
| `game/src/main.js` | Game loop, screen flow, sounds |
| `main.ts` | Hand-in program (copies game/ + screenshots/, writes dossier.json) |
| `vendor/makefun-game.ts` | Kit library, byte-identical to the kit (sha256 dc671875…6129) |
| `LICENSE` / `README.md` | MIT / play + build instructions |
| `screenshots/1-cover.jpg` (84,815 B, 1280×800) | Cover: 3 tickets, plate mid-assembly, patty grilling, chopping in progress |
| `screenshots/2-play.jpg` (80,706 B, 1280×800) | Rush moment: urgent 8s ticket, chef taking a grilled patty |
| `screenshots/3-serve.jpg` (81,047 B, 1280×800) | Chef serving a finished Classic Burger (+160 popup) |
| `screenshots/4-end.jpg` (65,972 B, 1280×800) | Service-over screen, final score 1240 |

## Verification done

1. **Gameplay logic (Node, headless):** full Classic Burger flow exercised —
   bun→plate, raw patty→grill→cooked in ~6 s→plate, cheese→plate,
   lettuce→board→hold-E chop→plate, serve matched the ticket (score 142,
   served 1, combo 1); wrong plate −20 / failed 1; day-end → `over` screen.
2. **Browser render (headless Chromium, real screenshots):** all 4 scenes +
   title screen render; no JS console errors (only unrelated dbus noise).
   Two visual fixes applied and re-shot: station labels changed from white to
   dark brown for contrast on the floor; plate food icons enlarged; serve
   popup moved off the SERVING WINDOW sign.
3. **main.ts:** `MAKEFUN_OUTPUT_DIR=out node main.ts` ran twice; the two runs
   were byte-identical (deterministic). Output: 13 files, 825,404 bytes;
   dossier.json 466,099 bytes (< 1.5 MiB cap). `out/` was removed afterwards
   to keep the repo clean — regenerate with the command above.
4. **Gate self-check:** game/ is 8 files / 46,765 bytes (cap 993 files /
   48 MiB); index.html 985 bytes (cap 1 MiB); screenshots 4 × ≤ 256 KiB,
   1280×800 (long ≤ 1280, short ≥ 480); no `http(s):` / protocol-relative /
   `fetch` / `XMLHttpRequest` references anywhere in game/; no symlinks.
5. **Kit check** (`node cli/makefun.mjs check --kit <kit> --repo . --worktree`):
   **4 passed, 1 failed, 15 skipped, 5 checked at submission.**
   - pass: competition_open, snapshot (42 files at check time incl. out/),
     license_osi (MIT), entrypoint (main.ts, node22).
   - FAIL: `transcripts_present` — expected: no bundle was passed; the
     parent must run `bundle` over this build session and re-check with
     `--transcripts` before submitting.
   - At submission: repo_public / repo_owner / repo_created_after_open /
     commit_in_repo / duplicate_snapshot — all to be satisfied by the parent
     at submit time (new repo after the opening, owner claim, push, submit).

## Not done (parent's job)

- Bundle transcripts, re-run kit check with `--transcripts`.
- Create the repo (after the opening), commit, push, submit before the
  deadline **2026-11-25 21:37 CST (13:37Z)**; next blind round 12:37 CST.
- No GitHub repo was created and nothing was pushed from this session.
