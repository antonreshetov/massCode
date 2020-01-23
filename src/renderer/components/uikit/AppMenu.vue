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
    <div
      ref="body"
      class="app-menu__body"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import PerfectScrollbar from 'perfect-scrollbar'

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
      children: [],
      ps: null
    }
  },

  mounted () {
    this.getChildren()
    this.initPS()
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
    },
    initPS () {
      this.ps = new PerfectScrollbar(this.$refs.body, {
        suppressScrollX: true
      })
    }
  }
}
</script>

<style lang="scss">
.app-menu {
  display: grid;
  grid-template-columns: 200px 1fr;
  &__list {
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
    position: relative;
    height: calc(100vh - var(--menu-header));
    overflow: scroll;
    padding-bottom: var(--spacing-lg);
  }
}
</style>
