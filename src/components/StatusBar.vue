<template>
  <div class="status-bar">
    <h1>Flamel</h1>
    <p><button @click="returnToMainMenu()">Main Menu</button></p>
    <p>Difficulty: {{ ["Easy", "Medium", "Hard"][difficulty] }}</p>
    <p>Level: {{ level }}</p>
    <p>Score: {{ score }}</p>
    <p>Forge: {{ forge }} / {{ maxForges }}</p>
    <p><button @click="discard">Discard</button></p>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Game from "../game/game";
import store from "../game/store";

export default {
  computed: {
    ...mapState(["score", "forge", "maxForges", "difficulty", "level"]),
  },
  methods: {
    discard() {
      Game.discard();
    },
    returnToMainMenu() {
      store.dispatch("gameInactive");
    },
  },
};
</script>

<style>
  .status-bar {
    flex: 0 0 300px;
    background: #ccc;
  }
</style>
