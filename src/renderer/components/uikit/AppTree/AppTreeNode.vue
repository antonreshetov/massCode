<template>
  <div
    class="app-tree-node"
    :class="{
      'has-children': hasChildren,
      'is-dragged': isDragged
    }"
    draggable="true"
    @dragstart.stop="onDragStart"
    @dragleave.stop="onDragLeave"
    @dragend.stop="onDragEnd"
    @drop.stop="onDrop"
    @dragover.prevent
    @click.stop="onClickNode(node.id)"
  >
    <div
      :id="node.id"
      ref="row"
      class="app-tree-node__row"
      :class="{
        'is-hovered': isHovered && root.isAllowed,
        'is-selected': isSelected,
        'is-highlighted': root.highlightId === node.id
      }"
      @dragenter.stop="onDragEnter($event, node)"
      @dragover="onDragOver($event, node)"
    >
      <span class="app-tree-node__name">
        <slot
          :node="node"
          :deep="deep"
        >
          <AppIcon
            v-if="node.children.length"
            name="chevron-right"
            class="app-tree-node__arrow"
            :class="{ 'app-tree-node__arrow--down': node.open }"
          />
          <span
            v-else
            class="app-tree-node__arrow-placeholder"
          />

          {{ node.name }}
        </slot>
      </span>
    </div>
    <template v-if="node.children">
      <AppTreeNode
        v-for="(children, idx) in node.children"
        v-show="node.open"
        :key="children.id"
        class="children"
        :index="idx"
        :deep="deep + 1"
        :deep-array="addDeep(idx)"
        :node="children"
        :nodes="node.children"
      >
        <template v-slot="{ node, deep }">
          <slot
            :node="node"
            :deep="deep"
          >
            <AppIcon
              v-if="node.children.length"
              name="chevron-right"
            />

            <span
              v-else
              class="app-tree-node__arrow-placeholder"
            />
            <span class="app-tree-node__name">
              {{ node.name }}
            </span>
          </slot>
        </template>
      </AppTreeNode>
    </template>
    <svg
      v-if="isShowBetweenLine"
      height="10"
      width="100%"
      :style="betweenLineStyle"
    >
      <circle
        cx="5"
        cy="5"
        r="3"
        stroke="var(--color-primary)"
        fill="none"
        stroke-width="2"
      />
      <line
        x1="100%"
        x2="8"
        y1="5"
        y2="5"
        stroke="var(--color-primary)"
        stroke-width="2"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'AppTreeNode',

  props: {
    index: {
      type: Number,
      default: 0
    },
    deep: {
      type: Number,
      default: 0
    },
    deepArray: {
      type: Array,
      default: () => [0]
    },
    node: {
      type: Object,
      default: () => {}
    },
    nodes: {
      type: Array,
      default: () => []
    },
    ghostEl: {
      type: Function,
      default: null
    }
  },

  inject: ['root'],

  data () {
    return {
      hoveredId: null,
      hoveredBefore: false,
      hoveredAfter: false,
      // highlightId: '6f882fda-316e-41b5-94fd-1d3f37282cca+',
      isOrderOrInsert: false,
      overPosition: null,
      isDragged: false
    }
  },

  computed: {
    siblings () {
      if (this.isFirst && this.nodes.length > 1) {
        return [this.nodes[1]]
      }
      if (this.isLast && this.nodes.length > 1) {
        return [this.nodes[this.nodes.length - 2]]
      }
      if (this.nodes.length > 2) {
        return [this.nodes[this.index - 1], this.nodes[this.index + 1]]
      }

      return []
    },
    siblingsIds () {
      return this.siblings.map(i => i.id)
    },
    treeId () {
      return this.root.id
    },
    hasChildren () {
      return this.node?.children?.length > 0
    },
    betweenLineStyle () {
      const style = {
        position: 'absolute'
      }

      if (this.overPosition === 'before') {
        style.top = '-6px'
      }

      if (this.overPosition === 'after') {
        style.bottom = '-6px'
      }

      return style
    },
    isHovered () {
      return this.node?.id === this.hoveredId && this.overPosition === 'center'
    },
    isSelected () {
      return this.root.selectedId === this.node?.id
    },
    isSameTree () {
      return this.treeId === this.root.id
    },
    isShowBetweenLine () {
      if (!this.root.dragNode) return
      return this.overPosition === 'before' || this.overPosition === 'after'
    },
    isFirst () {
      return this.index === 0
    },
    isLast () {
      return this.index === this.nodes.length - 1
    }
  },

  mounted () {
    this.$refs.row.style.setProperty('--offset', 10 * this.deep + 'px')
  },

  methods: {
    onClickArrow (id) {
      this.root.$emit('toggle:node', id)
    },
    onClickNode (id) {
      this.root.$emit('click:node', id)
    },
    addDeep (index) {
      const arr = [...this.deepArray]
      arr.push(index)
      return arr
    },
    onDragStart (e) {
      this.root.dragNode = this.node
      this.isDragged = true

      if (this.root.createGhostEl) {
        this.root.createGhostEl(e)
      } else {
        const el = document.createElement('div')
        const style = {
          position: 'fixed',
          left: '-100%',
          color: 'var(--color-text)',
          fontSize: 'var(--text-md)'
        }

        el.id = 'ghost'
        el.innerHTML = this.node.name

        Object.assign(el.style, style)
        document.body.appendChild(el)

        e.dataTransfer.setDragImage(el, 0, 0)
        setTimeout(() => el.remove(), 0)
      }

      e.dataTransfer.setData('node', JSON.stringify(this.node))
    },
    onDragEnd (e) {
      this.root.dragNode = null
      this.root.dragEnterNode = null
      this.overPosition = null
      this.isDragged = false
    },
    onDragEnter (e, node) {
      this.hoveredId = node?.id
      this.root.dragEnterNode = node
    },
    onDragOver (e, node) {
      this.hoveredId = node?.id

      if (this.node?.id === this.root?.dragNode?.id) return

      const height = this.$refs.row.offsetHeight
      const before = height * 0.3
      const after = height - before

      if (e.layerY < before && this.isFirst) {
        this.overPosition = 'before'
      } else if (e.layerY > after) {
        this.overPosition = 'after'
      } else {
        this.overPosition = 'center'
      }
    },
    onDragLeave (e) {
      e.target.style.background = ''
      this.hoveredId = null
      this.overPosition = null
    },
    onDrop (e) {
      if (this.overPosition === 'after') {
        this.root.$emit('change:insert', 'after', this.node, this.root.dragNode)
      }
      if (this.overPosition === 'before') {
        this.root.$emit(
          'change:insert',
          'before',
          this.node,
          this.root.dragNode
        )
      }

      if (this.overPosition === 'center') {
        const payload = e.dataTransfer.getData('payload')
        this.root.$emit('drop', this.node, this.root.dragNode, payload)
      }
      this.hoveredId = null
      this.overPosition = null
    }
  }
}
</script>

