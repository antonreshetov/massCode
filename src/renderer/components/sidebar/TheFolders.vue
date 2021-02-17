<template>
  <div class="folders">
    <SidebarList title="Folders">
      <AppTree
        ref="tree"
        v-model="localFolders"
        class="folders__tree"
        :create-ghost-el="addGhostEl"
        @click:node="onClickFolder"
        @change="onTreeChange"
      >
        <template v-slot="{ node, deep }">
          <FolderItem
            :model="node"
            :deep="deep"
            @drop="onDropTreeNode($event, node)"
            @dragover="onDragOver($event, node._id)"
            @dragleave="onDragLeave"
          />
        </template>
      </AppTree>
      <template v-slot:action>
        <AppIcon
          name="plus"
          @click="onAddFolder"
        />
      </template>
    </SidebarList>
  </div>
</template>

<script>
import SidebarList from './SidebarList.vue'
import { mapGetters } from 'vuex'
import cloneDeep from 'lodash-es/cloneDeep'
import { track } from '@@/lib/analytics'
import PerfectScrollbar from 'perfect-scrollbar'
import AppTree from '@/components/uikit/AppTree/AppTree.vue'
import FolderItem from '@/components/sidebar/FolderItem.vue'
import { nestedToFlat } from '@@/util/helpers'

export default {
  name: 'TheFolders',

  components: {
    FolderItem,
    AppTree,
    SidebarList
  },

  data () {
    return {
      localFolders: [],
      editableFolderId: null,
      ps: null
    }
  },

  computed: {
    ...mapGetters('folders', ['folders', 'selectedId']),
    ...mapGetters('snippets', ['selectedSnippets', 'selectedIds'])
  },

  watch: {
    selectedId (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$refs.tree.setSelectedNode(this.selectedId)
      }
    }
  },

  async created () {
    this.localFolders = cloneDeep(this.folders)
    this.$watch('folders', () => {
      this.localFolders = cloneDeep(this.folders)
      this.ps.update()
    })
  },

  mounted () {
    this.$refs.tree.setSelectedNode(this.selectedId)
    this.initPS()
  },

  methods: {
    async onAddFolder () {
      this.$store.dispatch('folders/addFolder')
      track('folders/new')
    },
    onDropTreeNode (e, node) {
      const data = e.dataTransfer.getData('payload')

      if (!data) return

      try {
        const ids = JSON.parse(data).value
        if (ids) {
          const payload = { folderId: node.id }
          this.$store.dispatch('snippets/updateSnippetsByIds', { ids, payload })
        }
      } catch (err) {
        console.warn(err)
      }
      this.$refs.tree.setHighlightedNode(null)
    },
    onClickFolder (id) {
      this.$store.dispatch('folders/setSelectedFolderById', id)
      this.$store.dispatch('snippets/getSnippetsBySelectedFolders')
    },
    onTreeChange (tree) {
      const flat = nestedToFlat(tree)
      flat.map(i => delete i.id)

      this.$store.dispatch('folders/updateFolders', flat)
      this.ps.update()
    },
    onDragLeave () {
      this.$refs.tree.setHighlightedNode(null)
    },
    onDragOver (e, id) {
      if (!this.$refs.tree.dragNode) {
        this.$refs.tree.setHighlightedNode(id)
      }
    },
    initPS () {
      const el = document.querySelector('.app-tree__inner')
      this.ps = new PerfectScrollbar(el, {
        suppressScrollX: true
      })
    },
    addGhostEl (e) {
      let el = e.target.cloneNode(true)
      el = el.querySelector('.app-tree-node__row')
      el.classList.remove('is-selected')
      el.id = 'ghost'

      const style = {
        backgroundColor: 'transparent',
        color: 'var(--color-contrast-higher)',
        fontSize: '14px',
        width: 'var(--snippets-list-width)',
        borderBottom: 'none'
      }

      Object.assign(el.style, style)
      document.body.appendChild(el)

      e.dataTransfer.setDragImage(el, 0, 0)
      setTimeout(() => el.remove(), 0)
    }
  }
}
</script>

<style lang="scss">
.folders {
  overflow: hidden;
  height: 100%;
  &__tree {
    overflow: hidden;
    .app-tree__inner {
      position: relative;
      height: 100%;
    }
  }
  .sidebar-list {
    display: grid;
    grid-template-rows: 30px 1fr;
    .tree {
      position: relative;
      overflow-y: scroll;
    }
  }
}
</style>
