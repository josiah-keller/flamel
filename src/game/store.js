import Vue from "vue";
import Vuex from "vuex";

import Constants from "./constants";

Vue.use(Vuex);

let cells = [];
for(let i=0; i<Constants.BOARD_HEIGHT; i++) {
  cells.push([]);
  for (let j=0; j<Constants.BOARD_WIDTH; j++) {
    cells[i].push({
      shape: null,
      color: null,
      gold: false,
    });
  }
}
let startCell = cells[Constants.START_SPACE_ROW][Constants.START_SPACE_COL];
startCell.shape = "W";
startCell.gold = true;

export default new Vuex.Store({
  state: {
    score: 0,
    forge: 0,
    maxForges: 3,
    isGameOver: false,
    cells: cells,
    nextRune: null,
  },
  mutations: {
    setNextRune(state, nextRune) {
      state.nextRune = nextRune;
    },
    updateCell(state, { rowIndex, cellIndex, cell }) {
      if (rowIndex < 0 || rowIndex >= Constants.BOARD_HEIGHT || cellIndex < 0 || cellIndex >= Constants.BOARD_WIDTH) {
        return;
      }
      let oldCell = state.cells[rowIndex][cellIndex];
      Object.assign(oldCell, cell);
    },
    setForge(state, newValue) {
      state.forge = newValue;
    },
    gameOver(state) {
      state.isGameOver = true;
    },
  },
  actions: {
    selectNextRune({ commit }) {
      commit("setNextRune", {
        shape: Constants.RUNE_SHAPES[Math.floor(Math.random() * Constants.RUNE_SHAPES.length)],
        color: Constants.RUNE_COLORS[Math.floor(Math.random() * Constants.RUNE_COLORS.length)],
      });
    },
    updateCell({ commit }, payload) {
      commit("updateCell", payload);
    },
    clearCell({ dispatch }, { rowIndex, cellIndex }) {
      dispatch("updateCell", {
        rowIndex,
        cellIndex,
        cell: {
          shape: null,
          color: null,
          gold: true,
        },
      });
    },
    incrementForge({ state, commit }) {
      commit("setForge", state.forge + 1);
    },
    decrementForge({ state, commit }) {
      commit("setForge", Math.max(state.forge - 1, 0));
    },
    clearForge({ state, commit }) {
      commit("setForge", 0);
    },
    gameOver({ commit }) {
      commit("gameOver");
    },
  },
});