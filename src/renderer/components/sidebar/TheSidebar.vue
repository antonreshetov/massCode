<template>
  <div class="sidebar">
    <TheLibrary />
    <TheFolders />
    <div
      ref="gutter"
      class="gutter-line"
    />
  </div>
</template>

<script>
import TheLibrary from '../sidebar/TheLibrary.vue'
import TheFolders from '../sidebar/TheFolders.vue'
import interact from 'interactjs'
import { mapState } from 'vuex'

export default {
  name: 'TheSidebar',

  components: {
    TheFolders,
    TheLibrary
  },

  data () {
    return {}
  },
  computed: {
    ...mapState(['app'])
  },

  mounted () {
    interact(this.$el).resizable({
      allowFrom: this.$refs.gutter,
      onmove: e => {
        const { pageX } = e
        const minWidth = 100

        if (pageX < minWidth) return

        this.$store.dispatch('app/setSidebarWidth', pageX)
      }
    })
  }
}
</script>

<style lang="scss">
.sidebar {
  padding-top: var(--title-bar-height);
  position: relative;
  background-color: var(--color-contrast-lower);
  display: grid;
  grid-template-rows: 150px 1fr;
  height: 100%;
  overflow: hidden;
}
</style>
