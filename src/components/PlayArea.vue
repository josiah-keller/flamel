<template>
  <div class="play-area" @contextmenu="discard($event)">
    <OutsideScene v-if="!isGameOver && !delayedBoardCleared && !isPaused && showOutsideScene"/>
    <StatusBar v-if="!isGameOver && !delayedBoardCleared" :getOriginRect="getPlayerCursorRect" :onMulligan="performMulligan" :mulliganAvailable="mulliganAvailable" :mulliganUsed="mulliganUsed"/>
    <Board v-if="!isGameOver && !delayedBoardCleared"/>
    <MobileBottomBar v-if="!isGameOver && !delayedBoardCleared && !isPaused" :onMulligan="performMulligan" :mulliganAvailable="mulliganAvailable" :mulliganUsed="mulliganUsed"/>
    <PlayerCursor ref="playerCursor" v-if="viewportWidth > 900 && !isPaused" :rune="nextRune" :showIllegalIndicator="showIllegalIndicator"/>
    <div
      class="score-tip"
      :class="{ 'score-incremented': scoreIncremented }"
      ref="scoreTip"
      :style="{ right: `${scoreTipX}px`, bottom: `${scoreTipY}px` }">
        {{ lastScoreIncrement }}
    </div>
    <GameOverScreen v-if="isGameOver"/>
    <BoardClearedScreen v-if="isBoardCleared"/>
    <PauseScreen v-if="isPaused && !showMulliganModal"/>
    <MulliganWarningModal v-if="showMulliganModal" @confirm="onMulliganModalConfirm" @cancel="onMulliganModalCancel"/>
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
import MulliganWarningModal from "./MulliganWarningModal";
import OutsideScene from "./OutsideScene.vue";

export default {
  components: {
    Board,
    StatusBar,
    MobileBottomBar,
    MulliganWarningModal,
    PlayerCursor,
    GameOverScreen,
    BoardClearedScreen,
    PauseScreen,
    OutsideScene,
  },
  computed: {
    ...mapState(["nextRune", "isGameOver", "isBoardCleared", "isPaused", "difficulty", "score", "lastScoreIncrement", "previousGameState", "mulliganUsed"]),
    showIllegalIndicator() {
      return this.difficulty == Constants.Difficulties.EASY && !Game.anyMoveLegal(this.nextRune);
    },
    showOutsideScene() {
      return this.viewportWidth > 900;
    },
    mulliganAvailable() {
      return !!this.previousGameState;
    },
  },
  data() {
    return {
      delayedBoardCleared: this.isBoardCleared,
      boardClearTimeout: null,
      inactivityTimeout: null,
      viewportWidth: window.innerWidth,
      scoreIncremented: false,
      scoreTipX: 0,
      scoreTipY: 0,
      cursorX: 0,
      cursorY: 0,
      showMulliganModal: false,
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
    isPaused(newValue) {
      if (newValue) {
        clearTimeout(this.inactivityTimeout);
      } else {
        this.resetInactivityTimer();
      }
    },
  },
  methods: {
    discard(e) {
      e.preventDefault();
      if (this.isBoardCleared || this.isPaused) return;
      Game.discard();
    },
    performMulligan() {
      if (!this.mulliganAvailable || this.isPaused || this.isBoardCleared || this.isGameOver) return;
      if (localStorage.getItem("mulliganModalAcknowledged") !== "true") {
        this.$store.dispatch("pauseGame");
        this.showMulliganModal = true;
      } else {
        Game.mulligan();
      }
    },
    onMulliganModalConfirm() {
      localStorage.setItem("mulliganModalAcknowledged", "true");
      this.showMulliganModal = false;
      this.$store.dispatch("resumeGame");
      Game.mulligan();
    },
    onMulliganModalCancel() {
      this.showMulliganModal = false;
      this.$store.dispatch("resumeGame");
    },
    onWindowResize() {
      this.viewportWidth = window.innerWidth;
    },
    onMouseMove(e) {
      this.cursorX = innerWidth - e.clientX;
      this.cursorY = innerHeight - e.clientY;
      this.resetInactivityTimer();
    },
    onTouchStart(e) {
      const touch = e.touches[0];
      this.cursorX = innerWidth - touch.clientX;
      this.cursorY = innerHeight - touch.clientY;
      this.resetInactivityTimer();
    },
    getPlayerCursorRect() {
      return this.$refs.playerCursor ? this.$refs.playerCursor.getContainerRect() : null;
    },
    resetInactivityTimer() {
      clearTimeout(this.inactivityTimeout);
      if (this.isPaused || this.isGameOver || this.isBoardCleared) return;
      this.inactivityTimeout = setTimeout(() => {
        if (!this.isPaused && !this.isGameOver && !this.isBoardCleared) {
          this.$store.dispatch("pauseGame");
        }
      }, 5 * 60 * 1000);
    },
  },
  mounted() {
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('touchstart', this.onTouchStart);
    this.resetInactivityTimer();
    this.$watch("score", function() {
      if (!this.lastScoreIncrement) return;
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
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchstart', this.onTouchStart);
    clearTimeout(this.inactivityTimeout);
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
