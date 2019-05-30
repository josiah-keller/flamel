<template>
  <div class="status-bar">
    <h1>Flamel</h1>
    <p>Score: {{ gameState.score }}</p>
    <p>Forge: {{ gameState.forge }} / {{ gameState.maxForges }}</p>
    <p><button @click="discard">Discard</button></p>
  </div>
</template>

<script>
export default {
  props: {
    gameState: Object,
  },
  methods: {
    discard() {
      this.$emit("discard-requested");
    }
  },
}
</script>

<style>
  .status-bar {
    flex: 0 0 300px;
    background: #ccc;
  }
</style>
