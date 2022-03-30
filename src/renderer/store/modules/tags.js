import db from '@@/lib/datastore'
import pull from 'lodash-es/pull'

export default {
  namespaced: true,
  state: {
    list: [],
    selectedId: null
  },
  getters: {
    tags (state) {
      return state.list.map(i => {
        return {
          ...i,
          text: i.name
        }
      })
    },
    selectedId (state) {
      return state.selectedId
    }
  },
  mutations: {
    SET_TAGS (state, tags) {
      state.list = tags
    },
    SET_SELECTED_ID (state, id) {
      state.selectedId = id
    }
  },
  actions: {
    getTags ({ commit }) {
      const tags = db.collections.tags.$find().sort((a, b) => (a > b ? 1 : -1))
      commit('SET_TAGS', tags)
    },
    addTag ({ commit, dispatch }, tag) {
      const isExist = db.collections.tags.find({ name: tag }).value()
      if (isExist) return

      const newTag = db.collections.tags.$insert(tag)
      dispatch('getTags')
      return newTag
    },
    removeTag ({ state, commit, dispatch, getters, rootGetters }, id) {
      db.collections.snippets
        .filter(i => i.tagIds.includes(id))
        .map(i => pull(i.tagIds, id))
        .write()
      db.collections.tags.remove({ _id: id }).write()

      dispatch('getTags')
      const firstTagId = getters.tags[0]?._id

      if (firstTagId) {
        commit('SET_SELECTED_ID', firstTagId)
        dispatch(
          'snippets/getSnippets',
          {
            tagIds: { $elemMatch: firstTagId }
          },
          { root: true }
        )
      } else {
        dispatch('app/setShowTags', false, { root: true })
      }
    }
  }
}
