import store from "./store";
import Constants from "./constants";

export default {
  init() {
    store.dispatch("selectNextRune");
  },
  discard() {
    store.dispatch("incrementForge");
    if (store.state.forge > store.state.maxForges) {
      return this.gameOver();
    }
    store.dispatch("selectNextRune");
  },
  place(rowIndex, cellIndex) {
    if (! this.moveLegal(store.state.nextRune, rowIndex, cellIndex)) {
      return;
    }
    store.dispatch("updateCell", {
      rowIndex,
      cellIndex,
      cell: {
        ...store.state.nextRune,
        gold: true,
      },
    });

    this.clearFullSpans(rowIndex, cellIndex);

    store.dispatch("decrementForge");
    store.dispatch("selectNextRune");
  },
  moveLegal(rune, rowIndex, cellIndex) {
    if (rowIndex < 0 ||
        rowIndex >= Constants.BOARD_HEIGHT ||
        cellIndex < 0 ||
        cellIndex >= Constants.BOARD_WIDTH) {

      // out of bounds for some reason
      return false;
    }
    let cell = store.state.cells[rowIndex][cellIndex];
    if (cell.shape || cell.color) {
      // already a rune there
      return false;
    }

    let foundPopulatedNeighbor = false;
    if (rowIndex > 0) {
      // up
      if (! this.runesCompatible(rune, store.state.cells[rowIndex - 1][cellIndex])) return false;
      if (! this.blankRune(store.state.cells[rowIndex - 1][cellIndex])) foundPopulatedNeighbor = true;
    }
    if (rowIndex < Constants.BOARD_HEIGHT - 1) {
      // down
      if (! this.runesCompatible(rune, store.state.cells[rowIndex + 1][cellIndex])) return false;
      if (! this.blankRune(store.state.cells[rowIndex + 1][cellIndex])) foundPopulatedNeighbor = true;
    }
    if (cellIndex > 0) {
      // left
      if (! this.runesCompatible(rune, store.state.cells[rowIndex][cellIndex - 1])) return false;
      if (! this.blankRune(store.state.cells[rowIndex][cellIndex - 1])) foundPopulatedNeighbor = true;
    }
    if (cellIndex < Constants.BOARD_WIDTH - 1) {
      // right
      if (! this.runesCompatible(rune, store.state.cells[rowIndex][cellIndex + 1])) return false;
      if (! this.blankRune(store.state.cells[rowIndex][cellIndex + 1])) foundPopulatedNeighbor = true;
    }
    if (! foundPopulatedNeighbor) return false;

    return true;
  },
  runesCompatible(rune1, rune2) {
    return rune1.shape === rune2.shape || rune1.color === rune2.color || rune1.shape === "W" || rune2.shape === "W" || this.blankRune(rune1) || this.blankRune(rune2);
  },
  blankRune(rune) {
    return (! rune.shape) && (! rune.color);
  },
  clearFullSpans(rowIndex, cellIndex) {
    let fullRow = true;
    for (let i=0; i<Constants.BOARD_WIDTH; i++) {
      if (! store.state.cells[rowIndex][i].shape) {
        fullRow = false;
        break;
      }
    }
    let fullCol = true;
    for (let i=0; i<Constants.BOARD_HEIGHT; i++) {
      if (! store.state.cells[i][cellIndex].shape) {
        fullCol = false;
        break;
      }
    }
    if (fullRow) {
      for (let i=0; i<Constants.BOARD_WIDTH; i++) {
        this.clearCell(rowIndex, i);
      }
    }
    if (fullCol) {
      for (let i=0; i<Constants.BOARD_HEIGHT; i++) {
        this.clearCell(i, cellIndex);
      }
    }
  },
  clearCell(rowIndex, cellIndex) {
    store.dispatch("clearCell", { rowIndex, cellIndex });
  },
  gameOver() {
    store.dispatch("gameOver");
  },
};