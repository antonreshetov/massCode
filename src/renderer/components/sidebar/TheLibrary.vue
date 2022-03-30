<template>
  <div
    class="library"
    :class="{
      'tags-show': activeTitle === 1
    }"
  >
    <div class="library__system-folders">
      <SidebarList
        v-model="activeTitle"
        title="Library"
        :title-array="[{ label: 'Library' }, { label: 'Tags' }]"
      >
        <template v-if="activeTitle === 0">
          <SidebarListItem
            v-for="i in system"
            :id="i._id"
            :key="i._id"
            :title="i.name"
            :model="i"
            :icon="icon(i.name)"
          />
        </template>
      </SidebarList>
    </div>
    <div
      v-if="activeTitle === 0"
      class="library__folders"
    >
      <TheFolders />
    </div>
    <div
      v-if="activeTitle === 1"
      class="library__tags"
    >
      <TheTags />
    </div>
  </div>
</template>

<script>
import SidebarList from './SidebarList.vue'
import SidebarListItem from './SidebarListItem.vue'
import TheFolders from './TheFolders.vue'
import TheTags from './TheTags.vue'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'TheLibrary',

  components: {
    SidebarList,
    SidebarListItem,
    TheFolders,
    TheTags
  },

  data () {
    return {}
  },

  computed: {
    ...mapState(['app']),
    ...mapGetters('folders', ['system', 'selectedIds']),
    activeTitle: {
      get () {
        return this.app.showTags ? 1 : 0
      },
      set (v) {
        this.$store.dispatch('app/setShowTags', !!v)
      }
    }
  },

  methods: {
    icon (name) {
      if (name === 'Inbox') return 'inbox'
      if (name === 'Favorites') return 'star'
      if (name === 'All Snippets') return 'archive'
      if (name === 'Trash') return 'trash'
    }
  }
}
</script>

<style lang="scss">
.library {
  display: grid;
  grid-template-rows: 150px 1fr;
  overflow: hidden;
  &.tags-show {
    grid-template-rows: 30px 1fr;
  }
  &__system-folders {
  }
  &__folders,
  &__tags {
    overflow: hidden;
  }
}
</style>
