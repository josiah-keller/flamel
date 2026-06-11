<template>
  <div class="game-over">
    <div class="game-over-wrapper">
      <template v-if="showPrompt">
        <NewHighScorePrompt />
      </template>
      <template v-else>
        <h1 class="game-over-title" :class="{ 'game-over-forged': gameOverForged }">Game over</h1>
        <div class="game-over-forge">
          <Forge :value="forgeValue" :showButton="false"/>
        </div>
        <button
          v-if="! qualifiesForHighScore"
          class="game-over-main-menu"
          @click="returnToMainMenu()"
          v-sparkle="{ maxParticles: 6, minInterval: 100, maxInterval: 300 }"
        >Main Menu</button>
      </template>
    </div>
  </div>
</template>

<script>
import Forge from "./Forge";
import NewHighScorePrompt from "./NewHighScorePrompt";
import Highscores from "../game/highscores";
import Constants from "../game/constants";

export default {
  components: {
    Forge,
    NewHighScorePrompt,
  },
  data() {
    return {
      forgeValue: 0,
      gameOverForged: false,
      qualifiesForHighScore: false,
      showPrompt: false,
    };
  },
  methods: {
    returnToMainMenu() {
      this.$store.dispatch("gameInactive");
    },
  },
  mounted() {
    const { score, difficulty, level } = this.$store.state;
    const boardsCleared = level - Constants.STARTING_LEVELS[difficulty];
    this.qualifiesForHighScore = boardsCleared > 0 && Highscores.isNewHighScore(score, difficulty);

    setTimeout(() => {
      this.forgeValue = 3;
    }, 3000);
    setTimeout(() => {
      this.gameOverForged = true;
    }, 5000);
    if (this.qualifiesForHighScore) {
      setTimeout(() => {
        this.showPrompt = true;
      }, 15000);
    }
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
      color: $color-text-primary;
    }
    10% {
      transform: translate(0px, 125px) rotate(-4deg);
      opacity: 1;
      color: $color-text-primary;
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
      color: $color-text-primary;
    }
    100% {
      transform: translate(0px, 0px) rotate(0deg);
      opacity: 1;
      color: $color-text-primary;
    }
  }

  .game-over {
    @include backdrop-container;
    z-index: 100;
    font-family: $font-display;
    user-select: none;
    animation: game-over 0.33s linear;

    .game-over-wrapper {
      @include menu-wrapper;

      .game-over-title {
        font-size: 52px;

        @media screen and (max-width: 1024px) {
          font-size: 36px;
        }
        color: $color-text-primary;
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

        @media screen and (max-width: 1024px) {
          .forge-wrapper {
            margin-left: 20px;
            margin-right: 20px;
            width: calc(100% - 40px);
          }
        }
      }

      button.game-over-main-menu {
        @include gloss-button-red;
      }
    }
  }
</style>
