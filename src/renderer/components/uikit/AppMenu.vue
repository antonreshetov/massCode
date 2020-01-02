<template>
  <div class="app-menu">
    <div class="app-menu__list">
      <div
        v-for="(i, index) in children"
        :key="index"
        class="app-menu__list-item"
        :class="{
          active: i.componentInstance.isActive
        }"
        @click="onSelect(i.componentInstance.value)"
      >
        {{ i.componentInstance.label }}
      </div>
    </div>
    <div class="app-menu__body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppMenu',

  props: {
    value: {
      type: String,
      default: ''
    }
  },

  provide () {
    return {
      root: this
    }
  },

  data () {
    return {
      children: []
    }
  },

  mounted () {
    this.getChildren()
  },

  methods: {
    getChildren () {
      if (this.$slots.default) {
        this.children = this.$slots.default.filter(
          i =>
            i.tag &&
            i.componentOptions &&
            i.componentOptions.Ctor.options.name === 'AppMenuItem'
        )
      }
    },
    onSelect (value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="scss">
.app-menu {
  display: flex;
  &__list {
    width: 200px;
    margin-right: var(--spacing-md);
    &-item {
      padding: var(--spacing-xs);
      -webkit-user-select: none;
      &:hover {
        background-color: var(--color-contrast-lower);
      }
      &.active {
        background-color: var(--color-contrast-low);
      }
    }
  }
  &__body {
    flex-grow: 1;
  }
}
</style>
