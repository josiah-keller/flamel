<template>
  <div class="board-container">
    <div class="board">
      <table ref="board" :class="{ 'mulligan-flash': mulliganFlash }">
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
    ...mapState(["cells", "mulliganBoardAnimationTick"]),
  },
  data() {
    return {
      mulliganFlash: false,
    };
  },
  methods: {
    cellClicked(rowIndex, cellIndex) {
      Game.place(rowIndex, cellIndex);
    },
    cellPlayable(rowIndex, cellIndex) {
      return Game.moveLegal(this.$store.state.nextRune, rowIndex, cellIndex);
    },
  },
  mounted() {
    this.$watch("mulliganBoardAnimationTick", function() {
      this.mulliganFlash = true;
    });
    this.$refs.board.addEventListener("animationend", () => {
      this.mulliganFlash = false;
    });
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

  @keyframes mulligan-flash {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

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
      --cell-size: 50px;

      @media screen and (max-width: 900px) {
        left: 20px;
        top: 0px;
        border-bottom-left-radius: 10px;
        border-top-right-radius: 0px;
        --cell-size: min(50px, calc((100vw - 100px) / 9));
      }

      table {
        border-spacing: 0px;

        &.mulligan-flash {
          animation: mulligan-flash 250ms ease-in-out;
        }
        border: 1px solid #222222;

        td {
          border: 1px solid #222222;
          width: var(--cell-size);
          height: var(--cell-size);
          padding: 0px;
          box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.15) inset;
        }
      }
    }

  }
</style>
