import electronStore from '@@/store'
import db from '@@/lib/datastore'
import { flatToNested } from '@@/util/helpers'

export default {
  namespaced: true,
  state: {
    list: [],
    selected: null,
    selectedId: null,
    selectedIds: null,
    editableId: null
  },
  getters: {
    all (state) {
      return state.list
    },
    folders (state) {
      return state.list.filter(i => !i.isSystem)
    },
    system (state) {
      return state.list.filter(i => i.isSystem)
    },
    systemAliases (state, getters) {
      const aliases = {}
      getters.system.map((i, index) => {
        aliases[getters.system[index].alias] = i._id
      })
      return aliases
    },
    selected (state, getters) {
      return getters.folders.find(i => i._id === state.selectedId) || null
    },
    selectedId (state) {
      return state.selectedId
    },
    selectedIds (state) {
      return state.selectedIds
    },
    editableId (state) {
      return state.editableId
    },
    defaultQueryBySystemFolder (state, getters) {
      let query = { isDeleted: false }

      if (state.selectedId === getters.systemAliases.trash) {
        query = { isDeleted: true }
      }
      if (state.selectedId === getters.systemAliases.favorites) {
        query = { isFavorites: true, isDeleted: false }
      }
      if (state.selectedId === getters.systemAliases.inbox) {
        query = { folderId: state.selectedId, isDeleted: false }
      }

      return query
    },
    isSystemFolder (state) {
      return state.selected?.isSystem || false
    }
  },
  mutations: {
    SET_FOLDERS (state, data) {
      state.list = data
    },
    SET_SELECTED_ID (state, id) {
      state.selectedId = id
    },
    SET_SELECTED_IDS (state, ids) {
      state.selectedIds = ids
    },
    SET_SELECTED (state, data) {
      state.selected = data
    },
    SET_EDITABLE (state, id) {
      state.editableId = id
    }
  },
  actions: {
    getFolders ({ commit }) {
      const folders = db.collections.folders.$find()
      let nestedFolders = flatToNested(folders, null)

      // Добавляем пропс 'id' для обеспечения работоспособности AppTree
      function addIdProp (arr) {
        return arr.map(i => {
          i.id = i._id
          if (i.children && i.children.length) {
            addIdProp(i.children)
          }
          return i
        })
      }

      nestedFolders = addIdProp(nestedFolders)
      const systemFolders = nestedFolders.splice(0, 4)

      function sort (arr, key = 'index') {
        arr
          .sort((a, b) => (a[key] > b[key] ? 1 : -1))
          .map(i => {
            if (i.children && i.children.length) {
              sort(i.children)
            }
            return i
          })
      }

      sort(nestedFolders)
      nestedFolders = [...systemFolders, ...nestedFolders]

      commit('SET_FOLDERS', nestedFolders)
    },
    setSelectedFolderById (
      { state, commit, dispatch, getters, rootGetters },
      id
    ) {
      const { list } = state
      const defaultFolderId = getters.systemAliases.allSnippets
      let folder

      function findFolderById (folders, id) {
        folders.forEach(i => {
          if (i._id === id) folder = i

          if (i.children && i.children.length) {
            findFolderById(i.children, id)
          }
        })
      }

      if (id) {
        findFolderById(list, id)
        commit('SET_SELECTED', folder)
        commit('SET_SELECTED_ID', id)
        electronStore.app.set('selectedFolderId', id)
      } else {
        const folder = list.find(i => i._id === defaultFolderId)
        commit('SET_SELECTED', folder)
        commit('SET_SELECTED_ID', defaultFolderId)
        electronStore.app.set('selectedFolderId', defaultFolderId)
      }

      dispatch('getNestedFolderIds')
    },
    getNestedFolderIds ({ state, commit }) {
      if (!state.selected) return

      const ids = []

      function getIds (arr) {
        arr.forEach(i => {
          ids.push(i._id)

          if (i.children && i.children.length) {
            getIds(i.children)
          }
        })
      }

      getIds([state.selected])

      commit('SET_SELECTED_IDS', ids)
    },
    addFolder ({ state, commit, dispatch }) {
      const folder = {
        name: 'Untitled',
        open: false,
        parentId: null,
        defaultLanguage: 'text'
      }

      const { _id: id } = db.collections.folders.$insert(folder)

      dispatch('getFolders')
      dispatch('setSelectedFolderById', id)
    },
    updateFolderById ({ dispatch, getters, rootGetters }, { id, payload }) {
      db.collections.folders.$findOneAndUpdate({ _id: id }, payload)

      dispatch('getFolders')
    },
    updateFolderNameById ({ dispatch, getters, rootGetters }, { id, payload }) {
      dispatch('updateFolderById', { id, payload })

      const ids = rootGetters['folders/selectedIds']
      dispatch(
        'snippets/getSnippets',
        { folderId: { $in: ids } },
        { root: true }
      )
      dispatch('getFolders')
    },
    updateFolders ({ dispatch }, folders) {
      folders.map(i => {
        db.collections.folders.$findOneAndUpdate(
          {
            _id: i._id
          },
          i
        )
      })
      dispatch('getFolders')
    },
    deleteFolderByIds ({ state, commit, dispatch, getters, rootGetters }, ids) {
      const snippetIds = rootGetters['snippets/snippetsBySort'].map(i => i._id)
      const payload = {
        folderId: getters.systemAliases.inbox,
        isDeleted: true
      }

      ids.map(id => db.collections.folders.remove({ _id: id }).write())

      dispatch('getFolders')
      dispatch('setSelectedFolderById', getters.systemAliases.inbox)
      dispatch(
        'snippets/updateSnippetsByIds',
        { ids: snippetIds, payload },
        { root: true }
      )
      dispatch('snippets/getSnippets', getters.defaultQueryBySystemFolder, {
        root: true
      })
      dispatch('snippets/setSelected', null, { root: true })
    },
    isFolderExist ({ state }, id) {
      return !!db.collections.folders.find({ _id: id }).value()
    }
  }
}
