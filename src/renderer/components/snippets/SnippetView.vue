<template>
  <div class="snippet-view">
    <div class="snippet-view__title">
      <AppInput
        ref="input"
        v-model="localSnippet.name"
        class="snippet-name"
      />
    </div>
    <div class="snippet-view__body">
      body
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import cloneDeep from 'lodash-es/cloneDeep'

export default {
  name: 'SnippetView',

  data () {
    return {
      localSnippet: null,
      unWatch: null
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
      this.cloneSnippet()
    })
    this.$watch(
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

  mounted () {
    if (this.isNew) {
      this.$refs.input.$refs.input.focus()
      this.$refs.input.$refs.input.select()
    }
  },

  methods: {
    cloneSnippet () {
      this.localSnippet = cloneDeep(this.selected)
      this.localSnippet.updatedAt = new Date()
    }
  }
}
</script>

<style lang="scss">
.snippet-view {
  &__title,
  &__body {
    padding: var(--spacing-xs);
  }
}
.snippet-name {
  input {
    font-size: var(--text-lg);
    font-weight: 600;
  }
}
</style>
