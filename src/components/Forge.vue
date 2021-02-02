<template>
  <div class="forge">
    <div class="forge-wrapper">
      <div class="forge-fill" :style="{ height: `${(100 * value / max).toFixed(2)}%` }"></div>
    </div>
    <div class="forge-discard">
      <button @click="discard">Discard</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: Number,
    max: Number,
  },
  methods: {
    discard() {
      this.$emit("discard");
    },
  },
};
</script>

<style lang="scss">
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
</style>