<template>
  <div class="favorites">
    <SidebarList title="Library">
      <SidebarListItem
        v-for="(i, index) in library"
        :id="i.id"
        :key="i.id"
        :title="i.label"
        :model="i"
        :icon="icon(index)"
      />
    </SidebarList>
  </div>
</template>

<script>
import SidebarList from './SidebarList.vue'
import SidebarListItem from './SidebarListItem.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'TheLibrary',

  components: {
    SidebarList,
    SidebarListItem
  },

  data () {
    return {
      library: [
        { label: 'InBox', id: 'inBox', icon: 'inbox' },
        { label: 'Favorites', id: 'favorites', icon: 'star' },
        { label: 'All Snippets', id: 'allSnippets', icon: 'archive' },
        { label: 'Trash', id: 'trash', icon: 'trash' }
      ]
    }
  },

  computed: {
    ...mapGetters('folders', ['system'])
  },

  methods: {
    icon (index) {
      let icon
      if (index === 0) icon = 'inbox'
      if (index === 1) icon = 'star'
      if (index === 2) icon = 'archive'
      if (index === 3) icon = 'trash'
      if (index > 3) icon = 'folder'
      return icon
    }
  }
}
</script>

<style lang="scss">
.favorites {
}
</style>
