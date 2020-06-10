<template>
  <div class="board-cleared">
    Board cleared!
    <table>
      <tr>
        <th scope="row">Boards Cleared</th>
        <td>{{ boardsCleared }}</td>
      </tr>
      <tr>
        <th scope="row">Time Spent Playing</th>
        <td>{{ timeAccumulator | gameTime }}</td>
      </tr>
      <tr>
        <th scope="row">Longest Run Without Discard</th>
        <td>{{ maxRun }}</td>
      </tr>
      <tr>
        <th scope="row">Current Score</th>
        <td>{{ score }}</td>
      </tr>
    </table>
    <button @click="nextLevel()">Play next board</button>
    <button @click="returnToMainMenu()">Main Menu</button>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Game from "../game/game";
import Constants from "../game/constants";
import store from "../game/store";

export default {
  computed: {
    boardsCleared() {
      return store.state.level - Constants.STARTING_LEVELS[store.state.difficulty] + 1;
    },
    ...mapState(["timeAccumulator", "maxRun", "score"]),
  },
  methods: {
    nextLevel() {
      Game.nextLevel();
    },
    returnToMainMenu() {
      store.dispatch("gameInactive");
    },
  },
  filters: {
    gameTime(value) {
      if (! value) value = 0;
      let seconds = Math.floor(value / 1000),
        minutes = Math.floor(seconds / 60),
        hours = Math.floor(minutes / 60);
      seconds = seconds % 60;
      minutes = minutes % 60;
      return `${hours > 0 ? `${hours}:` : ""}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
  },
};
</script>

<style lang="scss">
  .board-cleared {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background: #999;
    z-index: 100;
  }
</style>
