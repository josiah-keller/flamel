<template>
  <div
    class="board-cell"
    :class="{ 'gold': cell.gold, 'playable': playable, 'special': special, 'blank': blank }"
    @click="clicked">
      <Rune :shape="cell.shape" :color="cell.color"/>
      <div class="turn-blank-effect"></div>
  </div>
</template>

<script>
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
    };
  },
  computed: {
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
  },
};
</script>

<style lang="scss">
  @keyframes turn-gold {
    0% {
      background: transparent;
      box-shadow: 0px 0px 0px #cccc0a;
    }
    50% {
      box-shadow: 0px 0px 10px #cccc0a;
    }
    100% {
      background: #cccc0a;
      box-shadow: 0px 0px 0px #cccc0a;
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

  .board-cell {
    width: 100%;
    height: 100%;
    text-align: center;
    line-height: 50px;
    vertical-align: middle;
    position: relative;

    &.gold {
      background: #cccc0a;

      &:not(.special) {
        animation: turn-gold 0.5s linear;
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
