import electronStore from '@@/store'
import { format } from 'date-fns'
import db from '@@/lib/datastore'

export default {
  namespaced: true,
  state: {
    os: process.platform,
    init: false,
    theme: electronStore.preferences.get('theme'),
    sidebarWidth: electronStore.app.get('sidebarWidth') || 180, // Принудительное значение если пришел null
    snippetListWidth: electronStore.app.get('snippetListWidth') || 220, // Принудительное значение если пришел null
    storagePath: electronStore.preferences.get('storagePath'),
    editorWidth: null,
    backupPath: electronStore.preferences.get('backupPath'),
    backups: [], // Временные метки
    markdownPreview: false,
    updateAvailable: false,
    showTags: false
  },
  getters: {
    isTagsShow (state) {
      return state.showTags
    },
    backups (state) {
      return state.backups
        .map(i => {
          return {
            label: format(i, 'dd MMM yyyy, HH:mm:ss'),
            date: i
          }
        })
        .sort((a, b) => (a > b ? 1 : -1))
    }
  },
  mutations: {
    SET_INIT (state, bool) {
      state.init = bool
    },
    SET_SIDEBAR_WIDTH (state, width) {
      state.sidebarWidth = width
    },
    SET_SNIPPET_LIST_WIDTH (state, width) {
      state.snippetListWidth = width
    },
    SET_STORAGE_PATH (state, path) {
      state.storagePath = path
    },
    SET_THEME (state, theme) {
      state.theme = theme
    },
    SET_MARKDOWN_PREVIEW (state, bool) {
      state.markdownPreview = bool
    },
    SET_UPDATE_AVAILABLE (state, bool) {
      state.updateAvailable = bool
    },
    SET_SHOW_TAGS (state, bool) {
      state.showTags = bool
    },
    SET_BACKUP_PATH (state, path) {
      state.backupPath = path
    },
    SET_BACKUPS (state, backups) {
      state.backups = backups
    }
  },
  actions: {
    setSidebarWidth ({ commit }, width) {
      width = Math.ceil(width)
      commit('SET_SIDEBAR_WIDTH', width)
      electronStore.app.set('sidebarWidth', width)
    },
    setSnippetListWidth ({ commit }, width) {
      width = Math.ceil(width)
      commit('SET_SNIPPET_LIST_WIDTH', width)
      electronStore.app.set('snippetListWidth', width)
    },
    setTheme ({ commit }, theme) {
      commit('SET_THEME', theme)
      electronStore.preferences.set('theme', theme)
    },
    async setShowTags ({ commit, dispatch, rootGetters }, bool) {
      if (bool) {
        commit('SET_SHOW_TAGS', true)
        const selectedTagId = rootGetters['tags/selectedId']
        await dispatch(
          'snippets/getSnippets',
          { tags: { $elemMatch: selectedTagId } },
          { root: true }
        )
      } else {
        commit('SET_SHOW_TAGS', false)
        const selectedFolderIds = rootGetters['folders/selectedIds']
        const defaultQueryBySystemFolder =
          rootGetters['folders/defaultQueryBySystemFolder']
        const isSystemFolder = rootGetters['folders/isSystemFolder']

        let query = {}

        if (isSystemFolder) {
          query = defaultQueryBySystemFolder
        }

        if (this.selectedIds) {
          query = { folderId: { $in: selectedFolderIds } }
        }

        await dispatch('snippets/getSnippets', query, { root: true })
      }

      const firstSnippet = rootGetters['snippets/snippetsBySort'][0]

      if (firstSnippet) {
        dispatch('snippets/setSelected', firstSnippet, { root: true })
      } else {
        dispatch('snippets/setSelected', null, { root: true })
      }
    },
    async getBackups ({ commit }) {
      const backups = await db.getBackupsDirsAsDate()
      commit('SET_BACKUPS', backups)
    }
  }
}
