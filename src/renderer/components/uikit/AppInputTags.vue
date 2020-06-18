<template>
  <div class="app-input-tags">
    <VueTagsInput
      ref="tagsInput"
      v-bind="$attrs"
      :add-on-blur="false"
      @tags-changed="onTagsChange"
      v-on="$listeners"
    />
    <AppPopper
      v-if="showPopper"
      ref="popper"
      :append-to="appendEl"
      :arrow="false"
    >
      <div class="app-input-tags__autocomplete">
        <div
          v-for="i in autocomplete"
          :key="i._id"
          class="app-input-tags__autocomplete-item"
          @click="onSelectTag(i)"
        >
          {{ i.name }}
        </div>
      </div>
    </AppPopper>
  </div>
</template>

<script>
import { VueTagsInput, createTag } from '@johmun/vue-tags-input'
import { mapGetters } from 'vuex'

export default {
  name: 'AppInputTags',

  components: {
    VueTagsInput
  },

  props: {
    autocomplete: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      appendEl: null,
      showPopper: false
    }
  },

  computed: {
    ...mapGetters('tags', ['tags']),
    ...mapGetters('snippets', ['selected']),
    isResult () {
      return this.autocomplete.length > 0
    }
  },

  watch: {
    '$attrs.value' (v) {
      if (this.isResult && v) {
        this.showPopper = true
      } else {
        this.showPopper = false
      }
    },
    selected () {
      this.$nextTick(() => {
        this.checkTagsHeight()
        this.showPopper = false
      })
    }
  },

  mounted () {
    this.checkTagsHeight()
    this.appendEl = this.$el.querySelector('.ti-new-tag-input')
  },

  methods: {
    onTagsChange () {
      this.$nextTick(() => {
        this.checkTagsHeight()
        if (this.showPopper) {
          this.$refs.popper.update()
        }
      })
    },
    checkTagsHeight () {
      const height = this.$el.querySelector('.ti-tags').offsetHeight
      document.documentElement.style.setProperty(
        '--snippets-tags-height',
        height + 'px'
      )
    },
    onSelectTag (tag) {
      const clonedTag = Object.assign({}, tag)
      const newTag = createTag(clonedTag, [{ type: 'length' }])

      this.$refs.tagsInput.addTag(newTag)
      this.$emit('tag:select', newTag)
      this.showPopper = false
    }
  }
}
</script>

<style lang="scss">
.app-input-tags {
  width: 100%;
  overflow: hidden;
  position: relative;
  &__autocomplete {
    &-item {
      font-size: var(--text-sm);
      padding: var(--spacing-xs);
      border-bottom: 1px solid var(--color-border);
      -webkit-user-select: none;
      &:hover {
        background-color: var(--color-contrast-lower);
      }
      &:last-child {
        border-bottom: none;
      }
    }
  }
  .vue-tags-input {
    background-color: transparent;
    max-width: 100%;
    outline: none;
    ::-webkit-input-placeholder {
      color: var(--color-contrast-medium);
    }
    .ti-input {
      border: none;
    }
    .ti-new-tag-input {
      background-color: transparent;
      color: var(--color-text);
    }
    .ti-tag {
      background-color: var(--color-contrast-lower);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      height: 20px;
      font-size: var(--text-xs);
      :hover {
        cursor: default;
      }
      .ti-action,
      i {
        cursor: default;
      }
      &.ti-deletion-mark {
        background-color: transparent;
      }
    }
  }
  input {
    outline: none;
  }
}
</style>
