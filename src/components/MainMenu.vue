<template>
  <div class="main-menu">
    <h1>Flamel</h1>
    <div>
      <button @click="selectEasy()">Easy</button>
      <button @click="selectMedium()">Medium</button>
      <button @click="selectHard()">Hard</button>
      <p>Currently selected: {{ ["Easy", "Medium", "Hard"][difficulty] }}</p>
    </div>
    <button @click="startGame">Play</button>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Game from "../game/game";
import Constants from "../game/constants";
import store from "../game/store";

export default {
  computed: {
    ...mapState(["isGameActive"]),
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

<style>
  .main-menu {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: #fff;
    z-index: 101;
  }
</style>