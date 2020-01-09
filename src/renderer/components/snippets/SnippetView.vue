<template>
  <div
    v-click-outside="onClickOutside"
    class="snippet-view"
  >
    <div class="snippet-view__title">
      <AppInput
        ref="input"
        v-model="localSnippet.name"
        ghost
        class="snippet-name"
      />
      <div class="snippet-view__actions">
        <div class="snippet-view__actions-item">
          <AppIcon
            name="clipboard"
            @click="onCopySnippet"
          />
        </div>
      </div>
      <div class="snippet-view__actions">
        <div
          class="snippet-view__actions-item"
          @click="onAddTab"
        >
          <AppIcon name="plus" />
        </div>
      </div>
    </div>
    <div class="snippet-view__body">
      <SnippetTabs
        v-model="active"
        :tabs="localSnippet.content"
        @tab:edit="onEditTab"
        @tab:delete="onDeleteTab"
      >
        <SnippetTabsPane
          v-for="(i, index) in localSnippet.content"
          :key="i.index"
          :label="i.label"
          :index="index"
        >
          <MonacoEditor
            v-model="i.value"
            :language="i.language"
            :is-tabs="localSnippet.content.length > 1"
            @change:lang="onChangeLanguage($event, index)"
          />
        </SnippetTabsPane>
      </SnippetTabs>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import cloneDeep from 'lodash-es/cloneDeep'
import MonacoEditor from '@/components/editor/MonacoEditor.vue'
import SnippetTabs from '@/components/snippets/SnippetTabs.vue'
import SnippetTabsPane from '@/components/snippets/SnippetTabsPane.vue'
import { menu, dialog } from '@@/lib'
import { track } from '@@/lib/analytics'

export default {
  name: 'SnippetView',

  components: {
    MonacoEditor,
    SnippetTabs,
    SnippetTabsPane
  },

  data () {
    return {
      localSnippet: null,
      unWatch: null,
      active: 0
    }
  },

  computed: {
    ...mapGetters('snippets', ['selected', 'newSnippetId']),
    isNew () {
      return this.newSnippetId === this.localSnippet._id
    }
  },

  created () {
    this.cloneSnippet()
    this.$watch('selected', () => {
      this.unWatch()
      this.cloneSnippet()
      this.setWatcher()
      this.active = 0
    })
    this.setWatcher()
    this.$bus.$on('snippet:new-fragment', () => {
      this.onAddTab()
    })
    this.$bus.$on('menu:copy-snippet', () => {
      this.onCopySnippet()
    })
  },

  mounted () {
    if (this.isNew) {
      this.$refs.input.$refs.input.focus()
      this.$refs.input.$refs.input.select()
    }
  },

  methods: {
    setWatcher () {
      this.unWatch = this.$watch(
        'localSnippet',
        () => {
          this.$emit('edit')
          const id = this.localSnippet._id
          const payload = this.localSnippet

          this.$store.dispatch('snippets/updateSnippet', { id, payload })
        },
        { deep: true }
      )
    },
    cloneSnippet () {
      this.localSnippet = cloneDeep(this.selected)
      this.localSnippet.updatedAt = new Date()
    },
    onChangeLanguage (lang, index) {
      this.localSnippet.content[index].language = lang
    },
    onClickOutside () {
      if (this.newSnippetId) {
        this.$store.commit('snippets/SET_NEW', null)
      }
    },
    onAddTab () {
      const index = this.localSnippet.content.length
      const fragment = {
        label: `Fragment ${index + 1}`,
        language: null,
        value: null
      }
      this.localSnippet.content.push(fragment)
      this.active = index
      track('snippets/new-fragment')
    },
    onEditTab (v, index) {
      this.localSnippet.content[index].label = v
    },
    onDeleteTab (index) {
      this.localSnippet.content.splice(index, 1)
      if (this.active === index) {
        this.active = 0
      }
      track('snippets/delete-fragment')
    },
    onTabContext (fragment) {
      menu.popup([
        {
          label: `Rename "${fragment.label}"`,
          click: () => {}
        },
        {
          type: 'separator'
        },
        {
          label: `Delete ${fragment.label}"`,
          click: () => {
            const buttonId = dialog.showMessageBoxSync({
              message: `Are you sure you want to permanently delete "${fragment.label}"?`,
              detail: 'You cannot undo this action.',
              buttons: ['Delete', 'Cancel'],
              defaultId: 0,
              cancelId: 1
            })
            if (buttonId === 0) {
              this.localSnippet.content.splice(fragment.index, 1)
              if (this.active === fragment.index) {
                this.active = 0
              }
            }
          }
        }
      ])
    },
    async onCopySnippet () {
      const snippet = this.selected.content[this.active].value
      await navigator.clipboard.writeText(snippet)
      if (process.platform === 'darwin' || process.platform === 'linux') {
        /* eslint-disable no-new */
        new Notification('massCode', {
          body: 'Snippet is copied'
        })
      }
    }
  }
}
</script>

<style lang="scss">
.snippet-view {
  display: grid;
  grid-template-rows:
    var(--snippets-view-header-height)
    1fr;
  overflow: hidden;
  &__title {
    display: flex;
  }
  &__title,
  &__footer {
    padding: var(--spacing-xs);
    overflow: hidden;
  }
  &__actions {
    display: flex;
    align-items: center;
    &-item {
      height: 24px;
      width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        svg {
          stroke: var(--color-contrast-high);
        }
      }
    }
    svg {
      stroke: var(--color-contrast-medium);
      width: 16px;
      height: 16px;
    }
  }
}
.snippet-name {
  width: 100%;
  input {
    font-size: var(--text-lg);
    font-weight: 600;
    height: 40px;
    line-height: 40px;
  }
}
</style>
