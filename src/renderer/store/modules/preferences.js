import electronStore from '@@/store'

export default {
  namespaced: true,
  state: {
    renderWhitespace: electronStore.preferences.get('renderWhitespace'),
    wordWrap: electronStore.preferences.get('wordWrap'),
    tabSize: electronStore.preferences.get('tabSize'),
    insertSpaces: electronStore.preferences.get('insertSpaces'),
    prettierSemi: electronStore.preferences.get('prettierSemi'),
    prettierQuotes: electronStore.preferences.get('prettierQuotes'),
    showSubContent: electronStore.preferences.get('showSubContent')
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
    },
    SET_PRETTIER_SEMI (state, bool) {
      state.prettierSemi = bool
    },
    SET_PRETTIER_QUOTES (state, bool) {
      state.prettierQuotes = bool
    },
    SET_SHOW_SUB_CONTENT (state, bool) {
      state.showSubContent = bool
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
    },
    setPrettierSemi ({ commit }, bool) {
      commit('SET_PRETTIER_SEMI', bool)
      electronStore.preferences.set('prettierSemi', bool)
    },
    setPrettierQuotes ({ commit }, bool) {
      commit('SET_PRETTIER_QUOTES', bool)
      electronStore.preferences.set('prettierQuotes', bool)
    },
    setShowSubContent ({ commit }, bool) {
      commit('SET_SHOW_SUB_CONTENT', bool)
      electronStore.preferences.set('showSubContent', bool)
    }
  }
}
