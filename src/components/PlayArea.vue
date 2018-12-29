<template>
  <div class="play-area">
    <StatusBar v-bind:gameState="gameState"/>
    <Board v-bind:boardState="boardState"/>
  </div>
</template>

<script>
import Board from "./Board";
import StatusBar from "./StatusBar";

export default {
  components: {
    Board,
    StatusBar,
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
      },
      boardState: {
        cells: cells,
      },
    };
  },
}
</script>

<style>
  .play-area {
    display: flex;
  }
</style>
