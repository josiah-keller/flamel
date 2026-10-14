import Constants from "@/game/constants";

// Constants is a plain mutable object — nothing freezes it, and every other
// module imports the same instance. These tests are therefore strictly
// read-only: a mutation here would leak into every spec that runs after.
//
// What's checked are the invariants the rest of the game relies on: that the
// score tables cover every reachable lookup key, that the per-level rune
// thresholds index safely into the rune pools, and that the three
// difficulty-indexed arrays stay the same length. The one place an invariant
// does *not* hold is the shape thresholds, which is pinned below as the
// behavior it actually is and written up as finding 1 in
// docs/game-module-findings.md.

const { ScoreValues, LevelThresholds, Difficulties } = Constants;
const { SHAPE_THRESHOLDS, COLOR_THRESHOLDS } = LevelThresholds;

// game.js reads these tables with the adjacency count and the number of spans
// cleared by a single placement. A cell has at most 4 orthogonal neighbors, and
// one placement completes at most one row plus one column.
const MAX_ADJACENCY = 4;
const MAX_SPANS_PER_PLACEMENT = 2;

function keysOf(table) {
  return Object.keys(table).map(Number).sort((a, b) => a - b);
}

function range(n) {
  return Array.from({ length: n + 1 }, (_, i) => i);
}

