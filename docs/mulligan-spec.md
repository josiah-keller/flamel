# New mulligan feature

## Overview
I want to add a quality-of-life feature to the game - an "undo last move" or "mulligan" button. When clicked, the game state should return to before the most recent move.

## Mulligan effects
- The score should decrease
- The "next rune" should be reset to the rune that was last placed
- The board should return to the previous state
    * Last rune placed removed
    * The gold state of the last rune's cell should revert, if it turned gold in the last move
    * Any row/column that cleared should revert
- "mulligan used" flag should be set, and persisted in the high score entry if the current game results in a new high score.
- The clock should continue counting normally
- Mulligan cannot be used twice in a row - only one previous state should be tracked. After using mulligan, it is disabled until another move is played.
- The new "next rune" after a mulligan should still be random as normal.

## UI
On desktop, the button should be located in the sidebar beneath the Forge. It should read "Mulligan." On mobile, it should be in the bottom bar next to the Pause button.

The first time the Mulligan button is used, a modal warning prompt should appear to warn that the high score entry will have an asterisk. The game clock should be paused until the modal is dismissed. localStorage should persist the fact that this modal has been acknowledged, and it should not be presented again afterwards.

The Mulligan button should match in style with the Pause and New Game buttons.

After at least one mulligan has been used in the current game, the button should change visually to indicate this. To start, just give it a gold colored box-shadow glow.

When Mulligan can't be used, the button should have a disabled style. To start, copy the "pressed" (:active) style but with 50% opacity.
