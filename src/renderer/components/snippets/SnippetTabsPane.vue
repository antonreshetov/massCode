<template>
  <div
    v-if="isShow"
    class="snippet-tabs-pane"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'SnippetTabsPane',

  props: {
    index: {
      type: Number,
      default: null
    }
  },

  data () {
    return {}
  },

  inject: ['root'],

  computed: {
    isShow () {
      return this.root.value === this.index
    }
  }
}
</script>

<style lang="scss">
.snippet-tabs-pane {
  height: 100%;
}
</style>
