<template>
  <div
    :id="model.id"
    ref="folder"
    v-click-outside="onClickOutside"
    class="folder-item"
    :class="{ 'folder-item--context': context }"
    v-on="$listeners"
    @contextmenu="onContext"
    @dblclick="setEditable"
  >
    <div class="folder-item__icon">
      <div
        class="folder-item__icon-arrow"
        @click.stop="onToggleOpen"
      >
        <div
          v-if="isShowArrow"
          class="folder-item__icon-arrow__inner"
        >
          <AppIcon
            v-if="model.open"
            name="chevron-down"
          />
          <AppIcon
            v-else
            name="chevron-right"
          />
        </div>
      </div>
      <AppIcon name="folder" />
    </div>
    <div
      v-if="!editable"
      class="folder-item__name"
    >
      {{ model.name }}
    </div>
    <div
      v-if="editable"
      class="folder-item__input"
    >
      <input
        ref="input"
        v-model="folderName"
        class="folder-item__input"
        :class="{
          'is-editable': editable
        }"
        type="text"
        :disabled="!editable"
        @keydown.enter="onClickOutside"
      >
    </div>
  </div>
</template>

<script>
import AppIcon from '@/components/uikit/AppIcon'
import { dialog, menu } from '@@/lib'
import { track } from '@@/lib/analytics'
import { mapGetters } from 'vuex'
import languages from '@/components/editor/languages'

export default {
  name: 'FolderItem',

  components: {
    AppIcon
  },

  props: {
    model: {
      type: Object,
      default: () => {}
    },
    name: {
      type: String,
      default: ''
    },
    deep: {
      type: Number,
      default: null
    }
  },

  data () {
    return {
      folderName: null,
      editable: false,
      context: false
    }
  },

  watch: {
    isEditable (v) {
      if (!v) this.editable = false
    }
  },

  computed: {
    ...mapGetters('folders', ['selectedId', 'selectedIds']),
    languagesMenu () {
      return languages
        .map(i => {
          i.type = 'radio'
          i.checked = i.value === this.model.defaultLanguage
          i.click = e => {
            const id = this.model.id
            const payload = { defaultLanguage: e.value }

            this.$store.dispatch('folders/updateFolderById', {
              id,
              payload
            })
            track(`folders/set-default-language/${e.label}`)
          }
          return i
        })
        .sort((a, b) => (a.label < b.label ? -1 : 1))
    },
    isEditable () {
      return this.model.id === this.selectedId
    },
    isShowArrow () {
      return this.model.children?.length
    }
  },

  mounted () {
    this.$refs.folder.style.setProperty('--offset', 10 * this.deep + 'px')
  },

  methods: {
    onToggleOpen () {
      const id = this.model._id
      const payload = {
        open: !this.model.open
      }
      this.$store.dispatch('folders/updateFolderById', { id, payload })
    },
    onContext () {
      this.context = true
      const contextMenu = menu.popup([
        {
          label: 'Rename',
          click: () => this.setEditable()
        },

        {
          label: 'Delete',
          click: () => {
            const buttonId = dialog.showMessageBoxSync({
              message: `Are you sure you want to delete "${this.title}" folder?`,
              detail: 'All snippets in this folder will be moved to trash.',
              buttons: ['Delete', 'Cancel'],
              defaultId: 0,
              cancelId: 1
            })
            if (buttonId === 0) {
              this.$store.dispatch(
                'folders/deleteFolderByIds',
                this.selectedIds
              )
              track('folders/delete')
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Default Language',
          submenu: this.languagesMenu
        }
      ])
      contextMenu.addListener('menu-will-close', () => {
        this.context = false
      })
    },
    setEditable () {
      this.editable = true
      this.$emit('edit', true)
      this.$nextTick(() => {
        this.$refs.input.focus()
        this.$refs.input.select()
      })
      this.folderName = this.model.name
    },
    onClickOutside () {
      if (!this.editable) return

      if (this.folderName !== this.model.name) {
        const id = this.model._id
        const payload = {
          name: this.folderName
        }
        this.$store.dispatch('folders/updateFolderNameById', { id, payload })
      }

      this.editable = false
      this.folderName = null
    }
  }
}
</script>

<style lang="scss">
.folder-item {
  display: flex;
  padding: 4px 2px;
  width: 100%;
  position: relative;

  svg {
    width: 16px;
    height: 16px;
    position: relative;
    margin-right: var(--spacing-xs);
    stroke: var(--color-contrast-medium);
  }

  &__icon {
    display: flex;

    &-arrow {
      position: relative;
      width: 16px;
      //height: 14px;
      left: 2px;
      //margin-right: -4px;
      display: flex;
      align-items: center;
      justify-content: center;

      &__inner {
      }

      svg {
        width: 12px;
        height: 12px;
      }
    }
  }

  &__input {
    width: 100%;
    position: relative;
    input {
      position: absolute;
      top: -1px;
      outline: none;
      border: 1px solid var(--color-primary);
      border-radius: 2px;
      background-color: var(--color-contrast-lower);
      color: var(--color-contrast-higher);
      &[disabled] {
        color: var(--color-text);
      }
    }
    //&:after {
    //  content: '';
    //  position: absolute;
    //  top: 0;
    //  left: 0;
    //  right: 0;
    //  bottom: 0;
    //  border: 2px solid var(--color-primary);
    //  border-radius: 4px;
    //}

    &.is-editable {
      //border: 1px solid var(--color-primary);
      //background-color: var(--color-contrast-lower);
      //color: var(--color-contrast-higher);
    }
  }

  &--context {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: calc(-1 * var(--offset));
      right: 0;
      bottom: 0;
      border: 2px solid var(--color-primary);
      border-radius: 4px;
    }
  }
}
</style>
