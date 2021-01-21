import { createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import { cloneDeep } from "lodash";
import storeConfig from "@/game/store/store-config";
import Constants from "@/game/constants";
import Game from "@/game/game";
import TestData from "./test-data";

function useBoard(store, cells) {
  store.commit("setCells", cells);
}

describe("game logic", () => {
  let localVue, store;

  beforeEach(() => {
    // Create a new store each time
    localVue = createLocalVue();
    localVue.use(Vuex);
    store = new Vuex.Store(cloneDeep(storeConfig));
    Game.setStore(store);
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
});