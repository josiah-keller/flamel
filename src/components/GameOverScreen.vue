<template>
  <div class="game-over">
    <div class="game-over-wrapper">
      <h1 class="game-over-title" :class="{ 'game-over-forged': gameOverForged }">Game over</h1>
      <div class="game-over-forge">
        <Forge :value="forgeValue" :showButton="false"/>
      </div>
      <button @click="returnToMainMenu()" v-sparkle="{ maxParticles: 6, minInterval: 100, maxInterval: 300 }">Main Menu</button>
    </div>
  </div>
</template>

<script>
import Forge from "./Forge";

export default {
  components: {
    Forge,
  },
  data() {
    return {
      forgeValue: 0,
      gameOverForged: false,
    };
  },
  methods: {
    returnToMainMenu() {
      this.$store.dispatch("gameInactive");
    },
  },
  mounted() {
    setTimeout(() => {
      this.forgeValue = 3;
    }, 3000);
    setTimeout(() => {
      this.gameOverForged = true;
    }, 5000);
  }
};
</script>

<style lang="scss">
  @import "@/global.scss";

  @keyframes game-over {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes game-over-forged {
    0% {
      transform: translate(0px, 0px) rotate(0deg);
      opacity: 1;
      color: rgb(37, 21, 19);
    }
    10% {
      transform: translate(0px, 125px) rotate(-4deg);
      opacity: 1;
      color: rgb(37, 21, 19);
    }
    20% {
      transform: translate(0px, 120px) rotate(-2deg);
      opacity: 1;
      color: rgb(114, 11, 0);
    }
    50% {
      transform: translate(0px, 125px) rotate(-2deg);
      opacity: 0;
      color: rgb(114, 11, 0);
    }
    90% {
      transform: translate(0px, 0px) rotate(0deg);
      opacity: 0;
      color: rgb(37, 21, 19);
    }
    100% {
      transform: translate(0px, 0px) rotate(0deg);
      opacity: 1;
      color: rgb(37, 21, 19);
    }
  }

  .game-over {
    @include backdrop-container;
    z-index: 100;
    font-family: "Fraunces", "Times New Roman", serif;
    user-select: none;
    animation: game-over 0.33s linear;

    .game-over-wrapper {
      @include menu-wrapper;

      .game-over-title {
        font-size: 52px;
        color: rgb(37, 21, 19);
        text-transform: uppercase;
        margin-bottom: 30px;
        position: relative;
        z-index: 3;

        &.game-over-forged {
          animation: game-over-forged 8s ease-out;
        }
      }

      .game-over-forge {
        max-width: 600px;
        margin: auto;
        margin-bottom: 30px;
      }

      button {
        @include gloss-button-base;
        border-color: rgb(100, 0, 0);
        background-color: rgb(100, 0, 0);
        background-image: linear-gradient(to top, rgb(140, 0, 0) 0%, rgb(100, 0, 0) 30%, rgb(50, 0, 0) 49.9999%, rgb(120, 0, 0) 50%, rgb(160, 0, 0) 100%);
        transition: box-shadow 0.1s linear;

        &:hover, &:focus {
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5) inset, 0px 0px 10px rgba(0, 0, 0, 0.25), 0px 0px 30px rgb(160, 0, 0);
        }
      }
    }
  }
</style>
