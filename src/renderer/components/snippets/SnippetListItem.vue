<template>
  <div
    v-click-outside="onClickOutside"
    class="snippet-list-item"
    :class="{
      'snippet-list-item--selected': isSelected,
      'snippet-list-item--context': context,
      focus: focus
    }"
    tabindex="0"
    v-bind="$listeners"
    @dragstart="onDrag"
    @click="onSelect"
    @contextmenu="onContext"
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
import { mapGetters } from 'vuex'
import { format, isSameDay } from 'date-fns'
import { menu } from '@@/lib'
import { track } from '@@/lib/analytics'

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
    return {
      focus: false,
      context: false
    }
  },

  computed: {
    ...mapGetters('snippets', ['selected']),
    isSelected () {
      if (!this.selected) return null

      return this.selected._id === this.model._id
    },
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
    onSelect () {
      this.focus = true
      this.$store.dispatch('snippets/setSelected', this.model)
    },
    onDrag (e) {
      const payload = JSON.stringify({ value: this.model._id })
      e.dataTransfer.setData('payload', payload)
    },
    onClickOutside () {
      this.focus = false
      this.context = false
    },
    onContext () {
      this.context = true
      const contextMenu = menu.popup([
        {
          label: 'Add to Favorites',
          click: () => {
            const id = this.model._id
            const payload = {
              $set: { isFavorites: true }
            }

            this.$store.dispatch('snippets/updateSnippet', { id, payload })
            track('snippets/add-to-favorites')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Delete',
          click: () => {
            const id = this.model._id
            const payload = {
              $set: { isDeleted: true }
            }

            this.$store.dispatch('snippets/updateSnippet', { id, payload })
            track('snippets/delete')
          }
        }
      ])
      contextMenu.addListener('menu-will-close', () => {
        this.context = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.snippet-list-item {
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
