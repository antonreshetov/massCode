import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import snippets from './modules/snippets'
import folders from './modules/folders'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  modules: {
    app,
    snippets,
    folders
  }
})
