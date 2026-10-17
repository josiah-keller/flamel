import { createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import { cloneDeep } from "lodash";
import storeConfig from "@/game/store/store-config";
import Constants from "@/game/constants";
import Random from "@/game/random";
import TestData from "./test-data";

// The store in isolation. game.spec.js drives it through Game.* and so covers
// these mutations and actions only incidentally; here they're called directly,
// which is the only way to reach the branches no Game method takes — the
// committedNextRune draw, the out-of-bounds updateCell guard, pausing a clock
// that isn't running.
//
// Game.setStore is deliberately not called: nothing in this file goes through
// game.js, so the module-level singleton there is left alone.

// Two distinct runes for the draw tests. selectNextRune redraws while the new
// rune matches the current one, so a generator that returns a single rune
// forever would spin — see "redraws while the generator repeats the current
// rune" below.
const DRAW_1 = { shape: "G", color: "cyan" };
const DRAW_2 = { shape: "H", color: "yellow" };

function mockRuneDraws(...runes) {
  let draws = 0;
  return jest.spyOn(Random, "generateRune")
    .mockImplementation(() => runes[draws++ % runes.length]);
}

describe("store config", () => {
  let localVue, store;

  beforeEach(() => {
    // storeConfig.state is a shared plain object rather than a factory, so the
    // clone is what keeps state from leaking between tests.
    localVue = createLocalVue();
    localVue.use(Vuex);
    store = new Vuex.Store(cloneDeep(storeConfig));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("initializeBoard", () => {
    beforeEach(() => {
      store.dispatch("initializeBoard");
    });

    it("builds a blank board of the configured size", () => {
      expect(store.state.cells).toHaveLength(Constants.BOARD_HEIGHT);
      store.state.cells.forEach(row => {
        expect(row).toHaveLength(Constants.BOARD_WIDTH);
        row.forEach(cell => {
          expect(cell).toEqual({ shape: null, color: null, gold: false });
        });
      });
    });

    it("gives every row and cell its own object", () => {
      // Array(n).fill(sharedRow) would pass the size check above but make one
      // placement appear in every row at once.
      expect(store.state.cells[0]).not.toBe(store.state.cells[1]);
      expect(store.state.cells[0][0]).not.toBe(store.state.cells[0][1]);
      expect(store.state.cells[0][0]).not.toBe(store.state.cells[1][0]);
    });

    it("clears the game over and board cleared flags", () => {
      store.commit("gameOver");
      store.commit("boardCleared");
      store.dispatch("initializeBoard");
      expect(store.state.isGameOver).toBe(false);
      expect(store.state.isBoardCleared).toBe(false);
    });
  });

  describe("updateCell", () => {
    beforeEach(() => {
      store.dispatch("initializeBoard");
    });

    it("merges into the cell rather than replacing it", () => {
      store.dispatch("updateCell", {
        rowIndex: 2, cellIndex: 3, cell: { shape: "A", color: "red", gold: true },
      });
      // Only gold this time: shape and color have to survive the merge.
      store.dispatch("updateCell", { rowIndex: 2, cellIndex: 3, cell: { gold: false } });
      expect(store.state.cells[2][3]).toEqual({ shape: "A", color: "red", gold: false });
    });

    it("mutates the existing cell object in place", () => {
      // Object.assign onto the cell the board already holds. This is why board
      // fixtures have to be cloneDeep'd on the way in — handing the store a
      // fixture directly would let a test permanently edit it.
      const cell = store.state.cells[0][0];
      store.dispatch("updateCell", { rowIndex: 0, cellIndex: 0, cell: { gold: true } });
      expect(store.state.cells[0][0]).toBe(cell);
    });

    it.each([
      ["negative row", -1, 0],
      ["negative column", 0, -1],
      ["row past the bottom", Constants.BOARD_HEIGHT, 0],
      ["column past the right edge", 0, Constants.BOARD_WIDTH],
    ])("ignores a %s", (_label, rowIndex, cellIndex) => {
      const before = cloneDeep(store.state.cells);
      store.dispatch("updateCell", {
        rowIndex, cellIndex, cell: { shape: "A", color: "red", gold: true },
      });
      expect(store.state.cells).toEqual(before);
    });
  });

  describe("clearCell", () => {
    it("empties the cell and leaves it gold", () => {
      store.dispatch("initializeBoard");
      store.dispatch("updateCell", {
        rowIndex: 1, cellIndex: 1, cell: { shape: "A", color: "red", gold: false },
      });
      store.dispatch("clearCell", { rowIndex: 1, cellIndex: 1 });
      expect(store.state.cells[1][1]).toEqual({ shape: null, color: null, gold: true });
    });
  });

  describe("newGame", () => {
    beforeEach(() => {
      store.commit("setScore", 1234);
      store.commit("setForge", 2);
      store.commit("setRunCount", 7);
      store.commit("setPreviousGameState", { score: 1234 });
      store.commit("setMulliganUsed", true);
      store.commit("setCommittedNextRune", DRAW_1);
      store.dispatch("newGame");
    });

    it("zeroes the score, forge and run counters", () => {
      expect(store.state.score).toBe(0);
      expect(store.state.forge).toBe(0);
      expect(store.state.runCount).toBe(0);
      expect(store.state.maxRun).toBe(0);
    });

    it("clears all three mulligan fields", () => {
      expect(store.state.previousGameState).toBeNull();
      expect(store.state.mulliganUsed).toBe(false);
      expect(store.state.committedNextRune).toBeNull();
    });

    it("leaves the level, difficulty, clock and game over flag alone", () => {
      // Game.init() dispatches newGame and then sets the level and clock
      // itself, so these are the caller's job rather than oversights — but a
      // caller that assumes newGame resets everything would be wrong.
      store.commit("setLevel", 9);
      store.commit("setDifficulty", Constants.Difficulties.HARD);
      store.commit("setTimeAccumulator", 5000);
      store.commit("gameOver");
      store.dispatch("newGame");
      expect(store.state.level).toBe(9);
      expect(store.state.difficulty).toBe(Constants.Difficulties.HARD);
      expect(store.state.timeAccumulator).toBe(5000);
      expect(store.state.isGameOver).toBe(true);
    });
  });

  describe("selectNextRune", () => {
    it("draws from the generator at the current level", () => {
      const generateRune = mockRuneDraws(DRAW_1, DRAW_2);
      store.commit("setLevel", 12);
      store.dispatch("selectNextRune");
      expect(generateRune).toHaveBeenCalledWith(12);
      expect(store.state.nextRune).toEqual(DRAW_1);
    });

    it("accepts the very first draw whatever it is", () => {
      // nextRune starts null, and the redraw loop is guarded by
      // `state.nextRune &&`, so a generator stuck on one rune is safe here.
      const generateRune = mockRuneDraws(DRAW_1);
      store.dispatch("selectNextRune");
      expect(generateRune).toHaveBeenCalledTimes(1);
      expect(store.state.nextRune).toEqual(DRAW_1);
    });

    it("redraws while the generator repeats the current rune", () => {
      // Two consecutive identical runes would look like nothing happened, so
      // the action keeps drawing. The flip side is that a generator which can
      // only return the current rune loops forever — which is why every mock
      // in these specs supplies at least two distinct runes.
      store.commit("setNextRune", DRAW_1);
      const generateRune = mockRuneDraws(DRAW_1, DRAW_1, DRAW_2);
      store.dispatch("selectNextRune");
      expect(generateRune).toHaveBeenCalledTimes(3);
      expect(store.state.nextRune).toEqual(DRAW_2);
    });

    it("compares shape and color, not object identity", () => {
      store.commit("setNextRune", { ...DRAW_1 });
      const generateRune = mockRuneDraws({ ...DRAW_1 }, DRAW_2);
      store.dispatch("selectNextRune");
      expect(generateRune).toHaveBeenCalledTimes(2);
    });

    it("consumes a committed rune instead of drawing", () => {
      // How a mulligan preserves the draw sequence: the rune the player was
      // about to get is stashed, then handed back without touching the
      // generator.
      const generateRune = mockRuneDraws(DRAW_1, DRAW_2);
      store.commit("setCommittedNextRune", TestData.Runes.WILD);
      store.dispatch("selectNextRune");
      expect(generateRune).not.toHaveBeenCalled();
      expect(store.state.nextRune).toEqual(TestData.Runes.WILD);
      expect(store.state.committedNextRune).toBeNull();
    });

    it("draws normally again on the next call after consuming one", () => {
      const generateRune = mockRuneDraws(DRAW_1, DRAW_2);
      store.commit("setCommittedNextRune", TestData.Runes.WILD);
      store.dispatch("selectNextRune");
      store.dispatch("selectNextRune");
      expect(generateRune).toHaveBeenCalledTimes(1);
      expect(store.state.nextRune).toEqual(DRAW_1);
    });
  });

  describe("setWildRune", () => {
    it("sets the next rune to a wild", () => {
      store.dispatch("setWildRune");
      expect(store.state.nextRune).toEqual(TestData.Runes.WILD);
    });
  });

  describe("forge", () => {
    it("increments and clears", () => {
      store.dispatch("incrementForge");
      store.dispatch("incrementForge");
      expect(store.state.forge).toBe(2);
      store.dispatch("clearForge");
      expect(store.state.forge).toBe(0);
    });

    it("decrements no lower than zero", () => {
      // A placement decrements the forge, so this clamp is hit on any board
      // where the player places before ever discarding.
      store.dispatch("decrementForge");
      expect(store.state.forge).toBe(0);
      store.commit("setForge", 1);
      store.dispatch("decrementForge");
      store.dispatch("decrementForge");
      expect(store.state.forge).toBe(0);
    });
  });

  describe("run count", () => {
    it("ratchets maxRun up and never back down", () => {
      store.dispatch("updateRunCount");
      store.commit("setRunCount", 5);
      expect(store.state.maxRun).toBe(5);
      store.dispatch("resetRunCount");
      expect(store.state.runCount).toBe(0);
      expect(store.state.maxRun).toBe(5);
    });

    it("needs setMaxRun to lower maxRun", () => {
      // This is why mulligan() commits setMaxRun *after* setRunCount: the
      // restore would otherwise leave maxRun at the post-move high water mark.
      store.commit("setRunCount", 5);
      store.commit("setRunCount", 2);
      expect(store.state.maxRun).toBe(5);
      store.commit("setMaxRun", 2);
      expect(store.state.maxRun).toBe(2);
    });
  });

  describe("score and level", () => {
    it("adds to the score and records the increment", () => {
      store.dispatch("incrementScore", 30);
      store.dispatch("incrementScore", 15);
      expect(store.state.score).toBe(45);
      expect(store.state.lastScoreIncrement).toBe(15);
    });

    it("sets and increments the level", () => {
      store.dispatch("setLevel", 6);
      store.dispatch("incrementLevel");
      expect(store.state.level).toBe(7);
    });
  });

  describe("the clock", () => {
    it("starts by stamping the current time", () => {
      store.dispatch("startClock");
      expect(store.state.startTime).toBeInstanceOf(Date);
      expect(Date.now() - store.state.startTime.getTime()).toBeLessThan(1000);
    });

    it("accumulates the elapsed time on pause", () => {
      store.commit("setStartTime", new Date(Date.now() - 10000));
      store.dispatch("pauseClock");
      expect(store.state.timeAccumulator).toBeGreaterThanOrEqual(10000);
      expect(store.state.timeAccumulator).toBeLessThan(15000);
    });

    it("adds to whatever had already accumulated", () => {
      store.commit("setTimeAccumulator", 60000);
      store.commit("setStartTime", new Date(Date.now() - 5000));
      store.dispatch("pauseClock");
      expect(store.state.timeAccumulator).toBeGreaterThanOrEqual(65000);
      expect(store.state.timeAccumulator).toBeLessThan(70000);
    });

    it("stops the clock when it banks the time", () => {
      store.commit("setStartTime", new Date(Date.now() - 10000));
      store.dispatch("pauseClock");
      expect(store.state.startTime).toBeNull();
    });

    it("counts a stretch of time once however often it is paused", () => {
      store.commit("setStartTime", new Date(Date.now() - 10000));
      store.dispatch("pauseClock");
      const once = store.state.timeAccumulator;
      store.dispatch("pauseClock");
      store.dispatch("pauseClock");
      expect(store.state.timeAccumulator).toBe(once);
    });

    it("does nothing when paused before the clock was ever started", () => {
      expect(store.state.startTime).toBeNull();
      expect(() => store.dispatch("pauseClock")).not.toThrow();
      expect(store.state.timeAccumulator).toBe(0);
    });

    it("banks each stretch separately across a start and pause cycle", () => {
      store.commit("setStartTime", new Date(Date.now() - 10000));
      store.dispatch("pauseClock");
      store.commit("setStartTime", new Date(Date.now() - 5000));
      store.dispatch("pauseClock");
      expect(store.state.timeAccumulator).toBeGreaterThanOrEqual(15000);
      expect(store.state.timeAccumulator).toBeLessThan(20000);
    });

    it("resets the accumulator but keeps the start time", () => {
      // resetClock is unchanged: Game.init() dispatches it before startClock,
      // so it only ever has to zero the total.
      store.dispatch("startClock");
      const startTime = store.state.startTime;
      store.commit("setTimeAccumulator", 30000);
      store.dispatch("resetClock");
      expect(store.state.timeAccumulator).toBe(0);
      expect(store.state.startTime).toBe(startTime);
    });

    it("stops and restarts the clock around a pause", () => {
      store.commit("setStartTime", new Date(Date.now() - 10000));
      store.dispatch("pauseGame");
      expect(store.state.isPaused).toBe(true);
      expect(store.state.timeAccumulator).toBeGreaterThanOrEqual(10000);

      const pausedAt = store.state.timeAccumulator;
      store.dispatch("resumeGame");
      expect(store.state.isPaused).toBe(false);
      // Resuming restamps startTime, so the paused stretch isn't counted.
      expect(Date.now() - store.state.startTime.getTime()).toBeLessThan(1000);
      expect(store.state.timeAccumulator).toBe(pausedAt);
    });

    it("is harmless to pause an already paused game", () => {
      // Pausing again should be a no-op
      store.commit("setStartTime", new Date(Date.now() - 10000));
      store.dispatch("pauseGame");
      const pausedAt = store.state.timeAccumulator;
      store.dispatch("pauseGame");
      expect(store.state.isPaused).toBe(true);
      expect(store.state.timeAccumulator).toBe(pausedAt);
    });
  });

  describe("discardRune", () => {
    it("records a copy of the discarded rune", () => {
      // Copy, not reference
      const rune = { ...DRAW_1 };
      store.commit("setNextRune", rune);
      store.dispatch("discardRune");
      expect(store.state.discardedRune).toEqual(rune);
      expect(store.state.discardedRune).not.toBe(rune);
    });

    it("keeps the discarded rune when the next one is replaced", () => {
      store.commit("setNextRune", { ...DRAW_1 });
      store.dispatch("discardRune");
      store.commit("setNextRune", { ...DRAW_2 });
      expect(store.state.discardedRune).toEqual(DRAW_1);
    });

    it("records null rather than an empty rune when there is nothing to discard", () => {
      // Forge.vue watches discardedRune and returns early on an exact null, so
      // the copy must not turn a null rune into a truthy `{}`. Not reachable in
      // play — a rune is always drawn before a discard is possible.
      store.commit("setNextRune", null);
      store.dispatch("discardRune");
      expect(store.state.discardedRune).toBeNull();
    });
  });

  describe("the mulligan snapshot", () => {
    beforeEach(() => {
      store.dispatch("initializeBoard");
      store.commit("setNextRune", DRAW_1);
      store.commit("setScore", 500);
      store.commit("setRunCount", 3);
      store.commit("setForge", 2);
    });

    it("captures exactly the fields a mulligan restores", () => {
      store.dispatch("saveMulliganSnapshot");
      expect(Object.keys(store.state.previousGameState).sort())
        .toEqual(["cells", "forge", "maxRun", "nextRune", "runCount", "score"]);
      expect(store.state.previousGameState).toMatchObject({
        score: 500, runCount: 3, maxRun: 3, forge: 2, nextRune: DRAW_1,
      });
    });

    it("deep clones the board", () => {
      store.dispatch("updateCell", {
        rowIndex: 0, cellIndex: 0, cell: { shape: "A", color: "red", gold: true },
      });
      store.dispatch("saveMulliganSnapshot");
      // A shallow copy here would let the next placement rewrite history.
      store.dispatch("updateCell", {
        rowIndex: 0, cellIndex: 0, cell: { shape: "B", color: "blue" },
      });
      expect(store.state.previousGameState.cells[0][0].shape).toBe("A");
    });

    it("snapshots an empty object when there is no next rune", () => {
      // `{ ...null }` is `{}`, not null. Only reachable before the first draw,
      // but it means the restored rune would be a blank one rather than null.
      store.commit("setNextRune", null);
      store.dispatch("saveMulliganSnapshot");
      expect(store.state.previousGameState.nextRune).toEqual({});
    });

    it("omits the level, difficulty and clock", () => {
      store.dispatch("saveMulliganSnapshot");
      const snapshot = store.state.previousGameState;
      expect(snapshot.level).toBeUndefined();
      expect(snapshot.difficulty).toBeUndefined();
      expect(snapshot.timeAccumulator).toBeUndefined();
    });

    it("clears both the snapshot and the committed rune", () => {
      store.dispatch("saveMulliganSnapshot");
      store.commit("setCommittedNextRune", DRAW_2);
      store.dispatch("clearMulliganSnapshot");
      expect(store.state.previousGameState).toBeNull();
      expect(store.state.committedNextRune).toBeNull();
    });
  });

  describe("flags", () => {
    it.each([
      ["gameOver", "gameUnover", "isGameOver"],
      ["boardCleared", "boardUncleared", "isBoardCleared"],
      ["gameActive", "gameInactive", "isGameActive"],
    ])("%s and %s toggle %s", (set, unset, flag) => {
      expect(store.state[flag]).toBe(false);
      store.commit(set);
      expect(store.state[flag]).toBe(true);
      store.commit(unset);
      expect(store.state[flag]).toBe(false);
    });

    it("initializes the game one way only", () => {
      // There is no gameUninitialized counterpart — once set, the flag stays
      // set for the life of the store.
      store.commit("gameInitialized");
      expect(store.state.isGameInitialized).toBe(true);
      expect(storeConfig.mutations.gameUninitialized).toBeUndefined();
    });

    it("counts up the mulligan board animation trigger", () => {
      // Components watch this counter rather than a boolean so that two
      // mulligans in a row both animate.
      expect(store.state.mulliganBoardAnimationTick).toBe(0);
      store.commit("triggerMulliganBoardAnimation");
      store.commit("triggerMulliganBoardAnimation");
      expect(store.state.mulliganBoardAnimationTick).toBe(2);
    });
  });

  describe("the high scores screen", () => {
    it("opens on all difficulties by default", () => {
      store.dispatch("openHighScores");
      expect(store.state.showHighScores).toBe(true);
      expect(store.state.highScoresInitialDifficulty).toBeNull();
    });

    it("opens on a given difficulty", () => {
      store.dispatch("openHighScores", Constants.Difficulties.HARD);
      expect(store.state.highScoresInitialDifficulty).toBe(Constants.Difficulties.HARD);
    });

    it("resets both fields on close", () => {
      store.dispatch("openHighScores", Constants.Difficulties.MEDIUM);
      store.dispatch("closeHighScores");
      expect(store.state.showHighScores).toBe(false);
      expect(store.state.highScoresInitialDifficulty).toBeNull();
    });
  });
});
