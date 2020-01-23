import electronStore from '@@/store'

export default {
  namespaced: true,
  state: {
    renderWhitespace: electronStore.preferences.get('renderWhitespace'),
    wordWrap: electronStore.preferences.get('wordWrap'),
    tabSize: electronStore.preferences.get('tabSize'),
    insertSpaces: electronStore.preferences.get('insertSpaces')
  },
  getters: {},
  mutations: {
    SET_RENDER_WHITESPACE (state, type) {
      state.renderWhitespace = type
    },
    SET_WORD_WRAP (state, type) {
      state.wordWrap = type
    },
    SET_TAB_SIZE (state, size) {
      state.tabSize = size
    },
    SET_INSERT_SPACES (state, bool) {
      state.insertSpaces = bool
    }
  },
  actions: {
    setWhitespaceType ({ commit }, type) {
      commit('SET_RENDER_WHITESPACE', type)
      electronStore.preferences.set('renderWhitespace', type)
    },
    setWordWrap ({ commit }, type) {
      commit('SET_WORD_WRAP', type)
      electronStore.preferences.set('wordWrap', type)
    },
    setTabSize ({ commit }, size) {
      commit('SET_TAB_SIZE', Number(size))
      electronStore.preferences.set('tabSize', Number(size))
    },
    setInsertSpaces ({ commit }, bool) {
      commit('SET_INSERT_SPACES', bool)
      electronStore.preferences.set('insertSpaces', bool)
    }
  }
}
