<template>
  <div class="sidebar-tags">
    <SidebarList>
      <div
        ref="list"
        class="tags-list"
      >
        <SidebarListItem
          v-for="(i, index) in tags"
          :id="i._id"
          :key="index"
          :title="i.text"
          icon="hash"
          :tag="true"
        />
      </div>
    </SidebarList>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarList from './SidebarList.vue'
import SidebarListItem from './SidebarListItem.vue'
import PerfectScrollbar from 'perfect-scrollbar'

export default {
  name: 'TheTags',

  components: {
    SidebarList,
    SidebarListItem
  },

  data () {
    return {
      ps: null
    }
  },

  computed: {
    ...mapGetters('tags', ['tags'])
  },

  mounted () {
    this.initPS()
  },

  methods: {
    initPS () {
      this.ps = new PerfectScrollbar(this.$refs.list)
    }
  }
}
</script>

<style lang="scss">
.sidebar-tags {
  overflow: hidden;
  height: 100%;
  .tags-list {
    position: relative;
  }
  > .sidebar-list {
    display: grid;
    height: 100%;
  }
  &__item {
    padding: 2px 0;
    -webkit-user-select: none;
    &:hover {
      background-color: var(--color-contrast-low);
    }
    .tag-name {
      padding: 2px;
      display: flex;
      svg {
        width: 16px;
        height: 16px;
        margin-right: var(--spacing-xs);
      }
    }
  }
}
</style>
