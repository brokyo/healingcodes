import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import App from './components/App'
import router from './router'
import store from './store'
import VModal from 'vue-js-modal'

Vue.use(VModal)
sync(store, router)

const app = new Vue({
  router,
  store,
  ...App
})

export { app, router, store }
