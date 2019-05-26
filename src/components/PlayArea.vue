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

export default {
  components: {
    Board,
    StatusBar,
    PlayerCursor,
    GameOverScreen,
  },
  data() {
    let cells = [];
    for(let i=0; i<8; i++) {
      cells.push([]);
      for (let j=0; j<9; j++) {
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
