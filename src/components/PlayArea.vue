<template>
  <div class="play-area" @contextmenu="discard($event)">
    <OutsideScene v-if="!isGameOver && !delayedBoardCleared && showOutsideScene"/>
    <StatusBar v-if="!isGameOver && !delayedBoardCleared"/>
    <Board v-if="!isGameOver && !delayedBoardCleared"/>
    <PlayerCursor :rune="nextRune" :showIllegalIndicator="showIllegalIndicator"/>
    <GameOverScreen v-if="isGameOver"/>
    <BoardClearedScreen v-if="isBoardCleared"/>
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
import OutsideScene from "./OutsideScene.vue";

export default {
  components: {
    Board,
    StatusBar,
    PlayerCursor,
    GameOverScreen,
    BoardClearedScreen,
    OutsideScene,
  },
  computed: {
    ...mapState(["nextRune", "isGameOver", "isBoardCleared", "difficulty"]),
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
      if (this.isBoardCleared) return;
      Game.discard();
    },
    onWindowResize() {
      this.viewportWidth = window.innerWidth;
    },
  },
  mounted() {
    window.addEventListener('resize', this.onWindowResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

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
