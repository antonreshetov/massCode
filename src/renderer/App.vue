<template>
  <div
    id="app"
    data-theme="dark"
  >
    <MainView v-if="init" />
  </div>
</template>

<script>
import MainView from './views/Main.vue'
import shortid from 'shortid'
import { mapGetters } from 'vuex'
import { defaultLibraryQuery } from '@/util/helpers'
import shortcuts from '@/lib/shortcuts'

export default {
  name: 'App',

  components: {
    MainView
  },

  data () {
    return {
      init: false
    }
  },

  computed: {
    ...mapGetters('folders', ['selectedIds'])
  },

  created () {
    this.initState()
    shortcuts()
  },

  methods: {
    async initState () {
      await this.setDefaultDataStore()

      const snippetListWidth = this.$electronStore.get('snippetListWidth')
      const sidebarWidth = this.$electronStore.get('sidebarWidth')
      const selectedFolderId = this.$electronStore.get('selectedFolderId')
      const selectedSnippetId = this.$electronStore.get('selectedSnippetId')

      if (snippetListWidth) {
        this.$store.commit('app/SET_SNIPPET_LIST_WIDTH', snippetListWidth)
      }

      if (sidebarWidth) {
        this.$store.commit('app/SET_SIDEBAR_WIDTH', sidebarWidth)
      }

      if (selectedFolderId) {
        this.$store.dispatch('folders/setSelectedFolder', selectedFolderId)

        const defaultQuery = { folderId: { $in: this.selectedIds } }
        const query = defaultLibraryQuery(defaultQuery, selectedFolderId)

        this.$store.dispatch('snippets/getSnippets', query)
      } else {
        this.$store.dispatch('snippets/getSnippets', { folderId: null })
      }

      if (selectedSnippetId) {
        this.$db.snippets.findOne({ _id: selectedSnippetId }, (err, doc) => {
          if (err) return
          if (doc) {
            this.$store.dispatch('snippets/setSelected', doc)
          }
        })
      }

      this.init = true
    },
    async setDefaultDataStore () {
      const defaultFolder = {
        list: [
          {
            id: shortid(),
            name: 'Default',
            open: false,
            defaultSyntax: null
          }
        ],
        _id: 'folders'
      }

      this.$db.masscode.insert(defaultFolder, (err, doc) => {
        if (err) return
        this.$store.dispatch('folders/getFolders')
      })

      await this.$store.dispatch('folders/getFolders')
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/scss/main';
</style>
