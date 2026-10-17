# Findings from the rest of `src/game/`

Behaviors uncovered while building out test coverage for the modules around
[game.js](../src/game/game.js): [highscores.js](../src/game/highscores.js),
[store-config.js](../src/game/store/store-config.js),
[random.js](../src/game/random.js) and [constants.js](../src/game/constants.js).

Each item is pinned by a passing test. Findings still open are asserted as the
behavior the code has *today*, so the suite stays green against unmodified
source and will fail the moment any of it changes — deliberately or otherwise.
Findings marked FIXED have had their tests moved to the new behavior. A finding
marked CLOSED turned out not to be reachable; the write-up is kept because the
mechanism is still a trap for future changes.

| # | Finding | Status |
|---|---|---|
| 1 | Shape thresholds overflow the shape pool at level 24 | open |
| 2 | A missing or duplicated entry id disables eviction | **closed** — not reachable; guarded anyway |
| 3 | `save()` has no error handling | **fixed** |
| 4 | `pauseClock` never clears `startTime` | **fixed** |
| 5 | `discardRune` stores a reference | **fixed** |
| 6 | `getTopScores()` with no difficulty returns nothing | open |

Finding 1 is the only one with live player impact still outstanding.

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

## 2. A missing or duplicated entry id disables high score eviction — CLOSED, NOT REACHABLE

This was originally written up as a live bug. It isn't: no code path can produce
an entry without an id, and the duplicate-id variant needs concurrency this game
doesn't have. The mechanism is real and is described below because it is a trap
for future changes, and the missing-id half is now guarded — but nothing was
broken for any player.

### The mechanism

