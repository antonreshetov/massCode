<template>
  <div class="tray">
    <div class="tray__header">
      <AppInput
        ref="search"
        v-model="query"
        class="search__input"
        placeholder="Search..."
        ghost
        @key:enter="onEnter"
        @key:up.prevent="scrollByArrow"
        @key:down.prevent="scrollByArrow"
      >
        <template slot="prefix">
          <AppIcon
            class="search__icon"
            name="search"
          />
        </template>
      </AppInput>
      <AppIcon
        v-if="isSearchedTray"
        class="clear"
        name="x"
        @click="onClearSearch"
      />
    </div>
    <div
      ref="body"
      class="tray__body"
    >
      <TraySnippetList ref="list">
        <TraySnippetListItem
          v-for="(i, index) in snippetList"
          :id="i.label"
          :key="i._id"
          :index="index"
          :model="i"
          @hover="aheadIndex = $event"
          @click="onSelect"
        />
      </TraySnippetList>
    </div>
  </div>
</template>

<script>
import TraySnippetList from '@/components/tray/TraySnippetList.vue'
import TraySnippetListItem from '@/components/tray/TraySnippetListItem.vue'
import { mapGetters } from 'vuex'
import PerfectScrollbar from 'perfect-scrollbar'
import '@/lib/ipcRenderer'
import { ipcRenderer } from 'electron'

export default {
  name: 'TrayView',

  components: {
    TraySnippetList,
    TraySnippetListItem
  },

  provide () {
    return {
      tray: this
    }
  },

  data () {
    return {
      ps: null,
      aheadIndex: 0,
      pointerPosTop: null,
      viewportHeight: null
    }
  },

  computed: {
    ...mapGetters('snippets', [
      'snippetsTray',
      'searchQueryTray',
      'isSearchedTray',
      'snippetsSearchedTray'
    ]),
    query: {
      get () {
        return this.searchQueryTray
      },
      set (query) {
        this.aheadIndex = 0
        this.$store.dispatch('snippets/searchSnippetsTray', query)
      }
    },
    snippetList () {
      return this.isSearchedTray ? this.snippetsSearchedTray : this.snippetsTray
    }
  },

  created () {
    this.$watch('snippetsSearchedTray', () => {
      this.$nextTick(() => {
        this.ps.update()
      })
    })

    ipcRenderer.on('tray:show', () => {
      this.init()
    })
    ipcRenderer.on('tray:hide', () => {
      this.onClearSearch()
    })
  },

  mounted () {
    this.initPS()
  },

  methods: {
    async init () {
      // Загружаем последние изменения БД
      await this.$store.dispatch('snippets/getSnippetsForTray')
      if (this.ps) {
        this.$nextTick(() => {
          this.ps.update()
        })
        this.searchFocus(true)
        this.scrollToTop()
      }
      this.getViewportHeight()
    },
    async onSelect (snippet) {
      // Пока что выбирает только контент из первого фрагмента
      const content = snippet.content[0].value
      await navigator.clipboard.writeText(content)
      if (process.platform === 'darwin' || process.platform === 'linux') {
        /* eslint-disable no-new */
        new Notification('massCode', {
          body: 'Snippet is copied',
          silent: true
        })
        ipcRenderer.send('tray:hide')
      }
    },
    onEnter () {
      const snippet = this.snippetList[this.aheadIndex]
      this.onSelect(snippet)
    },
    onClearSearch () {
      this.$store.commit('snippets/SET_SEARCH_TRAY', false)
      this.$store.commit('snippets/SET_SEARCH_QUERY_TRAY', null)
    },
    initPS () {
      this.ps = new PerfectScrollbar(this.$refs.body)
    },
    searchFocus () {
      this.$nextTick(() => {
        this.$refs.search.$refs.input.focus()
      })
    },
    scrollToTop () {
      this.$refs.body.scrollTop = 0
    },
    scrollByArrow (e) {
      const itemHeight = this.$refs.list.$el.children[0].offsetHeight

      if (e.keyCode === 38) {
        if (this.aheadIndex > 0) this.aheadIndex--
        this.getPointerPosTop()
      }

      if (e.keyCode === 40) {
        if (this.aheadIndex < this.snippetList.length - 1) this.aheadIndex++
        this.getPointerPosTop()
      }

      if (this.pointerPosTop < this.$refs.body.scrollTop) {
        this.$refs.body.scrollTop = this.pointerPosTop
      }

      if (
        this.pointerPosTop >
        this.$refs.body.scrollTop + this.viewportHeight - itemHeight
      ) {
        this.$refs.body.scrollTop =
          this.pointerPosTop - this.viewportHeight + itemHeight
      }
    },
    getPointerPosTop () {
      this.pointerPosTop = this.$refs.list.$el.children[
        this.aheadIndex
      ].offsetTop
    },
    getViewportHeight () {
      this.viewportHeight = this.$refs.body.offsetHeight
    }
  }
}
</script>

<style lang="scss">
.tray {
  --triangle-heigh: 8px;

  background-color: var(--color-bg);
  height: calc(400px - var(--triangle-heigh));
  position: relative;
  top: var(--triangle-heigh);
  display: grid;
  border-radius: 5px;
  grid-template-rows: 40px 1fr;
  &:before {
    content: '';
    display: inline-block;
    position: absolute;
    top: calc(var(--triangle-heigh) * -1);
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 9px var(--triangle-heigh) 9px;
    border-color: transparent transparent var(--color-bg) transparent;
  }
  &__header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--color-border);
    .search__input {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      line-height: 40px;
    }
    svg {
      width: 18px;
      height: 18px;
      stroke: var(--color-contrast-low);
      position: relative;
      top: 3px;
    }
    .clear {
      margin-right: var(--spacing-xs);
      position: relative;
      top: -1px;
    }
  }
  &__body {
    position: relative;
    overflow-y: scroll;
  }
}
</style>
