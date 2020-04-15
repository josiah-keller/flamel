<template>
  <div class="board-cell" :class="{ 'gold': cell.gold, 'playable': playable }" @click="clicked">
    <Rune :shape="cell.shape" :color="cell.color"/>
  </div>
</template>

<script>
import Rune from "./Rune";

export default {
  components: {
    Rune,
  },
  props: {
    cell: Object,
    playable: Boolean,
  },
  methods: {
    clicked() {
      this.$emit("clicked");
    },
  },
};
</script>

<style lang="scss">
  .board-cell {
    width: 100%;
    height: 100%;
    text-align: center;

    &.gold {
      background: #cccc0a;

      &.playable:hover {
        background: #a5a508;
      }
    }

    &.playable:hover:not(.gold) {
      background: #aaa;
    }
  }
</style>
