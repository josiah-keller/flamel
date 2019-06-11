<template>
  <div class="status-bar">
    <h1>Flamel</h1>
    <p>Score: {{ score }}</p>
    <p>Forge: {{ forge }} / {{ maxForges }}</p>
    <p><button @click="discard">Discard</button></p>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Game from "../game/game";

export default {
  computed: {
    ...mapState(["score", "forge", "maxForges"]),
  },
  methods: {
    discard() {
      Game.discard();
    }
  },
};
</script>

<style>
  .status-bar {
    flex: 0 0 300px;
    background: #ccc;
  }
</style>
