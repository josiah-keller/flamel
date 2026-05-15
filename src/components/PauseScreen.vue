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
    font-family: "Fraunces", "Times New Roman", serif;
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
        @include gloss-button-base;
        border-color: rgb(120, 80, 0);
        background-color: rgb(140, 90, 0);
        background-image: linear-gradient(to top, rgb(120, 80, 0) 0%, rgb(110, 70, 0) 30%, rgb(90, 55, 0) 49.9999%, rgb(140, 95, 0) 50%, rgb(180, 120, 0) 100%);
        transition: box-shadow 0.1s linear;

        &:hover, &:focus {
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5) inset, 0px 0px 10px rgba(0, 0, 0, 0.25), 0px 0px 30px rgb(200, 150, 0);
        }
      }
    }
  }
</style>