describe("constants", () => {
  describe("board geometry", () => {
    it("puts the starting space inside the board", () => {
      expect(Constants.START_SPACE_ROW).toBeGreaterThanOrEqual(0);
      expect(Constants.START_SPACE_ROW).toBeLessThan(Constants.BOARD_HEIGHT);
      expect(Constants.START_SPACE_COL).toBeGreaterThanOrEqual(0);
      expect(Constants.START_SPACE_COL).toBeLessThan(Constants.BOARD_WIDTH);
    });
  });

  describe("rune pools", () => {
    it("keeps the special shapes out of the ordinary shape pool", () => {
      // A normal draw indexes RUNE_SHAPES directly, so a Wild or Bomb glyph in
      // that pool would let generateRune produce a special without rolling for
      // one — and it would carry an ordinary color rather than SPECIAL_COLOR.
      expect(Constants.RUNE_SHAPES).not.toContain(Constants.WILD_SHAPE);
      expect(Constants.RUNE_SHAPES).not.toContain(Constants.BOMB_SHAPE);
    });

    it("has no duplicate shapes or colors", () => {
      expect(new Set(Constants.RUNE_SHAPES).size).toBe(Constants.RUNE_SHAPES.length);
      expect(new Set(Constants.RUNE_COLORS).size).toBe(Constants.RUNE_COLORS.length);
    });

    it("keeps SPECIAL_COLOR out of the ordinary color pool", () => {
      expect(Constants.RUNE_COLORS).not.toContain(Constants.SPECIAL_COLOR);
    });
  });

  describe("score tables", () => {
    it.each([
      ["PlacementBaseScores.Gold", ScoreValues.PlacementBaseScores.Gold, MAX_ADJACENCY],
      ["PlacementBaseScores.NonGold", ScoreValues.PlacementBaseScores.NonGold, MAX_ADJACENCY],
      ["ClearSpanBonus.Gold", ScoreValues.ClearSpanBonus.Gold, MAX_SPANS_PER_PLACEMENT],
      ["ClearSpanBonus.NonGold", ScoreValues.ClearSpanBonus.NonGold, MAX_SPANS_PER_PLACEMENT],
    ])("%s covers every reachable key exactly", (_label, table, max) => {
      // A missing key would make scoreMove look up undefined and score the
      // whole move NaN; an extra key is dead weight that can never be hit.
      expect(keysOf(table)).toEqual(range(max));
    });

    it.each([
      ["PlacementBaseScores.Gold", ScoreValues.PlacementBaseScores.Gold],
      ["PlacementBaseScores.NonGold", ScoreValues.PlacementBaseScores.NonGold],
      ["ClearSpanBonus.Gold", ScoreValues.ClearSpanBonus.Gold],
      ["ClearSpanBonus.NonGold", ScoreValues.ClearSpanBonus.NonGold],
    ])("%s never scores less for a higher adjacency/more spans", (_label, table) => {
      // Higher adjacency or more spans cleared should have a higher reward
      // than for easier moves.
      const values = keysOf(table).map(key => table[key]);
      values.forEach((value, i) => {
        expect(typeof value).toBe("number");
        if (i > 0) {
          expect(value).toBeGreaterThanOrEqual(values[i - 1]);
        }
      });
    });

    it("scores a non-gold placement above the equivalent gold one", () => {
      // Turning a fresh cell gold is the point of the game, so it should never
      // pay less than re-covering a cell that was already gold.
      const { Gold, NonGold } = ScoreValues.PlacementBaseScores;
      range(MAX_ADJACENCY).forEach(adjacency => {
        expect(NonGold[adjacency]).toBeGreaterThan(Gold[adjacency]);
      });
    });
  });

  describe("difficulty-indexed arrays", () => {
    it("has one entry per difficulty in each", () => {
      const difficultyCount = Object.keys(Difficulties).length;
      expect(ScoreValues.DIFFICULTY_MULTIPLIERS).toHaveLength(difficultyCount);
      expect(Constants.STARTING_LEVELS).toHaveLength(difficultyCount);
    });

    it("numbers the difficulties 0..n-1 so they can index those arrays", () => {
      const values = Object.values(Difficulties).sort((a, b) => a - b);
      expect(values).toEqual(range(values.length - 1));
    });

    it("raises both the multiplier and the starting level with difficulty", () => {
      [ScoreValues.DIFFICULTY_MULTIPLIERS, Constants.STARTING_LEVELS].forEach(array => {
        array.forEach((value, i) => {
          if (i > 0) expect(value).toBeGreaterThan(array[i - 1]);
        });
      });
    });

    it("starts every difficulty at a level both threshold tables define", () => {
      // Below these indices clamp() would read past the front of the array and
      // return undefined, which draws an undefined rune.
      Constants.STARTING_LEVELS.forEach(level => {
        expect(level).toBeGreaterThan(0);
        expect(level).toBeLessThan(SHAPE_THRESHOLDS.length);
        expect(level).toBeLessThan(COLOR_THRESHOLDS.length);
      });
    });
  });

  describe("level thresholds", () => {
    it.each([
      ["SHAPE_THRESHOLDS", SHAPE_THRESHOLDS],
      ["COLOR_THRESHOLDS", COLOR_THRESHOLDS],
    ])("%s reserves index 0 for the nonexistent level 0", (_label, thresholds) => {
      expect(thresholds[0]).toBe(0);
    });

    it.each([
      ["SHAPE_THRESHOLDS", SHAPE_THRESHOLDS],
      ["COLOR_THRESHOLDS", COLOR_THRESHOLDS],
    ])("%s never shrinks as the level rises", (_label, thresholds) => {
      thresholds.forEach((threshold, level) => {
        expect(Number.isInteger(threshold)).toBe(true);
        if (level > 0) {
          expect(threshold).toBeGreaterThanOrEqual(thresholds[level - 1]);
        }
      });
    });

    it("opens every color by the last level it defines", () => {
      expect(Math.max(...COLOR_THRESHOLDS)).toBe(Constants.RUNE_COLORS.length);
    });

    it("tops the shape thresholds out one past the end of the shape pool", () => {
      // Finding 1 in docs/game-module-findings.md: the largest shape threshold
      // (level 24) is 22 while RUNE_SHAPES holds only 21 glyphs, so a draw at
      // that level can land on index 21 and come back undefined. Asserted as
      // the mismatch it currently is rather than as the `<=` invariant it
      // ought to satisfy — see random.spec.js for the draw that hits it.
      expect(Constants.RUNE_SHAPES).toHaveLength(21);
      expect(Math.max(...SHAPE_THRESHOLDS)).toBe(22);
      expect(Math.max(...SHAPE_THRESHOLDS)).toBeGreaterThan(Constants.RUNE_SHAPES.length);
    });

    it("stays within the shape pool at every level below 24", () => {
      // The overflow above is confined to the final entry: every earlier level
      // indexes safely, so the bug only shows up in a very long game.
      SHAPE_THRESHOLDS.slice(0, -1).forEach(threshold => {
        expect(threshold).toBeLessThanOrEqual(Constants.RUNE_SHAPES.length);
      });
    });

    it("clamps shapes and colors at different levels", () => {
      // The two tables are different lengths, so from level 19 on the shape
      // pool is still growing while the color pool has been maxed out since
      // level 18. random.spec.js pins what that asymmetry draws.
      expect(SHAPE_THRESHOLDS.length).toBeGreaterThan(COLOR_THRESHOLDS.length);
    });
  });
});
