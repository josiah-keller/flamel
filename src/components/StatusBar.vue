<template>
  <div class="status-bar">
    <div class="logo-wrapper">
      <h1 class="logo" v-sparkle>Flamel</h1>
    </div>
    <div class="score">
      <h2 class="score-heading">Score</h2>
      <span class="score-value">{{ score }}</span>
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
    <div class="nav-buttons">
      <button @click="returnToMainMenu()">New Game</button>
    </div>
    <div class="forge">
      <div class="forge-wrapper">
        <div class="forge-fill" :style="{ height: `${(100 * forge / maxForges).toFixed(2)}%` }"></div>
      </div>
      <div class="forge-discard">
        <button @click="discard">Discard</button>
      </div>
    </div>
    <div class="debug" v-if="debugEnabled">
      <button @click="dumpState">Dump State JSON to Console</button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Game from "../game/game";

export default {
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

    .score {
      text-align: center;
      background: #292720;
      border-radius: 3px;
      margin: 20px 50px;
      padding: 5px;
      box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5) inset;
      color: rgba(255, 255, 255, 0.8);

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

      .difficulty, .level {
        flex: 1;
        text-align: center;
        background: #292720;
        border-radius: 3px;
        padding: 5px;
        box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5) inset;
        color: rgba(255, 255, 255, 0.8);

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

    .forge {
      .forge-wrapper {
        border: 12px solid;
        border-radius: 3px;
        border-image: url("../assets/wrapper-border.png") 25 / 12px round;
        box-shadow: 0px 1px 2px 1px rgba(0, 0, 0, 0.4), 0px 0px 10px rgba(0, 0, 0, 0.5) inset;
        background: #000;
        background-image: linear-gradient(to top, #292720 0%, #1d1b17 100%);
        margin: 20px 60px 0px 60px;
        height: 100px;
        position: relative;
      }
      .forge-fill {
        position: absolute;
        left: 0%;
        bottom: 0%;
        width: 100%;
        height: 0%;
        background-color: #aa0000;
        background-image: url("../assets/forge-noise.png"), url("../assets/forge-noise.png"),
          linear-gradient(to top, #aa0000 0%, #ad0000 90%, #ad5500 100%);
        background-size: 600px, 1200px;
        animation: liquid-texture 40s linear infinite;
        box-shadow: 0px 0px 20px #aa0000;
        transition: height 0.5s ease-out;
      }
      .forge-discard {
        text-align: center;

        button {
          padding: 5px 30px;
          background: #343030;
          border: 0px;
          border-bottom-left-radius: 5px;
          border-bottom-right-radius: 5px;
          color: rgba(255, 255, 255, 0.6);
          font-family: "Fraunces", "Times New Roman", serif;
          text-transform: uppercase;
          cursor: pointer;

          &:hover {
            background: #413c3c;
          }
        }
      }
    }
  }
</style>
