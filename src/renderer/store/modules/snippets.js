import db from '@/datastore'
import electronStore from '@@/store'
import { defaultLibraryQuery } from '@/util/helpers'
import uniqBy from 'lodash-es/uniqBy'

// Fallback stored sorting value
// @see https://github.com/antonreshetov/massCode/pull/74
// TODO: Remove in future
const sort =
  electronStore.app.get('snippetsSort') === 'updateAt'
    ? 'updatedAt'
    : electronStore.app.get('snippetsSort')

export default {
  namespaced: true,
  state: {
    snippets: [],
    snippetsLatest: [],
    selectedId: null,
    selectedSnippets: [],
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
    snippetsLatest (state) {
      return state.snippetsLatest
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
      return state.snippets.find(i => i._id === state.selectedId)
    },
    selectedId (state) {
      return state.selectedId
    },
    selectedIndex (state, getters) {
      return getters.snippetsBySort.findIndex(i => i._id === state.selectedId)
    },
    selectedSnippets (state) {
      return state.selectedSnippets
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
    SET_LATEST_SNIPPETS (state, snippets) {
      state.snippetsLatest = snippets
    },
    SET_SELECTED_ID (state, id) {
      state.selectedId = id
    },
    SET_SELECTED_SNIPPETS (state, snippets) {
      state.selectedSnippets = snippets
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
    SET_COUNT (state, count) {
      state.count = count
    }
  },
  actions: {
    async getSnippets ({ commit }, query = {}) {
      const defaultQuery = {
        isDeleted: false,
        ...query
      }

      function getSnippets () {
        return new Promise((resolve, reject) => {
          db.snippets.find(defaultQuery, (err, snippets) => {
            if (err) reject(err)
            resolve(snippets)
          })
        })
      }

      function getFolders () {
        return new Promise((resolve, reject) => {
          db.masscode.findOne({ _id: 'folders' }, (err, doc) => {
            if (err) reject(err)
            resolve(doc.list)
          })
        })
      }

      function getTags () {
        return new Promise((resolve, reject) => {
          db.tags.find({}, (err, doc) => {
            if (err) reject(err)
            resolve(doc)
          })
        })
      }

      const snippets = await getSnippets()
      const folders = await getFolders()
      const tags = await getTags()

      // Добавляем связь folder
      snippets.map(snippet => {
        function findFolderById (folders, id) {
          folders.forEach(i => {
            if (i.id === id) snippet.folder = i

            if (i.children && i.children.length) {
              findFolderById(i.children, id)
            }
          })
        }

        findFolderById(folders, snippet.folderId)

        return snippet
      })

      // Добавляем связь tags
      snippets.map(snippet => {
        snippet.tagsPopulated = []
        snippet.tags.forEach(tagId => {
          const foundedTag = tags.find(tag => tag._id === tagId)
          if (foundedTag) {
            foundedTag.text = foundedTag.name
            snippet.tagsPopulated.push(foundedTag)
          }
        })
      })

      commit('SET_SNIPPETS', snippets)
    },
    async getLatestSnippets ({ commit, dispatch }, limit = 20) {
      const query = {
        isDeleted: false
      }

      return new Promise((resolve, reject) => {
        db.snippets
          .find(query)
          .sort({ updatedAt: -1 })
          .limit(limit)
          .exec((err, snippets) => {
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

              commit('SET_LATEST_SNIPPETS', snippets)
              resolve()
            })
          })
      })
    },
    setSelected ({ commit }, snippet) {
      if (snippet) {
        commit('SET_SELECTED_ID', snippet._id)
        electronStore.app.set('selectedSnippetId', snippet._id)
      } else {
        commit('SET_SELECTED_ID', null)
        electronStore.app.delete('selectedSnippetId')
      }
    },
    addSnippet ({ commit, dispatch, rootGetters }, { folderId, snippet }) {
      const ids = rootGetters['folders/selectedIds']
      const defaultLanguage = rootGetters['folders/defaultLanguage']
      const defaultQuery = { folderId: { $in: ids } }
      const query = defaultLibraryQuery(defaultQuery, folderId)

      if (!snippet) {
        snippet = {
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
        commit('SET_SELECTED_ID', snippet._id)
        commit('SET_NEW', snippet._id)
      })
    },
    updateSnippets ({ commit, dispatch, rootGetters }, { ids, payload }) {
      const foldersIds = rootGetters['folders/selectedIds']
      const folderId = rootGetters['folders/selectedId']
      const isTagsShow = rootGetters['app/isTagsShow']
      const defaultQuery = { folderId: { $in: foldersIds } }
      const query = defaultLibraryQuery(defaultQuery, folderId)

      return new Promise((resolve, reject) => {
        db.snippets.update(
          { _id: { $in: ids } },
          payload,
          { multi: true },
          async (err, num) => {
            if (err) return
            if (!isTagsShow) {
              await dispatch('getSnippets', query)
            } else {
              const selectedTagId = rootGetters['tags/selectedId']
              await dispatch('getSnippets', {
                tags: { $elemMatch: selectedTagId }
              })
            }
            resolve()
          }
        )
        commit('SET_NEW', null)
      })
    },
    deleteSnippets ({ dispatch, rootGetters }, ids) {
      const foldersIds = rootGetters['folders/selectedIds']
      const folderId = rootGetters['folders/selectedId']
      const defaultQuery = { folderId: { $in: foldersIds } }
      const query = defaultLibraryQuery(defaultQuery, folderId)

      db.snippets.remove({ _id: { $in: ids } }, { multi: true }, (err, num) => {
        if (err) return
        dispatch('getSnippets', query)
      })
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
    },
    searchSnippets ({ commit }, query) {
      db.snippets.find({}, (err, doc) => {
        if (err) return
        query = query.toLowerCase()

        doc = doc
          .filter(snippet => !snippet.isDeleted)
          .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))

        const resultBySnippetContent = doc.filter(snippet =>
          snippet.content.some(content =>
            content.value ? content.value.toLowerCase().includes(query) : false
          )
        )

        const resultBySnippetName = doc.filter(snippet =>
          snippet.name.toLowerCase().includes(query)
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
            commit('folders/SET_SELECTED_ID', 'allSnippets', { root: true })
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
      })
    },
    searchSnippetsTray ({ commit }, query) {
      db.snippets.find({}, (err, doc) => {
        if (err) return
        query = query.toLowerCase()

        doc = doc
          .filter(snippet => !snippet.isDeleted)
          .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))

        const resultBySnippetContent = doc.filter(snippet =>
          snippet.content.some(content =>
            content.value ? content.value.toLowerCase().includes(query) : false
          )
        )

        const resultBySnippetName = doc.filter(snippet =>
          snippet.name.toLowerCase().includes(query)
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
      })
    },
    setSort ({ commit }, sort) {
      commit('SET_SORT', sort)
      electronStore.app.set('snippetsSort', sort)
    },
    async addTag ({ dispatch, rootGetters }, { snippetId, tagId }) {
      db.snippets.update({ _id: snippetId }, { $addToSet: { tags: tagId } })
      const isTagsShow = rootGetters['app/isTagsShow']

      if (!isTagsShow) {
        const selectedFolderIds = rootGetters['folders/selectedIds']
        const isSystemFolder = rootGetters['folders/isSystemFolder']
        const defaultQuery = rootGetters['folders/defaultQueryBySystemFolder']

        let query = { folderId: { $in: selectedFolderIds } }

        if (isSystemFolder) {
          query = defaultQuery
        }

        await dispatch('getSnippets', query)
      } else {
        const selectedTagId = rootGetters['tags/selectedId']
        await dispatch('getSnippets', { tags: { $elemMatch: selectedTagId } })
      }
    },
    async removeTag ({ dispatch, rootGetters }, { snippetId, tagId }) {
      db.snippets.update({ _id: snippetId }, { $pull: { tags: tagId } })
      const isTagsShow = rootGetters['app/isTagsShow']

      if (!isTagsShow) {
        const selectedFolderIds = rootGetters['folders/selectedIds']
        const isSystemFolder = rootGetters['folders/isSystemFolder']
        const defaultQuery = rootGetters['folders/defaultQueryBySystemFolder']

        let query = { folderId: { $in: selectedFolderIds } }

        if (isSystemFolder) {
          query = defaultQuery
        }

        await dispatch('getSnippets', query)
      } else {
        const selectedTagId = rootGetters['tags/selectedId']
        await dispatch('getSnippets', { tags: { $elemMatch: selectedTagId } })
      }
    },
    getSnippetsCount ({ commit }) {
      db.snippets.count({ isDeleted: false }, (err, count) => {
        if (err) throw new Error(err)

        commit('SET_COUNT', count)
      })
    }
  }
}
