# Findings from the rest of `src/game/`

Behaviors uncovered while building out test coverage for the modules around
[game.js](../src/game/game.js): [highscores.js](../src/game/highscores.js),
[store-config.js](../src/game/store/store-config.js),
[random.js](../src/game/random.js) and [constants.js](../src/game/constants.js).

Each item is pinned by a passing test. Findings still open are asserted as the
behavior the code has *today*, so the suite stays green against unmodified
source and will fail the moment any of it changes — deliberately or otherwise.
Findings marked FIXED have had their tests moved to the new behavior.

| # | Finding | Status |
|---|---|---|
| 1 | Shape thresholds overflow the shape pool at level 24 | open |
| 2 | A missing or duplicated entry id disables eviction | open |
| 3 | `save()` has no error handling | **fixed** |
| 4 | `pauseClock` never clears `startTime` | open |
| 5 | `discardRune` stores a reference | open |
| 6 | `getTopScores()` with no difficulty returns nothing | open |

Findings 1 and 2 are the two still worth acting on.

## 1. The shape thresholds overflow the shape pool at level 24

[`SHAPE_THRESHOLDS`](../src/game/constants.js#L76) tops out at `22`, but
`RUNE_SHAPES` holds only 21 glyphs. `draw()` computes
`pool[Math.floor(Math.random() * threshold)]`
([random.js:23](../src/game/random.js#L23)), so from level 24 on, any roll at or
above `21/22` (≈0.9545) indexes past the end of the array and the draw comes
back as:

```js
{ shape: undefined, color: "red" }
```

That is roughly **one ordinary draw in 22** — not a rare edge case but a
recurring one, in a game that is explicitly designed to run up to level 24.

The consequences spread out from there. `blankRune()` tests
`(!rune.shape) && (!rune.color)`, so a shape-less rune with a color is not
blank; `runesCompatible()` compares `rune1.shape === rune2.shape`, so two
overflowed runes read as compatible with each other, and an overflowed rune
matches no ordinary shape. `Rune.vue` renders the glyph directly, so the player
sees a rune with a color and no symbol.

Level 24 is reachable: Easy starts at level 1 and Hard at 11, so it takes 23 and
13 cleared boards respectively.

The adjacent entry is also suspicious — `SHAPE_THRESHOLDS` goes `20, 21, 22` for
levels 22–24 while there are only 21 shapes, so the intended top value was
probably `21`.

Pinned by `tops the shape thresholds out one past the end of the shape pool` and
`stays within the shape pool at every level below 24`
([constants.spec.js](../tests/unit/constants.spec.js)), and by
`draws an undefined shape on the top roll at level 24`,
`never overflows at level 23, where the threshold matches the pool` and
`overflows on roughly one in 22 draws at level 24`
([random.spec.js](../tests/unit/random.spec.js)).

## 2. A missing or duplicated entry id disables high score eviction

[`protectedIds()`](../src/game/highscores.js#L86) collects the ids that appear in
any top-10 view into a `Set`, and [`evict()`](../src/game/highscores.js#L105)
refuses to remove anything in it. Both work on `entry.id` without checking that
one exists.

An entry with no `id` contributes a single `undefined` to the set. Every other
id-less entry then satisfies `protected_.has(entry.id)`, because they all have
`entry.id === undefined` too. The whole stored table reads as protected.

What happens next is the part worth noting. `addEntry()` appends the new entry
and then evicts
([highscores.js:126](../src/game/highscores.js#L126)), so the only entry
eviction is *willing* to drop is the one just added — and if the new score
doesn't crack a top 10, it is unprotected and goes. **The score the player
actually just earned is the one discarded**, while a hundred legacy entries are
preserved. `addEntry` still returns it, with nothing to indicate it never
reached storage.

The same thing happens with a duplicated id: protecting one entry protects every
twin. `makeId()` is
`` `${Date.now()}-${Math.floor(Math.random() * 1000)}` ``
([highscores.js:82](../src/game/highscores.js#L82)), so two entries saved in the
same millisecond collide with probability 1/1000 — and a caller-supplied `id`
overrides the generated one outright (see the smaller notes below).

Worth being precise about what is *not* broken: with well-formed distinct ids,
eviction always succeeds. At most 40 ids can be protected — ten per difficulty
plus ten overall — which is comfortably under the 100-entry cap, so there are
always enough unprotected candidates to remove. The cap cannot creep upward on
well-formed data. The bug is entirely in the handling of absent and colliding
ids.

A fix would be to skip entries without an id when building the protected set
(`if (e.id) ids.add(e.id)`), and to exempt the entry being added from eviction.

Pinned by `throws away the new entry when the stored ones have no ids`,
`evicts nothing when every entry shares one id`, and the counterpart invariant
`always gets back down to the cap when ids are well formed`
([highscores.spec.js](../tests/unit/highscores.spec.js)).

## 3. `save()` has no error handling — FIXED

`save()` called `localStorage.setItem` bare. `load()` is carefully defensive —
it catches parse failures and type-checks every field — but the write path had
nothing, so a `QuotaExceededError`, a browser configured to block site data, or
Safari's private mode threw straight out through `addEntry`, `saveSettings`,
`incrementBoardsPlayed`, `resetBoardsPlayed` and `resetAll`.

`incrementBoardsPlayed` was the one that mattered, because it is called from
`Game.boardCleared()` ([game.js:316](../src/game/game.js#L316)) — in the middle
of a game, on the success path, after the clock has been paused and the board
cleared flag set. An exception there landed inside the cleared-board
transition, so a browser refusing to store a statistic would break the player's
completed board.

[`save()`](../src/game/highscores.js#L48) now wraps the write and returns
whether it succeeded:

```js
function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (_) {
    return false;
  }
}
```

A failed write is a no-op rather than a crash — the previously stored data is
left intact, since nothing is removed before the write. `saveSettings`,
`incrementBoardsPlayed`, `resetBoardsPlayed` and `resetAll` pass the result
back to their callers, so a UI that wants to tell the player their score
couldn't be saved now has something to check. Nothing checks it yet.

The catch is silent, matching `load()`'s existing `catch (_)`. `JSON.stringify`
sits inside the `try` as well, so a non-serializable payload is contained the
same way.

`addEntry` is deliberately unchanged: it still returns the entry it built, with
no signal that storage rejected it. That phantom return is part of finding 2
and is better fixed there, alongside the eviction case that drops the entry for
an entirely different reason.

Pinned by the `save` block in
[highscores.spec.js](../tests/unit/highscores.spec.js) —
`contains a storage failure instead of throwing`, `reports success`, the
`survives a storage failure` and `reports the failure to its caller` tables
across all five entry points, `leaves the stored data untouched when a write
fails`, and `still reports the new entry from addEntry when the write fails`
for the finding-2 overlap.

## 4. `pauseClock` never clears `startTime`, so a second pause double counts

[`pauseClock`](../src/game/store/store-config.js#L226) adds
`now - startTime` to `timeAccumulator` and leaves `startTime` as it was. Pausing
twice without an intervening `startClock` therefore counts the same stretch of
time twice. It also reads `state.startTime.getTime()` unguarded, so pausing
before the clock was ever started throws a `TypeError`.

This is the mechanism behind finding 2 in
[game-logic-findings.md](game-logic-findings.md) — the double-pause there was a
symptom, and fixing `checkForEndOfBoard` removed that particular caller without
removing the hazard.

Nothing double-pauses today, but the guard is thinner than it looks. `pauseGame`
is dispatched from four places, and unlike `discard` and `performMulligan`
(which both bail on `this.isPaused`), neither
[StatusBar.pause()](../src/components/StatusBar.vue#L63) nor
[MobileBottomBar.pause()](../src/components/MobileBottomBar.vue#L60) checks
whether the game is already paused. `MobileBottomBar` is unmounted while paused
([PlayArea.vue:6](../src/components/PlayArea.vue#L6)) but `StatusBar` is not
([PlayArea.vue:4](../src/components/PlayArea.vue#L4)) — its Pause button stays
mounted, and what stops a second click is `PauseScreen` covering it at
`z-index: 100` against the status bar's `51`. The invariant is held by CSS
stacking rather than by any check in the action or its callers.

Making `pauseClock` null `startTime` (and no-op when it is already null) would
make the double-pause harmless regardless.

Pinned by `double counts when paused twice`,
`throws when paused before the clock was ever started` and
`resets the accumulator but keeps the start time`
([store-config.spec.js](../tests/unit/store-config.spec.js)).

## 5. `discardRune` stores a reference rather than a copy

[`discardRune`](../src/game/store/store-config.js#L248) commits
`state.nextRune` itself, so `discardedRune` and `nextRune` point at the same
object until the next draw replaces one of them. Every other rune-shaped piece
of state is copied on the way in — `place()` writes `{...nextRune, gold: true}`,
`saveMulliganSnapshot` writes `{...state.nextRune}`.

Harmless today, since `selectNextRune` always assigns a freshly generated
object and nothing mutates a rune in place. It becomes a bug the moment
something does, and `Forge.vue` watches `discardedRune` to animate it.

Pinned by `records the discarded rune by reference`
([store-config.spec.js](../tests/unit/store-config.spec.js)).

## 6. `getTopScores()` with no difficulty returns nothing

[`getTopScores`](../src/game/highscores.js#L54) treats `null` as "all
difficulties" via a strict `difficulty === null` check. Pass nothing, and the
parameter is `undefined`, which falls to the filter branch and matches only
entries whose own `difficulty` is `undefined` — i.e. none of them. The caller
gets an empty list rather than every score.

The signature invites the mistake: `limit` has a default and `difficulty` does
not, so `getTopScores()` reads like a reasonable call. The one caller passes an
explicit value ([HighScoresScreen.vue:85](../src/components/HighScoresScreen.vue#L85)),
so this is latent.

Pinned by `returns nothing at all when the difficulty is omitted`
([highscores.spec.js](../tests/unit/highscores.spec.js)).

## Smaller notes

Quirks rather than bugs, each pinned by a test so a future change to them is
deliberate.

### `load()` type-checks everything except `settings`

`scores` must be an array and `boardsPlayed` must be a number, but settings get
`parsed.settings || { playerName: "" }` — which only catches a *falsy* value.
Stored settings of `"a string"` or `42` are handed to callers unchanged, and
`getSettings().playerName` comes back `undefined`.
Pinned by `passes a non-object settings value straight through`.

### `addEntry` lets the caller override the generated id and date

`{ id: makeId(), date: new Date().toISOString(), ...entry }` spreads the
caller's fields last, so a caller-supplied `id` or `date` wins. Useful for
tests, and the easiest route to the duplicate id in finding 2.
Pinned by `lets the caller override the generated id and date`.

### `isNewHighScore` rejects a score that ties the tenth

The comparison is a strict `>`, so matching the bottom of a full table is not a
new high score. Deliberate-looking, and the table only holds ten.
Pinned by `rejects a score that merely ties the tenth`.

### Level 0 draws the first shape and color rather than failing

`clamp` returns the level-0 threshold of `0`, and `Math.floor(rand * 0)` is
always `0`, so `generateRune(0)` quietly returns `pool[0]` for both. Level 0
doesn't exist in play. A *negative* level is the one that would break — `clamp`
reads `thresholds[-1]`, giving `undefined` for both fields.
Pinned by `draws the first shape and color at level 0`.

### `generateRune`'s `allowSpecials` parameter is dead

Nothing passes it; the only call site is `Random.generateRune(state.level)` in
`selectNextRune`. It works as documented.
Pinned by the two tests under `allowSpecials=false`.

### `updateCell` merges in place

The mutation does `Object.assign(oldCell, cell)` on the cell object the board
already holds, so omitted keys survive and the cell keeps its identity. Both
behaviors are relied on — `clearFullSpans` writes only `shape`/`color`/`gold` —
but it means handing the store a shared fixture lets a test edit it permanently,
which is why every board fixture is `cloneDeep`'d on the way in.
Pinned by `merges into the cell rather than replacing it` and
`mutates the existing cell object in place`.

### `newGame` is a partial reset

It zeroes the score, forge, run counters and mulligan fields, and leaves
`level`, `difficulty`, `timeAccumulator` and `isGameOver` untouched. `Game.init()`
sets those itself afterward, so the division of labor is intentional, but the
name oversells it.
Pinned by `leaves the level, difficulty, clock and game over flag alone`.

### `selectNextRune` can spin forever on a degenerate generator

The redraw loop keeps drawing while the new rune matches the current one, with
no attempt limit. With the real generator this terminates immediately; with a
test double that returns one rune it hangs the test run. Every mock in these
specs supplies at least two distinct runes for that reason.
Pinned by `redraws while the generator repeats the current rune`.

### `saveMulliganSnapshot` snapshots `{}` for a null next rune

`{ ...state.nextRune }` is `{}` rather than `null`, so a mulligan taken before
the first draw would restore a blank rune instead of nothing. Not reachable —
there is always a next rune by the time a move can be made.
Pinned by `snapshots an empty object when there is no next rune`.
