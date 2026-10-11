import { createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import { cloneDeep } from "lodash";
import storeConfig from "@/game/store/store-config";
import Constants from "@/game/constants";
import Game from "@/game/game";
import Random from "@/game/random";
import Highscores from "@/game/highscores";
import TestData from "./test-data";

// Board fixtures are shared module-level objects, and the store mutates cells
// in place, so always hand the store a copy.
function useBoard(store, cells) {
  store.commit("setCells", cloneDeep(cells));
}

function fillCell(store, rowIndex, cellIndex, rune) {
  store.dispatch("updateCell", {
    rowIndex,
    cellIndex,
    cell: { ...rune, gold: true },
  });
}

// Make Random.generateRune hand out the given runes in a repeating cycle.
// Pass at least two *distinct* runes: selectNextRune redraws while the new rune
// matches the current one, so a single repeated rune would spin forever.
function mockRuneDraws(...runes) {
  let draws = 0;
  return jest.spyOn(Random, "generateRune")
    .mockImplementation(() => runes[draws++ % runes.length]);
}

// Shape "F" doesn't appear in any fixture, so these runes only ever match a
// fixture rune by color.
const RED_F = { shape: "F", color: "red" };
const BLUE_F = { shape: "F", color: "blue" };
const GREEN_F = { shape: "F", color: "green" };
const BLUE_A = { shape: "A", color: "blue" };
// Draws handed back by the mocked generator, distinct from everything above.
const DRAW_1 = { shape: "G", color: "cyan" };
const DRAW_2 = { shape: "H", color: "yellow" };

const { WILD, BOMB } = TestData.Runes;
const { EASY, MEDIUM, HARD } = Constants.Difficulties;

describe("game logic", () => {
  let localVue, store, incrementBoardsPlayed;

  beforeEach(() => {
    // Create a new store each time
    localVue = createLocalVue();
    localVue.use(Vuex);
    store = new Vuex.Store(cloneDeep(storeConfig));
    Game.setStore(store);
    // pauseClock reads startTime, so anything that ends the game needs a clock
    // that has been started. Tests that assert on timing override this.
    store.commit("setStartTime", new Date());
    // Keep board-cleared bookkeeping away from real localStorage.
    incrementBoardsPlayed = jest.spyOn(Highscores, "incrementBoardsPlayed")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("game start", () => {
    it("starts with blank board, with wild starting space", () => {
      Game.init();
      for (let row=0; row<Constants.BOARD_HEIGHT; row++) {
        for (let col=0; col<Constants.BOARD_WIDTH; col++) {
          const cell = store.state.cells[row][col];
          if (row === Constants.START_SPACE_ROW && col === Constants.START_SPACE_COL) {
            expect(cell.shape).toBe(Constants.WILD_SHAPE);
            expect(cell.color).toBe(Constants.SPECIAL_COLOR);
            expect(cell.gold).toBe(true);
          } else {
            expect(cell.shape).toBeNull();
            expect(cell.color).toBeNull();
            expect(cell.gold).toBe(false);
          }
        }
      }
    });
    it("starts the clock from zero", () => {
      Game.init();
      expect(store.state.timeAccumulator).toBe(0);
      // startTime should be now-ish
      expect(Date.now() - store.state.startTime.getTime()).toBeLessThan(500);
    });
  });

  describe("rune placement", () => {
    it.each([
      [TestData.Boards.LEVEL_1_MIDWAY, 0, 0, true],
      [TestData.Boards.LEVEL_1_MIDWAY, 3, 5, true],
      [TestData.Boards.LEVEL_1_MIDWAY, 5, 6, true],
      [TestData.Boards.LEVEL_1_MIDWAY, 1, 4, false],
      [TestData.Boards.LEVEL_1_MIDWAY, 2, 3, true],
    ])("identifies occupied cells %#", (board, row, col, expected) => {
      useBoard(store, board.cells);
      expect(Game.cellOccupied(row, col)).toBe(expected);
    });
  });

  describe("blankRune", () => {
    it.each([
      [{ shape: null, color: null }, true],
      [{ shape: "A", color: null }, false],
      [{ shape: null, color: "red" }, false],
      [{ shape: "A", color: "red" }, false],
    ])("identifies blank runes %#", (rune, expected) => {
      expect(Game.blankRune(rune)).toBe(expected);
    });
  });

  describe("runesCompatible", () => {
    it.each([
      ["same shape, different color", { shape: "A", color: "red" }, { shape: "A", color: "blue" }, true],
      ["same color, different shape", { shape: "A", color: "red" }, { shape: "B", color: "red" }, true],
      ["neither shape nor color matches", { shape: "A", color: "red" }, { shape: "B", color: "blue" }, false],
      ["first rune is wild", WILD, { shape: "B", color: "blue" }, true],
      ["second rune is wild", { shape: "B", color: "blue" }, WILD, true],
      ["first rune is blank", { shape: null, color: null }, { shape: "B", color: "blue" }, true],
      ["second rune is blank", { shape: "B", color: "blue" }, { shape: null, color: null }, true],
    ])("%s", (_label, rune1, rune2, expected) => {
      expect(Game.runesCompatible(rune1, rune2)).toBe(expected);
    });
  });

  describe("countAdjacency", () => {
    beforeEach(() => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
    });

    it.each([
      [0, 0, 0],
      [1, 0, 1],
      [3, 4, 2],
      [5, 2, 3],
      [6, 6, 4],
      // Edge cells, where some of the four directions don't exist
      [7, 5, 2],
      [6, 8, 1],
    ])("counts %i,%i as adjacency %i", (row, col, expected) => {
      expect(Game.countAdjacency(row, col)).toBe(expected);
    });

    // Note the type inconsistency: out of bounds yields `false`, not 0. Callers
    // that feed the result straight into the score matrix would look it up
    // under the key "false" and get undefined.
    it.each([
      [-1, 0],
      [Constants.BOARD_HEIGHT, 0],
      [0, -1],
      [0, Constants.BOARD_WIDTH],
    ])("returns false (not 0) out of bounds at %i,%i", (row, col) => {
      expect(Game.countAdjacency(row, col)).toBe(false);
    });
  });

  describe("moveLegal", () => {
    it.each([
      [-1, 4],
      [Constants.BOARD_HEIGHT, 4],
      [4, -1],
      [4, Constants.BOARD_WIDTH],
    ])("rejects out-of-bounds coordinates %i,%i", (row, col) => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      expect(Game.moveLegal(RED_F, row, col)).toBe(false);
    });

    it("rejects an occupied cell", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      expect(Game.moveLegal(RED_F, 1, 1)).toBe(false);
    });

    it("allows a wild rune as the first move of a blank board", () => {
      useBoard(store, TestData.Boards.ALL_BLANK.cells);
      expect(Game.moveLegal(WILD, 0, 0)).toBe(true);
      expect(Game.moveLegal(WILD, 4, 4)).toBe(true);
    });

    it("rejects a non-wild rune as the first move of a blank board", () => {
      useBoard(store, TestData.Boards.ALL_BLANK.cells);
      expect(Game.moveLegal(RED_F, 4, 4)).toBe(false);
    });

    it("allows a placement next to a compatible neighbor", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      // (1,1) is A/red; F/red matches by color
      expect(Game.moveLegal(RED_F, 1, 0)).toBe(true);
      // (5,2)'s three neighbors are all red
      expect(Game.moveLegal(RED_F, 5, 2)).toBe(true);
    });

    it("rejects a placement where any one neighbor is incompatible", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      // (5,2)'s neighbors are D/red, A/red and E/red. A/blue matches the A by
      // shape but clashes with the other two, so the move is still illegal.
      expect(Game.runesCompatible(BLUE_A, store.state.cells[6][2])).toBe(true);
      expect(Game.moveLegal(BLUE_A, 5, 2)).toBe(false);
    });

    it("allows a placement on the board edge", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      // (6,8) is on the right edge; its only populated neighbor is D/blue
      expect(Game.moveLegal(BLUE_F, 6, 8)).toBe(true);
      // (7,5) is on the bottom edge, between C/blue and E/blue
      expect(Game.moveLegal(BLUE_F, 7, 5)).toBe(true);
    });

    it("rejects a blank cell with no populated neighbors", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      expect(Game.moveLegal(RED_F, 0, 0)).toBe(false);
    });

    it("allows a wild rune next to mutually incompatible neighbors", () => {
      useBoard(store, TestData.Boards.NO_LEGAL_MOVES.cells);
      expect(Game.moveLegal(RED_F, 0, 4)).toBe(false);
      expect(Game.moveLegal(WILD, 0, 4)).toBe(true);
    });
  });

  describe("anyMoveLegal", () => {
    it("always reports a bomb as playable", () => {
      useBoard(store, TestData.Boards.NO_LEGAL_MOVES.cells);
      expect(Game.anyMoveLegal(BOMB)).toBe(true);
    });

    it("reports no legal move when every blank cell is hemmed in", () => {
      useBoard(store, TestData.Boards.NO_LEGAL_MOVES.cells);
      expect(Game.anyMoveLegal(RED_F)).toBe(false);
      expect(Game.anyMoveLegal(BLUE_A)).toBe(false);
    });

    it("finds a legal move when one exists", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      expect(Game.anyMoveLegal(RED_F)).toBe(true);
      // A wild can always play, even on the hemmed-in board
      useBoard(store, TestData.Boards.NO_LEGAL_MOVES.cells);
      expect(Game.anyMoveLegal(WILD)).toBe(true);
    });
  });

  describe("clearFullSpans", () => {
    it("clears a completed row only", () => {
      useBoard(store, TestData.Boards.ONE_CELL_FROM_ROW_CLEAR.cells);
      store.commit("setForge", 2);
      fillCell(store, 0, 4, RED_F);

      expect(Game.clearFullSpans(0, 4)).toBe(1);
      for (let col=0; col<Constants.BOARD_WIDTH; col++) {
        expect(store.state.cells[0][col].shape).toBeNull();
        expect(store.state.cells[0][col].color).toBeNull();
      }
      // Column 0 was not complete, so (1,0) survives
      expect(store.state.cells[1][0].shape).toBe("A");
      expect(store.state.forge).toBe(0);
    });

    it("leaves cleared cells gold", () => {
      useBoard(store, TestData.Boards.ONE_CELL_FROM_ROW_CLEAR.cells);
      // (0,4) starts out not gold; filling it turns it gold
      fillCell(store, 0, 4, RED_F);
      Game.clearFullSpans(0, 4);
      for (let col=0; col<Constants.BOARD_WIDTH; col++) {
        expect(store.state.cells[0][col].gold).toBe(true);
      }
    });

    it("clears a completed column only", () => {
      useBoard(store, TestData.Boards.ONE_CELL_FROM_COL_CLEAR.cells);
      store.commit("setForge", 2);
      fillCell(store, 3, 0, RED_F);

      expect(Game.clearFullSpans(3, 0)).toBe(1);
      for (let row=0; row<Constants.BOARD_HEIGHT; row++) {
        expect(store.state.cells[row][0].shape).toBeNull();
        expect(store.state.cells[row][0].gold).toBe(true);
      }
      // Row 3 was not complete, so the unrelated rune at (5,5) survives
      expect(store.state.cells[5][5].shape).toBe("A");
      expect(store.state.forge).toBe(0);
    });

    it("clears a row and a column completed by the same move", () => {
      useBoard(store, TestData.Boards.ONE_CELL_FROM_BOTH_CLEAR.cells);
      store.commit("setForge", 2);
      fillCell(store, 3, 4, RED_F);

      expect(Game.clearFullSpans(3, 4)).toBe(2);
      for (let col=0; col<Constants.BOARD_WIDTH; col++) {
        expect(store.state.cells[3][col].shape).toBeNull();
      }
      for (let row=0; row<Constants.BOARD_HEIGHT; row++) {
        expect(store.state.cells[row][4].shape).toBeNull();
      }
      expect(store.state.cells[0][0].shape).toBe("A");
      expect(store.state.forge).toBe(0);
    });

    it("clears nothing and leaves the forge alone when no span is complete", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setForge", 2);
      fillCell(store, 5, 2, RED_F);
      const before = cloneDeep(store.state.cells);

      expect(Game.clearFullSpans(5, 2)).toBe(0);
      expect(store.state.cells).toEqual(before);
      expect(store.state.forge).toBe(2);
    });
  });

  describe("scoreMove", () => {
    it.each([
      // [wasCellGold, adjacency, spansCleared, expected]
      [false, 0, 0, 5],
      [false, 1, 0, 5],
      [false, 2, 0, 15],
      [false, 3, 0, 30],
      [false, 4, 0, 50],
      [true, 0, 0, 1],
      [true, 1, 0, 1],
      [true, 2, 0, 2],
      [true, 3, 0, 3],
      [true, 4, 0, 4],
      [false, 1, 1, 55],
      [false, 2, 1, 65],
      [false, 3, 1, 80],
      [false, 4, 1, 100],
      [false, 4, 2, 300],
      [true, 1, 1, 6],
      [true, 2, 1, 7],
      [true, 4, 1, 9],
      [true, 4, 2, 34],
    ])("gold=%s adjacency=%i spans=%i scores %i", (wasCellGold, adjacency, spansCleared, expected) => {
      expect(Game.scoreMove(wasCellGold, adjacency, spansCleared)).toBe(expected);
    });

    it.each([
      [EASY, 1],
      [MEDIUM, 2],
      [HARD, 4],
    ])("scales by the difficulty multiplier (difficulty %i)", (difficulty, multiplier) => {
      store.dispatch("setDifficulty", difficulty);
      expect(Game.scoreMove(false, 2, 1)).toBe(65 * multiplier);
      expect(Game.scoreMove(true, 3, 0)).toBe(3 * multiplier);
    });
  });

  describe("scoreBoardClear", () => {
    // Worked examples from NOTES.md: (500 + 125n) * multiplier, where n counts
    // boards already completed at this difficulty.
    it.each([
      [EASY, 1, 500],
      [EASY, 2, 625],
      [EASY, 3, 750],
      [EASY, 4, 875],
      [MEDIUM, 6, 1000],
      [MEDIUM, 7, 1250],
      [HARD, 11, 2000],
      [HARD, 12, 2500],
    ])("difficulty %i at level %i awards %i", (difficulty, level, expected) => {
      store.dispatch("setDifficulty", difficulty);
      store.dispatch("setLevel", level);
      expect(Game.scoreBoardClear()).toBe(expected);
    });

    it("grows with each level completed", () => {
      store.dispatch("setDifficulty", EASY);
      store.dispatch("setLevel", Constants.STARTING_LEVELS[EASY]);
      expect(Game.scoreBoardClear()).toBe(500);
      store.dispatch("incrementLevel");
      store.dispatch("incrementLevel");
      expect(Game.scoreBoardClear()).toBe(750);
    });
  });

  describe("board state checks", () => {
    it("recognizes an all-gold board", () => {
      useBoard(store, TestData.Boards.ALMOST_ALL_GOLD.cells);
      expect(Game.isBoardAllGold()).toBe(false);
      useBoard(store, TestData.Boards.ALL_GOLD.cells);
      expect(Game.isBoardAllGold()).toBe(true);
    });

    it("only reports the board cleared once every cell is gold", () => {
      const boardCleared = jest.spyOn(Game, "boardCleared");

      useBoard(store, TestData.Boards.ALMOST_ALL_GOLD.cells);
      Game.checkForBoardCleared();
      expect(boardCleared).not.toHaveBeenCalled();

      useBoard(store, TestData.Boards.ALL_GOLD.cells);
      Game.checkForBoardCleared();
      expect(boardCleared).toHaveBeenCalled();
    });

    it("recognizes an all-blank board", () => {
      useBoard(store, TestData.Boards.ALMOST_ALL_BLANK.cells);
      expect(Game.isBoardAllBlank()).toBe(false);
      useBoard(store, TestData.Boards.ALL_BLANK.cells);
      expect(Game.isBoardAllBlank()).toBe(true);
    });

    it("only ends the game once every cell is blank", () => {
      const gameOver = jest.spyOn(Game, "gameOver");

      useBoard(store, TestData.Boards.ALMOST_ALL_BLANK.cells);
      Game.checkForBlankBoard();
      expect(gameOver).not.toHaveBeenCalled();

      useBoard(store, TestData.Boards.ALL_BLANK.cells);
      Game.checkForBlankBoard();
      expect(gameOver).toHaveBeenCalled();
    });
  });

  describe("place", () => {
    it("places the rune and advances the game state", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setForge", 2);
      store.commit("setNextRune", RED_F);
      mockRuneDraws(DRAW_1, DRAW_2);

      Game.place(5, 2);

      expect(store.state.cells[5][2]).toEqual({ ...RED_F, gold: true });
      // Adjacency 3, not previously gold, no span cleared
      expect(store.state.score).toBe(30);
      expect(store.state.lastScoreIncrement).toBe(30);
      expect(store.state.runCount).toBe(1);
      expect(store.state.maxRun).toBe(1);
      expect(store.state.forge).toBe(1);
      expect(store.state.nextRune).toEqual(DRAW_1);
    });

    it("saves a mulligan snapshot of the pre-move state", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setForge", 2);
      store.commit("setNextRune", RED_F);
      mockRuneDraws(DRAW_1, DRAW_2);
      const before = cloneDeep(store.state.cells);

      Game.place(5, 2);

      expect(store.state.previousGameState).toEqual({
        cells: before,
        score: 0,
        nextRune: RED_F,
        runCount: 0,
        maxRun: 0,
        forge: 2,
      });
    });

    it("scores a placement on an already-gold cell at the gold rate", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setNextRune", BLUE_F);
      mockRuneDraws(DRAW_1, DRAW_2);

      // (6,6) is blank but already gold, with four blue neighbors
      Game.place(6, 6);

      expect(store.state.cells[6][6]).toEqual({ ...BLUE_F, gold: true });
      expect(store.state.score).toBe(4);
    });

    it("leaves the board untouched on an illegal move", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setForge", 2);
      store.commit("setNextRune", GREEN_F);
      mockRuneDraws(DRAW_1, DRAW_2);
      const before = cloneDeep(store.state.cells);

      // Green clashes with (5,2)'s all-red neighbors
      Game.place(5, 2);

      expect(store.state.cells).toEqual(before);
      expect(store.state.score).toBe(0);
      expect(store.state.runCount).toBe(0);
      expect(store.state.forge).toBe(2);
      expect(store.state.nextRune).toEqual(GREEN_F);
    });

    // saveMulliganSnapshot runs after the legality check, so a misclick leaves
    // the undo snapshot the player is holding alone.
    it("leaves the mulligan snapshot alone on an illegal move", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setNextRune", GREEN_F);
      store.commit("setPreviousGameState", null);

      Game.place(5, 2);

      expect(store.state.previousGameState).toBeNull();
    });

    it("includes the span-clear bonus when a placement completes a row", () => {
      useBoard(store, TestData.Boards.ONE_CELL_FROM_ROW_CLEAR.cells);
      store.commit("setForge", 2);
      store.commit("setNextRune", RED_F);
      mockRuneDraws(DRAW_1, DRAW_2);

      Game.place(0, 4);

      // Adjacency 2, not previously gold, one span cleared: 15 + 50
      expect(store.state.score).toBe(65);
      for (let col=0; col<Constants.BOARD_WIDTH; col++) {
        expect(store.state.cells[0][col].shape).toBeNull();
        expect(store.state.cells[0][col].gold).toBe(true);
      }
      // clearFullSpans resets the forge, then place decrements it
      expect(store.state.forge).toBe(0);
      expect(store.state.isGameOver).toBe(false);
      expect(store.state.isBoardCleared).toBe(false);
    });

    it("includes the double-span bonus when a placement completes both spans", () => {
      useBoard(store, TestData.Boards.ONE_CELL_FROM_BOTH_CLEAR.cells);
      store.commit("setNextRune", RED_F);
      mockRuneDraws(DRAW_1, DRAW_2);

      Game.place(3, 4);

      // Adjacency 4, not previously gold, two spans cleared: 50 + 250.
      // This is the move NOTES.md observed scoring 300 on Easy.
      expect(store.state.score).toBe(300);
    });

    it("ends the game when a span clear empties the board", () => {
      useBoard(store, TestData.Boards.ROW_CLEAR_EMPTIES_BOARD.cells);
      store.commit("setNextRune", RED_F);
      mockRuneDraws(DRAW_1, DRAW_2);

      Game.place(0, 4);

      expect(Game.isBoardAllBlank()).toBe(true);
      expect(store.state.isGameOver).toBe(true);
    });

    it("clears the board when a placement turns the last cell gold", () => {
      useBoard(store, TestData.Boards.ONE_CELL_FROM_BOARD_CLEAR.cells);
      store.commit("setNextRune", BLUE_A);
      mockRuneDraws(DRAW_1, DRAW_2);

      Game.place(3, 5);

      expect(store.state.isBoardCleared).toBe(true);
      expect(store.state.isGameOver).toBe(false);
      // Adjacency 1, not previously gold (5), plus the level 1 Easy bonus (500)
      expect(store.state.score).toBe(505);
      expect(incrementBoardsPlayed).toHaveBeenCalledTimes(1);
    });

    // A span clear on an otherwise-gold board is all-blank *and* all-gold at
    // once. All-gold is a win by the game's own definition, so the cleared
    // board wins and the blank-board game over never runs.
    it("clears the board, and doesn't end the game, when a span clear empties an all-gold board", () => {
      useBoard(store, TestData.Boards.ALL_GOLD_ROW_CLEAR.cells);
      store.commit("setNextRune", RED_F);
      mockRuneDraws(DRAW_1, DRAW_2);

      Game.place(3, 4);

      expect(Game.isBoardAllBlank()).toBe(true);
      expect(store.state.isBoardCleared).toBe(true);
      expect(store.state.isGameOver).toBe(false);
      // (3,4) was already gold: adjacency 2 (2), one span cleared (5), plus
      // the level 1 Easy board bonus (500)
      expect(store.state.score).toBe(507);
      expect(incrementBoardsPlayed).toHaveBeenCalledTimes(1);
    });

    it("pauses the clock exactly once on a span clear that empties an all-gold board", () => {
      useBoard(store, TestData.Boards.ALL_GOLD_ROW_CLEAR.cells);
      store.commit("setNextRune", RED_F);
      mockRuneDraws(DRAW_1, DRAW_2);
      store.commit("setStartTime", new Date(Date.now() - 10000));

      Game.place(3, 4);

      // One pause banks ~10s; the old double pause banked it twice
      expect(store.state.timeAccumulator).toBeGreaterThanOrEqual(10000);
      expect(store.state.timeAccumulator).toBeLessThan(15000);
    });
  });

  describe("placeBomb", () => {
    it("clears an occupied cell without scoring", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setForge", 2);
      store.commit("setNextRune", BOMB);
      mockRuneDraws(DRAW_1, DRAW_2);

      Game.place(1, 1);

      expect(store.state.cells[1][1]).toEqual({ shape: null, color: null, gold: true });
      expect(store.state.score).toBe(0);
      expect(store.state.runCount).toBe(0);
      expect(store.state.forge).toBe(1);
      expect(store.state.nextRune).toEqual(DRAW_1);
    });

    it("does nothing when aimed at an empty cell", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setForge", 2);
      store.commit("setNextRune", BOMB);
      mockRuneDraws(DRAW_1, DRAW_2);
      store.commit("setPreviousGameState", null);
      const before = cloneDeep(store.state.cells);

      Game.place(0, 0);

      expect(store.state.cells).toEqual(before);
      expect(store.state.score).toBe(0);
      expect(store.state.forge).toBe(2);
      expect(store.state.nextRune).toEqual(BOMB);
      // the wasted click doesn't burn the mulligan snapshot either
      expect(store.state.previousGameState).toBeNull();
    });

    it("ends the game when it clears the last occupied cell", () => {
      useBoard(store, TestData.Boards.ALMOST_ALL_BLANK.cells);
      store.commit("setNextRune", BOMB);
      mockRuneDraws(DRAW_1, DRAW_2);

      Game.place(3, 4);

      expect(Game.isBoardAllBlank()).toBe(true);
      expect(store.state.isGameOver).toBe(true);
    });

    // A bomb empties a cell as gold, so bombing the last rune off an otherwise
    // gold board is all-gold and all-blank at once. Same rule as a span clear:
    // all-gold is a win.
    it("clears the board when it bombs the last rune off an all-gold board", () => {
      useBoard(store, TestData.Boards.ALL_GOLD_ONE_RUNE_LEFT.cells);
      store.commit("setNextRune", BOMB);
      mockRuneDraws(DRAW_1, DRAW_2);

      Game.place(3, 4);

      expect(Game.isBoardAllBlank()).toBe(true);
      expect(store.state.isBoardCleared).toBe(true);
      expect(store.state.isGameOver).toBe(false);
    });
  });

  describe("discard", () => {
    it("stokes the forge, resets the run and draws again", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setNextRune", RED_F);
      store.commit("setRunCount", 3);
      mockRuneDraws(DRAW_1, DRAW_2);

      Game.discard();

      expect(store.state.forge).toBe(1);
      expect(store.state.runCount).toBe(0);
      expect(store.state.maxRun).toBe(3);
      expect(store.state.discardedRune).toEqual(RED_F);
      expect(store.state.nextRune).toEqual(DRAW_1);
      expect(store.state.previousGameState).not.toBeNull();
      expect(store.state.isGameOver).toBe(false);
    });

    it("ends the game when the forge overflows", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setNextRune", RED_F);
      store.commit("setForge", store.state.maxForges);
      const generateRune = mockRuneDraws(DRAW_1, DRAW_2);

      Game.discard();

      expect(store.state.forge).toBe(store.state.maxForges + 1);
      expect(store.state.isGameOver).toBe(true);
      expect(store.state.discardedRune).toBeNull();
      expect(store.state.nextRune).toEqual(RED_F);
      expect(generateRune).not.toHaveBeenCalled();
      // gameOver clears the snapshot the discard had just saved
      expect(store.state.previousGameState).toBeNull();
    });
  });

  describe("nextLevel", () => {
    it("resets the board and hands the player a wild rune", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.dispatch("setLevel", 4);
      store.commit("setForge", 2);
      store.commit("setNextRune", RED_F);
      store.commit("setStartTime", new Date(Date.now() - 5000));

      Game.nextLevel();

      for (let row=0; row<Constants.BOARD_HEIGHT; row++) {
        for (let col=0; col<Constants.BOARD_WIDTH; col++) {
          expect(store.state.cells[row][col]).toEqual({ shape: null, color: null, gold: false });
        }
      }
      expect(store.state.level).toBe(5);
      expect(store.state.forge).toBe(0);
      expect(store.state.nextRune).toEqual(WILD);
      expect(store.state.isGameOver).toBe(false);
      expect(store.state.isBoardCleared).toBe(false);
      expect(Date.now() - store.state.startTime.getTime()).toBeLessThan(500);
    });
  });

  describe("mulligan", () => {
    // Play RED_F at (5,2) on ADJACENCY_CORNERS: adjacency 3, no span cleared.
    function playAMove() {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setForge", 2);
      store.commit("setNextRune", RED_F);
      mockRuneDraws(DRAW_1, DRAW_2);
      const before = cloneDeep(store.state.cells);
      Game.place(5, 2);
      return before;
    }

    it("does nothing without a snapshot", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setNextRune", RED_F);
      const before = cloneDeep(store.state.cells);

      expect(store.state.previousGameState).toBeNull();
      Game.mulligan();

      expect(store.state.cells).toEqual(before);
      expect(store.state.nextRune).toEqual(RED_F);
      expect(store.state.mulliganUsed).toBe(false);
      expect(store.state.committedNextRune).toBeNull();
      expect(store.state.mulliganBoardAnimationTick).toBe(0);
    });

    it("reverts the board, score, run and forge to before the move", () => {
      const before = playAMove();
      expect(store.state.score).toBe(30);

      Game.mulligan();

      expect(store.state.cells).toEqual(before);
      expect(store.state.score).toBe(0);
      expect(store.state.lastScoreIncrement).toBe(0);
      expect(store.state.runCount).toBe(0);
      expect(store.state.maxRun).toBe(0);
      expect(store.state.forge).toBe(2);
      expect(store.state.nextRune).toEqual(RED_F);
      expect(store.state.mulliganUsed).toBe(true);
      expect(store.state.previousGameState).toBeNull();
    });

    it("cannot be used twice in a row", () => {
      playAMove();
      Game.mulligan();
      const after = cloneDeep(store.state);

      Game.mulligan();

      expect(store.state.cells).toEqual(after.cells);
      expect(store.state.score).toBe(after.score);
      expect(store.state.nextRune).toEqual(after.nextRune);
      expect(store.state.committedNextRune).toEqual(after.committedNextRune);
      expect(store.state.mulliganBoardAnimationTick).toBe(after.mulliganBoardAnimationTick);
    });

    it("preserves the draw sequence across the undo", () => {
      playAMove();
      expect(store.state.nextRune).toEqual(DRAW_1);

      Game.mulligan();

      // The draw the undone move produced is held back...
      expect(store.state.committedNextRune).toEqual(DRAW_1);
      expect(store.state.nextRune).toEqual(RED_F);

      // ...and handed out instead of a fresh draw on the next move
      Game.place(5, 2);
      expect(store.state.nextRune).toEqual(DRAW_1);
      expect(store.state.committedNextRune).toBeNull();
    });

    it("flags the board animation only when cells actually changed", () => {
      playAMove();
      Game.mulligan();
      expect(store.state.mulliganBoardAnimationTick).toBe(1);
    });

    it("skips the board animation after a discard left the cells alone", () => {
      useBoard(store, TestData.Boards.ADJACENCY_CORNERS.cells);
      store.commit("setForge", 2);
      store.commit("setNextRune", GREEN_F);
      mockRuneDraws(DRAW_1, DRAW_2);

      Game.discard();
      expect(store.state.previousGameState).not.toBeNull();

      Game.mulligan();

      expect(store.state.mulliganBoardAnimationTick).toBe(0);
      expect(store.state.mulliganUsed).toBe(true);
    });

    it("holds the in-progress flag until the end of the microtask queue", async () => {
      playAMove();

      Game.mulligan();
      expect(store.state.mulliganInProgress).toBe(true);

      await Promise.resolve();
      expect(store.state.mulliganInProgress).toBe(false);
    });

    it("restores a whole span that the undone move had cleared", () => {
      useBoard(store, TestData.Boards.ONE_CELL_FROM_ROW_CLEAR.cells);
      store.commit("setNextRune", RED_F);
      mockRuneDraws(DRAW_1, DRAW_2);
      const before = cloneDeep(store.state.cells);

      Game.place(0, 4);
      expect(store.state.cells[0][0].shape).toBeNull();

      Game.mulligan();

      expect(store.state.cells).toEqual(before);
      expect(store.state.score).toBe(0);
    });
  });

  describe("gameOver", () => {
    it("clears the mulligan snapshot, pauses the clock and ends the game", () => {
      store.commit("setPreviousGameState", { cells: [] });
      store.commit("setCommittedNextRune", DRAW_1);
      store.commit("setStartTime", new Date(Date.now() - 1000));

      Game.gameOver();

      expect(store.state.previousGameState).toBeNull();
      expect(store.state.committedNextRune).toBeNull();
      expect(store.state.timeAccumulator).toBeGreaterThanOrEqual(1000);
      expect(store.state.timeAccumulator).toBeLessThan(1500);
      expect(store.state.isGameOver).toBe(true);
    });
  });

  describe("boardCleared", () => {
    it("awards the level bonus, pauses the clock and counts the board", () => {
      store.commit("setPreviousGameState", { cells: [] });
      store.commit("setCommittedNextRune", DRAW_1);
      store.commit("setScore", 100);
      store.dispatch("setDifficulty", MEDIUM);
      store.dispatch("setLevel", 7);
      store.commit("setStartTime", new Date(Date.now() - 1000));

      Game.boardCleared();

      expect(store.state.previousGameState).toBeNull();
      expect(store.state.committedNextRune).toBeNull();
      expect(store.state.score).toBe(1350);
      expect(store.state.lastScoreIncrement).toBe(1250);
      expect(store.state.timeAccumulator).toBeGreaterThanOrEqual(1000);
      expect(store.state.isBoardCleared).toBe(true);
      expect(incrementBoardsPlayed).toHaveBeenCalledTimes(1);
    });
  });
});
