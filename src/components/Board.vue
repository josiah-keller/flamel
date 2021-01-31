<template>
  <div class="board-container">
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
    cellPlayable(rowIndex, cellIndex) {
      return Game.moveLegal(this.$store.state.nextRune, rowIndex, cellIndex);
    },
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

  .board-container {
    @include backdrop-texture;
    flex: 1 1 100%;
    position: relative;
    z-index: 50;

    .board {
      @include plate;
      border-top-left-radius: 0px;
      border-bottom-left-radius: 0px;
      position: absolute;
      left: 0px;
      top: 20px;

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
  }
</style>