<style lang="scss">
$color-blue: #0063e1;
$color-grey: #8c8c8c;

.app-tree-node {
  $r: &;
  position: relative;
  user-select: none;
  + .app-tree-node {
    margin-top: 2px;
  }
  &__row {
    user-select: none;
    position: relative;
    //display: flex;
    &.is-hovered,
    &.is-selected,
    &.is-highlighted {
      //color: #fff;
      position: relative;
      //z-index: 2;
      #{$r}__arrow {
        fill: #fff;
      }
      &::before {
        content: '';
        left: calc(-1 * var(--offset));
        right: 0;
        top: 0;
        bottom: 0;
        position: absolute;
        background-color: var(--color-contrast-low);
        z-index: 0;
      }
    }
    &.is-highlighted {
      &::before {
        background-color: var(--color-primary);
      }
      svg {
        stroke: var(--color-text);
      }
    }
  }
  &__name {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .children {
    padding-left: 10px;
  }
  .after-line,
  .before-line {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 5px;
    z-index: 2;
    &.is-hovered {
      opacity: 1;
    }
    &::after {
      content: '';
      display: inline-block;
      height: 2px;
      top: 1px;
      left: 14px;
      width: calc(100% - 24px);
      position: absolute;
      //background-color: $color-blue;
      background-color: var(--color-primary);
    }
    &__dot {
      position: absolute;
      left: 6px;
      top: -2px;
      height: 8px;
      width: 8px;
      border-radius: 100%;
      //border: 2px solid $color-blue;
      border: 2px solid var(--color-primary);
      z-index: 1;
    }
  }
  .before-line {
    top: -2px;
  }
  .after-line {
    bottom: -2px;
  }
  &__arrow {
    position: relative;
    //padding: 2px 4px;
    color: $color-grey;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    fill: $color-grey;
    z-index: 1;
    &-placeholder {
      width: 18px;
    }
    &--down {
      transform: rotate(90deg);
    }
  }
}
</style>
