<template>
  <div class="status-bar">
    <div class="logo-wrapper">
      <h1 class="logo" v-sparkle>Flamel</h1>
    </div>
    <GameStatus :score="score" :difficulty="difficulty" :level="level"/>
    <div class="nav-buttons">
      <button @click="returnToMainMenu()">New Game</button>
    </div>
    <Forge :value="forge" :max="maxForges" @discard="discard"/>
    <div class="debug" v-if="debugEnabled">
      <button @click="dumpState">Dump State JSON to Console</button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Forge from "./Forge";
import GameStatus from "./GameStatus";

import Game from "../game/game";

export default {
  components: {
    GameStatus,
    Forge,
  },
  computed: {
    ...mapState(["score", "forge", "maxForges", "difficulty", "level"]),
  },
  methods: {
    discard() {
      Game.discard();
    },
    returnToMainMenu() {
      this.$store.dispatch("gameInactive");
    },
    dumpState() {
      console.log(JSON.stringify(this.$store.state));
    },
  },
  data() {
    return {
      debugEnabled: false,
    };
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

  .status-bar {
    flex: 0 0 300px;
    background: #898677;
    background-image: url("../assets/brick-texture.png");
    background-size: 50px;
    position: relative;
    z-index: 51;
    border-right: 2px solid #494638;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5);
    font-family: "Fraunces", "Times New Roman", serif;
    user-select: none;

    .logo-wrapper {
      text-align: center;
      margin-top: 20px;
    }

    .nav-buttons {
      text-align: center;

      button {
        font-family: "Fraunces", "Times New Roman", serif;
        font-size: 16px;
        color: #a3a08f;
        padding: 5px 15px;
        border: 1px solid #898677;
        border-radius: 3px;
        background: #494638;
        box-shadow: 0px 2px #292720;
        cursor: pointer;

        &:hover {
          background: #66624f;
        }

        &:active {
          background: #3d3b2f;
          box-shadow: 0px 2px #1f1d18 inset;
        }
      }
    }
  }
</style>
