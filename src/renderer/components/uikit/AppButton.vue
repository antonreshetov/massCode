<template>
  <div
    class="app-button"
    v-on="$listeners"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'AppButton',

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
}
</style>
