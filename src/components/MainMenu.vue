<template>
  <div class="main-menu">
    <h1>AlChEmY</h1>
    <button @click="startGame">Play</button>
  </div>
</template>

<script>
  export default {
    methods: {
      startGame: () => {
        alert("foo");
      },
    },
  }
</script>

<style>
</style>