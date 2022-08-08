<template>
  <div class="game-status">
    <div class="score">
        <h2 class="score-heading">Score</h2>
        <span class="score-value">{{ presentedScore }}</span>
    </div>
    <div class="difficulty-level">
      <div class="difficulty">
        <h2 class="difficulty-heading">Difficulty</h2>
        <span class="difficulty-value">{{ ["Easy", "Medium", "Hard"][difficulty] }}</span>
      </div>
      <div class="level">
        <h2 class="level-heading">Level</h2>
        <span class="level-value">{{ level }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import tween from "../tween";
import Constants from "../game/constants";

export default {
  props: {
    score: Number,
    difficulty: Number,
    level: Number,
  },
  data() {
    return {
      tweenedScore: this.score,
    };
  },
  computed: {
    ...mapState(["isBoardCleared"]),
    presentedScore() {
      return this.tweenedScore.toFixed(0);
    },
  },
  watch: {
    score(newValue, oldValue) {
      if (newValue === oldValue) return;
      const duration = this.isBoardCleared ? Constants.BOARD_CLEAR_DELAY - 1000 : 250;
      tween.go(this.$data, { tweenedScore: newValue }, { duration });
    },
  },
};
</script>

<style lang="scss">
  .game-status {
    display: flex;
    flex-direction: column;
    width: 100%;

    flex: 0 2;

    @media screen and (max-width: 900px) {
      flex-direction: row;
    }

    .score {
      text-align: center;
      background: #292720;
      border-radius: 3px;
      margin: 20px 50px 0px 50px;
      padding: 5px;
      box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5) inset;
      color: rgba(255, 255, 255, 0.8);

      @media screen and (max-width: 900px) {
        margin: 13px 10px 0px 10px;
        padding: 15px 10px;
        width: 100px;
        height: 44px;
      }

      .score-heading {
        font-size: 10px;
        text-transform: uppercase;
        margin: 0px;
      }
      .score-value {
        font-size: 28px;
      }
    }

    .difficulty-level {
      display: flex;
      column-gap: 10px;
      margin: 20px 50px;

      @media screen and (max-width: 900px) {
        margin: 13px 10px 0px 0px;
        height: 44px;
      }

      .difficulty, .level {
        flex: 1;
        text-align: center;
        background: #292720;
        border-radius: 3px;
        padding: 5px;
        box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5) inset;
        color: rgba(255, 255, 255, 0.8);

        @media screen and (max-width: 900px) {
          padding: 15px 10px;
          height: 44px;
        }

        .difficulty-heading, .level-heading {
          font-size: 10px;
          text-transform: uppercase;
          margin: 0px;
        }
        .difficulty-value, .level-value {
          font-size: 22px;
        }
      }
    }
  }
</style>