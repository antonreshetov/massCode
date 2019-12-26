<template>
  <div class="action-bar">
    <div class="search">
      <AppInput placeholder="Search...">
        <template slot="prefix">
          <AppIcon
            class="search__icon"
            name="search"
          />
        </template>
      </AppInput>
      <AppIcon
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

export default {
  name: 'ActionBar',

  components: {
    AppInput
  },

  data () {
    return {}
  },

  computed: {
    ...mapGetters('folders', ['selectedId'])
  },

  methods: {
    onAddSnippet () {
      console.log('add snippet')

      this.$store.dispatch('snippets/addSnippet', this.selectedId)
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
