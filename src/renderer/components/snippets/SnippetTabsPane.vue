<template>
  <div
    v-if="isShow"
    class="snippet-tabs-pane"
    :class="{
      'snippet-tabs-pane--split': split
    }"
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
    },
    split: {
      type: Boolean,
      default: false
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
  &--split {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
