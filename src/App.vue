<template>
  <div id="app">
    <MainMenu v-if="! isGameActive"/>
    <PlayArea v-if="isGameInitialized && isGameActive"/>
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
