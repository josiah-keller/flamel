<template>
  <div class="play-area">
    <StatusBar/>
    <Board/>
    <PlayerCursor :rune="nextRune"/>
    <GameOverScreen v-if="isGameOver"/>
    <BoardClearedScreen v-if="isBoardCleared"/>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Game from "../game/game";

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
    ...mapState(["nextRune", "isGameOver", "isBoardCleared"]),
  },
  created() {
    Game.init();
  },
};
</script>

<style lang="scss">
  .play-area {
    user-select: none;
    cursor: default;
    display: flex;
  }
</style>
