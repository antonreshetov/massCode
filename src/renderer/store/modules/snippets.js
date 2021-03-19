import electronStore from '@@/store'
import uniqBy from 'lodash-es/uniqBy'
import db from '@@/lib/datastore'
import pull from 'lodash-es/pull'
import { deleteTechProps } from '@@/lib/datastore/helpers'

const sort = electronStore.app.get('snippetsSort') || 'updatedAt'

export default {
  namespaced: true,
  state: {
    snippets: [],
    snippetsTray: [],
    selectedId: null,
    selectedIds: [],
    searched: [],
    searchedTray: [],
    search: false,
    searchTray: false,
    searchQuery: null,
    searchQueryTray: null,
    newSnippetId: null,
    sort,
    activeFragment: { snippetId: null, index: 0 },
    count: null
  },
  getters: {
    snippetsBySort (state) {
      if (state.sort === 'createdAt') {
        return [...state.snippets].sort((a, b) =>
          a.createdAt > b.createdAt ? -1 : 1
        )
      }
      if (state.sort === 'updatedAt') {
        return [...state.snippets].sort((a, b) =>
          a.updatedAt > b.updatedAt ? -1 : 1
        )
      }
      if (state.sort === 'name') {
        return [...state.snippets].sort((a, b) =>
          a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
        )
      }
      return state.snippets
    },
    snippetFirst (state, getters) {
      return getters.snippetsBySort?.[0]
    },
    snippetLatest (state, getters) {
      return getters.snippetsBySort[getters.snippetsBySort.length - 1]
    },
    snippetsTray (state) {
      return state.snippetsTray
    },
    snippetsFavorites (state) {
      return state.snippets.filter(i => i.isFavorites)
    },
    snippetsDeleted (state) {
      return state.snippets.filter(i => i.isDeleted)
    },
    snippetsSearched (state) {
      return state.searched
    },
    snippetsSearchedTray (state) {
      return state.searchedTray
    },
    searchQuery (state) {
      return state.searchQuery
    },
    searchQueryTray (state) {
      return state.searchQueryTray
    },
    selected (state) {
      if (state.search) {
        return state.searched.find(i => i._id === state.selectedId)
      } else {
        return state.snippets.find(i => i._id === state.selectedId)
      }
    },
    selectedId (state) {
      return state.selectedId
    },
    selectedIds (state) {
      return state.selectedIds
    },
    selectedIndex (state, getters) {
      return getters.snippetsBySort.findIndex(i => i._id === state.selectedId)
    },
    selectedSnippets (state, getters) {
      return (
        getters.selectedIds?.reduce((acc, id) => {
          const snippet = state.snippets.find(i => i._id === id)
          acc.push(snippet)
          return acc
        }, []) || []
      )
    },
    newSnippetId (state) {
      return state.newSnippetId
    },
    sort (state) {
      return state.sort
    },
    count (state) {
      return state.count
    },
    activeFragment (state) {
      return state.activeFragment
    },
    isSelected (state) {
      return !!state.selectedId
    },
    isSelectedMultiple (state, getters) {
      return getters.selectedIds?.length > 1 || false
    },
    isSearched (state) {
      return state.search
    },
    isSearchedTray (state) {
      return state.searchTray
    }
  },
  mutations: {
    SET_SNIPPETS (state, snippets) {
      state.snippets = snippets
    },
    SET_SNIPPETS_FOR_TRAY (state, snippets) {
      state.snippetsTray = snippets
    },
    SET_SELECTED_ID (state, id) {
      state.selectedId = id
    },
    SET_SELECTED_IDS (state, ids) {
      state.selectedIds = ids
    },
    SET_NEW (state, snippet) {
      state.newSnippetId = snippet
    },
    SET_SEARCHED (state, snippets) {
      state.searched = snippets
    },
    SET_SEARCHED_TRAY (state, snippets) {
      state.searchedTray = snippets
    },
    SET_SEARCH (state, bool) {
      state.search = bool
    },
    SET_SEARCH_TRAY (state, bool) {
      state.searchTray = bool
    },
    SET_SEARCH_QUERY (state, query) {
      state.searchQuery = query
    },
    SET_SEARCH_QUERY_TRAY (state, query) {
      state.searchQueryTray = query
    },
    SET_SORT (state, sort) {
      state.sort = sort
    },
    SET_ACTIVE_FRAGMENT (state, payload) {
      state.activeFragment = payload
    },
    RESET_ACTIVE_FRAGMENT (state) {
      state.activeFragment = { snippetId: null, index: 0 }
    },
    SET_COUNT (state, count) {
      state.count = count
    }
  },
  actions: {
    async getSnippets ({ commit, rootGetters }, query = {}) {
      const defaultQuery = {
        isDeleted: false,
        ...query
      }

      const snippets = db.collections.snippets.$aggregate([
        {
          $match: defaultQuery
        },
        {
          $lookup: {
            from: 'tags',
            localField: 'tagIds',
            foreignField: '_id',
            as: 'tags'
          }
        },
        {
          $lookup: {
            from: 'folders',
            localField: 'folderId',
            foreignField: '_id',
            as: 'folder'
          }
        },
        {
          $sort: { updatedAt: 1 }
        }
      ])

      commit('SET_SNIPPETS', snippets)
    },
    getSnippetsBySelectedFolders ({ dispatch, rootGetters }) {
      const foldersIds = rootGetters['folders/selectedIds']
      const isSystemFolder = rootGetters['folders/isSystemFolder']
      const defaultQueryBySystemFolder =
        rootGetters['folders/defaultQueryBySystemFolder']
      let query = { folderId: { $in: foldersIds } }

      if (isSystemFolder) query = defaultQueryBySystemFolder

      dispatch('getSnippets', query)
    },
    async getSnippetsForTray ({ commit, dispatch }, limit = 10) {
      const defaultQuery = {
        isDeleted: false
      }
      const snippets = db.collections.snippets.$aggregate([
        {
          $match: defaultQuery
        },
        {
          $lookup: {
            from: 'tags',
            localField: 'tagIds',
            foreignField: '_id',
            as: 'tags'
          }
        },
        {
          $lookup: {
            from: 'folders',
            localField: 'folderId',
            foreignField: '_id',
            as: 'folder'
          }
        },
        {
          $sort: { updatedAt: 1 }
        },
        {
          $limit: limit
        }
      ])
      commit('SET_SNIPPETS_FOR_TRAY', snippets)
    },
    setSelected ({ commit }, snippet) {
      if (snippet) {
        if (typeof snippet === 'object') {
          commit('SET_SELECTED_ID', snippet._id)
          commit('SET_ACTIVE_FRAGMENT', {
            snippetId: snippet._id,
            index: 0
          })
          electronStore.app.set('selectedSnippetId', snippet._id)
        }
        if (typeof snippet === 'string') {
          commit('SET_SELECTED_ID', snippet)
          commit('SET_ACTIVE_FRAGMENT', {
            snippetId: snippet,
            index: 0
          })
          electronStore.app.set('selectedSnippetId', snippet)
        }
      } else {
        commit('SET_SELECTED_ID', null)
        electronStore.app.delete('selectedSnippetId')
      }
    },
    async addSnippet (
      { commit, dispatch, getters, rootGetters },
      { folderId, snippet }
    ) {
      const isFolderExist = await dispatch('folders/isFolderExist', folderId, {
        root: true
      })
      const { trash, favorites, allSnippets, inbox } = rootGetters[
        'folders/systemAliases'
      ]

      if (folderId === trash || folderId === favorites) return
      if (!folderId || !isFolderExist) folderId = inbox

      const defaultLanguage =
        rootGetters['folders/selected']?.defaultLanguage || 'text'

      if (!snippet) {
        db.collections.snippets.$insert({
          name: 'Untitled snippet',
          folderId: folderId === allSnippets ? inbox : folderId,
          content: [
            { label: 'Fragment 1', language: defaultLanguage, value: '' }
          ]
        })
      } else {
        snippet = deleteTechProps(snippet)
        db.collections.snippets.$insert(snippet)
      }

      dispatch('getSnippetsBySelectedFolders')
      const first = getters.snippetsBySort[0]
      dispatch('setSelected', first)
    },
    updateSnippetsByIds ({ commit, dispatch, rootGetters }, { ids, payload }) {
      ids.forEach(id => {
        try {
          db.collections.snippets.$findOneAndUpdate(
            {
              _id: id
            },
            payload
          )
        } catch (err) {
          console.error(err)
        }
      })

      dispatch('getSnippetsBySelectedFolders')
    },
    addToFavoritesByIds ({ state, dispatch }, ids) {
      ids.map(id => {
        db.collections.snippets
          .find({ _id: id })
          .assign({ isFavorites: true })
          .write()
      })
      dispatch('getSnippetsBySelectedFolders')
    },
    removeFromFavoritesByIds ({ state, dispatch }, ids) {
      ids.map(id => {
        db.collections.snippets
          .find({ _id: id })
          .assign({ isFavorites: false })
          .write()
      })
      dispatch('getSnippetsBySelectedFolders')
    },
    deleteSnippetByIds ({ dispatch, rootGetters }, ids) {
      ids.map(id => {
        db.collections.snippets.remove({ _id: id }).write()
      })
      dispatch('getSnippetsBySelectedFolders')
    },
    emptyTrash ({ dispatch, rootGetters }) {
      db.collections.snippets.remove({ isDeleted: true }).write()
      dispatch('setSelected', null)
      dispatch('getSnippetsBySelectedFolders')
    },
    async searchSnippets (
      { state, commit, dispatch, getters, rootGetters },
      query
    ) {
      await dispatch('getSnippets')
      commit('RESET_ACTIVE_FRAGMENT')

      query = query.trim().toLowerCase()
      const re = new RegExp(query.replace(' ', '|'))

      const snippets = getters.snippetsBySort

      const resultBySnippetContent = snippets.filter(snippet =>
        snippet.content.some(content =>
          content.value ? content.value.toLowerCase().match(re)?.length : false
        )
      )

      const resultBySnippetName = snippets.filter(snippet =>
        snippet.name.toLowerCase().match(re)?.length
      )

      const results = uniqBy(
        [...resultBySnippetContent, ...resultBySnippetName],
        '_id'
      )

      if (query) {
        commit('SET_SEARCH', true)
        commit('SET_SEARCH_QUERY', query)

        if (results.length) {
          const first = results[0]
          commit('SET_SELECTED_ID', first._id)
          const { allSnippets } = rootGetters['folders/systemAliases']
          commit('folders/SET_SELECTED_ID', allSnippets, { root: true })
        } else {
          commit('SET_SELECTED_ID', null)
        }
      } else {
        const selectedSnippetId = electronStore.app.get('selectedSnippetId')
        const selectedFolderId = electronStore.app.get('selectedFolderId')
        commit('SET_SEARCH', false)
        commit('SET_SEARCH_QUERY', null)
        commit('SET_SELECTED_ID', selectedSnippetId)
        commit('folders/SET_SELECTED_ID', selectedFolderId, { root: true })
      }

      commit('SET_SEARCHED', results)
    },
    async searchSnippetsTray ({ commit, dispatch, getters }, query) {
      await dispatch('getSnippets')

      query = query.toLowerCase()
      const snippets = getters.snippetsBySort
      const re = new RegExp(query.replace(' ', '|'))

      const resultBySnippetContent = snippets.filter(snippet =>
        snippet.content.some(content =>
          content.value ? content.value.toLowerCase().match(re)?.length : false
        )
      )

      const resultBySnippetName = snippets.filter(snippet =>
        snippet.name.toLowerCase().match(re)?.length
      )

      const results = uniqBy(
        [...resultBySnippetContent, ...resultBySnippetName],
        '_id'
      )

      if (query) {
        commit('SET_SEARCH_TRAY', true)
        commit('SET_SEARCH_QUERY_TRAY', query)
      } else {
        commit('SET_SEARCH_TRAY', false)
        commit('SET_SEARCH_QUERY_TRAY', null)
      }

      commit('SET_SEARCHED_TRAY', results)
    },
    setSort ({ commit }, sort) {
      commit('SET_SORT', sort)
      electronStore.app.set('snippetsSort', sort)
    },
    async addTag ({ dispatch, getters, rootGetters }, { snippetId, tagId }) {
      const snippetDoc = db.collections.snippets.find({ _id: snippetId })
      const { tagIds } = snippetDoc.cloneDeep().value()

      tagIds.push(tagId)
      snippetDoc.assign({ tagIds }).write()
      dispatch('getSnippetsBySelectedFolders')
    },
    async removeTag ({ dispatch, getters, rootGetters }, { snippetId, tagId }) {
      const snippetDoc = db.collections.snippets.find({ _id: snippetId })
      const { tagIds } = snippetDoc.cloneDeep().value()

      pull(tagIds, tagId)
      snippetDoc.assign({ tagIds }).write()
      dispatch('getSnippetsBySelectedFolders')
    },
    getSnippetsCount ({ commit }) {
      const count = db.collections.snippets
        .filter({ isDeleted: false })
        .size()
        .value()
      commit('SET_COUNT', count)
    }
  }
}
