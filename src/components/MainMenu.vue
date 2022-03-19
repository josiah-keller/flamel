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
    ...mapActions(["setDifficulty"]),
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
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

  .main-menu {
    @include backdrop-container;
    z-index: 101;
    font-family: "Fraunces", "Times New Roman", serif;
    user-select: none;

    .main-menu-wrapper {
      @include menu-wrapper;

      .difficulty-select {
        margin-top: 50px;

        button {
          color: rgba(255, 255, 255, 0.6);
          font-size: 22px;
          font-family: "Fraunces", "Times New Roman", serif;
          text-transform: uppercase;
          margin: 0 5px;
          padding: 10px 20px;
          border: 1px solid #222;
          border-radius: 10px;
          background-color: #666;
          background-image: linear-gradient(to top, rgb(100, 100, 100) 0%, rgb(50, 50, 50) 30%, rgb(35, 35, 35) 49.9999%, rgb(45, 45, 45) 50%, rgb(80, 80, 80) 100%);
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5) inset, 0px 0px 5px rgba(0, 0, 0, 1) inset;
          cursor: pointer;

          &:hover, &:focus {
            color: rgba(255, 255, 255, 0.8);
            background-color: #777;
            background-image: linear-gradient(to top, rgb(120, 120, 120) 0%, rgb(60, 60, 60) 30%, rgb(40, 40, 40) 49.9999%, rgb(50, 50, 50) 50%, rgb(90, 90, 90) 100%);
          }
          &.selected {
            background-color: rgb(28, 138, 28);
            background-image: linear-gradient(to top, rgb(35, 212, 35) 0%, rgb(21, 97, 21) 30%, rgb(16, 82, 16) 49.9999%, rgb(20, 97, 20) 50%, rgb(23, 165, 23) 100%);
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
      .play {
        margin-top: 50px;

        button {
          @include gloss-button-base;
          border-color: rgb(8, 80, 99);
          background-color: rgb(8, 80, 99);
          background-image: linear-gradient(to top, rgb(11, 159, 196) 0%, rgb(8, 76, 94) 30%, rgb(5, 56, 68) 49.9999%, rgb(8, 81, 99) 50%, rgb(12, 134, 165) 100%);
          transition: box-shadow 0.1s linear;

          &:hover, &:focus {
            box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5) inset, 0px 0px 10px rgba(0, 0, 0, 0.25), 0px 0px 20px rgb(8, 80, 99);
          }
        }
      }
    }
  }
</style>