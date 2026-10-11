# Game logic findings

Behaviors in [src/game/game.js](../src/game/game.js) uncovered while building out the
test coverage in [tests/unit/game.spec.js](../tests/unit/game.spec.js).

None of these have been changed. Every one is pinned by a test, so the current
behavior is locked in and any future change to it will be deliberate rather than
accidental. Three look like genuine bugs; two are quirks worth knowing about.

## 1. An illegal click burns the mulligan

`place()` dispatches `saveMulliganSnapshot` at [game.js:51](../src/game/game.js#L51),
*before* the legality check at [game.js:60](../src/game/game.js#L60). The early
return on an illegal move leaves the overwritten snapshot in place.

So clicking an illegal cell replaces the undo snapshot with the current state.
The player's real previous move is gone, and the mulligan they were holding now
undoes nothing. The misclick costs them the undo without any visible feedback —
the board doesn't change, so there's nothing to suggest anything happened.

Same applies to a bomb aimed at an empty cell, which returns at
[game.js:56](../src/game/game.js#L56) after the snapshot was already taken.

Pinned by `still overwrites the mulligan snapshot on an illegal move`
([game.spec.js:491](../tests/unit/game.spec.js#L491)).

**Fix would be:** move the `saveMulliganSnapshot` dispatch below the legality
check and the bomb-on-empty-cell early return, so only moves that actually
change something take a snapshot.

## 2. A span clear on an otherwise-gold board ends the game *and* clears the board

`place()` runs `checkForBlankBoard()` at [game.js:80](../src/game/game.js#L80) and
then `checkForBoardCleared()` at [game.js:82](../src/game/game.js#L82). Neither
returns early or guards against the other.

When a row or column clear empties the last runes off a board whose cells are all
gold, both conditions hold at once: the board is all-blank *and* all-gold. So
`gameOver()` fires, and then `boardCleared()` fires too. The store ends up with
`isGameOver` and `isBoardCleared` both true, the clock is paused twice (double
counting the delta into `timeAccumulator`), and the player is credited the level
completion bonus on a game that just ended. Which screen the player actually sees
depends on how the components resolve the two flags.

Pinned by `reports both game over and board cleared when a span clear empties an
all-gold board` ([game.spec.js:562](../tests/unit/game.spec.js#L562)).

**Fix would be:** decide which outcome wins and make the checks mutually
exclusive. Board-cleared is the more generous reading, and an all-gold board is
a win by the game's own definition, so checking for the cleared board first and
returning seems right.

## 3. The double-span bonus contradicts NOTES.md

`ClearSpanBonus.NonGold[2]` is `300` in
[constants.js:67](../src/game/constants.js#L67). [NOTES.md](../NOTES.md) derives
the value from one observed move — a quad-adjacent, non-gold cell clearing both a
row and a column on Easy, which scored 300 points total:

```
300    = 1          * (50          + x)
points   multiplier    4x adjacency   bonus
```

That solves to `x = 250`, not 300. With the constant at 300, the same move scores
`50 + 300 = 350`. NOTES.md reasons that a 5× single-span bonus "seems unlikely"
and guesses "50 points for one span and 200 points for a second span" — which
would make the constant 250, matching the observation.

So whatever the intent, the implemented value reproduces neither the observation
(300) nor the stated guess (250).

The tests encode the code's behavior, not NOTES.md's:
`gold=false adjacency=4 spans=2 scores 350`
([game.spec.js:333](../tests/unit/game.spec.js#L333)).

**Fix would be:** pick a value and reconcile the two files. Setting the constant
to 250 makes the one real observation come out exactly right.

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

The guard at [game.js:277](../src/game/game.js#L277) only triggers the board
animation when cells actually differ from the snapshot
([game.js:294](../src/game/game.js#L294)). It is not always-true, as might be
assumed: both of the finding-1 paths — an illegal placement and a bomb aimed at
an empty cell — save a snapshot without touching any cell, so a mulligan
afterwards reverts nothing visible and correctly skips the animation.

Note this means the guard is currently doing useful work *only* in the cases that
finding 1 describes as a bug. Fixing finding 1 would make it dead code.

Pinned by `skips the board animation after an illegal move left the cells alone`
([game.spec.js:757](../tests/unit/game.spec.js#L757)) and its counterpart
`flags the board animation only when cells actually changed`
([game.spec.js:751](../tests/unit/game.spec.js#L751)).
