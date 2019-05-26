<template>
  <div class="rune" :class="`color-${color}`">
    {{ shape }}
  </div>
</template>

<script>
export default {
  props: {
    shape: String,
    color: String,
  },
}
</script>

<style lang="scss">
  .rune {
    font-size: 22px;

    &.color-red {
      color: red;
    }
    &.color-blue {
      color: blue;
    }
    &.color-magenta {
      color: magenta;
    }
    &.color-green {
      color: limegreen;
    }
  }
</style>
