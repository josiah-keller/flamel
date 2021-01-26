<template>
  <div class="game-over">
    <div class="game-over-wrapper">
      <h1 class="game-over-title">Game over</h1>
      <button @click="returnToMainMenu()" v-sparkle="{ maxParticles: 6, minInterval: 100, maxInterval: 300 }">Main Menu</button>
    </div>
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
  @import "@/global.scss";

  .game-over {
    @include backdrop-container;
    z-index: 100;
    font-family: "Fraunces", "Times New Roman", serif;
    user-select: none;

    .game-over-wrapper {
      @include menu-wrapper;

      .game-over-title {
        font-size: 52px;
        color: rgb(37, 21, 19);
        text-transform: uppercase;
        margin-bottom: 100px;
      }

      button {
        @include gloss-button-base;
        border-color: rgb(100, 0, 0);
        background-color: rgb(100, 0, 0);
        background-image: linear-gradient(to top, rgb(140, 0, 0) 0%, rgb(100, 0, 0) 30%, rgb(50, 0, 0) 49.9999%, rgb(120, 0, 0) 50%, rgb(160, 0, 0) 100%);
        transition: box-shadow 0.1s linear;

        &:hover {
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5) inset, 0px 0px 10px rgba(0, 0, 0, 0.25), 0px 0px 30px rgb(160, 0, 0);
        }
      }
    }
  }
</style>
