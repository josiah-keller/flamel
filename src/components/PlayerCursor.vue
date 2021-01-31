<template>
  <div
    class="player-cursor"
    :class="{ 'new-rune': newRune }"
    ref="container"
    v-follow-mouse>
    <Rune :shape="rune.shape" :color="rune.color"/>
    <div class="illegal-indicator" v-show="showIllegalIndicator"></div>
  </div>
</template>

<script>
import Rune from "./Rune";

const CURSOR_OFFSET = 1;

export default {
  components: {
    Rune,
  },
  props: {
    rune: Object,
    showIllegalIndicator: Boolean,
  },
  data() {
    return {
      newRune: false,
    };
  },
  directives: {
    followMouse: {
      bind(el) {
        document.body.addEventListener("mousemove", e => {
          el.style.right = `${innerWidth - e.clientX + CURSOR_OFFSET}px`;
          el.style.bottom = `${innerHeight - e.clientY + CURSOR_OFFSET}px`;
        });
      }
    },
  },
  mounted() {
    this.$watch("rune", function() {
      console.log("new rune");
      this.newRune = true;
    }, { deep: true });
    this.$refs.container.addEventListener("animationend", () => {
      this.newRune = false;
    });
  },
};
</script>

<style lang="scss">
  @keyframes new-rune {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .player-cursor {
    position: fixed;
    z-index: 99;

    &.new-rune {
      .rune {
        animation: new-rune 0.2s ease-in-out;
      }
    }

    .illegal-indicator {
      box-sizing: border-box;
      position: absolute;
      left: 0px;
      top: 0px;
      width: 20px;
      height: 20px;
      border-radius: 10px;
      border: 2px solid red;

      &::after {
        position: absolute;
        left: -1px;
        top: 8px;
        width: 18px;
        height: 2px;
        background: red;
        content: ' ';
        transform: rotate(45deg);
      }
    }
  }
</style>
