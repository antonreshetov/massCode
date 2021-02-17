<template>
  <div
    ref="tree"
    class="app-tree"
  >
    <div class="app-tree__inner">
      <AppTreeNode
        v-for="(node, index) in value"
        ref="node"
        :key="node.id"
        :node="node"
        :nodes="value"
        :index="index"
      >
        <template v-slot="{ node: node, deep }">
          <slot
            :node="node"
            :deep="deep"
          />
        </template>
      </AppTreeNode>
    </div>
  </div>
</template>

<script>
import AppTreeNode from './AppTreeNode.vue'
import {
  clone,
  guid,
  deleteNodeById,
  insertNodeById,
  pushNodeById,
  toggleNodeById
} from './helpers'

export default {
  name: 'AppTree',

  components: {
    AppTreeNode
  },

  model: {
    prop: 'value',
    event: 'change'
  },

  props: {
    value: {
      type: Array,
      default: () => []
    },
    createGhostEl: {
      type: Function,
      default: null
    }
  },

  provide () {
    return {
      root: this
    }
  },

  data () {
    return {
      id: guid(),
      clone: null,
      dragNode: null,
      dragEnterNode: null,
      selectedId: null,
      highlightId: null
    }
  },

  computed: {
    dragNodeChildrenIds () {
      const ids = []

      function findIds (nodes) {
        nodes.map(i => {
          ids.push(i.id)

          if (i.children.length) {
            findIds(i.children)
          }
        })
      }

      findIds(this.dragNode?.children || [])

      return ids
    },
    isAllowed () {
      if (!this.dragNode) return false

      const isSameNode = this.dragNode?.id === this.dragEnterNode?.id
      const isChildrenNode = this.dragNodeChildrenIds.includes(
        this.dragEnterNode?.id
      )
      return !isSameNode && !isChildrenNode
    }
  },

  created () {
    this.cloneNodes()
    this.$watch('value', this.cloneNodes)
    this.$on('drop', this.onDrop)
    this.$on('change:insert', this.onDropInsert)
    this.$on('toggle:node', id => this.toggleNode(id))
    this.$on('click:node', id => {
      this.selectedId = id
    })
  },

  methods: {
    cloneNodes () {
      this.clone = clone(this.value)
    },
    onDrop (to, from) {
      if (!this.isAllowed) return

      deleteNodeById(this.clone, from.id)
      pushNodeById(this.clone, to.id, from)
      this.$emit('change', this.clone)
    },
    onDropInsert (position, to, from) {
      if (!this.isAllowed) return

      deleteNodeById(this.clone, from.id)
      insertNodeById(this.clone, to.id, from, position)
      this.$emit('change', this.clone)
    },

    toggleNode (id) {
      toggleNodeById(this.clone, id)
      this.$emit('change', this.clone)
    },
    setSelectedNode (id) {
      this.selectedId = id
    },
    setHighlightedNode (id) {
      this.highlightId = id
    }
  }
}
</script>

<style lang="scss">
.app-tree {
  &__inner {
    padding-top: 5px;
  }
}
</style>
