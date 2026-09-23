<template>
  <div class="mulligan-warning-modal">
    <div class="mulligan-warning-wrapper">
      <h1 class="mulligan-warning-title">Mulligan</h1>
      <p class="mulligan-warning-text">
        Using Mulligan will mark your high score entry with an asterisk (*).
      </p>
      <button @click="$emit('confirm')" v-sparkle="{ maxParticles: 6, minInterval: 100, maxInterval: 300 }">Use</button>
      <button @click="$emit('cancel')">Cancel</button>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["confirm", "cancel"],
};
</script>

<style lang="scss">
  @import "@/global.scss";

  .mulligan-warning-modal {
    @include backdrop-container;
    z-index: 100;
    font-family: $font-display;
    user-select: none;

    .mulligan-warning-wrapper {
      @include plate;
      position: absolute;
      width: 40%;
      left: 30%;
      top: 50%;
      transform: translateY(-50%);
      text-align: center;
      padding: 40px;

      @media screen and (max-width: 700px) {
        width: calc(100% - 80px);
        left: 40px;
      }

      @media screen and (min-width: 1720px) {
        width: 28%;
        left: 36%;
      }

      .mulligan-warning-title {
        font-size: 36px;
        color: rgb(37, 30, 10);
        text-transform: uppercase;
        margin-bottom: 16px;
      }

      .mulligan-warning-text {
        font-size: 18px;
        color: rgb(37, 30, 10);
        margin-bottom: 30px;
        line-height: 1.4;
      }

      button {
        @include gloss-button-blue;
        margin: 4px;

        & + button {
          @include gloss-button-blue;
          margin: 4px;
        }
      }
    }
  }
</style>
