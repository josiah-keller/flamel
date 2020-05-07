<template>
  <div id="app">
    <MainMenu v-show="! isGameActive"/>
    <PlayArea v-if="isGameInitialized"/>
  </div>
</template>

<script>
import { mapState } from "vuex";

import MainMenu from "./components/MainMenu";
import PlayArea from "./components/PlayArea";

export default {
  name: "app",
  components: {
    MainMenu,
    PlayArea,
  },
  computed: {
    ...mapState(["isGameInitialized", "isGameActive"]),
  },
}
</script>

<style>
</style>
