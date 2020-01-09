<template>
  <div class="action-bar">
    <div class="search">
      <AppInput
        ref="search"
        v-model="query"
        class="search__input"
        placeholder="Search..."
        ghost
      >
        <template slot="prefix">
          <AppIcon
            class="search__icon"
            name="search"
          />
        </template>
      </AppInput>
      <AppIcon
        v-if="isSearched"
        class="add-snippet"
        name="x"
        @click="onClearSearch"
      />
      <AppIcon
        v-if="!isSearched"
        class="add-snippet"
        name="plus"
        @click="onAddSnippet"
      />
    </div>
  </div>
</template>

<script>
import AppInput from '@/components/uikit/AppInput.vue'
import { mapGetters } from 'vuex'
import { track } from '@@/lib/analytics'

export default {
  name: 'ActionBar',

  components: {
    AppInput
  },

  data () {
    return {}
  },

  computed: {
    ...mapGetters('folders', ['selectedId']),
    ...mapGetters('snippets', ['searchQuery', 'isSearched']),
    query: {
      get () {
        return this.searchQuery
      },
      set (query) {
        this.$store.dispatch('snippets/searchSnippets', query)
      }
    }
  },

  created () {
    this.$bus.$on('menu:find-snippets', () => {
      this.$refs.search.$refs.input.focus()
    })
  },

  methods: {
    onAddSnippet () {
      this.$store.dispatch('snippets/addSnippet', { folderId: this.selectedId })
      track('snippets/new')
    },
    onClearSearch () {
      this.$store.commit('snippets/SET_SEARCH', false)
      this.$store.commit('snippets/SET_SEARCH_QUERY', null)
    }
  }
}
</script>

<style lang="scss">
.search {
  padding-top: var(--spacing-xs);
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  &__input {
    height: 40px;
    line-height: 40px;
  }
  svg {
    width: 18px;
    height: 18px;
    stroke: var(--color-contrast-low);
  }
  .add-snippet {
    margin-right: var(--spacing-xs);
    position: relative;
    top: 1px;
  }
}
</style>
