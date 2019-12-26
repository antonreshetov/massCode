import electronStore from '@@/store'

export default {
  namespaced: true,
  state: {
    sidebarWidth: 180,
    snippetListWidth: 220
  },
  getters: {},
  mutations: {
    SET_SIDEBAR_WIDTH (state, width) {
      state.sidebarWidth = width
    },
    SET_SNIPPET_LIST_WIDTH (state, width) {
      state.snippetListWidth = width
    }
  },
  actions: {
    setSidebarWidth ({ commit }, width) {
      width = Math.ceil(width)
      commit('SET_SIDEBAR_WIDTH', width)
      electronStore.set('sidebarWidth', width)
    },
    setSnippetListWidth ({ commit }, width) {
      width = Math.ceil(width)
      commit('SET_SNIPPET_LIST_WIDTH', width)
      electronStore.set('snippetListWidth', width)
    }
  }
}
