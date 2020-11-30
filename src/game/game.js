import Constants from "@/game/constants";

let store = null;

export default {
  setStore(newStore) {
    store = newStore;
  },
  init() {
    store.dispatch("initializeBoard");
    store.dispatch("newGame");
    store.dispatch("setLevel", Constants.STARTING_LEVELS[store.state.difficulty]);
    store.dispatch("updateCell", {
      rowIndex: Constants.START_SPACE_ROW,
      cellIndex: Constants.START_SPACE_COL,
      cell: {
        shape: Constants.WILD_SHAPE,
        color: Constants.SPECIAL_COLOR,
        gold: true,
      },
    });
    store.dispatch("selectNextRune");
    store.dispatch("gameInitialized");
    store.dispatch("gameActive");
    store.dispatch("resetClock");
    store.dispatch("startClock");
  },
  nextLevel() {
    store.dispatch("initializeBoard");
    store.dispatch("incrementLevel");
    store.dispatch("setWildRune");
    store.dispatch("boardUncleared");
    store.dispatch("startClock");
  },
  discard() {
    store.dispatch("incrementForge");
    store.dispatch("resetRunCount");
    if (store.state.forge > store.state.maxForges) {
      return this.gameOver();
    }
    store.dispatch("selectNextRune");
  },
  cellOccupied(rowIndex, cellIndex) {
    let cell = store.state.cells[rowIndex][cellIndex];
    return cell.shape || cell.color;
  },
  place(rowIndex, cellIndex) {
    if (store.state.nextRune.shape === Constants.BOMB_SHAPE) {
      if (this.cellOccupied(rowIndex, cellIndex)) {
        return this.placeBomb(rowIndex, cellIndex);
      } else {
        return;
      }
    }

    if (! this.moveLegal(store.state.nextRune, rowIndex, cellIndex)) {
      return;
    }

    let wasCellGold = store.state.cells[rowIndex][cellIndex].gold;

    store.dispatch("updateCell", {
      rowIndex,
      cellIndex,
      cell: {
        ...store.state.nextRune,
        gold: true,
      },
    });

    let adjacency = this.countAdjacency(rowIndex, cellIndex);
    let spansCleared = this.clearFullSpans(rowIndex, cellIndex);
    let score = this.scoreMove(wasCellGold, adjacency, spansCleared);
    store.dispatch("incrementScore", score);

    this.checkForBlankBoard();

    this.checkForBoardCleared();

    store.dispatch("updateRunCount");
    store.dispatch("decrementForge");
    store.dispatch("selectNextRune");
  },
  placeBomb(rowIndex, cellIndex) {
    this.clearCell(rowIndex, cellIndex);
    this.checkForBlankBoard();
    store.dispatch("decrementForge");
    store.dispatch("selectNextRune");
  },
  scoreMove(wasCellGold, adjacency, spansCleared) {
    let score = 0,
      valueSet = Constants.ScoreValues.PlacementBaseScores.NonGold,
      clearSpanBonusSet = Constants.ScoreValues.ClearSpanBonus.NonGold;
    if (wasCellGold) {
      valueSet = Constants.ScoreValues.PlacementBaseScores.Gold;
      clearSpanBonusSet = Constants.ScoreValues.ClearSpanBonus.Gold;
    }
    score = valueSet[adjacency] + clearSpanBonusSet[spansCleared];
    score *= Constants.ScoreValues.DIFFICULTY_MULTIPLIERS[store.state.difficulty]
    return score;
  },
  scoreBoardClear() {
    let boardsCompleted = store.state.level - Constants.STARTING_LEVELS[store.state.difficulty],
      multiplier = Constants.ScoreValues.DIFFICULTY_MULTIPLIERS[store.state.difficulty];
    return (Constants.ScoreValues.CLEAR_BOARD_BASE +
      (Constants.ScoreValues.CLEAR_BOARD_INCREMENT * boardsCompleted)) * multiplier;
  },
  countAdjacency(rowIndex, cellIndex) {
    if (rowIndex < 0 ||
        rowIndex >= Constants.BOARD_HEIGHT ||
        cellIndex < 0 ||
        cellIndex >= Constants.BOARD_WIDTH) {

      // out of bounds for some reason
      return false;
    }
    let adjacency = 0;
    if (rowIndex > 0) {
      // up
      if (! this.blankRune(store.state.cells[rowIndex - 1][cellIndex])) adjacency += 1;
    }
    if (rowIndex < Constants.BOARD_HEIGHT - 1) {
      // down
      if (! this.blankRune(store.state.cells[rowIndex + 1][cellIndex])) adjacency += 1;
    }
    if (cellIndex > 0) {
      // left
      if (! this.blankRune(store.state.cells[rowIndex][cellIndex - 1])) adjacency += 1;
    }
    if (cellIndex < Constants.BOARD_WIDTH - 1) {
      // right
      if (! this.blankRune(store.state.cells[rowIndex][cellIndex + 1])) adjacency += 1;
    }
    return adjacency;
  },
  moveLegal(rune, rowIndex, cellIndex) {
    if (rowIndex < 0 ||
        rowIndex >= Constants.BOARD_HEIGHT ||
        cellIndex < 0 ||
        cellIndex >= Constants.BOARD_WIDTH) {

      // out of bounds for some reason
      return false;
    }
    if (this.cellOccupied(rowIndex, cellIndex)) {
      // already a rune there
      return false;
    }

    // Special case for first move of a new board
    if (this.isBoardAllBlank() && rune.shape === Constants.WILD_SHAPE) {
      return true;
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
    return rune1.shape === rune2.shape
      || rune1.color === rune2.color
      || rune1.shape === Constants.WILD_SHAPE
      || rune2.shape === Constants.WILD_SHAPE
      || this.blankRune(rune1)
      || this.blankRune(rune2);
  },
  blankRune(rune) {
    return (! rune.shape) && (! rune.color);
  },
  anyMoveLegal(rune) {
    if (rune.shape == Constants.BOMB_SHAPE) {
      // if bomb, it should play (board should never be completely blank...)
      return true;
    }
    for (let rowIndex=0; rowIndex<Constants.BOARD_HEIGHT; rowIndex++) {
      for (let cellIndex=0; cellIndex<Constants.BOARD_WIDTH; cellIndex++) {
        if (this.moveLegal(rune, rowIndex, cellIndex)) return true;
      }
    }
    return false;
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

    if (fullRow || fullCol) {
      store.dispatch("clearForge");
    }

    if (fullRow && fullCol) {
      return 2;
    } else if (fullRow || fullCol) {
      return 1;
    }
    return 0;
  },
  isBoardAllGold() {
    for (let row of store.state.cells) {
      for (let cell of row) {
        if (! cell.gold) return false;
      }
    }
    return true;
  },
  checkForBoardCleared() {
    if (this.isBoardAllGold()) {
      this.boardCleared();
    }
  },
  isBoardAllBlank() {
    for (let row of store.state.cells) {
      for (let cell of row) {
        if (! this.blankRune(cell)) return false;
      }
    }
    return true;
  },
  checkForBlankBoard() {
    if (this.isBoardAllBlank()) {
      this.gameOver();
    }
  },
  clearCell(rowIndex, cellIndex) {
    store.dispatch("clearCell", { rowIndex, cellIndex });
  },
  gameOver() {
    store.dispatch("gameOver");
  },
  boardCleared() {
    let score = this.scoreBoardClear();
    store.dispatch("incrementScore", score);
    store.dispatch("pauseClock");
    store.dispatch("boardCleared");
  },
};