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

import brickTexture from "./assets/brick-texture.png";
import forgeNoise from "./assets/forge-noise.png";
import wrapperBorder from "./assets/wrapper-border.png";

export default {
  name: "app",
  components: {
    MainMenu,
    PlayArea,
    HighScoresScreen,
  },
  mounted() {
    [brickTexture, forgeNoise, wrapperBorder].forEach(src => {
      new Image().src = src;
    });
  },
  computed: {
    ...mapState(["isGameInitialized", "isGameActive", "showHighScores"]),
  },
}
</script>

<style>
</style>
