<template>
  <div class="rune" :class="classString">
    {{ shape }}
  </div>
</template>

<script>
import Constants from "../game/constants";
export default {
  props: {
    shape: String,
    color: String,
  },
  computed: {
    classString() {
      let cls = `color-${this.color}`;
      if (this.shape === Constants.WILD_SHAPE) {
        cls += " special-wild";
      } else if (this.shape === Constants.BOMB_SHAPE) {
        cls += " special-bomb";
      }
      return cls;
    },
  },
};
</script>

<style lang="scss">
  @keyframes bomb-fuse-spark {
    0% {
      box-shadow: 0px -4px 5px #f20;
    }
    20% {
      box-shadow: 0px -4px 4px #f00;
    }
    40% {
      box-shadow: 0px -5px 5px #f80;
    }
    60% {
      box-shadow: 0px -5px 4px #f47;
    }
    80% {
      box-shadow: 0px -4px 4px #f32;
    }
    100% {
      box-shadow: 0px -5px 4px #f50;
    }
  }

  .rune {
    box-sizing: border-box;
    font-family: "Times New Roman", serif;
    font-size: 30px;
    font-weight: bold;
    text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.75);

    &.color-red {
      color: red;
    }
    &.color-blue {
      color: blue;
    }
    &.color-magenta {
      color: magenta;
    }
    &.color-green {
      color: limegreen;
    }
    &.color-yellow {
      color: yellow;
    }
    &.color-cyan {
      color: cyan;
    }
    &.color-orange {
      color: orange;
    }
    &.color-white {
      color: white;
    }
    &.color-gray {
      color: slategray;
    }
    &.color-special {
      color: transparent;
      font-size: 0px;
      text-shadow: none;
    }
    &.special-wild {
      width: 50px;
      height: 50px;
      background: #888;
      border: 22px outset #666;
      border-top-color: #777;
      border-bottom-color: #555;
      box-shadow: inset 0px 0px 20px #666;
    }
    &.special-bomb {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #222;
      box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.75);

      &::after {
        content: ' ';
        position: absolute;
        width: 1px;
        height: 10px;
        left: 50%;
        top: -10px;
        transform: rotate(30deg);
        transform-origin: bottom center;
        background: #222;
        box-shadow: 0px -4px 5px #f00;
        animation: 1s linear infinite bomb-fuse-spark;
      }
    }
  }
</style>
