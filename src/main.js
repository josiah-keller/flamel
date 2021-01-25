import Vue from "vue";

import store from "@/game/store";

import Game from "@/game/game";

import App from "@/App.vue";

import "@/fonts.scss";
import "@/global.scss";

Vue.config.productionTip = false;

Game.setStore(store);

new Vue({
  render: h => h(App),
  store,
}).$mount('#app');
