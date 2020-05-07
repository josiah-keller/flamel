# Miscellaneous notes and observations on _Alchemy_'s rules
Josiah Keller

I've undertaken this project with only distant memories of actually playing the _Alchemy_ game myself as a child. I do not currently have a copy of the game, and I have not attempted to obtain a copy online beyond a cursory search. In the future, I may have to find a physical copy of the game in order to get a definitive answer on how it handles certain rules and gameplay conditions. For the time being, the approach I have taken is to find secondhand information on various sources online as well as making empirical observations of YouTube videos of people playing the game.

## Sources of information
- Unofficial Wikia page: https://popcapgames.fandom.com/wiki/Alchemy ([archive](https://web.archive.org/web/20200422030732/https://popcapgames.fandom.com/wiki/Alchemy))
- "Everything Explained Today" website, also seems to be some kind of knockoff wiki. I think it has had some information removed, but I may have saved it somewhere. Stay tuned. https://everything.explained.today/Alchemy_(video_game)/
- Various YouTube videos, including but not limited to the ones in this [playlist](https://www.youtube.com/playlist?list=PLc8oN3IpUSFqFqUydpekoPphq_hloHucX)

## Definition of terms
Here are a few points of terminology that I will use in these notes and in the source code.

- _Level_: A number that counts up by 1 each time a board is cleared.  The starting value of the level is determined by the difficulty setting. There is a precalculated schedule, found in `constants.js`, that maps level numbers to what subset of rune shapes and colors are found in that level.
- _Difficulty setting_: One of three options chosen by the user at the beginning of the game.  See _Difficulty settings_ below.
- _Scoring multiplier_: Integer corresponding to the difficulty setting which is used to increase the points value of in-game events at higher difficulties.

## Difficulty settings
There are three difficulty settings.  My provisional understanding of how the settings work is as follows:

1. Easy: This difficulty level starts at level 1.  The scoring multiplier is 1.  The "No legal moves" icon is enabled.
2. Medium (In _Alchemy_, "Average"): Starts at level 6.  Scoring multiplier 2.  There is no indicator for a piece that can't play.
3. Hard: Starts at level 11.  Scoring multiplier 4.  No indicator.

## Scoring
Each time a rune is placed on the board, the player scores points.  Points are also scored at the end of each board.  Absent a copy of _Alchemy_ to experiment with, I have resorted to empirically deriving the values of different plays from watching YouTube videos of people playing the game.

Upon placing a rune, the move's score is calculated primarily according to the following criteria:

- Goldness: Since the object of the game is to turn the board gold, you get fewer points for playing on a cell that is _already_ gold.
- Adjacency: Since runes must match either the color or shape of any neighboring runes in the cardinal directions, it is more difficult to place a rune on a cell with multiple adjacent runes; thus, these placements are worth more points.

From observations, the base score of a move appears to conform to the following matrix:

| Adjacency | Not gold | Gold |
|-----------|----------|------|
| 1         | 5        | 1    |
| 2         | 15       | 2    |
| 3         | 30       | 3    |
| 4         | 50       | 4*   |

`*` denotes a guess for a scenario that I haven't observed

Additionally, the following bonus is added in the event that a span (ie, row or column) is cleared:

- Not gold: 50
- Gold: 5

It is currently unclear what the bonus is if _both_ a row _and_ a column are cleared in the same move.  The only observation I currently have of this scenario is [this video](https://youtu.be/Gudr7o-X6CA?t=241) (as well as another observation of the exact same scenario in a different video).  In that video, the score for the move is 300 points.  The rune is placed in a quad-adjacent, non-gold cell and the difficulty is set to Easy.  Thus, the score would seem to break down as:

```
300    = 1          * (50          + x)
points   multiplier    4x adjacent   bonus
```

Solving for _x_ would put the bonus at 250 points, which would be five times the normal span bonus.  This seems unlikely.  Perhaps it's 50 points for one span and 200 points for a second span.  For the time being, this is the best guess I can make.  If I find more information, this calculation may be changed.

After adding the move's score plus any applicable span clearing bonus, the sum is then multiplied by the _scoring multiplier_ that is set by the current difficulty setting.  Naturally, this causes players who choose a higher difficulty to be rewarded with more points.

### Level completion bonus
After clearing a level, the player's score increases by a given bonus. Following are the observations I have made in trying to determine how this bonus is calculated:

Observations from https://www.youtube.com/watch?v=p902uQ_y3r4&list=PLc8oN3IpUSFqFqUydpekoPphq_hloHucX&index=1

| Difficulty | Level # | Bonus after completing |
|------------|---------|------------------------|
| Easy       | 1       | 500                    |
| Easy       | 2       | 625                    |
| Easy       | 3       | 750                    |
| Easy       | 4       | 875                    |

Observations from https://www.youtube.com/watch?v=woNAkHlYtzI&list=PLc8oN3IpUSFqFqUydpekoPphq_hloHucX&index=2
| Difficulty | Level # | Bonus after completing |
|------------|---------|------------------------|
| Medium     | 6       | 1000                   |
| Medium     | 7       | 1250                   |

Based on this data it appears the level completion bonus is calculated as follows:

```
(500 + 125n) * m
```

where _n_ is the number of levels that the player has completed and _m_ is the scoring multiplier. Note that _n_ can be calculated by subtracting the current level from the starting level for the difficulty setting, hence there is no need for additional bookkeeping.