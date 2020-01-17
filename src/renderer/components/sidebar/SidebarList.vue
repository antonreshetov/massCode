<template>
  <div class="sidebar-list">
    <div
      v-if="title || titleArray"
      class="sidebar-list__header"
    >
      <div class="sidebar-list__title">
        <h6 v-if="!titleArray">
          {{ title }}
        </h6>
        <h6>
          <span
            v-for="(i, index) in titleArray"
            :key="index"
            class="tab-header"
            :class="{ active: value === index }"
            @click="onClickTitle(index)"
          >{{ i.label }}</span>
        </h6>
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
    },
    titleArray: {
      type: Array,
      default: null
    },
    value: {
      type: Number,
      default: 0
    }
  },

  data () {
    return {}
  },

  methods: {
    onClickTitle (index) {
      this.$emit('input', index)
    }
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
    h6 {
      color: var(--color-contrast-medium);
    }
  }
  &__title,
  &__action {
    display: inline-block;
  }
  .tab-header {
    color: var(--color-contrast-low-alt);
    padding: var(--spacing-xs) 0;
    -webkit-user-select: none;
    &.active {
      color: var(--color-contrast-medium);
    }
    &:after {
      content: '/';
      margin: 0 5px;
      color: var(--color-contrast-low-alt);
    }
    &:last-child {
      &:after {
        display: none;
      }
    }
  }
}
</style>
