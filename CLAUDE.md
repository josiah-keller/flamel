# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn serve        # Dev server
yarn build        # Production build
yarn test:unit    # Run Jest unit tests
yarn lint         # ESLint
```

To run a single test file: `yarn test:unit --testPathPattern=game.spec.js`

**Note:** `serve` and `build` use `NODE_OPTIONS=--openssl-legacy-provider` because webpack 4 relies on MD4 hashing, which was removed in OpenSSL 3 (Node 17+).

## Architecture

Flamel is a Vue.js 2 reimplementation of the classic Alchemy puzzle game. Players place runes on a 9×8 board to turn all cells gold, earning points through adjacency-based scoring.

### Core Game Logic

The game logic lives entirely in [src/game/](src/game/) and is decoupled from the UI:

- **[game.js](src/game/game.js)** — The game controller. Handles all game state transitions: placing runes, validating legality, scoring, clearing spans, and checking win/lose conditions. Mutates the Vuex store directly.
- **[constants.js](src/game/constants.js)** — Single source of truth for board dimensions (9×8), rune system (17 shapes, 9 colors, plus Wild/Bomb specials), scoring matrix by adjacency, difficulty settings, and level thresholds that gate which runes are available.
- **[random.js](src/game/random.js)** — Rune generation. Level-based thresholds control shape/color availability; Wild has 2.5% probability and Bomb 1.5%.
- **[store/store-config.js](src/game/store/store-config.js)** — Vuex store. Owns all game state: board cells, current/next rune, score, level, difficulty, forge counter, cursor position, and timing.

### Component Hierarchy

```
App.vue
└── MainMenu.vue        (difficulty selection, game start)
└── PlayArea.vue        (main game wrapper)
    ├── Board.vue        (9×8 grid, click handling, score tips)
    │   └── BoardCell.vue
    │       └── Rune.vue
    ├── PlayerCursor.vue (follows mouse, shows next rune + illegal indicator)
    ├── Forge.vue        (discard counter)
    ├── StatusBar.vue    (score, level, run count)
    ├── GameOverScreen.vue
    └── BoardClearedScreen.vue
```

### Key Patterns

- **Game state flows one way**: UI components dispatch actions or call `game.js` methods → `game.js` commits to Vuex store → components react via computed properties.
- **Scoring** is adjacency-based. The scoring matrix in `constants.js` maps `(adjacentCount, isGold)` to point values and drives all point calculations in `game.js`.
- **Level progression** gates available runes. `constants.js` defines thresholds per level; as levels increase, more shapes and colors unlock.
- **Animations** use a custom `tween.js` utility with `requestAnimationFrame`, and custom Vue directives (`v-sparkle`, `v-glimmer-trail`) for particle effects.

### Tests

Tests are in [tests/unit/](tests/unit/) and focus on the game logic layer (`game.spec.js`). Test fixtures live in `test-data.js`. Each test creates an isolated Vuex store using `lodash.cloneDeep` to prevent state leakage between tests.

### Game Rules Reference

[NOTES.md](NOTES.md) contains detailed documentation of game rules, scoring research, difficulty settings, and level progression — useful context when modifying game mechanics.

## Contribution Guidelines

Do not remove or modify existing comments UNLESS the related code is being deleted, or is changing in a way that obsoletes the comment.