<template>
  <div class="board">
    <table>
      <tr v-for="(row, rowIndex) in cells" :key="rowIndex">
        <td v-for="(cell, cellIndex) in row" :key="cellIndex">
          <BoardCell :cell="cell" @clicked="cellClicked(rowIndex, cellIndex)"/>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapState } from "vuex";

import BoardCell from "./BoardCell";
import Game from "../game/game";

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
