<template>
  <div class="player-cursor" v-follow-mouse>
    <Rune :shape="rune.shape" :color="rune.color"/>
  </div>
</template>

<script>
import Rune from "./Rune";

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
          el.style.right = `${innerWidth - e.clientX}px`;
          el.style.bottom = `${innerHeight - e.clientY}px`;
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
