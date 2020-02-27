<template>
  <div
    class="tray-snippet-list-item"
    :class="{ 'is-selected': isSelected }"
    @click="onClick"
    @mouseenter="onHover"
  >
    <div class="title">
      <span>
        {{ model.name }}
      </span>
    </div>
    <div class="meta">
      <div class="folder">
        {{ model.folder ? model.folder.name : 'InBox' }}
      </div>
      <div class="date">
        {{ date }}
      </div>
    </div>
  </div>
</template>

<script>
import { isSameDay, format } from 'date-fns'

export default {
  name: 'SnippetListItem',

  props: {
    model: {
      type: Object,
      default: () => {}
    },
    id: {
      type: [String, Number],
      default: ''
    },
    index: {
      type: Number,
      default: null
    },
    title: {
      type: [String, Number],
      default: ''
    }
  },

  inject: ['tray'],

  data () {
    return {}
  },

  computed: {
    date () {
      const isToday = isSameDay(this.model.updatedAt, new Date())
      let date

      if (isToday) {
        date = format(this.model.updatedAt, 'HH:mm')
      } else {
        date = format(this.model.updatedAt, 'dd.MM.yyyy')
      }

      return date
    },
    isSelected () {
      return this.index === this.tray.aheadIndex
    }
  },

  methods: {
    onClick () {
      this.$emit('click', this.model)
    },
    onHover () {
      this.$emit('hover', this.index)
    }
  }
}
</script>

<style lang="scss">
.tray-snippet-list-item {
  $r: &;
  padding: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
  outline: none;
  margin-right: 1px;
  user-select: none;
  &--context {
    position: relative;
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0px;
      border: 2px solid var(--color-primary);
    }
  }
  &:hover {
    background-color: var(--color-contrast-low);
  }
  &.is-selected {
    background-color: var(--color-contrast-low);
  }
}

.title {
  display: table;
  table-layout: fixed;
  width: 100%;
  overflow: hidden;
  span {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
}
.meta {
  display: flex;
  color: var(--color-contrast-medium);
  margin-top: var(--spacing-xs);
  justify-content: space-between;
  font-size: var(--text-xs);
}
</style>
