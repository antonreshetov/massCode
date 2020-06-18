<template>
  <div
    v-click-outside="onClickOutside"
    class="snippet-view"
  >
    <div class="snippet-view__title">
      <div class="snippet-view__header">
        <AppInput
          ref="input"
          v-model="name"
          ghost
          class="snippet-name"
        />
        <div class="snippet-view__actions">
          <div
            v-if="isMarkdown"
            class="snippet-view__actions-item eye"
            :class="{
              active: app.markdownPreview
            }"
          >
            <AppIcon
              name="eye"
              @click="onMarkdownPreview"
            />
          </div>
          <div class="snippet-view__actions-item">
            <AppIcon
              name="clipboard"
              @click="onCopySnippet"
            />
          </div>
          <div
            class="snippet-view__actions-item"
            @click="onAddTab"
          >
            <AppIcon name="plus" />
          </div>
        </div>
      </div>
      <div class="snippet-view__tags">
        <AppInputTags
          v-model="inputTag"
          tabindex="-1"
          :tags="selectedTags"
          :autocomplete="autocompleteTag"
          @before-adding-tag="onAddTag"
          @before-deleting-tag="onRemoveTag"
          @tag:select="onAddTagFromAutocomplete"
        />
      </div>
    </div>
    <div class="snippet-view__body">
      <SnippetTabs
        v-model="activeTab"
        :tabs="fragments"
        :width="snippetWidth"
        @tab:edit="onEditTab"
        @tab:delete="onDeleteTab"
      >
        <SnippetTabsPane
          v-for="(i, index) in fragments"
          :key="i.index"
          :label="i.label"
          :index="index"
          :split="false"
        >
          <MonacoEditor
            v-show="!app.markdownPreview || !isMarkdown"
            v-model="i.value"
            :language="i.language"
            :is-tabs="fragments.length > 1"
            @change:lang="onChangeLanguage($event, index)"
            @change:layout="onChangeLayout"
          />
          <MarkdownPreview
            v-if="i.language === 'markdown' && i.value"
            :model="i.value"
            :is-tabs="fragments.length > 1"
          />
        </SnippetTabsPane>
      </SnippetTabs>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import cloneDeep from 'lodash-es/cloneDeep'
import debounce from 'lodash-es/debounce'
import MonacoEditor from '@/components/editor/MonacoEditor.vue'
import MarkdownPreview from '@/components/editor/MarkdownPreview.vue'
import SnippetTabs from '@/components/snippets/SnippetTabs.vue'
import SnippetTabsPane from '@/components/snippets/SnippetTabsPane.vue'
import { menu, dialog } from '@@/lib'
import { track } from '@@/lib/analytics'
import { ipcRenderer } from 'electron'

