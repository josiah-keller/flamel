<template>
  <div class="game-over">
    Game over
    <button @click="returnToMainMenu()">Main Menu</button>
  </div>
</template>

<script>
import store from "../game/store";

export default {
  methods: {
    returnToMainMenu() {
      store.dispatch("gameInactive");
    },
  },
};
</script>

<style lang="scss">
  .game-over {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: #999;
    z-index: 100;
  }
</style>
