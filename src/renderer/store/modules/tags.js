import db from '@/datastore'

export default {
  namespaced: true,
  state: {
    list: []
  },
  getters: {
    tags (state) {
      return state.list.map(i => {
        i.text = i.name
        return i
      })
    }
  },
  mutations: {
    SET_TAGS (state, tags) {
      state.list = tags
    }
  },
  actions: {
    getTags ({ commit }) {
      db.tags
        .find({})
        .sort({ name: 1 })
        .exec((err, doc) => {
          if (err) return

          commit('SET_TAGS', doc)
        })
    },
    async addTag ({ commit }, tag) {
      return new Promise((resolve, reject) => {
        console.log(tag)
        db.tags.findOne({ name: tag.name }, (err, doc) => {
          if (err) return

          if (!doc) {
            db.tags.insert(tag, (err, doc) => {
              if (err) return
              resolve(doc)
            })
          } else {
            resolve(null)
          }
        })
      })
    },
    async addTagToSnippet ({ commit, rootGetters }, { tagId, snippetId }) {
      db.snippets.update({ _id: snippetId }, { $addToSet: { tags: tagId } })
    }
  }
}
