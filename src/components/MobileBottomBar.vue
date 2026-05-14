<template>
  <div class="mobile-bottom-bar">
    <Forge :value="forge"/>
    <div class="next-rune-indicator" :class="{ 'new-rune': newRune }" ref="nextRuneIndicator">
      <h2 class="next-rune-heading">Next</h2>
      <div class="rune-wrapper">
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
