<template>
  <div class="play-area">
    <StatusBar :gameState="gameState" @discard-requested="discard"/>
    <Board :boardState="boardState" @cell-clicked="place"/>
    <PlayerCursor :rune="nextRune"/>
    <GameOverScreen v-if="gameState.isGameOver" :gameState="gameState"/>
  </div>
</template>

<script>
import Board from "./Board";
import StatusBar from "./StatusBar";
import PlayerCursor from "./PlayerCursor";
import GameOverScreen from "./GameOverScreen";

const BOARD_WIDTH = 9;
const BOARD_HEIGHT = 8;

export default {
  components: {
    Board,
    StatusBar,
    PlayerCursor,
    GameOverScreen,
  },
  data() {
    let cells = [];
    for(let i=0; i<BOARD_HEIGHT; i++) {
      cells.push([]);
      for (let j=0; j<BOARD_WIDTH; j++) {
        cells[i].push({
          shape: null,
          color: null,
          gold: false,
        });
      }
    }
    
    return {
      gameState: {
        score: 0,
        forge: 0,
        maxForges: 3,
        isGameOver: false,
      },
      boardState: {
        cells: cells,
      },
      nextRune: null,
    };
  },
  created() {
    this.selectNextRune();
  },
  methods: {
    selectNextRune() {
      let shapes = "ABCDE".split("");
      let colors = ["red", "blue", "magenta", "green"];
      this.nextRune = {
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    },
    discard() {
      this.gameState.forge += 1;
      if (this.gameState.forge > this.gameState.maxForges) {
        return this.gameOver();
      }
      this.selectNextRune();
    },
    place(rowIndex, cellIndex) {
      if (! this.moveLegal(this.nextRune, rowIndex, cellIndex)) {
        return;
      }
      let cell = this.boardState.cells[rowIndex][cellIndex];
      cell.shape = this.nextRune.shape;
      cell.color = this.nextRune.color;
      this.selectNextRune();
    },
    moveLegal(rune, rowIndex, cellIndex) {
      if (rowIndex < 0 || rowIndex >= BOARD_HEIGHT || cellIndex < 0 || cellIndex >= BOARD_WIDTH) {
        // out of bounds for some reason
        return false;
      }
      let cell = this.boardState.cells[rowIndex][cellIndex];
      if (cell.shape || cell.color) {
        // already a rune there
        return false;
      }
      if (rowIndex > 0) {
        // up
        if (! this.runesCompatible(rune, this.boardState.cells[rowIndex - 1][cellIndex])) return false;
      }
      if (rowIndex < BOARD_HEIGHT - 1) {
        // down
        if (! this.runesCompatible(rune, this.boardState.cells[rowIndex + 1][cellIndex])) return false;
      }
      if (cellIndex > 0) {
        // left
        if (! this.runesCompatible(rune, this.boardState.cells[rowIndex][cellIndex - 1])) return false;
      }
      if (cellIndex < BOARD_WIDTH - 1) {
        // right
        if (! this.runesCompatible(rune, this.boardState.cells[rowIndex][cellIndex + 1])) return false;
      }
      return true;
    },
    runesCompatible(rune1, rune2) {
      // later, will need to account for wildcards
      return rune1.shape === rune2.shape || rune1.color === rune2.color || this.blankRune(rune1) || this.blankRune(rune2);
    },
    blankRune(rune) {
      return (! rune.shape) && (! rune.color);
    },
    gameOver() {
      this.gameState.isGameOver = true;
    },
  },
}
</script>

<style lang="scss">
  .play-area {
    user-select: none;
    cursor: default;
    display: flex;
  }
</style>
