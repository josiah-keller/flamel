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
import { mapState } from "vuex";

import Game from "../game/game";
import Constants from "../game/constants";
import store from "../game/store";
import "../directives/sparkle";

export default {
  computed: {
    ...mapState(["isGameActive"]),
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
  data() {
    return {
      difficulty: Constants.Difficulties.EASY,
    };
  },
  methods: {
    startGame() {
      store.dispatch("setDifficulty", this.difficulty);
      Game.init();
    },
    selectEasy() {
      this.difficulty = Constants.Difficulties.EASY;
    },
    selectMedium() {
      this.difficulty = Constants.Difficulties.MEDIUM;
    },
    selectHard() {
      this.difficulty = Constants.Difficulties.HARD;
    },
  },
};
</script>

<style lang="scss">
  .main-menu {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background-color: #0f0f0f;
    background-image: url("../assets/menu-texture-1.png");
    background-size: cover;
    z-index: 101;
    font-family: "Fraunces", "Times New Roman", serif;
    user-select: none;

    .main-menu-wrapper {
      box-sizing: border-box;
      padding: 20px;
      background-color: rgb(124, 121, 119);
      background-image: linear-gradient(to top, rgb(116, 111, 108), rgb(151, 148, 146));
      border-radius: 10px;
      box-shadow: 0px 3px 0px rgb(31, 30, 29), 0px 0px 50px rgba(0, 0, 0, 0.3);
      position: absolute;
      width: 50%;
      height: 75%;
      left: 25%;
      top: 12.5%;
      text-align: center;

      &::after {
        content: ' ';
        position: absolute;
        left: 10px;
        top: 10px;
        width: 50px;
        height: 20px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 10px;
      }

      .logo {
        font-weight: normal;
        color: #646407;
        background-color: #9c9c08;
        background-image: linear-gradient(to top, #9c9c08 0%, #a8a812 49.9999%, #b1b115 50%, #d6d619 100%);
        text-transform: uppercase;
        margin: 0px;
        display: inline-block;
        font-size: 52px;
        padding: 5px 10px;
        text-shadow: 0px -1px #2c2c03;
        border-radius: 3px;
        box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
        position: relative;

        &::after {
          content: ' ';
          position: absolute;
          left: 5px;
          top: 3px;
          width: 20px;
          height: 6px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
        }
      }

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

          &:hover {
            color: rgba(255, 255, 255, 0.8);
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
          color: rgba(255, 255, 255, 0.6);
          font-size: 22px;
          font-family: "Fraunces", "Times New Roman", serif;
          text-transform: uppercase;
          margin: 0 5px;
          padding: 10px 40px;
          border: 1px solid rgb(8, 80, 99);
          border-radius: 30px;
          background-color: rgb(8, 80, 99);
          background-image: linear-gradient(to top, rgb(11, 159, 196) 0%, rgb(8, 76, 94) 30%, rgb(5, 56, 68) 49.9999%, rgb(8, 81, 99) 50%, rgb(12, 134, 165) 100%);
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5) inset, 0px 0px 10px rgba(0, 0, 0, 0.25);
          cursor: pointer;

          transition: box-shadow 0.1s linear;

          &:hover {
            color: rgba(255, 255, 255, 0.8);
            box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5) inset, 0px 0px 10px rgba(0, 0, 0, 0.25), 0px 0px 20px rgb(8, 80, 99);
          }
        }
      }
    }
  }
</style>