<template>
  <div class="board">
    <table>
      <tr v-for="(row, index) in boardState.cells" :key="index">
        <td v-for="(cell, cellIndex) in row" :key="cellIndex">
          <BoardCell v-bind:cell="cell"/>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import BoardCell from "./BoardCell";

export default {
  components: {
    BoardCell,
  },
  props: {
    boardState: Object,
  },
}
</script>

<style lang="scss">
  .board {
    flex: 1 1 100%;
    background: #ddd;

    table {
      border-spacing: 0px;

      td {
        border: 1px solid black;
        width: 50px;
        height: 50px;
      }
    }
  }
</style>
