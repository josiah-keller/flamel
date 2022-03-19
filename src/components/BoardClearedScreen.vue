<template>
  <div class="board-cleared">
    <div class="board-cleared-wrapper">
      <h1 class="board-cleared-title">Board cleared</h1>
      <table class="board-cleared-stats">
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
      <button @click="nextLevel()" v-sparkle="{ maxParticles: 6, minInterval: 100, maxInterval: 300 }">Play next board</button>
      <button @click="returnToMainMenu()">Main Menu</button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Game from "../game/game";
import Constants from "../game/constants";

export default {
  computed: {
    boardsCleared() {
      return this.$store.state.level - Constants.STARTING_LEVELS[this.$store.state.difficulty] + 1;
    },
    ...mapState(["timeAccumulator", "maxRun", "score"]),
  },
  methods: {
    nextLevel() {
      Game.nextLevel();
    },
    returnToMainMenu() {
      this.$store.dispatch("gameInactive");
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
  @import "@/global.scss";

  @keyframes board-cleared {
    0% {
      opacity: 0;
    }
    90% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .board-cleared {
    @include backdrop-container;
    z-index: 100;
    font-family: "Fraunces", "Times New Roman", serif;
    user-select: none;
    animation: board-cleared 3.33s linear;

    .board-cleared-wrapper {
      @include menu-wrapper;

      .board-cleared-title {
        font-size: 52ps;
        color: rgb(21, 37, 19);
        text-transform: uppercase;
        margin-bottom: 50px;
      }

      .board-cleared-stats {
        width: 80%;
        margin: auto;
        text-align: left;
        font-size: 20px;
        margin-bottom: 50px;

        td {
          padding: 2px 0px;
        }
      }

      button {
        @include gloss-button-base;
        border-color: rgb(0, 100, 0);
        background-color: rgb(0, 150, 0);
        background-image: linear-gradient(to top, rgb(0, 100, 0) 0%, rgb(0, 90, 0) 30%, rgb(0, 80, 0) 49.9999%, rgb(0, 120, 0) 50%, rgb(0, 140, 0) 100%);
        transition: box-shadow 0.1s linear;

        &:hover, &:focus {
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5) inset, 0px 0px 10px rgba(0, 0, 0, 0.25), 0px 0px 30px rgb(0, 140, 0);
        }
      }
    }
  }
</style>
