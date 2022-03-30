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
    @dragstart="onDrag($event, model._id)"
    @click="onClick"
    @contextmenu="onContext"
  >
    <AppIcon
      v-if="model.isFavorites"
      class="snippet-list-item__favorites"
      name="star"
    />
    <div class="title">
      <span>{{ model.name }}</span>
    </div>
    <div class="meta">
      <div class="folder">
        {{ model.folder ? model.folder.name : 'Inbox' }}
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
import { menu, dialog } from '@@/lib'
import { track } from '@@/lib/analytics'
import cloneDeep from 'lodash-es/cloneDeep'

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
    ...mapGetters('snippets', [
      'snippetsBySort',
      'selectedId',
      'selectedIndex',
      'selectedSnippets',
      'snippetsBySort',
      'sort'
    ]),
    ...mapGetters('folders', { selectedFolderId: 'selectedId' }),
    ...mapGetters('folders', ['systemAliases']),
    isSelected () {
      if (!this.selectedId) return null

      let selected
      if (this.selectedSnippets?.length > 1) {
        selected = !!this.selectedSnippets.find(i => i?._id === this.model._id)
      } else {
        selected = this.selectedId === this.model._id
      }

      return selected
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
    onClick (e) {
      if (e.shiftKey) {
        let snippets
        if (this.selectedIndex < this.index) {
          snippets = this.snippetsBySort.slice(
            this.selectedIndex,
            this.index + 1
          )
        } else {
          snippets = this.snippetsBySort.slice(
            this.index,
            this.selectedIndex + 1
          )
        }
        const ids = snippets.map(i => i._id)
        this.$store.commit('snippets/SET_SELECTED_IDS', ids)
      } else {
        this.onSelect()
        this.$store.commit('snippets/SET_SELECTED_IDS', [this.model._id])
      }
    },
    onSelect () {
      this.focus = true
      this.$store.dispatch('snippets/setSelected', this.model)
    },
    onDrag (e, id) {
      const isDraggableInSelected = this.selectedSnippets.some(
        i => i?._id === this.model?._id
      )
      let value = [this.model._id]

      if (this.selectedSnippets.length > 1 && isDraggableInSelected) {
        this.addGhostDragItem(e, true)
        value = this.selectedSnippets.map(i => i._id)
      } else {
        this.addGhostDragItem(e)
      }

      const payload = JSON.stringify({ value })
      e.dataTransfer.setData('payload', payload)
      this.focus = false
    },
    addGhostDragItem (e, multi) {
      let el = e.target.cloneNode(true)
      let style = {
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-contrast-higher)',
        fontSize: '14px',
        width: 'var(--snippets-list-width)',
        borderBottom: 'none'
      }
      el.id = 'ghost'

      if (multi) {
        const count = this.selectedSnippets.length
        el = document.createElement('div')
        style = {
          padding: '2px 10px',
          backgroundColor: 'var(--color-bg)',
          borderRadius: '3px',
          color: 'var(--color-contrast-higher)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'fixed',
          fontSize: '14px',
          top: '100%'
        }
        el.innerHTML = `${count} ${count > 1 ? 'items' : 'item'}`
      }

      Object.assign(el.style, style)
      document.body.appendChild(el)

      e.dataTransfer.setDragImage(el, 0, 0)
      setTimeout(() => el.remove(), 0)
    },
    onClickOutside () {
      this.focus = false
      this.context = false
    },
    onContext () {
      this.context = true
      let snippets = cloneDeep(this.selectedSnippets)
      let isFavorites

      const inSelected =
        this.selectedSnippets.findIndex(i => i?._id === this.model?._id) !== -1

      if (!inSelected) {
        snippets = [cloneDeep(this.model)]
        isFavorites = this.model.isFavorites
      } else {
        isFavorites = this.selectedSnippets.some(i => i.isFavorites)
      }

      const ids = snippets.map(i => i._id)

      let menuItems = [
        {
          label: 'Add to Favorites',
          click: () => {
            this.$store.dispatch('snippets/addToFavoritesByIds', ids)
            track('snippets/add-to-favorites')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Duplicate',
          click: () => {
            const snippet = Object.assign({}, this.model)
            snippet.name = `${snippet.name} (copy)`

            this.$store.dispatch('snippets/addSnippet', {
              folderId: snippet.folderId,
              snippet
            })
            track('snippets/duplicate')
          }
        },
        {
          label: 'Delete',
          click: async () => {
            const payload = {
              isDeleted: true
            }

            await this.$store.dispatch('snippets/updateSnippetsByIds', {
              ids,
              payload
            })
            const firstSnippet = this.snippetsBySort[0]

            if (firstSnippet) {
              this.$store.dispatch('snippets/setSelected', firstSnippet)
            } else {
              this.$store.dispatch('snippets/setSelected', null)
            }

            track('snippets/delete')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Sort By',
          submenu: [
            {
              label: 'Date Modified',
              type: 'radio',
              checked: this.sort === 'updatedAt',
              click: () => {
                this.$store.dispatch('snippets/setSort', 'updatedAt')
                track('snippets/sort/updatedAt')
              }
            },
            {
              label: 'Date Created',
              type: 'radio',
              checked: this.sort === 'createdAt',
              click: () => {
                this.$store.dispatch('snippets/setSort', 'createdAt')
                track('snippets/sort/createdAt')
              }
            },
            {
              label: 'Name',
              type: 'radio',
              checked: this.sort === 'name',
              click: () => {
                this.$store.dispatch('snippets/setSort', 'name')
                track('snippets/sort/name')
              }
            }
          ]
        }
      ]

      if (isFavorites) {
        const removeFromFavorites = {
          label: 'Remove from Favorites',
          click: () => {
            this.$store.dispatch('snippets/removeFromFavoritesByIds', ids)
            track('snippets/remove-from-favorites')
          }
        }
        menuItems.splice(0, 1, removeFromFavorites)
      }

      if (this.selectedFolderId === this.systemAliases.trash) {
        const deleteNow = {
          label: 'Delete Now',
          click: async () => {
            const plural = snippets.length > 1 ? 'snippets' : 'snippet'
            const buttonId = dialog.showMessageBoxSync({
              message: `Are you sure you want to permanently delete ${plural}?`,
              detail: 'You cannot undo this action.',
              buttons: ['Delete', 'Cancel'],
              defaultId: 0,
              cancelId: 1
            })
            if (buttonId === 0) {
              // const ids = snippets.map(i => i._id)
              // const ids = ids
              await this.$store.dispatch('snippets/deleteSnippetByIds', ids)
              const firstSnippet = this.snippetsBySort[0]

              if (firstSnippet) {
                this.$store.dispatch('snippets/setSelected', firstSnippet)
              } else {
                this.$store.dispatch('snippets/setSelected', null)
              }

              track('snippets/delete-now')
            }
          }
        }
        menuItems = [deleteNow]
      }

      const contextMenu = menu.popup(menuItems)
      contextMenu.addListener('menu-will-close', () => {
        this.context = false
      })
    }
  }
}
</script>

<style lang="scss">
.snippet-list-item {
  $r: &;
  padding: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
  outline: none;
  margin-right: 1px;
  user-select: none;
  position: relative;
  &__favorites {
    position: absolute;
    top: 0px;
    right: var(--spacing-xs);
    svg {
      width: 9px;
      height: 9px;
      stroke: var(--color-contrast-medium);
      fill: var(--color-contrast-medium);
    }
  }
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
    #{$r}__favorites {
      svg {
        fill: var(--color-text);
        stroke: var(--color-text);
      }
    }
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
