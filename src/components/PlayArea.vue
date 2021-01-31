<template>
  <div class="play-area" @contextmenu="discard($event)">
    <StatusBar/>
    <Board/>
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
  methods: {
    discard(e) {
      e.preventDefault();
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
