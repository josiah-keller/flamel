<template>
  <div class="status-bar">
    <div class="logo-wrapper" @click="returnToMainMenu()" title="Return to Main Menu (leaves game)">
      <h1 class="logo" v-sparkle>F<span class="lamel">lamel</span></h1>
    </div>
    <GameStatus :score="score" :difficulty="difficulty" :level="level"/>
    <div class="nav-buttons">
      <button @click="returnToMainMenu()">New Game</button>
      <button @click="pause()">Pause</button>
    </div>
    <Forge :value="forge" :getOriginRect="getOriginRect"/>
    <div class="mulligan-section">
      <button
        class="mulligan-button"
        :class="{ 'mulligan-used': mulliganUsed, 'mulligan-disabled': !mulliganAvailable }"
        :disabled="!mulliganAvailable"
        :title="mulliganUsed ? 'Mulligan has been used' : null"
        @click="onMulligan"
      >Mulligan</button>
    </div>
    <div class="debug" v-if="debugEnabled">
      <button @click="dumpState">Dump State JSON to Console</button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Forge from "./Forge";
import GameStatus from "./GameStatus";

export default {
  components: {
    GameStatus,
    Forge,
  },
  props: {
    getOriginRect: {
      type: Function,
      required: true,
    },
    onMulligan: {
      type: Function,
      required: true,
    },
    mulliganAvailable: {
      type: Boolean,
      required: true,
    },
    mulliganUsed: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapState(["score", "difficulty", "level", "forge"]),
  },
  methods: {
    returnToMainMenu() {
      this.$store.dispatch("gameInactive");
    },
    pause() {
      this.$store.dispatch("pauseGame");
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
    display: flex;
    align-items: center;
    flex-direction: column;

    @media screen and (min-width: 1600px) {
      border-left: 2px solid #494638;
    }

    @media screen and (max-width: 900px) {
      flex-direction: row;
      flex: 0 0 100px;

      .forge {
        display: none;
      }
    }

    .logo-wrapper {
      text-align: center;
      margin-top: 20px;
      cursor: pointer;

      @media screen and (max-width: 900px) {
        margin-top: 13px;
        margin-left: 20px;
        vertical-align: middle;
        order: 0;

        .logo {
          line-height: 1;
          padding-top: 11px;
          padding-bottom: 11px;
        }
      }

      @media screen and (max-width: 680px) {
        .lamel {
          display: none;
        }
      }
    }

    .nav-buttons {
      text-align: center;

      @media screen and (max-width: 900px) {
        display: none;
      }

      button {
        @include sidebar-button;
        margin: 0px 4px;
      }
    }

    .mulligan-section {
      text-align: center;
      margin-top: 10px;

      @media screen and (max-width: 900px) {
        display: none;
      }

      .mulligan-button {
        @include sidebar-button;
        position: relative;

        &.mulligan-disabled {
          background: $color-bg-darker;
          box-shadow: 0px 2px #1f1d18 inset;
          opacity: 0.5;
          cursor: default;
        }

        &.mulligan-used::after {
          content: '*';
          position: absolute;
          top: 0px;
          right: 4px;
          font-size: 22px;
          line-height: 1;
          color: rgb(200, 160, 0);
          pointer-events: none;
        }
      }
    }
  }
</style>
