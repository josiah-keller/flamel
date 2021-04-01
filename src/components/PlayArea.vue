<template>
  <div class="play-area" @contextmenu="discard($event)">
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

export default {
  components: {
    Board,
    StatusBar,
    PlayerCursor,
    GameOverScreen,
    BoardClearedScreen,
  },
  computed: {
    ...mapState(["nextRune", "isGameOver", "isBoardCleared", "difficulty"]),
    showIllegalIndicator() {
      return this.difficulty == Constants.Difficulties.EASY && !Game.anyMoveLegal(this.nextRune);
    },
  },
  data() {
    return {
      delayedBoardCleared: this.isBoardCleared,
      boardClearTimeout: null,
    };
  },
  watch: {
    isBoardCleared(newValue, oldValue) {
      if (newValue === true && newValue !== oldValue) {
        if (this.boardClearTimeout) clearTimeout(this.boardClearTimeout);
        setTimeout(() => {
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
  }
</style>
