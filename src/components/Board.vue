<template>
  <div class="board">
    <table>
      <tr v-for="(row, rowIndex) in cells" :key="rowIndex">
        <td v-for="(cell, cellIndex) in row" :key="cellIndex">
          <BoardCell
            :cell="cell"
            :playable="cellPlayable(rowIndex, cellIndex)"
            @clicked="cellClicked(rowIndex, cellIndex)"/>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapState } from "vuex";

import BoardCell from "./BoardCell";
import Game from "../game/game";
import store from "../game/store";

export default {
  components: {
    BoardCell,
  },
  computed: {
    ...mapState(["cells"]),
  },
  methods: {
    cellClicked(rowIndex, cellIndex) {
      Game.place(rowIndex, cellIndex);
    },
    cellPlayable(rowIndex, cellIndex) {
      return Game.moveLegal(store.state.nextRune, rowIndex, cellIndex);
    },
  },
};
</script>

<style lang="scss">
  .board {
    flex: 1 1 100%;
    background: #ddd;

    table {
      border-spacing: 0px;
      border: 1px solid black;

      td {
        border: 1px solid black;
        width: 50px;
        height: 50px;
        padding: 0px;
      }
    }
  }
</style>
