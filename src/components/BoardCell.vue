<template>
  <div class="board-cell">
    {{ cell.shape }} / {{ cell.color }} / {{ cell.gold }}
  </div>
</template>

<script>
export default {
  props: {
    cell: Object,
  },
}
</script>

<style>

</style>
