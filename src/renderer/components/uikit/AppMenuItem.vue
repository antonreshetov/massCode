<template>
  <div
    v-if="isActive"
    class="app-menu-item"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'AppMenuItem',

  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    }
  },

  inject: ['root'],

  data () {
    return {}
  },

  computed: {
    isActive () {
      return this.value === this.root.value
    }
  }
}
</script>

<style lang="scss">
.app-menu-item {
}
</style>
