<template>
  <div class="sidebar-list">
    <div class="sidebar-list__header">
      <div class="sidebar-list__title">
        <h6>{{ title }}</h6>
      </div>
      <div class="sidebar-list__action">
        <slot name="action" />
      </div>
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'SidebarList',

  props: {
    title: {
      type: String,
      default: ''
    }
  },

  data () {
    return {}
  }
}
</script>

<style lang="scss">
.sidebar-list {
  margin-bottom: var(--spacing-xs);
  height: 100%;
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px var(--spacing-xs);
    svg {
      stroke: var(--color-contrast-medium);
      width: 16px;
      height: 16px;
    }
  }
  &__title {
  }
  &__title,
  &__action {
    display: inline-block;
  }
}
</style>
