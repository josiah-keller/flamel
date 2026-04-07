<template>
  <div
    v-show="!isBoardCleared"
    class="player-cursor"
    :class="{ 'new-rune': newRune }"
    ref="container"
    v-follow-mouse
    v-glimmer-trail="glimmerOptions">
      <Rune :shape="rune.shape" :color="rune.color"/>
      <div class="illegal-indicator" v-show="showIllegalIndicator"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";

// need this so that the followMouse directive can update the cursor coordinates
import store from "../game/store";
import Rune from "./Rune";

import "../directives/glimmer-trail";

const CURSOR_OFFSET = 1;

export default {
  components: {
    Rune,
  },
  props: {
    rune: Object,
    showIllegalIndicator: Boolean,
  },
  computed: {
    ...mapState(["isBoardCleared"]),
  },
  data() {
    return {
      newRune: false,
      isMoving: false,
      glimmerOptions: { maxParticles: 6, minInterval: 400, maxInterval: 700 },
    };
  },
  directives: {
    followMouse: {
      bind(el, binding, vnode) {
        let timeout;
        const vm = vnode.context;
        document.body.addEventListener("mousemove", e => {
          const x = innerWidth - e.clientX + CURSOR_OFFSET,
            y = innerHeight - e.clientY + CURSOR_OFFSET;
          el.style.right = `${x}px`;
          el.style.bottom = `${y}px`;
          vm.isMoving = true;
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(function() {
            vm.isMoving = false;
          }, 100);
          store.dispatch("setCursorCoords", { x, y });
        });
      }
    },
  },
  mounted() {
    this.$watch("rune", function() {
      this.newRune = true;
    }, { deep: true });
    this.$refs.container.addEventListener("animationend", (e) => {
      if (e.target.classList.contains("rune")) {
        this.newRune = false;
      }
    });
    this.$watch("isMoving", function(isMoving) {
      this.glimmerOptions.maxParticles = isMoving ? 6 : 0;
    });
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

  .player-cursor {
    position: fixed;
    z-index: 99;

    &.new-rune {
      .rune {
        animation: new-rune 0.2s ease-in-out;
      }
    }

    .illegal-indicator {
      @include illegal-indicator;
    }
  }
</style>
