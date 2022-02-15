<template>
  <div
    class="board-cell"
    :class="{ 'gold': cell.gold, 'playable': playable, 'special': special, 'blank': blank, 'cleared': delayedBoardCleared }"
    @click="clicked">
      <Rune :shape="cell.shape" :color="cell.color"/>
      <div class="turn-blank-effect"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Rune from "./Rune";
import Constants from '../game/constants';

export default {
  components: {
    Rune,
  },
  props: {
    cell: Object,
    playable: Boolean,
  },
  data() {
    return {
      blank: false,
      delayedBoardCleared: this.isBoardCleared,
    };
  },
  computed: {
    ...mapState(["isBoardCleared"]),
    special() {
      return this.cell.color === Constants.SPECIAL_COLOR;
    },
  },
  methods: {
    clicked() {
      this.$emit("clicked");
    },
  },
  mounted() {
    // have to watch rather than use computed to prevent cells from "turning" blank at the start
    this.$watch("cell.shape", function(shape, oldShape) {
      this.blank = shape === null && oldShape !== null;
    });
    this.$watch("isBoardCleared", function(newValue, oldValue) {
      if (newValue === oldValue) return;
      setTimeout(() => {
        this.delayedBoardCleared = newValue;
      }, 500 + Math.random() * (Constants.BOARD_CLEAR_DELAY - 1000));
    });
  },
};
</script>

<style lang="scss">
  @keyframes turn-gold {
    0% {
      background: transparent;
      box-shadow: 0px 0px 0px #cccc0a, 0px 0px 0px rgba(120, 120, 11, 1) inset;
    }
    50% {
      box-shadow: 0px 0px 10px #cccc0a, 0px 0px 0px rgba(120, 120, 11, 1) inset;
    }
    100% {
      background: #cccc0a;
      box-shadow: 0px 0px 0px #cccc0a, 0px 0px 10px rgba(120, 120, 11, 1) inset;
    }
  }

  @keyframes turn-blank {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes cleared {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(2);
    }
  }

  .board-cell {
    width: 100%;
    height: 100%;
    text-align: center;
    line-height: 50px;
    vertical-align: middle;
    position: relative;

    &.gold {
      background: #cccc0a;
      box-shadow: 0px 0px 10px rgba(120, 120, 11, 0.8) inset;

      &:not(.special) {
        animation: turn-gold 0.5s linear;

        &::before {
          content: ' ';
          position: absolute;
          left: 5px;
          top: 3px;
          width: 10px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
      }

      &.playable:hover {
        background: #a5a508;
      }
    }

    &.blank {
      .turn-blank-effect {
        animation: turn-blank 0.8s ease-in-out;
      }
    }

    &.cleared {
      .rune {
        animation: cleared 0.4s ease-in;
        opacity: 0;
      }
    }

    &.playable:hover:not(.gold) {
      background: #aaa;
    }

    .turn-blank-effect {
      position: absolute;
      left: 0%;
      top: 0%;
      width: 100%;
      height: 100%;
      background: #f7f79a;
      opacity: 0;
    }
  }
</style>
