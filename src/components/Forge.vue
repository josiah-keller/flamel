<template>
  <div class="forge">
    <div class="forge-wrapper">
      <div class="forge-fill" :style="{ height: `${(100 * value / maxForges).toFixed(2)}%` }"></div>
      <div
        ref="phantom"
        class="forge-phantom-rune"
        :class="{ melt, fly }"
        :style="{ transform: `translate(${phantomOffsets.x}, ${phantomOffsets.y})` }">

        <Rune v-if="discardedRune" :shape="discardedRune.shape" :color="discardedRune.color"/>
      </div>
    </div>
    <div class="forge-discard" v-if="showButton">
      <button @click="discard">Discard</button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Rune from "./Rune";
import Game from "../game/game";

export default {
  components: {
    Rune,
  },
  props: {
    value: Number,
    showButton:{
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapState(["maxForges", "discardedRune"]),
  },
  data() {
    return {
      melt: false,
      fly: false,
      phantomOffsets: {
        x: "0px",
        y: "0px",
      },
    };
  },
  methods: {
    discard() {
      Game.discard();
    },
    positionPhantom() {
      const boundingRect = this.$refs.phantom.getBoundingClientRect();
      this.phantomOffsets.x = `${innerWidth - this.$store.state.cursorX - boundingRect.right}px`;
      this.phantomOffsets.y = `${innerHeight - this.$store.state.cursorY - boundingRect.bottom}px`;
    },
    flyPhantom() {
      this.phantomOffsets.x = this.phantomOffsets.y = "0px";
    },
    playDiscardAnimation() {
      this.positionPhantom();
      this.$nextTick(() => {
        setTimeout(() => {
          this.fly = true;
          this.flyPhantom();
        }, 10);
      });
    },
  },
  mounted() {
    this.$watch("discardedRune", function(newValue) {
      if (newValue === null) return;
      this.playDiscardAnimation();
    }, { deep: true });
    this.$refs.phantom.addEventListener("transitionend", () => {
      this.fly = false;
      this.melt = true;
    });
    this.$refs.phantom.addEventListener("animationend", () => {
      this.melt = false;
    });
  },
};
</script>

<style lang="scss">
  @keyframes melt {
    0% {
      opacity: 1;
      transform: translate(0px, 0px) scale(1, 1);
    }
    100% {
      opacity: 0;
      transform: translate(0px, 40px) scale(1.2, 0.7);
    }
  }
  .forge {
    flex: 0 0 120px;
    width: 100%;
    position: relative;

    @media screen and (max-width: 900px) {
      width: 120px;
    }

    .forge-wrapper {
      border: 12px solid;
      border-radius: 3px;
      border-image: url("../assets/wrapper-border.png") 25 / 12px round;
      box-shadow: 0px 1px 2px 1px rgba(0, 0, 0, 0.4), 0px 0px 10px rgba(0, 0, 0, 0.5) inset;
      background: #000;
      background-image: linear-gradient(to top, #292720 0%, #1d1b17 100%);
      box-sizing: border-box;
      margin: 20px 60px 0px 60px;
      width: calc(100% - 120px);
      height: 124px;
      position: relative;

      @media screen and (max-width: 900px) {
        width: 100%;
        height: 68px;
        margin: 0px;
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
        z-index: 2;
      }

      .forge-phantom-rune {
        position: absolute;
        width: 50px;
        height: 50px;
        left: calc(50% - 25px);
        top: 0px;
        text-align: center;
        line-height: 50px;
        vertical-align: middle;
        opacity: 0;
        z-index: 1;
        transition: none;

        &.fly {
          opacity: 1;
          transition: transform 0.2s linear;
          z-index: 4;
        }
        &.melt {
          animation: melt 0.2s ease-out;
        }
      }
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

        &:hover, &:focus {
          background: #413c3c;
        }

        @media screen and (max-width: 900px) {
          position: absolute;
          left: 0px;
          top: 0px;
          width: 100%;
          height: 100%;
          z-index: 3;
          background: transparent;
          border-radius: 0px;

          &:hover, &:focus {
            background: transparent;
          }
        }
      }
    }
  }
</style>