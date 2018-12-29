<template>
  <div class="status-bar">
    <h1>AlChEmY</h1>
    <p>Score: {{ gameState.score }}</p>
    <p>Forge: {{ gameState.forge }}</p>
  </div>
</template>

<script>
export default {
  props: {
    gameState: Object,
  }
}
</script>

<style>
  .status-bar {
    flex: 0 0 300px;
    background: #ccc;
  }
</style>
