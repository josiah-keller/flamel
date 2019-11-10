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
};
</script>

<style lang="scss">
  .rune {
    font-size: 22px;
    text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.75);

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
    &.color-yellow {
      color: yellow;
    }
    &.color-cyan {
      color: cyan;
    }
    &.color-orange {
      color: orange;
    }
    &.color-white {
      color: white;
    }
    &.color-gray {
      color: slategray;
    }
  }
</style>
