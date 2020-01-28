<template>
  <div
    v-click-outside="onClickOutside"
    class="snippet-tabs-item"
    :class="{
      active: isActive
    }"
    v-on="$listeners"
    @contextmenu="onTabContext"
  >
    <input
      ref="input"
      v-model="computedLabel"
      :class="{
        'is-editable': editable
      }"
      type="text"
      :disabled="!editable"
      @keydown.enter="onClickOutside"
    >
  </div>
</template>

<script>
import { menu, dialog } from '@@/lib'

export default {
  name: 'SnippetTabsItem',

  props: {
    label: {
      type: String,
      default: ''
    },
    index: {
      type: Number,
      default: null
    }
  },

  inject: ['root'],

  data () {
    return {
      editable: false
    }
  },

  computed: {
    isActive () {
      return this.root.value === this.index
    },
    computedLabel: {
      get () {
        return this.label
      },
      set (v) {
        this.root.$emit('tab:edit', v, this.index)
      }
    }
  },

  methods: {
    onTabContext () {
      menu.popup([
        {
          label: `Rename "${this.label}"`,
          click: () => {
            this.editable = true
            this.$nextTick(() => {
              this.$refs.input.focus()
              this.$refs.input.select()
            })
          }
        },
        {
          type: 'separator'
        },
        {
          label: `Delete ${this.label}`,
          click: () => {
            const buttonId = dialog.showMessageBoxSync({
              message: `Are you sure you want to permanently delete "${this.label}"?`,
              detail: 'You cannot undo this action.',
              buttons: ['Delete', 'Cancel'],
              defaultId: 0,
              cancelId: 1
            })
            if (buttonId === 0) {
              this.root.$emit('tab:delete', this.index)
            }
          }
        }
      ])
    },
    onClickOutside () {
      this.editable = false
    }
  }
}
</script>

<style lang="scss">
.snippet-tabs-item {
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 var(--spacing-xs);
  color: var(--color-contrast-medium);
  font-size: var(--text-sm);
  -webkit-user-select: none;
  input {
    width: 100%;
    color: var(--color-contrast-medium);
    text-align: center;
    border: 1px solid transparent;
    background-color: transparent;
    outline: none;
    &[disabled] {
      color: var(--color-contrast-medium);
      -webkit-user-select: none;
    }
    &.is-editable {
      border: 1px solid var(--color-primary);
      background-color: var(--color-contrast-lower);
      color: var(--color-contrast-higher);
    }
  }
  &.active {
    background-color: var(--color-contrast-lower);
  }
}
</style>