[`protectedIds()`](../src/game/highscores.js#L93) collects the ids that appear
in any top-10 view into a `Set`, and [`evict()`](../src/game/highscores.js#L120)
refuses to remove anything in it. Both work on `entry.id` without checking that
one exists.

An entry with no `id` contributed a single `undefined` to the set. Every other
id-less entry then satisfied `protected_.has(entry.id)`, because they all had
`entry.id === undefined` too, so the whole stored table read as protected.

The consequence was the sharp part. `addEntry()` appends the new entry and then
evicts ([highscores.js:141](../src/game/highscores.js#L141)), so the only entry
eviction was *willing* to drop was the one just added — and a new score that
didn't crack a top 10 was unprotected, so it went. The score the player just
earned would be the one discarded while a hundred older entries were preserved,
and `addEntry` would still return it as though it had been saved.

### Why it can't happen

- **No legacy data.** [highscores.js](../src/game/highscores.js) has two commits
  in its whole history: `4bf911b Add high scores tracking` and `ebac92d Suppress
  exceptions when saving to local storage`. `id: makeId()` is present in
  `addEntry` in the first of those, unchanged since. No released version ever
  wrote id-less entries, so no existing player can be holding any.
- **The only producer can't omit it.**
  [NewHighScorePrompt.vue](../src/components/NewHighScorePrompt.vue#L84) builds
  the entry as a literal with seven fields — `name`, `score`, `timePlayed`,
  `maxRun`, `boardsCleared`, `mulliganUsed`, `difficulty` — and no `id` key at
  all, so the spread-last ordering in `addEntry` never overrides the generated
  id.
- **One writer, one key.**
  [highscores.js:50](../src/game/highscores.js#L50) is the only `setItem` for
  `flamel_data` anywhere in `src/`. `save()` is exported but has no callers
  outside the module.
- **`makeId()` can't return nothing** — it is a template literal over
  `Date.now()` and `Math.floor(...)`, so always a non-empty string.

That leaves hand-edited storage, or a future caller passing `id: undefined`
explicitly — which would silently win the spread, and `JSON.stringify` would
then drop the key entirely.

The duplicate-id variant needs two entries written in the same millisecond with
the same 1-in-1000 suffix. Entries are only ever written when a player finishes
a board and confirms a name, so there is no concurrency and no batch path that
could produce two in the same millisecond.

The phantom return is unreachable for a second, independent reason: with
well-formed ids the new entry is always *last* in `evict`'s oldest-first
ordering, and at most 40 entries can be protected (ten per difficulty plus ten
overall) against a cap of 100 — so there is always an older unprotected entry to
drop instead. `addEntry` is also only called behind an `isNewHighScore` gate
([GameOverScreen.vue:50](../src/components/GameOverScreen.vue#L50)), so the new
entry is in a top 10 and protected anyway.

### What changed

`protectedIds` now skips entries without an id, so the missing-id class is gone
regardless of how a future caller behaves:

```js
const addId = e => {
  if (e.id) ids.add(e.id);
};
```

Id-less entries are now treated as unprotected, which is the safe direction:
eviction drops them oldest-first and keeps the new score.

The duplicate-id case is deliberately left as-is. The guard doesn't address it —
a duplicate is a real id that happens to be shared, so one protected entry
still protects every twin — and closing it would mean either deduplicating ids
on read or exempting the new entry from eviction, which is more machinery than a
scenario that can't occur warrants.

Also worth knowing for any future change here: `id` is load-bearing in the UI,
not just in eviction. It is the `v-for` key in the score table and drives the
new-entry highlight through `newEntryId`
([HighScoresScreen.vue:112](../src/components/HighScoresScreen.vue#L112)).

Pinned by `keeps the new entry when the stored ones have no ids`,
`still evicts nothing when every entry shares one id`, and the invariant
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

## 4. `pauseClock` never clears `startTime`, so a second pause double counts — FIXED

`pauseClock` added `now - startTime` to `timeAccumulator` and left `startTime`
as it was. Pausing twice without an intervening `startClock` therefore counted
the same stretch of time twice. It also read `state.startTime.getTime()`
unguarded, so pausing before the clock was ever started threw a `TypeError`.

This is the mechanism behind finding 2 in
[game-logic-findings.md](game-logic-findings.md) — the double-pause there was a
symptom, and fixing `checkForEndOfBoard` removed that particular caller without
removing the hazard.

Nothing double-paused, but the guard was thinner than it looked. `pauseGame` is
dispatched from four places, and unlike `discard` and `performMulligan` (which
both bail on `this.isPaused`), neither
[StatusBar.pause()](../src/components/StatusBar.vue#L63) nor
[MobileBottomBar.pause()](../src/components/MobileBottomBar.vue#L60) checks
whether the game is already paused. `MobileBottomBar` is unmounted while paused
([PlayArea.vue:6](../src/components/PlayArea.vue#L6)) but `StatusBar` is not
([PlayArea.vue:4](../src/components/PlayArea.vue#L4)) — its Pause button stays
mounted, and what stopped a second click was `PauseScreen` covering it at
`z-index: 100` against the status bar's `51`. The invariant was held by CSS
stacking rather than by any check in the action or its callers.

[`pauseClock`](../src/game/store/store-config.js#L226) now stops the clock as
well as banking the time, and treats a clock that isn't running as nothing to
do:

```js
pauseClock({ state, commit }) {
  if (! state.startTime) {
    return;
  }
  let now = new Date(),
    timeDelta = now.getTime() - state.startTime.getTime();
  commit("setTimeAccumulator", state.timeAccumulator + timeDelta);
  commit("setStartTime", null);
},
```

`startTime` now means "the clock is running, since this moment" rather than
"the clock was last started at this moment", which is what makes the second
pause a no-op instead of a double count. Pausing an unstarted clock is also
harmless now, so no caller has to arrange a start time before ending a game.

This was safe to change because `pauseClock` was the only thing in `src/` that
read `startTime` — the components that display elapsed time
([BoardClearedScreen.vue](../src/components/BoardClearedScreen.vue),
[NewHighScorePrompt.vue](../src/components/NewHighScorePrompt.vue)) read
`timeAccumulator`, and they render after a pause has already banked it.

`resetClock` is deliberately unchanged. It only zeroes the accumulator, and
`Game.init()` dispatches it immediately before `startClock`, so it never needs
to touch `startTime` itself.

One consequence worth knowing: the clock assertion in
`pauses the clock exactly once on a span clear that empties an all-gold board`
([game.spec.js:576](../tests/unit/game.spec.js#L576)) is now a weaker signal,
because a reintroduced double pause would no longer double the accumulator. The
mutual exclusion that test was written to guard is still pinned by the flag
assertions in `clears the board, and doesn't end the game, when a span clear
empties an all-gold board`, so the coverage holds.

Pinned by `stops the clock when it banks the time`,
`counts a stretch of time once however often it is paused`,
`does nothing when paused before the clock was ever started`,
`banks each stretch separately across a start and pause cycle` and
`is harmless to pause an already paused game`
([store-config.spec.js](../tests/unit/store-config.spec.js)).

## 5. `discardRune` stores a reference rather than a copy — FIXED

`discardRune` committed `state.nextRune` itself, so `discardedRune` and
`nextRune` pointed at the same object until the next draw replaced one of them.
Every other rune-shaped piece of state is copied on the way in — `place()`
writes `{...nextRune, gold: true}`, `saveMulliganSnapshot` writes
`{...state.nextRune}` — so this was the one place the convention broke.

It was harmless as it stood, since `selectNextRune` always assigns a freshly
generated object and nothing mutates a rune in place. It would have become a bug
the moment something did, and `Forge.vue` watches `discardedRune` (deeply) to
animate the rune flying into the forge.

[`discardRune`](../src/game/store/store-config.js#L256) now copies:

```js
commit("setDiscardedRune", state.nextRune ? { ...state.nextRune } : null);
```

The null branch is load-bearing rather than defensive padding. `Forge.vue`'s
watcher returns early on an exact `null`
([Forge.vue:79](../src/components/Forge.vue#L79)), so an unconditional spread
would hand it a truthy `{}` and play a discard animation for a rune with no
shape or colour. That is the same `{ ...null }` trap `saveMulliganSnapshot`
already falls into (see the smaller notes below); there it is unreachable and
harmless, here it would have been a visible glitch, so the two are not worth
making consistent with each other.

Nothing depends on the old identity semantics: `Forge.vue` reads `.shape` and
`.color` off the value and compares it only against `null`, and the watcher
still fires on each discard because every discard writes a fresh object — more
reliably than before, not less.

Pinned by `records a copy of the discarded rune`,
`keeps the discarded rune when the next one is replaced` and
`records null rather than an empty rune when there is nothing to discard`
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
