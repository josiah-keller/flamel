import Constants from "@/game/constants";
import Random from "@/game/random";

// random.js is the game's only source of randomness, and Math.random is its
// only seam — every other spec stubs Random.generateRune instead, so this is
// the one file that mocks Math.random directly.
//
// generateRune draws in a fixed order:
//   1. one roll for the special-rune event (Wild / Bomb / neither)
//   2. one roll for the shape, indexing RUNE_SHAPES
//   3. one roll for the color, indexing RUNE_COLORS
// Rolls 2 and 3 are skipped for a special, since it returns early.
function mockRandom(...values) {
  let i = 0;
  // The last value repeats if the code draws more rolls than we supplied, so a
  // test only has to name the rolls it actually cares about.
  return jest.spyOn(Math, "random")
    .mockImplementation(() => values[Math.min(i++, values.length - 1)]);
}

const { SHAPE_THRESHOLDS, COLOR_THRESHOLDS } = Constants.LevelThresholds;
const { DRAW_WILD, DRAW_BOMB } = Constants.Probabilities;

// What draw() will pick for a given roll: pool[floor(rand * threshold)].
function expectedDraw(pool, threshold, rand) {
  return pool[Math.floor(rand * threshold)];
}

function shapeThresholdFor(level) {
  return SHAPE_THRESHOLDS[Math.min(level, SHAPE_THRESHOLDS.length - 1)];
}

function colorThresholdFor(level) {
  return COLOR_THRESHOLDS[Math.min(level, COLOR_THRESHOLDS.length - 1)];
}

