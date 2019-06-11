import Vue from "vue";

import store from "./game/store";

import App from "./App.vue";

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  store,
}).$mount('#app');
