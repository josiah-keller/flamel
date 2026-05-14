<template>
  <div class="outside-scene">
    <div class="starfield" v-starfield></div>
    <div class="wall">
    </div>
  </div>
</template>

<script>
import "../directives/starfield";
export default {

}
</script>

<style lang="scss">
  .outside-scene {
    flex: 0 2 25%;
    background: #070326;
    background-image: linear-gradient(to top, #0D0759, #070326);
    position: relative;

    .starfield {
      position: absolute;
      left: 0px;
      top: 0px;
      width: 100%;
      height: 85%;
    }

    .wall {
      position: absolute;
      left: 0px;
      bottom: 0px;
      width: 100%;
      height: 15%;
      background: #898677;
      background-image: url("../assets/brick-texture.png");
      background-size: 40px;
      border-top: 4px solid #494638;
      filter: grayscale(80%) brightness(40%);
    }
  }
</style>