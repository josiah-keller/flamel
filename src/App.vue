<template>
  <div id="app">
    <HighScoresScreen v-if="showHighScores" />
    <MainMenu v-else-if="! isGameActive"/>
    <PlayArea v-if="isGameInitialized && isGameActive && ! showHighScores"/>
  </div>
</template>

<script>
import { mapState } from "vuex";

import MainMenu from "./components/MainMenu";
import PlayArea from "./components/PlayArea";
import HighScoresScreen from "./components/HighScoresScreen";

export default {
  name: "app",
  components: {
    MainMenu,
    PlayArea,
    HighScoresScreen,
  },
  computed: {
    ...mapState(["isGameInitialized", "isGameActive", "showHighScores"]),
  },
}
</script>

<style>
</style>
