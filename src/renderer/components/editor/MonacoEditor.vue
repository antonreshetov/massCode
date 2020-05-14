<template>
  <div
    ref="wrapper"
    class="app-monaco-editor__wrapper"
  >
    <div
      ref="editor"
      class="app-monaco-editor"
      :style="editorStyles"
    />

    <div class="app-monaco-editor__footer">
      <div
        class="language"
        @click="onClickLanguage"
      >
        {{ languageName }}
      </div>
      <div class="position">
        Line {{ position.lineNumber }}, Column {{ position.column }}
      </div>
    </div>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { emmetHTML } from 'emmet-monaco-es'
import { menu } from '@@/lib'
import { mapState, mapGetters } from 'vuex'
import languages from './languages'
import { track } from '@@/lib/analytics'
import prettier from 'prettier'
import { ipcRenderer } from 'electron'
import { conf as dartConf, language as dartLanguage } from './languages/dart'

export default {
  name: 'MonacoEditor',

  props: {
    value: {
      type: String,
      default: null
    },
    language: {
      type: String,
      default: 'text'
    },
    theme: {
      type: String,
      default: 'massCode-dark'
    },
    isTabs: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      editor: null,
      position: {
        lineNumber: 0,
        column: 0
      },
      decorations: [],
      isInit: false,
      isFocused: false
    }
  },

  computed: {
    ...mapState(['app', 'preferences']),
    ...mapGetters('snippets', ['searchQuery', 'selected']),
    languagesMenu () {
      return languages
        .map(i => {
          i.type = 'radio'
          i.checked = i.value === this.language
          i.click = e => {
            this.$emit('change:lang', e.value)
            this.setLanguage(e.value)
            track(`snippets/set-language/${e.label}`)
          }
          return i
        })
        .sort((a, b) => (a.label < b.label ? -1 : 1))
    },
    languageName () {
      let name = 'Plain text'
      const lang = languages.find(i => i.value === this.language)

      if (lang) name = lang.label
      return name
    },
    editorStyles () {
      let style = {
        height:
          'calc(100vh - var(--snippets-view-header-full-height) - var(--snippets-view-footer-height))'
      }
      if (this.isTabs) {
        style = {
          height:
            'calc(100vh - var(--snippets-view-header-full-height) - var(--snippet-tab-header-height) - var(--snippets-view-footer-height))'
        }
      }
      return style
    },
    isFormatAvailable () {
      const available = [
        'css',
        'graphql',
        'html',
        'javascript',
        'json',
        'less',
        'markdown',
        'scss',
        'typescript',
        'yaml'
      ]
      return available.includes(this.language)
    }
  },

  watch: {
    'app.theme' () {
      this.setTheme()
    },
    'app.snippetListWidth' () {
      this.updateLayout()
    },
    'app.sidebarWidth' () {
      this.updateLayout()
    },
    'app.markdownPreview' (e) {
      if (!e) {
        this.$nextTick(() => {
          this.updateLayout()
        })
      }
    },
    selected () {
      this.$nextTick(() => {
        this.updateLayout()
      })
    },
    'preferences.renderWhitespace' (v) {
      this.editor.updateOptions({ renderWhitespace: v })
    },
    'preferences.wordWrap' (v) {
      this.editor.updateOptions({ wordWrap: v })
    },
    'preferences.tabSize' (v) {
      this.editor.getModel().updateOptions({
        tabSize: v,
        insertSpaces: this.preferences.insertSpaces
      })
    },
    'preferences.insertSpaces' (v) {
      this.editor.getModel().updateOptions({
        tabSize: this.preferences.tabSize,
        insertSpaces: v
      })
    }
  },

  created () {
    this.$bus.$on('menu:format-snippet', () => {
      this.format()
    })
  },

  mounted () {
    this.init()
    this.searchHighlight(this.searchQuery)
    this.$watch('value', newVal => {
      if (newVal !== this.editor.getValue()) {
        this.editor.setValue(newVal)
        this.editor.setPosition({ lineNumber: 0, column: 0 })
        this.searchHighlight(this.searchQuery)
      }
    })
    this.$watch('language', newVal => {
      this.setLanguage(newVal)
    })
    this.$watch('searchQuery', newVal => {
      this.searchHighlight(newVal)
    })
    if (this.isTabs) {
      const { height, width } = this.$refs.wrapper.getBoundingClientRect()
      const footerHeight = 30
      this.editor.layout({ width, height: height - footerHeight - 60 })
    }
    this.updateLayout()
    window.addEventListener('resize', this.updateLayout)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.updateLayout)
  },

  methods: {
    init () {
      this.defineThemes()
      this.addLanguage('dart', dartConf, dartLanguage)

      this.editor = monaco.editor.create(this.$refs.editor, {
        value: this.value,
        language: this.language,
        minimap: {
          enabled: false
        },
        matchBrackets: 'never',
        scrollbar: {
          useShadows: false,
          verticalScrollbarSize: 5,
          horizontalScrollbarSize: 5
        },
        contextmenu: false,
        scrollBeyondLastLine: false,
        renderWhitespace: this.preferences.renderWhitespace,
        wordWrap: this.preferences.wordWrap,
        links: false
      })
      // Обновление опций
      this.editor.getModel().updateOptions({
        tabSize: this.preferences.tabSize,
        insertSpaces: this.preferences.insertSpaces
      })
      // Отслеживание изменений модели редактора для обновления v-model
      this.editor.onDidChangeModelContent(e => {
        const value = this.editor.getValue()
        this.$emit('input', value)
      })
      // Получение позиции курсора
      this.editor.onMouseDown(e => {
        this.position = e.target.position
      })
      this.editor.onDidFocusEditorText(e => {
        this.isFocused = true
      })
      this.editor.onDidBlurEditorText(e => {
        this.isFocused = false
      })
      this.editor.onDidChangeCursorPosition(e => {
        this.position = e.position
      })
      // Отключаем поиск по cmd+f
      this.editor._standaloneKeybindingService.addDynamicKeybinding(
        '-actions.find'
      )

      this.bindUndoRedo()
      this.setTheme()
      emmetHTML(monaco)
    },
    defineThemes () {
      // Темная тема
      monaco.editor.defineTheme('massCode-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [{ background: 'EDF9FA' }],
        colors: {
          'editor.background': '#333333',
          'editor.lineHighlightBackground': '#333',
          'editorLineNumber.foreground': '#525252',
          'editorSuggestWidget.foreground': '#ffffff',
          'editorSuggestWidget.background': '#404040',
          'editorSuggestWidget.selectedBackground': '#525252',
          'editorSuggestWidget.highlightForeground': '#67a4ef',
          'list.focusBackground': '#ffffff',
          'list.hoverBackground': '#585858',
          'list.hoverForeground': '#ffffff',
          'list.highlightForeground': '#333333'
        }
      })
      // Светлая тема
      monaco.editor.defineTheme('massCode-light', {
        base: 'vs',
        inherit: true,
        rules: [{ background: 'EDF9FA' }],
        colors: {
          'editor.background': '#ffffff',
          'editor.lineHighlightBackground': '#ffffff',
          'editorLineNumber.foreground': '#525252',
          'editorSuggestWidget.foreground': '#262626',
          'editorSuggestWidget.background': '#f7f7f7',
          'editorSuggestWidget.selectedBackground': '#d9d9d9',
          'editorSuggestWidget.highlightForeground': '#67a4ef',
          'list.focusBackground': '#ffffff',
          'list.hoverBackground': '#d3d3d3',
          'list.hoverForeground': '#262626',
          'list.highlightForeground': '#ffffff'
        }
      })
    },
    setTheme () {
      if (this.app.theme === 'dark') {
        monaco.editor.setTheme('massCode-dark')
      } else {
        monaco.editor.setTheme('massCode-light')
      }
    },
    setLanguage (lang) {
      const model = this.editor.getModel()
      monaco.editor.setModelLanguage(model, lang)
    },
    addLanguage (name, conf, language) {
      monaco.languages.register({ id: name })
      monaco.languages.setMonarchTokensProvider(name, language)
      monaco.languages.setLanguageConfiguration(name, conf)
    },
    onClickLanguage () {
      menu.popup(this.languagesMenu)
    },
    searchHighlight (query) {
      const model = this.editor.getModel()
      const matches = model.findMatches(query, false, true, false)
      const newDecorations = matches.map(i => {
        return {
          range: i.range,
          options: { inlineClassName: 'marked' }
        }
      })
      this.decorations = this.editor.deltaDecorations(
        this.decorations,
        newDecorations
      )
    },
    format () {
      if (!this.isFormatAvailable) return

      let parser = this.language

      if (this.language === 'javascript') parser = 'babel'
      if (this.language === 'html') parser = 'vue'

      const formated = prettier.format(this.value, {
        parser,
        semi: this.preferences.prettierSemi,
        tabWidth: this.preferences.tabSize,
        useTabs: !this.preferences.insertSpaces,
        singleQuote: this.preferences.prettierQuotes
      })
      this.$emit('input', formated)
      track('snippets/format')
    },
    updateLayout () {
      const snippetListWidth = this.app.snippetListWidth
      const sidebarWidth = this.app.sidebarWidth
      const editorHeight = this.$refs.editor.getBoundingClientRect().height
      const width = window.innerWidth - snippetListWidth - sidebarWidth
      const height = editorHeight

      this.editor.layout({ width, height })
      this.$emit('change:layout', { width, height })
    },
    bindUndoRedo () {
      ipcRenderer.on('menu:undo', () => {
        if (this.isFocused) {
          this.editor.getModel().undo()
        }
      })
      ipcRenderer.on('menu:redo', () => {
        if (this.isFocused) {
          this.editor.getModel().redo()
        }
      })
    }
  }
}
</script>

<style lang="scss">
.app-monaco-editor {
  min-height: 200px;
  &__wrapper {
    display: grid;
    grid-template-rows: 1fr var(--snippets-view-footer-height);
  }
  &__footer {
    font-size: var(--text-sm);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--spacing-xs);
    color: var(--color-contrast-medium);
    .language {
      cursor: default;
    }
  }
  .decorationsOverviewRuler {
    width: 0 !important;
  }
  .marked {
    background-color: yellow;
    color: #000;
    border-radius: 3px;
  }
}
</style>