describe("rune generation", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("special runes", () => {
    // selectEvent builds cumulative segments from the probabilities and
    // returns the first index whose bound the roll falls strictly under, so
    // the segments are [0, 0.025) wild, [0.025, 0.04) bomb, [0.04, 1) neither.
    const WILD_CEILING = DRAW_WILD;              // 0.025
    const BOMB_CEILING = DRAW_WILD + DRAW_BOMB;  // 0.04

    it.each([
      ["a roll of 0 draws a wild", 0, Constants.WILD_SHAPE],
      ["just under the wild ceiling draws a wild", WILD_CEILING - 0.0001, Constants.WILD_SHAPE],
      ["exactly the wild ceiling draws a bomb", WILD_CEILING, Constants.BOMB_SHAPE],
      ["just under the bomb ceiling draws a bomb", BOMB_CEILING - 0.0001, Constants.BOMB_SHAPE],
    ])("%s", (_label, rand, expectedShape) => {
      mockRandom(rand);
      expect(Random.generateRune(1)).toEqual({
        shape: expectedShape,
        color: Constants.SPECIAL_COLOR,
      });
    });

    it("draws an ordinary rune at exactly the bomb ceiling", () => {
      // The comparison is strict `<`, so 0.04 falls past both segments and
      // selectEvent returns -1 — the switch matches no case and falls through.
      mockRandom(BOMB_CEILING, 0, 0);
      const rune = Random.generateRune(1);
      expect(rune.color).not.toBe(Constants.SPECIAL_COLOR);
      expect(Constants.RUNE_SHAPES).toContain(rune.shape);
    });

    it("returns early for a special, without rolling for shape or color", () => {
      const random = mockRandom(0);
      Random.generateRune(1);
      expect(random).toHaveBeenCalledTimes(1);
    });

    it("rolls three times for an ordinary rune", () => {
      const random = mockRandom(0.5);
      Random.generateRune(1);
      expect(random).toHaveBeenCalledTimes(3);
    });
  });

  describe("allowSpecials=false", () => {
    // Nothing in the game passes this argument — generateRune is only ever
    // called as generateRune(level), from the selectNextRune action. The
    // parameter is dead, but it works, so this pins what it does.
    it("skips the special roll entirely, even on a roll that would draw a wild", () => {
      mockRandom(0, 0, 0);
      const rune = Random.generateRune(1, false);
      expect(rune.shape).toBe(Constants.RUNE_SHAPES[0]);
      expect(rune.color).toBe(Constants.RUNE_COLORS[0]);
    });

    it("rolls only twice, for shape and color", () => {
      const random = mockRandom(0, 0);
      Random.generateRune(1, false);
      expect(random).toHaveBeenCalledTimes(2);
    });
  });

  describe("ordinary draws", () => {
    it.each([
      [1, 0, 0],
      [1, 0.5, 0.5],
      [1, 0.99, 0.99],
      [5, 0.5, 0.75],
      [12, 0.25, 0.6],
    ])("level %i with rolls %f/%f draws the matching pool entries", (level, shapeRand, colorRand) => {
      // Expectations are derived from the pools and thresholds rather than
      // written out, so re-tuning a threshold or a glyph can't silently
      // invalidate the test.
      mockRandom(0.5, shapeRand, colorRand);
      expect(Random.generateRune(level)).toEqual({
        shape: expectedDraw(Constants.RUNE_SHAPES, shapeThresholdFor(level), shapeRand),
        color: expectedDraw(Constants.RUNE_COLORS, colorThresholdFor(level), colorRand),
      });
    });

    it("only ever draws from the open part of each pool", () => {
      // Sweeping the whole roll range at level 1 should stay inside the first
      // 5 shapes and 4 colors, which is what gates the early game's difficulty.
      const level = 1;
      const shapeCeiling = shapeThresholdFor(level);
      const colorCeiling = colorThresholdFor(level);
      for (let roll = 0; roll < 1; roll += 0.01) {
        mockRandom(0.5, roll, roll);
        const rune = Random.generateRune(level);
        expect(Constants.RUNE_SHAPES.slice(0, shapeCeiling)).toContain(rune.shape);
        expect(Constants.RUNE_COLORS.slice(0, colorCeiling)).toContain(rune.color);
        jest.restoreAllMocks();
      }
    });
  });

  describe("level clamping", () => {
    it("opens five shapes and four colors at level 1", () => {
      expect(shapeThresholdFor(1)).toBe(5);
      expect(colorThresholdFor(1)).toBe(4);
    });

    it("keeps opening shapes after the colors have all unlocked", () => {
      // COLOR_THRESHOLDS ends at level 18 and SHAPE_THRESHOLDS at level 24, so
      // clamping kicks in at different levels for the two pools. A level-20
      // draw sees every color but not yet every shape.
      mockRandom(0.5, 0.99, 0.99);
      const rune = Random.generateRune(20);
      expect(colorThresholdFor(20)).toBe(Constants.RUNE_COLORS.length);
      expect(rune.color).toBe(Constants.RUNE_COLORS[Constants.RUNE_COLORS.length - 1]);
      expect(shapeThresholdFor(20)).toBeLessThan(Math.max(...SHAPE_THRESHOLDS));
    });

    it.each([25, 40, 100])("clamps level %i to the level-24 thresholds", (level) => {
      mockRandom(0.5, 0.5, 0.5);
      const high = Random.generateRune(level);
      jest.restoreAllMocks();
      mockRandom(0.5, 0.5, 0.5);
      expect(high).toEqual(Random.generateRune(SHAPE_THRESHOLDS.length - 1));
    });

    it("draws the first shape and color at level 0", () => {
      // Level 0 doesn't exist in play, but its threshold is 0 and
      // `Math.floor(rand * 0)` is always 0 — so instead of failing it quietly
      // draws pool[0]. Surprising, but harmless.
      mockRandom(0.5, 0.99, 0.99);
      expect(Random.generateRune(0)).toEqual({
        shape: Constants.RUNE_SHAPES[0],
        color: Constants.RUNE_COLORS[0],
      });
    });
  });

  describe("the level-24 shape overflow", () => {
    // Finding 1 in docs/game-module-findings.md. SHAPE_THRESHOLDS tops out at
    // 22 while RUNE_SHAPES holds 21 glyphs, so draw() can compute index 21 and
    // read off the end of the array.
    const OVERFLOW_LEVEL = SHAPE_THRESHOLDS.length - 1; // 24
    const SAFE_LEVEL = OVERFLOW_LEVEL - 1;              // 23

    it("draws an undefined shape on the top roll at level 24", () => {
      // 21/22 ≈ 0.9545, so any roll at or above that indexes past the pool.
      mockRandom(0.5, 0.99, 0.5);
      const rune = Random.generateRune(OVERFLOW_LEVEL);
      expect(rune.shape).toBeUndefined();
      expect(rune.color).toBeDefined();
    });

    it("still draws a real shape on a lower roll at level 24", () => {
      mockRandom(0.5, 0.5, 0.5);
      expect(Random.generateRune(OVERFLOW_LEVEL).shape).toBeDefined();
    });

    it("never overflows at level 23, where the threshold matches the pool", () => {
      expect(shapeThresholdFor(SAFE_LEVEL)).toBe(Constants.RUNE_SHAPES.length);
      mockRandom(0.5, 0.999999, 0.5);
      expect(Random.generateRune(SAFE_LEVEL).shape)
        .toBe(Constants.RUNE_SHAPES[Constants.RUNE_SHAPES.length - 1]);
    });

    it("overflows on roughly one in 22 draws at level 24", () => {
      // Quantifies the exposure: a player who reaches level 24 sees a blank
      // rune every ~22 ordinary draws, not as a one-in-a-million edge case.
      const overflowing = Array.from({ length: 22 }, (_, i) => i / 22)
        .filter(roll => {
          jest.restoreAllMocks();
          mockRandom(0.5, roll, 0.5);
          return Random.generateRune(OVERFLOW_LEVEL).shape === undefined;
        });
      expect(overflowing).toHaveLength(1);
    });
  });

  describe("distribution, unmocked", () => {
    // The only test here that uses the real Math.random. Bounds are
    // deliberately loose — this is a sanity check that the probabilities are
    // wired up at all, not a precise statistical assertion. If it ever flakes,
    // widen the bounds or raise SAMPLES rather than deleting it.
    const SAMPLES = 20000;

    it("draws wilds and bombs at roughly their stated probabilities", () => {
      let wilds = 0, bombs = 0;
      for (let i = 0; i < SAMPLES; i++) {
        const { shape } = Random.generateRune(1);
        if (shape === Constants.WILD_SHAPE) wilds++;
        if (shape === Constants.BOMB_SHAPE) bombs++;
      }
      // ±1 percentage point around 2.5% and 1.5%.
      expect(wilds / SAMPLES).toBeGreaterThan(DRAW_WILD - 0.01);
      expect(wilds / SAMPLES).toBeLessThan(DRAW_WILD + 0.01);
      expect(bombs / SAMPLES).toBeGreaterThan(DRAW_BOMB - 0.01);
      expect(bombs / SAMPLES).toBeLessThan(DRAW_BOMB + 0.01);
    });

    it("reaches every shape and color open at level 1", () => {
      const shapes = new Set(), colors = new Set();
      for (let i = 0; i < SAMPLES; i++) {
        const { shape, color } = Random.generateRune(1);
        if (color === Constants.SPECIAL_COLOR) continue;
        shapes.add(shape);
        colors.add(color);
      }
      expect(shapes.size).toBe(shapeThresholdFor(1));
      expect(colors.size).toBe(colorThresholdFor(1));
    });
  });
});
