<template>
  <div
    class="tray-snippet-list-item"
    @click="onClick"
  >
    <div class="title">
      {{ model.name }}
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
    }
  },

  methods: {
    onClick () {
      this.$emit('click', this.model)
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
  &--selected {
    &::after {
      border: 2px solid #fff;
    }
    &:not(.focus) {
      &#{$r}--context {
        &::after {
          border: 2px solid var(--color-primary);
        }
      }
    }
  }
}

.title {
}
.meta {
  display: flex;
  color: var(--color-contrast-medium);
  margin-top: var(--spacing-xs);
  justify-content: space-between;
  font-size: var(--text-xs);
}
</style>
