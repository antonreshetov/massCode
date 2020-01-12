<template>
  <div
    class="app-button"
    :disabled="disabled"
    v-on="$listeners"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'AppButton',

  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {}
  }
}
</script>

<style lang="scss">
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-sm);
  -webkit-user-select: none;
  background-color: var(--color-contrast-lower);
  border: 1px solid var(--color-border);
  height: 32px;
  + .app-button {
    margin-left: var(--spacing-xs);
  }
  &[disabled] {
    color: var(--color-contrast-medium);
    &:active {
      color: var(--color-contrast-medium);
      background-color: var(--color-contrast-lower);
    }
  }
  &:active {
    color: var(--color-contrast-high);
    background-color: var(--color-contrast-low);
  }
}
</style>
