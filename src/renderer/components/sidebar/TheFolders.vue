<template>
  <div class="folders">
    <SidebarList title="Folders">
      <DraggableTree
        ref="tree"
        class="aaaaa"
        :data="localFolders"
        :indent="10"
        :space="0"
        :draggable="true"
        :ondragstart="onDragNodeStart"
        :ondragend="onDragNodeEnd"
        @change="onTreeChange"
      >
        <template v-slot="{ data, store }">
          <div
            v-if="!data.isDragPlaceHolder"
            @dragover.prevent
            @drop="onDropTreeNode($event, data.id)"
          >
            <SidebarListItem
              :id="data.id"
              :title="data.name"
              :children="!!data.children.length"
              :open="data.open"
              :model="data"
              @click:toggle="onNodeToggle(data, store)"
            />
          </div>
        </template>
      </DraggableTree>
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
import SidebarListItem from './SidebarListItem.vue'
import { mapGetters } from 'vuex'
import cloneDeep from 'lodash-es/cloneDeep'
import { DraggableTree } from 'vue-draggable-nested-tree/dist/vue-draggable-nested-tree'
import { track } from '@@/lib/analytics'
import PerfectScrollbar from 'perfect-scrollbar'

export default {
  name: 'TheFolders',

  components: {
    SidebarList,
    SidebarListItem,
    DraggableTree
  },

  data () {
    return {
      localFolders: [],
      draggable: true,
      editableFolderId: null,
      ps: null,
      ghostEl: null
    }
  },

  computed: {
    ...mapGetters('folders', ['folders']),
    tree () {
      return this.$refs.tree
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
    this.initPS()
  },

  methods: {
    async onAddFolder () {
      this.$store.dispatch('folders/addFolder')
      track('folders/new')
    },
    onDropTreeNode (e, folderId) {
      const data = e.dataTransfer.getData('payload')
      if (data) {
        const id = JSON.parse(data).value
        const payload = {
          $set: { folderId }
        }
        this.$store.dispatch('snippets/updateSnippet', { id, payload })
      }
    },
    onTreeChange (node, newTree, oldTree) {
      const folders = newTree.getPureData()
      this.$store.dispatch('folders/updateFolders', folders)
      this.ps.update()
    },
    onNodeToggle (data, store) {
      store.toggleOpen(data)
      const folders = this.tree.getPureData()
      this.$store.dispatch('folders/updateFolders', folders)
    },
    initPS () {
      const el = document.querySelector('.folders .tree')
      this.ps = new PerfectScrollbar(el)
    },
    onDragNodeStart (e) {
      this.createGhostDrag(e)
      document.addEventListener('mousemove', this.setGhostDragPosition)
    },
    onDragNodeEnd () {
      document.removeEventListener('mousemove', this.setGhostDragPosition)
      document.querySelector('.ghost-dragging-item').remove()
    },
    createGhostDrag (e) {
      const el = document.createElement('div')
      const style = {
        minWidth: '100px',
        height: '28px',
        backgroundColor: 'var(--color-contrast-low)',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        position: 'fixed'
      }

      el.className = 'ghost-dragging-item'
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-folder">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        ${e.name}`

      Object.assign(el.style, style)
      document.querySelector('#app').appendChild(el)

      this.ghostEl = el
    },
    setGhostDragPosition (e) {
      this.ghostEl.style.top = e.y + 'px'
      this.ghostEl.style.left = e.x + 'px'
    }
  }
}
</script>

<style lang="scss" scoped>
.folders {
  overflow: hidden;
  height: 100%;
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
