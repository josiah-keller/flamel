<template>
  <div class="player-cursor" v-follow-mouse>
    <Rune :shape="rune.shape" :color="rune.color"/>
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
};
</script>

<style lang="scss">
  .player-cursor {
    position: fixed;
  }
</style>
