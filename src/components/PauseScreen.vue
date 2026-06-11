<template>
  <div class="pause-screen">
    <div class="pause-screen-wrapper">
      <h1 class="pause-screen-title">Paused</h1>
      <button @click="resume()" v-sparkle="{ maxParticles: 6, minInterval: 100, maxInterval: 300 }">Resume</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    resume() {
      this.$store.dispatch("resumeGame");
    },
  },
};
</script>

<style lang="scss">
  @import "@/global.scss";

  @keyframes pause-screen {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .pause-screen {
    @include backdrop-container;
    z-index: 100;
    font-family: $font-display;
    user-select: none;

    .pause-screen-wrapper {
      @include menu-wrapper;
      animation: pause-screen 0.33s linear;

      .pause-screen-title {
        font-size: 52px;

        @media screen and (max-width: 1024px) {
          font-size: 36px;
        }
        color: rgb(37, 30, 10);
        text-transform: uppercase;
        margin-bottom: 30px;
      }

      button {
        @include gloss-button-gold;
      }
    }
  }
</style>
