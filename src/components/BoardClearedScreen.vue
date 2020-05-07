<template>
  <div class="board-cleared">
    Board cleared!
    <button @click="nextLevel()">Play next board</button>
    <button @click="returnToMainMenu()">Main Menu</button>
  </div>
</template>

<script>
import Game from "../game/game";
import store from "../game/store";

export default {
  methods: {
    nextLevel() {
      Game.nextLevel();
    },
    returnToMainMenu() {
      store.dispatch("gameInactive");
    },
  },
};
</script>

<style lang="scss">
  .board-cleared {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: #999;
    z-index: 100;
  }
</style>
