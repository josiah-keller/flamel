<template>
  <div class="play-area" @contextmenu="discard($event)">
    <OutsideScene v-if="!isGameOver && !delayedBoardCleared && !isPaused && showOutsideScene"/>
    <StatusBar v-if="!isGameOver && !delayedBoardCleared"/>
    <Board v-if="!isGameOver && !delayedBoardCleared"/>
    <MobileBottomBar v-if="!isGameOver && !delayedBoardCleared && !isPaused"/>
    <PlayerCursor v-if="viewportWidth > 900 && !isPaused" :rune="nextRune" :showIllegalIndicator="showIllegalIndicator"/>
    <div
      class="score-tip"
      :class="{ 'score-incremented': scoreIncremented }"
      ref="scoreTip"
      :style="{ right: `${scoreTipX}px`, bottom: `${scoreTipY}px` }">
        {{ lastScoreIncrement }}
    </div>
    <GameOverScreen v-if="isGameOver"/>
    <BoardClearedScreen v-if="isBoardCleared"/>
    <PauseScreen v-if="isPaused"/>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Game from "../game/game";
import Constants from "../game/constants";

import Board from "./Board";
import StatusBar from "./StatusBar";
import PlayerCursor from "./PlayerCursor";
import GameOverScreen from "./GameOverScreen";
import BoardClearedScreen from "./BoardClearedScreen";
import PauseScreen from "./PauseScreen";
import MobileBottomBar from "./MobileBottomBar";
import OutsideScene from "./OutsideScene.vue";

export default {
  components: {
    Board,
    StatusBar,
    MobileBottomBar,
    PlayerCursor,
    GameOverScreen,
    BoardClearedScreen,
    PauseScreen,
    OutsideScene,
  },
  computed: {
    ...mapState(["nextRune", "isGameOver", "isBoardCleared", "isPaused", "difficulty", "score", "lastScoreIncrement", "cursorX", "cursorY"]),
    showIllegalIndicator() {
      return this.difficulty == Constants.Difficulties.EASY && !Game.anyMoveLegal(this.nextRune);
    },
    showOutsideScene() {
      return this.viewportWidth > 900;
    },
  },
  data() {
    return {
      delayedBoardCleared: this.isBoardCleared,
      boardClearTimeout: null,
      viewportWidth: window.innerWidth,
      scoreIncremented: false,
      scoreTipX: 0,
      scoreTipY: 0,
    };
  },
  watch: {
    isBoardCleared(newValue, oldValue) {
      if (newValue === true && newValue !== oldValue) {
        if (this.boardClearTimeout) clearTimeout(this.boardClearTimeout);
        this.boardClearTimeout = setTimeout(() => {
          this.delayedBoardCleared = true;
        }, Constants.BOARD_CLEAR_DELAY);
      } else {
        this.delayedBoardCleared = false;
      }
    },
  },
  methods: {
    discard(e) {
      e.preventDefault();
      if (this.isBoardCleared || this.isPaused) return;
      Game.discard();
    },
    onWindowResize() {
      this.viewportWidth = window.innerWidth;
    },
  },
  mounted() {
    window.addEventListener('resize', this.onWindowResize);
    this.$watch("score", function() {
      this.scoreTipX = this.cursorX;
      this.scoreTipY = this.cursorY;
      this.scoreIncremented = true;
    });
    this.$refs.scoreTip.addEventListener("animationend", () => {
      this.scoreIncremented = false;
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

  @keyframes score-tip {
    0% {
      transform: translateY(-50px);
      opacity: 1;
    }
    100% {
      transform: translateY(-75px);
      opacity: 0;
    }
  }

  .score-tip {
    position: fixed;
    z-index: 52;
    transform: translateY(-50px);
    font-family: "Fraunces", "Times New Roman", serif;
    font-size: 18px;
    color: #f7f79a;
    text-shadow: 0px 0px 5px black;
    opacity: 0;

    &.score-incremented {
      visibility: visible;
      animation: score-tip 1s ease-out;
    }

    &:not(.score-incremented) {
      visibility: hidden;
    }
  }

  .play-area {
    @include backdrop-container;
    user-select: none;
    cursor: default;
    display: flex;

    @media screen and (max-width: 900px) {
      flex-direction: column;
    }
  }
</style>
