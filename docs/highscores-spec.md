# New persistent high scores feature

## Overview
The game should store the user's high scores in persistent local storage. This could be `localStorage`, IndexedDB, etc - please recommend a storage API.

The high score records will be viewable through a UI accessed from the main menu and can be sorted in a few different ways. Only a small number, probably 10, will be actually listed at a time in the UI, but that doesn't mean the entries beyond 10 should necessarily be dropped right away, since a given entry could still be in the top 10 for a different sort/filter. There will need to be some other scheme worked out for evicting old entries if the storage limit is reached.

In addition to the score entries, there should be space for some local settings to be saved. For now, this will probably just be the player's name to be autofilled in new score entries, but could expand later.

## Score entries
Each score record should have at least this set of fields:
- Name - the name of the player who scored this score. The first time the user plays (no persisted storage) this will default to blank and they will have to enter a name. The entered name should be stored in the new score record, and should also be saved off in the settings store. On subsequent high scores, the UI will autofill the name field with the saved name from the settings.
- Score
- Time spent playing
- Longest run without discard
- Number of boards cleared
- Mulligan used? (boolean, always false, to be used by a future feature)
- Difficulty setting

## Score lists
The primary way scores will be listed and ranked is "top scores per difficulty setting". At least one secondary view will be "top scores for all difficulty settings".

## Creating new score entries
When a user reaches a game over state by losing their current board, their score is final. If the score _would_ appear in the top 10 list for the current difficulty, then this triggers the creation of a new score entry to save. A UI should appear offering to save the high score, with the latest name setting populated in the name field (name is the only editable field). After the user confirms their name, the entry should be saved. Then, the view should switch to the high scores list for that difficulty level, showing the new entry in the list.

## Score list UI
On the main menu, there should be a new button to view high scores.

The high scores screen should look similar to the existing screens for main menu, game over, board cleared, etc. At the top there should be tabs (maybe patterned after the difficulty selector) allowing the user to choose which difficulty to view high scores for. At the end of these tabs would be "All"

The score entries should appear in a table with numbered rows. The 1st, 2nd, and 3rd rows should have a gold/silver/bronze medal instead of plain numbers.

If an entry has "mulligan used" == true, then there should be an asterisk after the score number with a tooltip that indicates "Mulligan used"