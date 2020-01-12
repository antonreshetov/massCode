<template>
  <div
    class="snippet-list"
    :class="{ focus: focus }"
  >
    <div class="action">
      <ActionBar />
    </div>
    <div
      ref="wrapper"
      class="snippet-list__wrapper"
    >
      <TransitionGroup :name="animation">
        <SnippetListItem
          v-for="(i, index) in snippetsList"
          :id="i.label"
          :key="i._id"
          :index="index"
          :model="i"
          :draggable="true"
        />
      </TransitionGroup>
    </div>
    <div
      ref="gutter"
      class="gutter-line"
    />
  </div>
</template>

<script>
import SnippetListItem from './SnippetListItem.vue'
import ActionBar from './ActionBar.vue'
import interact from 'interactjs'
import { mapState, mapGetters } from 'vuex'
import PerfectScrollbar from 'perfect-scrollbar'

export default {
  name: 'SnippetList',

  components: {
    SnippetListItem,
    ActionBar
  },

  data () {
    return {
      focus: false,
      animation: '',
      ps: null
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapGetters('snippets', [
      'snippetsSearched',
      'isSearched',
      'snippetsBySort'
    ]),
    ...mapGetters('folders', ['selectedId', 'selectedIds', 'allSnippetsId']),
    snippetsList () {
      return this.isSearched ? this.snippetsSearched : this.snippetsBySort
    }
  },

  watch: {
    async selectedId (id) {
      let query = { folderId: { $in: this.selectedIds } }

      if (id === 'trash') {
        query = { isDeleted: true }
      }
      if (id === 'favorites') {
        query = { isFavorites: true }
      }
      if (id === 'allSnippets') {
        query = {}
      }
      if (id === 'inBox') {
        query = { folderId: null }
      }

      await this.$store.dispatch('snippets/getSnippets', query)
      const firstSnippet = this.snippetsList[0]
      this.$store.commit('snippets/SET_SELECTED', firstSnippet)
    },
    snippetsList () {
      this.$nextTick(() => {
        this.animation = 'list'
        this.ps.update()
      })
    }
  },

  mounted () {
    interact(this.$el).resizable({
      allowFrom: this.$refs.gutter,
      onmove: e => {
        const { pageX } = e
        const minWidth = this.app.sidebarWidth + 100
        const width = pageX - this.app.sidebarWidth

        if (pageX < minWidth) return

        this.$store.dispatch('app/setSnippetListWidth', width)
      }
    })
    this.initPS()
  },

  methods: {
    initPS () {
      this.ps = new PerfectScrollbar(this.$refs.wrapper)
    }
  }
}
</script>

<style lang="scss">
.snippet-list {
  --action-bar-height: 48px;

  position: relative;
  outline: none;
  display: flex;
  flex-flow: column;
  .action {
    height: var(--action-bar-height);
    margin-bottom: 1px;
  }
  &__wrapper {
    overflow-y: scroll;
    position: relative;
    height: calc(100vh - var(--action-bar-height));
  }
}
.list-enter-active,
.list-leave-active,
.list-move {
  transition: 0.1s cubic-bezier(0.59, 0.12, 0.34, 0.95);
  transition-property: opacity, transform;
}
.list-enter {
  opacity: 0;
  transform: translateX(50px) scaleY(0.5);
}
.list-enter-to {
  opacity: 1;
  transform: translateX(0) scaleY(1);
}
.list-leave-active {
  position: absolute;
  width: 100%;
}
.list-leave-to {
  opacity: 0;
  transform: scaleY(0);
  transform-origin: center top;
}
</style>
