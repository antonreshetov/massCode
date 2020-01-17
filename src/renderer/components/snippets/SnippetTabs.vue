<template>
  <div class="snippet-tabs">
    <div
      v-if="isTabs"
      class="snippet-tabs__header"
    >
      <div class="snippet-tabs__header-inner">
        <SnippetTabsItem
          v-for="(i, index) in tabs"
          :key="index"
          :index="index"
          :label="i.label"
          @click="onClick(index)"
          @contextmenu="onContext(i)"
        />
      </div>
    </div>
    <div class="snippet-tabs__body">
      <slot />
    </div>
  </div>
</template>

<script>
import SnippetTabsItem from './SnippetTabsItem.vue'

export default {
  name: 'SnippetTabs',

  components: {
    SnippetTabsItem
  },

  props: {
    value: {
      type: [String, Number],
      default: null
    },
    tabs: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      children: []
    }
  },

  provide () {
    return {
      root: this
    }
  },

  computed: {
    isTabs () {
      return this.tabs.length > 1
    }
  },

  methods: {
    onClick (name) {
      this.$emit('input', name)
    },
    onAddNewTab () {
      this.$emit('tab:add')
    },
    onContext (fragment) {
      this.$emit('tab:context', fragment)
    }
  }
}
</script>

<style lang="scss">
.snippet-tabs {
  width: 100%;
  height: 100%;
  &__header {
    height: var(--snippet-tab-header-height);
  }
  &__header-inner {
    display: flex;
    align-items: center;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    height: calc(var(--snippet-tab-height));
  }
  &__body {
    height: 100%;
  }
  &__add-new {
    display: flex;
    align-items: center;
    padding: 0 var(--spacing-xs);
    height: 100%;
    &:hover {
      svg {
        stroke: var(--color-contrast-high);
      }
    }
    span,
    svg {
      height: 16px;
      width: 16px;
    }
    svg {
      stroke: var(--color-contrast-medium);
    }
  }
}
</style>
