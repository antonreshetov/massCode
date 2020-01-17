<template>
  <div
    v-if="app.init"
    class="main"
    :style="mainStyle"
  >
    <TheSidebar />
    <SnippetList ref="list" />
    <SnippetView
      v-if="isSelected"
      @edit="onEdit"
    />
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
import TheSidebar from '../components/sidebar/TheSidebar.vue'
import SnippetList from '../components/snippets/SnippetList.vue'
import SnippetView from '../components/snippets/SnippetView.vue'
import { mapState, mapGetters } from 'vuex'
import { shell } from 'electron'
import { track } from '@@/lib/analytics'

export default {
  name: 'Main',

  components: {
    TheSidebar,
    SnippetList,
    SnippetView
  },

  data () {
    return {}
  },

  computed: {
    ...mapState(['app']),
    ...mapGetters('snippets', ['isSelected', 'selectedId']),
    mainStyle () {
      return {
        'grid-template-columns': `${this.app.sidebarWidth}px ${this.app.snippetListWidth}px 1fr`
      }
    }
  },

  methods: {
    onEdit () {
      this.$refs.list.$refs.wrapper.scrollTop = 0
    },
    onClickUpdate () {
      shell.openExternal('https://masscode.io/download')
      track('click/update')
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  display: grid;
  height: 100vh;
  background-color: var(--color-bg);
  overflow: hidden;
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
  }
  z-index: 1020;
}
</style>
