<template>
  <div class="sidebar">
    <TheLibrary />
    <div
      ref="gutter"
      class="gutter-line"
    />
  </div>
</template>

<script>
import TheLibrary from '../sidebar/TheLibrary.vue'
import interact from 'interactjs'
import { mapState } from 'vuex'

export default {
  name: 'TheSidebar',

  components: {
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
  background-color: var(--color-bg-sidebar);
  display: grid;
  height: 100%;
  overflow: hidden;
  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 var(--spacing-xs);
  }
}
</style>
