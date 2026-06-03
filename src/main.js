import Vue from "vue";

import store from "@/game/store";

import Game from "@/game/game";

import App from "@/App.vue";

import "@/fonts.scss";
import "@/global.scss";

Vue.config.productionTip = false;

Vue.filter("gameTime", function(value) {
  if (!value) value = 0;
  let seconds = Math.floor(value / 1000),
    minutes = Math.floor(seconds / 60),
    hours = Math.floor(minutes / 60);
  seconds = seconds % 60;
  minutes = minutes % 60;
  return `${hours > 0 ? `${hours}:` : ""}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

Game.setStore(store);

new Vue({
  render: h => h(App),
  store,
}).$mount('#app');