export default {
  name: 'SnippetView',

  components: {
    MonacoEditor,
    MarkdownPreview,
    SnippetTabs,
    SnippetTabsPane
  },

  data () {
    return {
      localSnippet: null,
      unWatch: null,
      inputTag: '',
      snippetWidth: null
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapGetters('snippets', ['selected', 'newSnippetId', 'activeFragment']),
    ...mapGetters('tags', ['tags']),
    name: {
      get () {
        return this.localSnippet ? this.localSnippet.name : ''
      },
      set (v) {
        this.localSnippet.name = v
      }
    },
    fragments () {
      return this.localSnippet ? this.localSnippet.content : []
    },
    isNew () {
      if (this.selected) {
        return this.newSnippetId === this.selected._id
      }
      return false
    },
    isMarkdown () {
      const index = this.activeTab
      if (this.selected && this.selected.content[index]) {
        return this.selected.content[index].language === 'markdown'
      }
      return null
    },
    selectedTags () {
      if (this.selected) {
        return this.selected.tagsPopulated
      }
      return []
    },
    autocompleteTag () {
      if (this.inputTag === '') return []
      return this.tags
        .filter(
          i =>
            !this.selectedTags.some(
              tag => tag.text.toLowerCase() === i.text.toLowerCase()
            )
        )
        .filter(i => i.text.toLowerCase().includes(this.inputTag.toLowerCase()))
    },
    activeTab: {
      get () {
        return this.activeFragment.index
      },
      set (index) {
        this.$store.commit('snippets/SET_ACTIVE_FRAGMENT', {
          snippetId: this.localSnippet._id,
          index
        })
      }
    }
  },

  watch: {
    isNew (v) {
      if (v) {
        this.$nextTick(() => {
          this.$refs.input.$refs.input.focus()
          this.$refs.input.$refs.input.select()
        })
      }
    }
  },

  created () {
    this.cloneSnippet()
    this.$watch('selected', () => {
      this.unWatch()
      this.cloneSnippet()
      this.setWatcher()
      this.inputTag = ''
    })
    this.setWatcher()
    this.$bus.$on('snippet:new-fragment', () => {
      this.onAddTab()
    })
    this.$bus.$on('menu:copy-snippet', () => {
      this.onCopySnippet()
    })
  },

  methods: {
    setWatcher () {
      this.unWatch = this.$watch(
        'localSnippet',
        debounce(() => {
          this.$emit('edit')
          const ids = [this.localSnippet._id]
          const payload = this.localSnippet
          this.$store.dispatch('snippets/updateSnippets', { ids, payload })
        }, 300),
        { deep: true }
      )
    },
    cloneSnippet () {
      if (this.selected) {
        this.localSnippet = cloneDeep(this.selected)
        this.localSnippet.updatedAt = new Date()
      }
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
      this.$store.commit('snippets/SET_ACTIVE_FRAGMENT', {
        snippetId: this.localSnippet._id,
        index
      })
      track('snippets/new-fragment')
    },
    onEditTab (v, index) {
      this.localSnippet.content[index].label = v
    },
    onDeleteTab (index) {
      this.localSnippet.content.splice(index, 1)
      if (this.activeTab === index) {
        this.$store.commit('snippets/SET_ACTIVE_FRAGMENT', {
          snippetId: this.localSnippet._id,
          index: 0
        })
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
              if (this.activeTab === fragment.index) {
                this.$store.commit('snippets/SET_ACTIVE_FRAGMENT', {
                  snippetId: this.localSnippet._id,
                  index: 0
                })
              }
            }
          }
        }
      ])
    },
    async onCopySnippet () {
      const snippet = this.selected.content[this.activeTab].value
      await navigator.clipboard.writeText(snippet)
      if (process.platform === 'darwin' || process.platform === 'linux') {
        /* eslint-disable no-new */
        new Notification('massCode', {
          body: 'Snippet is copied',
          silent: true
        })
      }
    },
    onMarkdownPreview () {
      this.$store.commit('app/SET_MARKDOWN_PREVIEW', !this.app.markdownPreview)
      ipcRenderer.send('menu:markdown-preview', this.app.markdownPreview)
    },
    async onAddTag (e) {
      const { tag, addTag } = e

      if (
        !tag.tiClasses.includes('ti-duplicate') ||
        !tag.tiClasses.includes('ti-invalid')
      ) {
        addTag()
        const newTag = await this.$store.dispatch('tags/addTag', {
          name: tag.text.trim()
        })
        const payload = {
          snippetId: this.selected._id,
          tagId: newTag._id
        }
        track('tags/new')
        this.$store.dispatch('snippets/addTag', payload)

        track('tags/new-snippet-tag')
      }
    },
    async onRemoveTag (e) {
      const { tag, deleteTag } = e
      if (tag) {
        const payload = {
          snippetId: this.selected._id,
          tagId: tag._id
        }
        this.$store.dispatch('snippets/removeTag', payload)
        deleteTag()
        track('tags/delete-snippet-tag')
      }
    },
    onAddTagFromAutocomplete (e) {
      if (e._id) {
        const payload = {
          snippetId: this.selected._id,
          tagId: e._id
        }
        this.$store.dispatch('snippets/addTag', payload)
      }
    },
    onChangeLayout (e) {
      const { width } = e
      this.snippetWidth = width
    }
  }
}
</script>

<style lang="scss">
.snippet-view {
  display: grid;
  grid-template-rows:
    var(--snippets-view-header-full-height)
    1fr;
  overflow: hidden;
  &__header {
    display: flex;
    width: 100%;
    overflow: hidden;
  }
  &__title {
    display: flex;
    flex-flow: column;
  }
  &__title,
  &__footer {
    padding: var(--spacing-xs);
    overflow: hidden;
  }
  &__actions {
    display: flex;
    padding-top: 4px;
    &-item {
      height: 24px;
      width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      &.active {
        svg {
          stroke: var(--color-primary);
        }
      }
      &.eye {
        margin-right: 6px;
      }
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
    height: 30px;
    line-height: 30px;
  }
}
</style>
