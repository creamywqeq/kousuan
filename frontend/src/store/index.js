import Vue from 'vue'
import Vuex from 'vuex'
import practice from './modules/practice'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    practice
  }
}) 