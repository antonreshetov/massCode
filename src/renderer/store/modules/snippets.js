import db from '@/datastore'
import electronStore from '@@/store'
import { defaultLibraryQuery } from '@/util/helpers'

export default {
  namespaced: true,
  state: {
    snippets: [],
    selected: null,
    selectedId: null,
    newSnippetId: null
  },
  getters: {
    snippets (state) {
      return state.snippets
    },
    snippetsFavorites (state) {
      return state.snippets.filter(i => i.isFavorites)
    },
    snippetsDeleted (state) {
      return state.snippets.filter(i => i.isDeleted)
    },
    selected (state) {
      return state.selected
    },
    selectedId (state) {
      if (state.selected) {
        return state.selected._id
      }
    },
    newSnippetId (state) {
      return state.newSnippetId
    },
    isSelected (state) {
      return !!state.selected
    }
  },
  mutations: {
    SET_SNIPPETS (state, snippets) {
      state.snippets = snippets
    },
    SET_SELECTED (state, snippet) {
      state.selected = snippet
    },
    SET_SELECTED_ID (state, id) {
      state.selectedId = id
    },
    SET_NEW (state, snippet) {
      state.newSnippetId = snippet
    }
  },
  actions: {
    getSnippets ({ commit }, query = {}) {
      const defaultQuery = {
        isDeleted: false,
        ...query
      }

      return new Promise((resolve, reject) => {
        db.snippets.find(defaultQuery, (err, snippets) => {
          if (err) return
          // Добавляем связь folder по его id у snippet
          db.masscode.findOne({ _id: 'folders' }, (err, doc) => {
            if (err) return

            const { list } = doc

            snippets.map(snippet => {
              function findFolderById (folders, id) {
                folders.forEach(i => {
                  if (i.id === id) snippet.folder = i

                  if (i.children && i.children.length) {
                    findFolderById(i.children, id)
                  }
                })
              }

              findFolderById(list, snippet.folderId)

              return snippet
            })

            commit('SET_SNIPPETS', snippets)
            resolve()
          })
        })
      })
    },
    setSelected ({ commit }, snippet) {
      commit('SET_SELECTED', snippet)
      commit('SET_SELECTED_ID', snippet._id)
      electronStore.set('selectedSnippetId', snippet._id)
    },
    addSnippet ({ commit, dispatch, rootGetters }, folderId) {
      const ids = rootGetters['folders/selectedIds']
      const defaultLanguage = rootGetters['folders/defaultLanguage']
      const defaultQuery = { folderId: { $in: ids } }
      const query = defaultLibraryQuery(defaultQuery, folderId)

      const snippet = {
        name: 'Untitled snippet',
        folderId: folderId,
        content: [
          { label: 'Fragment 1', language: defaultLanguage, value: '' }
        ],
        tags: [],
        isFavorites: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (folderId === 'trash') {
        snippet.folderId = null
        snippet.isDeleted = true
      }
      if (folderId === 'favorites') {
        snippet.folderId = null
        snippet.isFavorites = true
      }
      if (folderId === 'allSnippets') {
        snippet.folderId = null
      }
      if (folderId === 'inBox') {
        snippet.folderId = null
      }

      db.snippets.insert(snippet, (err, snippet) => {
        if (err) return
        dispatch('getSnippets', query)
        commit('SET_SELECTED', snippet)
        commit('SET_NEW', snippet._id)
      })
    },
    updateSnippet ({ commit, dispatch, rootGetters }, { id, payload }) {
      const ids = rootGetters['folders/selectedIds']
      const folderId = rootGetters['folders/selectedId']
      const defaultQuery = { folderId: { $in: ids } }
      const query = defaultLibraryQuery(defaultQuery, folderId)

      db.snippets.update({ _id: id }, payload, {}, (err, num) => {
        if (err) return
        dispatch('getSnippets', query)
      })
      commit('SET_NEW', null)
    },
    emptyTrash ({ dispatch, rootGetters }) {
      const ids = rootGetters['folders/selectedIds']
      const folderId = rootGetters['folders/selectedId']
      const defaultQuery = { folderId: { $in: ids } }
      const query = defaultLibraryQuery(defaultQuery, folderId)

      db.snippets.remove({ isDeleted: true }, { multi: true }, (err, num) => {
        if (err) return
        dispatch('getSnippets', query)
      })
    }
  }
}
