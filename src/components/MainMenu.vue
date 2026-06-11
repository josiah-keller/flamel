<template>
  <div class="main-menu">
    <div class="main-menu-wrapper">
      <h1 class="logo" v-sparkle="{ maxParticles: 6, minInterval: 100, maxInterval: 800 }">Flamel</h1>
      <div class="difficulty-select">
        <button @click="selectEasy()" :class="easySelected">Easy</button>
        <button @click="selectMedium()" :class="mediumSelected">Medium</button>
        <button @click="selectHard()" :class="hardSelected">Hard</button>
      </div>
      <div class="play">
        <button @click="startGame" v-sparkle>Play</button>
      </div>
      <div class="high-scores-link">
        <button @click="viewHighScores">High Scores</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

import Game from "../game/game";
import Constants from "../game/constants";
import "../directives/sparkle";

export default {
  computed: {
    ...mapState(["isGameActive", "difficulty"]),
    easySelected() {
      return this.difficulty === Constants.Difficulties.EASY ? "selected" : "";
    },
    mediumSelected() {
      return this.difficulty === Constants.Difficulties.MEDIUM ? "selected" : "";
    },
    hardSelected() {
      return this.difficulty === Constants.Difficulties.HARD ? "selected" : "";
    },
  },
  methods: {
    ...mapActions(["setDifficulty", "openHighScores"]),
    startGame() {
      Game.init();
    },
    selectEasy() {
      this.setDifficulty(Constants.Difficulties.EASY);
    },
    selectMedium() {
      this.setDifficulty(Constants.Difficulties.MEDIUM);
    },
    selectHard() {
      this.setDifficulty(Constants.Difficulties.HARD);
    },
    viewHighScores() {
      this.openHighScores(null);
    },
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

  .main-menu {
    @include backdrop-container;
    z-index: 101;
    font-family: $font-display;
    user-select: none;

    .main-menu-wrapper {
      @include menu-wrapper;

      .difficulty-select {
        margin-top: 50px;

        @media screen and (max-width: 1024px) {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        button {
          @include tab-button-gray;
          font-size: 22px;
          margin: 0 5px;
          padding: 10px 20px;
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5) inset, 0px 0px 5px rgba(0, 0, 0, 1) inset;

          &:hover, &:focus {
            background-color: #777;
            background-image: linear-gradient(to top, rgb(120, 120, 120) 0%, rgb(60, 60, 60) 30%, rgb(40, 40, 40) 49.9999%, rgb(50, 50, 50) 50%, rgb(90, 90, 90) 100%);
          }
          &.selected {
            @include tab-button-green-selected;
          }
        }
      }
      .play {
        margin-top: 50px;

        button {
          @include gloss-button-blue;
        }
      }

      .high-scores-link {
        margin-top: 16px;

        button {
          color: rgba(255, 255, 255, 0.5);
          font-size: 16px;
          font-family: $font-display;
          text-transform: uppercase;
          padding: 6px 20px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          background: transparent;
          cursor: pointer;
          transition: color 0.1s, border-color 0.1s;

          &:hover, &:focus {
            color: rgba(255, 255, 255, 0.8);
            border-color: rgba(255, 255, 255, 0.4);
          }
        }
      }
    }
  }
</style>