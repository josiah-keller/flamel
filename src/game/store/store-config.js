import Constants from "@/game/constants";
import Random from "@/game/random";

export default {
  state: {
    level: 1,
    score: 0,
    forge: 0,
    maxForges: 3,
    isGameInitialized: false,
    isGameActive: false,
    isGameOver: false,
    isBoardCleared: false,
    cells: [],
    nextRune: null,
    difficulty: Constants.Difficulties.MEDIUM,
    timeAccumulator: 0,
    startTime: null,
    runCount: 0,
    maxRun: 0,
  },
  mutations: {
    setCells(state, cells) {
      state.cells = cells;
    },
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
    gameUnover(state) {
      state.isGameOver = false;
    },
    boardCleared(state) {
      state.isBoardCleared = true;
    },
    boardUncleared(state) {
      state.isBoardCleared = false;
    },
    gameInitialized(state) {
      state.isGameInitialized = true;
    },
    gameActive(state) {
      state.isGameActive = true;
    },
    gameInactive(state) {
      state.isGameActive = false;
    },
    setScore(state, newValue) {
      state.score = newValue;
    },
    setLevel(state, newValue) {
      state.level = newValue;
    },
    setDifficulty(state, newValue) {
      state.difficulty = newValue;
    },
    setStartTime(state, startTime) {
      state.startTime = startTime;
    },
    setTimeAccumulator(state, newValue) {
      state.timeAccumulator = newValue;
    },
    setRunCount(state, newValue) {
      state.runCount = newValue;
      if (state.runCount > state.maxRun) {
        state.maxRun = state.runCount;
      }
    },
  },
  actions: {
    initializeBoard({ commit }) {
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
      commit("setCells", cells);
      commit("gameUnover");
      commit("boardUncleared");
    },
    newGame({ commit }) {
      commit("setScore", 0);
      commit("setForge", 0);
    },
    selectNextRune({ state, commit }) {
      let nextRune = Random.generateRune(state.level);
      while (state.nextRune && nextRune.shape === state.nextRune.shape && nextRune.color === state.nextRune.color) {
        nextRune = Random.generateRune(state.level);
      }
      commit("setNextRune", nextRune);
    },
    setWildRune({ commit }) {
      commit("setNextRune", {
        shape: Constants.WILD_SHAPE,
        color: Constants.SPECIAL_COLOR,
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
    clearForge({ commit }) {
      commit("setForge", 0);
    },
    gameOver({ commit }) {
      commit("gameOver");
    },
    boardCleared({ commit }) {
      commit("boardCleared");
    },
    boardUncleared({ commit }) {
      commit("boardUncleared");
    },
    gameInitialized({ commit }) {
      commit("gameInitialized");
    },
    gameActive({ commit }) {
      commit("gameActive");
    },
    gameInactive({ commit }) {
      commit("gameInactive");
    },
    incrementScore({ state, commit }, increment) {
      commit("setScore", state.score + increment);
    },
    setLevel({ commit }, newValue) {
      commit("setLevel", newValue);
    },
    incrementLevel({ state, commit }) {
      commit("setLevel", state.level + 1);
    },
    setDifficulty({ commit }, newValue) {
      commit("setDifficulty", newValue);
    },
    startClock({ commit }) {
      commit("setStartTime", new Date());
    },
    pauseClock({ state, commit }) {
      let now = new Date(),
        timeDelta = now.getTime() - state.startTime.getTime();
      commit("setTimeAccumulator", state.timeAccumulator + timeDelta);
    },
    resetClock({ commit }) {
      commit("setTimeAccumulator", 0);
    },
    updateRunCount({ state, commit }) {
      commit("setRunCount", state.runCount + 1);
    },
    resetRunCount({ commit }) {
      commit("setRunCount", 0);
    }
  },
}