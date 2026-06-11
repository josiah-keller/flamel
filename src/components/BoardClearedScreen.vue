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
      <button @click="nextLevel()" v-sparkle="{ maxParticles: 6, minInterval: 100, maxInterval: 300 }">Next board</button>
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
    font-family: $font-display;
    user-select: none;
    animation: board-cleared 3.33s linear;

    .board-cleared-wrapper {
      @include menu-wrapper;

      @media screen and (max-width: 700px) {
        height: auto;
      }

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
          padding: 10px 0px;
        }
      }

      button {
        @include gloss-button-green;
        margin-bottom: 10px;
      }
    }
  }
</style>
