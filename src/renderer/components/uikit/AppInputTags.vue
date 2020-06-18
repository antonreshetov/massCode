<template>
  <div class="app-input-tags">
    <VueTagsInput
      ref="tagsInput"
      v-bind="$attrs"
      :add-on-blur="false"
      :is-duplicate="isAllowToAdd"
      @tags-changed="onTagsChange"
      v-on="$listeners"
    />
    <AppPopper
      v-if="showPopper"
      ref="popper"
      :append-to="appendEl"
      :arrow="false"
    >
      <div
        ref="list"
        class="app-input-tags__autocomplete"
      >
        <div
          v-for="(i, index) in autocomplete"
          :key="i._id"
          class="app-input-tags__autocomplete-item"
          :class="{ 'is-selected': index === aheadIndex }"
          @click="onSelectTag(i)"
          @hover="aheadIndex = $event"
        >
          {{ i.name }}
        </div>
      </div>
    </AppPopper>
  </div>
</template>

<script>
import { VueTagsInput, createTag } from '@johmun/vue-tags-input'
import PerfectScrollbar from 'perfect-scrollbar'
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
      showPopper: false,
      aheadIndex: null,
      pointerPosTop: null,
      viewportHeight: null,
      ps: null
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
    },
    autocomplete (v) {
      if (v.length) {
        this.aheadIndex = null
        this.$nextTick(() => {
          this.getViewportHeight()
          if (this.ps) {
            this.ps.update()
          }
        })
      }
    },
    showPopper (v) {
      if (!v) {
        this.viewportHeight = null
        this.pointerPosTop = null
        this.aheadIndex = null
      } else {
        this.$nextTick(() => {
          this.initPS()
        })
      }
    }
  },

  mounted () {
    this.checkTagsHeight()
    this.appendEl = this.$el.querySelector('.ti-new-tag-input')
    this.bindKeyEvent()
  },

  methods: {
    isAllowToAdd (e) {
      return this.aheadIndex !== null
    },
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
    },
    bindKeyEvent () {
      this.appendEl.addEventListener('keydown', e => {
        this.scrollByArrow(e)
        if (e.keyCode === 27) this.aheadIndex = null
        if (e.keyCode === 13 && this.aheadIndex !== null) {
          const tag = this.autocomplete[this.aheadIndex]
          this.onSelectTag(tag)
        }
      })
    },
    scrollByArrow (e) {
      if (!this.showPopper) return

      const list = this.$refs.popper.$el.children[0]
      const itemHeight = this.$refs.list.children[0].offsetHeight

      if (e.keyCode === 38) {
        if (this.aheadIndex > 0) this.aheadIndex--
        this.getPointerPosTop()
      }

      if (e.keyCode === 40) {
        if (this.aheadIndex === null) {
          this.aheadIndex = 0
          return
        }

        if (this.aheadIndex < this.autocomplete.length - 1) {
          this.aheadIndex++
        }

        this.getPointerPosTop()
      }

      if (this.pointerPosTop < list.scrollTop) {
        list.scrollTop = this.pointerPosTop
      }

      if (
        this.pointerPosTop >
        list.scrollTop + this.viewportHeight - itemHeight
      ) {
        list.scrollTop = this.pointerPosTop - this.viewportHeight + itemHeight
      }
    },
    getPointerPosTop () {
      this.pointerPosTop = this.$refs.list.children[this.aheadIndex].offsetTop
    },
    getViewportHeight () {
      this.viewportHeight = this.$refs.popper?.$el.children[0]?.offsetHeight
    },
    initPS () {
      this.ps = new PerfectScrollbar(this.$refs.popper.$el.children[0])
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
    // overflow: hidden;
    position: relative;
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
      &.is-selected {
        background-color: var(--color-contrast-lower);
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
