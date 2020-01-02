<template>
  <div class="app-form-item">
    <div
      class="app-form-item__label"
      :style="{
        width: labelWidth + 'px'
      }"
    >
      {{ label }}
    </div>
    <div class="app-form-item__body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppFormItem',

  props: {
    label: {
      type: String,
      default: ''
    },
    labelWidth: {
      type: Number,
      default: 120
    }
  },

  data () {
    return {}
  }
}
</script>

<style lang="scss">
.app-form-item {
  display: flex;
  + .app-form-item {
    margin-top: var(--spacing-sm);
  }
  &__label {
    margin-right: var(--spacing-sm);
  }
  &__body {
    flex-grow: 1;
  }
}
</style>
