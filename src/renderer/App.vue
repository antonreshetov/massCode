<template>
  <div
    id="app"
    :data-theme="app.theme"
  >
    <div class="app-title-bar" />
    <template v-if="init">
      <KeepAlive>
        <Component :is="view" />
      </KeepAlive>
    </template>
  </div>
</template>

<script>
import MainView from './views/Main.vue'
import PreferencesView from './views/Preferences.vue'
import shortid from 'shortid'
import { mapGetters, mapState } from 'vuex'
import { defaultLibraryQuery } from '@/util/helpers'
import '@/lib/ipcRenderer'

export default {
  name: 'App',

  components: {
    MainView,
    PreferencesView
  },

  data () {
    return {
      init: false
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapGetters('folders', ['selectedIds']),
    view () {
      if (this.app.view === 'main') {
        return 'MainView'
      } else {
        return 'PreferencesView'
      }
    }
  },

  created () {
    this.initState()
  },

  methods: {
    async initState () {
      await this.setDefaultDataStore()

      const snippetListWidth = this.$electronStore.get('snippetListWidth')
      const sidebarWidth = this.$electronStore.get('sidebarWidth')
      const selectedFolderId = this.$electronStore.get('selectedFolderId')
      const selectedSnippetId = this.$electronStore.get('selectedSnippetId')
      const theme = this.$electronStore.get('theme')

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

      if (theme) {
        this.$store.dispatch('app/setTheme', theme)
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
            defaultLanguage: 'text'
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

.app-title-bar {
  position: absolute;
  top: 0;
  width: 100%;
  height: var(--title-bar-height);
  -webkit-user-select: none;
  -webkit-app-region: drag;
  z-index: 1010;
}
</style>
