<template>
  <div
    id="app"
    :data-theme="theme"
  >
    <div class="app-title-bar" />
    <KeepAlive>
      <RouterView />
    </KeepAlive>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import '@/lib/ipcRenderer'
import electronStore from '@@/store'

export default {
  name: 'App',

  data () {
    return {
      init: false
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapGetters('folders', [
      'selectedIds',
      'defaultQueryBySystemFolder',
      'isSystemFolder',
      'systemAliases'
    ]),
    ...mapGetters('snippets', ['snippetsBySort']),
    isTray () {
      return this.$route.name === 'tray'
    },
    theme () {
      return this.isTray ? this.app.theme : null
    }
  },

  watch: {
    'app.theme' (v) {
      if (!this.isTray) {
        document.body.setAttribute('data-theme', this.app.theme)
      }
    }
  },

  created () {
    this.initState()
    if (!this.isTray) {
      document.body.setAttribute('data-theme', this.app.theme)
    }
  },

  methods: {
    async initState () {
      await this.$store.dispatch('tags/getTags')
      await this.$store.dispatch('folders/getFolders')

      const selectedFolderId = electronStore.app.get('selectedFolderId')
      const selectedSnippetId = electronStore.app.get('selectedSnippetId')

      if (selectedFolderId) {
        const isFolderExist = await this.$store.dispatch(
          'folders/isFolderExist',
          selectedFolderId
        )
        const folderId = isFolderExist
          ? selectedFolderId
          : this.systemAliases.inbox

        await this.$store.dispatch('folders/setSelectedFolderById', folderId)
        await this.$store.dispatch('snippets/getSnippetsBySelectedFolders')
      } else {
        await this.$store.dispatch('snippets/getSnippets')
      }

      if (selectedSnippetId) {
        await this.$store.dispatch('snippets/setSelected', selectedSnippetId)
        this.$store.commit('snippets/SET_SELECTED_IDS', [selectedSnippetId])
      }

      this.$store.commit('app/SET_INIT', true)
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
