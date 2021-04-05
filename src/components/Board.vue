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
    <div
      class="score-tip"
      :class="{ 'score-incremented': scoreIncremented }"
      ref="scoreTip"
      :style="{ right: `${scoreTipX}px`, bottom: `${scoreTipY}px` }">

        {{ lastScoreIncrement }}
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
  data() {
    return {
      scoreIncremented: false,
      scoreTipX: 0,
      scoreTipY: 0,
    };
  },
  computed: {
    ...mapState(["cells", "score", "lastScoreIncrement", "cursorX", "cursorY"]),
  },
  methods: {
    cellClicked(rowIndex, cellIndex) {
      Game.place(rowIndex, cellIndex);
    },
    cellPlayable(rowIndex, cellIndex) {
      return Game.moveLegal(this.$store.state.nextRune, rowIndex, cellIndex);
    },
    showScoreTip() {
      this.scoreTipX = this.cursorX;
      this.scoreTipY = this.cursorY;
      this.scoreIncremented = true;
    },
  },
  mounted() {
    this.$watch("score", function() {
      this.showScoreTip();
    });
    this.$refs.scoreTip.addEventListener("animationend", () => {
      this.scoreIncremented = false;
    });
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

  @keyframes score-tip {
    0% {
      transform: translateY(-50px);
      opacity: 1;
    }
    100% {
      transform: translateY(-75px);
      opacity: 0;
    }
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

    .score-tip {
      position: fixed;
      transform: translateY(-50px);
      font-family: "Fraunces", "Times New Roman", serif;
      font-size: 18px;
      color: #f7f79a;
      text-shadow: 0px 0px 5px black;
      opacity: 0;

      &.score-incremented {
        visibility: visible;
        animation: score-tip 1s ease-out;
      }

      &:not(.score-incremented) {
        visibility: hidden;
      }
    }
  }
</style>
