<template>
  <div
    id="app"
    :data-theme="app.theme"
  >
    <div class="app-title-bar" />
    <RouterView />
    <div
      v-if="app.updateAvailable"
      class="update-available"
      @click="onClickUpdate"
    >
      Update available
    </div>
  </div>
</template>

<script>
import shortid from 'shortid'
import { mapGetters, mapState } from 'vuex'
import { defaultLibraryQuery } from '@/util/helpers'
import '@/lib/ipcRenderer'
import electronStore from '@@/store'
import { shell } from 'electron'
import { track } from '@@/lib/analytics'

export default {
  name: 'App',

  data () {
    return {
      init: false
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapGetters('folders', ['selectedIds']),
    ...mapGetters('snippets', ['snippetsBySort'])
  },

  created () {
    this.initState()
  },

  methods: {
    async initState () {
      await this.setDefaultDataStore()

      const storagePath = electronStore.preferences.get('storagePath')
      const snippetListWidth = electronStore.app.get('snippetListWidth')
      const sidebarWidth = electronStore.app.get('sidebarWidth')
      const selectedFolderId = electronStore.app.get('selectedFolderId')
      const selectedSnippetId = electronStore.app.get('selectedSnippetId')
      const theme = electronStore.preferences.get('theme')
      const snippetsSort = electronStore.app.get('snippetsSort')

      this.$store.commit('app/SET_STORAGE_PATH', storagePath)

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

        await this.$store.dispatch('snippets/getSnippets', query)
      } else {
        await this.$store.dispatch('snippets/getSnippets', { folderId: null })
      }

      if (selectedSnippetId) {
        const snippet = this.snippetsBySort.find(
          i => i._id === selectedSnippetId
        )
        if (snippet) this.$store.dispatch('snippets/setSelected', snippet)
      }

      if (theme) {
        this.$store.dispatch('app/setTheme', theme)
      }

      if (snippetsSort) {
        this.$store.dispatch('snippets/setSort', snippetsSort)
      }

      this.$store.dispatch('tags/getTags')

      this.$store.commit('app/SET_INIT', true)
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
    },
    onClickUpdate () {
      shell.openExternal('https://masscode.io/download')
      track('click/update')
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
.update-available {
  position: absolute;
  top: 2px;
  right: var(--spacing-xs);
  font-size: var(--text-xs);
  text-transform: uppercase;
  font-weight: 500;
  color: var(--color-text);
  &:hover {
    text-decoration: underline;
    // color: var(--color-primary);
  }
  z-index: 1020;
}
</style>
