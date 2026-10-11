# Game logic findings

Behaviors in [src/game/game.js](../src/game/game.js) uncovered while building out the
test coverage in [tests/unit/game.spec.js](../tests/unit/game.spec.js).

All three of the genuine bugs — findings 1, 2 and 3 — have been fixed. The two
smaller notes at the end are quirks worth knowing about rather than bugs, and
are unchanged. Every finding here is pinned by a test, so the behavior is locked
in and any future change to it will be deliberate rather than accidental.

## 1. An illegal click burns the mulligan — FIXED

`place()` dispatched `saveMulliganSnapshot` *before* the legality check, and the
early return on an illegal move left the overwritten snapshot in place.

So clicking an illegal cell replaced the undo snapshot with the current state.
The player's real previous move was gone, and the mulligan they were holding
undid nothing. The misclick cost them the undo without any visible feedback —
the board doesn't change, so there was nothing to suggest anything happened.

Same applied to a bomb aimed at an empty cell, which returned after the snapshot
had already been taken.

The snapshot dispatch now sits below the legality check
([game.js:64](../src/game/game.js#L64)), and inside the bomb branch only when
the target cell is occupied ([game.js:54](../src/game/game.js#L54)) — so only
moves that actually change something take a snapshot.

Pinned by `leaves the mulligan snapshot alone on an illegal move`
([game.spec.js:490](../tests/unit/game.spec.js#L490)) and by the snapshot
assertion in `does nothing when aimed at an empty cell`
([game.spec.js:605](../tests/unit/game.spec.js#L605)).

## 2. A span clear on an otherwise-gold board ended the game *and* cleared the board — FIXED

`place()` ran `checkForBlankBoard()` and then `checkForBoardCleared()`, and
neither returned early or guarded against the other.

When a row or column clear emptied the last runes off a board whose cells were
all gold, both conditions held at once: the board was all-blank *and* all-gold.
So `gameOver()` fired, and then `boardCleared()` fired too. The store ended up
with `isGameOver` and `isBoardCleared` both true, the clock paused twice (double
counting the delta into `timeAccumulator`), and the player credited with the
level completion bonus on a game that had just ended. Worse, the two screens are
independent `v-if`s ([PlayArea.vue:15-16](../src/components/PlayArea.vue#L15-L16)),
so both rendered at once.

The two checks are now mutually exclusive, behind `checkForEndOfBoard()`
([game.js:278](../src/game/game.js#L278)). An all-gold board is a win by the
game's own definition, so all-gold always wins, even when the board is also
empty: the cleared board returns and the blank-board game over never runs.

The same collision exists on the bomb path — `clearCell` empties a cell *as
gold*, so bombing the last rune off an otherwise-gold board is all-blank and
all-gold too. `placeBomb` only ever checked for a blank board, so it ended the
game there, and never noticed a bomb that turned the last non-gold cell gold
without emptying the board. It now goes through the same helper, so the rule
holds for both paths.

Pinned by `clears the board, and doesn't end the game, when a span clear empties
an all-gold board` ([game.spec.js:559](../tests/unit/game.spec.js#L559)), its
clock counterpart `pauses the clock exactly once...`
([game.spec.js:575](../tests/unit/game.spec.js#L575)), and
`clears the board when it bombs the last rune off an all-gold board`
([game.spec.js:637](../tests/unit/game.spec.js#L637)).

## 3. The double-span bonus contradicted NOTES.md — FIXED

`ClearSpanBonus.NonGold[2]` was `300`. [NOTES.md](../NOTES.md) derives the value
from one observed move — a quad-adjacent, non-gold cell clearing both a row and a
column on Easy, which scored 300 points total:

```
300    = 1          * (50          + x)
points   multiplier    4x adjacency   bonus
```

That solves to `x = 250`, not 300. With the constant at 300, the same move scored
`50 + 300 = 350`. NOTES.md reasons that a 5× single-span bonus "seems unlikely"
and guesses "50 points for one span and 200 points for a second span" — which
makes the constant 250, matching the observation.

So the implemented value reproduced neither the observation (300) nor the stated
guess (250).

The constant is now `250` ([constants.js:70](../src/game/constants.js#L70)), so
the one real observation comes out exactly right: the move NOTES.md recorded at
300 points now scores 300.

NOTES.md is deliberately left as-is — it's a record of what was observed and
guessed while reverse-engineering the original game, not a spec to keep in sync.
Its 300 is the *total* for that move, which the code now reproduces; the "x =
250" derivation in it already agrees with the constant.

The tests moved with the constant: `gold=false adjacency=4 spans=2 scores 300`
([game.spec.js:333](../tests/unit/game.spec.js#L333)) and the worked placement in
`includes the double-span bonus when a placement completes both spans`
([game.spec.js:520](../tests/unit/game.spec.js#L520)).

`ClearSpanBonus.Gold[2]` is still `30`, flagged in constants.js as a guess. No
observation pins it, so it was left alone.

## Smaller notes

### `countAdjacency` returns `false` out of bounds, not `0`

[game.js:119](../src/game/game.js#L119) returns `false` for out-of-bounds
coordinates, while every in-bounds path returns a number. `place()` feeds the
result straight into the score matrix via `scoreMove`, so a `false` would be
looked up as `valueSet[false]` and yield `undefined`, making the whole move score
`NaN`.

Not currently reachable — `place()` is only called with coordinates from a real
board cell — but it's a trap for any future caller. `moveLegal` has the same
bounds guard and returning `false` there is correct, which is probably where the
inconsistency came from.

Pinned by `returns false (not 0) out of bounds`
([game.spec.js:158](../tests/unit/game.spec.js#L158)).

### `mulligan`'s `boardChanged` guard is reachable as false

The guard in `mulligan()` only triggers the board animation when cells actually
differ from the snapshot ([game.js:308](../src/game/game.js#L308)). It is not
always-true, as might be assumed.

Before finding 1 was fixed, the two paths that reached it were the buggy ones —
an illegal placement and a bomb aimed at an empty cell both saved a snapshot
without touching any cell. Those are gone, but `discard()`
([game.js:37](../src/game/game.js#L37)) still snapshots while leaving the board
alone, so a mulligan undoing a discard reverts the forge and rune with nothing
visible to animate, and correctly skips it.

Pinned by `skips the board animation after a discard left the cells alone`
([game.spec.js:790](../tests/unit/game.spec.js#L790)) and its counterpart
`flags the board animation only when cells actually changed`
([game.spec.js:784](../tests/unit/game.spec.js#L784)).
