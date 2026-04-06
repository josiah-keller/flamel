<template>
  <div class="mobile-bottom-bar">
    <Forge :value="forge"/>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Forge from "./Forge";

export default {
  components: {
    Forge,
  },
  computed: {
    ...mapState(["forge"]),
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
    }
  }
</style>
