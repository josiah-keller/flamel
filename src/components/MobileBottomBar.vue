<template>
  <div class="mobile-bottom-bar">
    <Forge :value="forge" :getOriginRect="() => $refs.runeWrapper.getBoundingClientRect()"/>
    <button class="mobile-pause-button" @click="pause()">Pause</button>
    <button
      class="mobile-mulligan-button"
      :class="{ 'mulligan-used': mulliganUsed, 'mulligan-disabled': !mulliganAvailable }"
      :disabled="!mulliganAvailable"
      @click="onMulligan"
    ><span class="mulligan-label-full">Mulligan</span><span class="mulligan-label-short">Mull.</span></button>
    <div class="next-rune-indicator" :class="{ 'new-rune': newRune }" ref="nextRuneIndicator">
      <h2 class="next-rune-heading">Next</h2>
      <div class="rune-wrapper" ref="runeWrapper">
        <Rune :shape="nextRune.shape" :color="nextRune.color"/>
        <div class="illegal-indicator" v-show="showIllegalIndicator"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Forge from "./Forge";
import Rune from "./Rune";
import Game from "../game/game";
import Constants from "../game/constants";

export default {
  components: {
    Forge,
    Rune,
  },
  props: {
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
    ...mapState(["forge", "nextRune", "difficulty"]),
    showIllegalIndicator() {
      return this.difficulty == Constants.Difficulties.EASY && !Game.anyMoveLegal(this.nextRune);
    },
  },
  data() {
    return {
      newRune: false,
    };
  },
  methods: {
    pause() {
      this.$store.dispatch("pauseGame");
    },
  },
  mounted() {
    this.$watch("nextRune", function() {
      this.newRune = true;
    }, { deep: true });
    this.$refs.nextRuneIndicator.addEventListener("animationend", (e) => {
      if (e.target.classList.contains("rune")) {
        this.newRune = false;
      }
    });
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

  .mobile-bottom-bar {
    display: none;

    @media screen and (max-width: 900px) {
      display: flex;
      flex: 0 0 auto;
      align-items: center;
      background: #898677;
      background-image: url("../assets/brick-texture.png");
      background-size: 50px;
      border-top: 2px solid #494638;
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5);
      padding: 8px 12px;
      position: relative;
      z-index: 51;

      .forge {
        width: 120px;

        .forge-wrapper {
          width: 100%;
          height: 72px;
          margin: 0px;
        }

        .forge-discard button {
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

    .mulligan-label-short {
      display: none;
    }

    @media screen and (max-width: 390px) {
      .mulligan-label-full { display: none; }
      .mulligan-label-short { display: inline; }
    }

    .mobile-mulligan-button {
      @include sidebar-button;
      position: relative;
      margin-left: 8px;

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

    .mobile-pause-button {
      @include sidebar-button;
      margin-left: 8px;
    }

    .next-rune-indicator {
      @include indicator-box;
      padding: 5px 10px;
      margin-left: auto;
      display: flex;
      flex-direction: column;
      align-items: center;

      .next-rune-heading {
        @include indicator-heading;
        margin-bottom: 4px;
      }

      .rune-wrapper {
        position: relative;
        height: 30px;
        display: flex;
        align-items: center;

        .rune.special-wild {
          width: 30px;
          height: 30px;
          border-width: 13px;
        }
        .rune.special-bomb {
          width: 22px;
          height: 22px;
          box-shadow: 0px 0px 6px rgba(255, 255, 255, 0.3);

          &::after {
            height: 7px;
            top: -2px;
          }
        }

        .illegal-indicator {
          @include illegal-indicator;
        }
      }

      &.new-rune .rune {
        animation: new-rune 0.2s ease-in-out;
      }
    }
  }
</style>
