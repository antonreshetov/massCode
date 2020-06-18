<template>
  <div
    :id="`vue-popper-${_uid}`"
    class="vue-popper"
    @mouseover="$emit('mouseover')"
    @mouseout="$emit('mouseout')"
  >
    <div
      :style="{ 'max-height': height + 'px' }"
      class="vue-popper__inner"
    >
      <slot />
    </div>
    <div
      v-if="arrow"
      class="vue-popper__arrow"
      x-arrow
    />
  </div>
</template>

<script>
import Popper from 'popper.js'

export default {
  name: 'AppPopper',

  props: {
    appendTo: {
      type: [HTMLInputElement, HTMLDivElement],
      default: null
    },
    fullSize: {
      type: Boolean,
      default: false
    },
    placement: {
      type: String,
      default: 'bottom-start'
    },
    popperOptions: {
      type: Object,
      default: () => {}
    },
    height: {
      type: [String, Number],
      default: 230
    },
    arrow: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      popper: undefined
    }
  },

  mounted () {
    const app = document.querySelector('#app')
    app.appendChild(this.$el)
    this.$nextTick(() => {
      this.init()
    })
  },

  beforeDestroy () {
    this.$el.remove()
  },

  methods: {
    init () {
      const popper = this.$el
      const options = {
        placement: this.placement,
        modifiers: {
          fullSize: {
            enabled: this.fullSize,
            order: 840,
            fn (data) {
              data.styles.minWidth = data.offsets.reference.width + 'px'
              data.offsets.popper.left = data.offsets.reference.left
              return data
            }
          }
        }
      }
      const mergedOptions = Object.assign({}, options, this.popperOptions)
      this.popper = new Popper(this.appendTo, popper, mergedOptions)
      this.update()
    },
    update () {
      this.popper.scheduleUpdate()
    }
  }
}
</script>

<style lang="scss">
.vue-popper {
  $r: &;
  background-color: var(--color-bg);
  border-radius: 4px;
  border: 1px solid var(--color-border);
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1010;
  * {
    box-sizing: border-box;
  }
  &__inner {
    position: relative;
    overflow: hidden;
  }
  &__arrow {
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    border-width: 6px;
    filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
    &::after {
      content: ' ';
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-color: transparent;
      border-style: solid;
    }
  }
  &[x-placement^='bottom'] {
    margin-top: 5px;
    #{$r}__arrow {
      top: -6px;
      left: 50% !important;
      transform: translateX(-50%);
      margin-right: 3px;
      border-top-width: 0;
      border-bottom-color: var(--color-contrast-lower);
      &::after {
        top: 1px;
        border-top-width: 1px;
        margin-top: 0px;
        margin-left: -3px;
        border-color: transparent;
        border-style: solid;
        transform: scale(1.5, 1.5);
        border-bottom-color: var(--color-contrast-lower);
      }
    }
  }
  &[x-placement^='bottom-start'] {
    margin-top: 5px;
    #{$r}__arrow {
      top: -6px;
      left: 10px !important;
      margin-right: 3px;
      border-top-width: 0;
      border-bottom-color: var(--color-contrast-lower);
      &::after {
        top: 1px;
        border-top-width: 1px;
        margin-top: 0px;
        margin-left: -3px;
        border-color: transparent;
        border-style: solid;
        transform: scale(1.5, 1.5);
        border-bottom-color: var(--color-contrast-lower);
      }
    }
  }
  &[x-placement^='bottom-end'] {
    margin-top: 5px;
    #{$r}__arrow {
      top: -6px;
      left: calc(100% - 10px) !important;
      margin-right: 3px;
      border-top-width: 0;
      border-bottom-color: var(--color-contrast-lower);
      &::after {
        top: 1px;
        border-top-width: 1px;
        margin-top: 0px;
        margin-left: -3px;
        border-color: transparent;
        border-style: solid;
        transform: scale(1.5, 1.5);
        border-bottom-color: var(--color-contrast-lower);
      }
    }
  }
  &[x-placement^='top'] {
    margin: 0;
    margin-bottom: 6px;
    #{$r}__arrow {
      bottom: -6px;
      left: 50%;
      margin-right: 3px;
      border-bottom-width: 0;
      border-top-color: var(--color-contrast-lower);
      &::after {
        bottom: 1px;
        margin-right: 3px;
        border-bottom-width: 1px;
        margin-top: -6px;
        margin-left: -3px;
        transform: scale(1.5, 1.5);
        border-top-color: var(--color-contrast-lower);
      }
    }
  }
  &[x-placement^='top-start'] {
    margin: 0;
    margin-bottom: 6px;
    #{$r}__arrow {
      bottom: -6px;
      left: 10px !important;
      margin-right: 3px;
      border-bottom-width: 0;
      border-top-color: var(--color-contrast-lower);
      &::after {
        bottom: 1px;
        margin-right: 3px;
        border-bottom-width: 1px;
        margin-top: -6px;
        margin-left: -3px;
        transform: scale(1.5, 1.5);
        border-top-color: var(--color-contrast-lower);
      }
    }
  }
  &[x-placement^='top-end'] {
    margin: 0;
    margin-bottom: 6px;
    #{$r}__arrow {
      bottom: -6px;
      left: calc(100% - 15px) !important;
      margin-right: 3px;
      border-bottom-width: 0;
      border-top-color: var(--color-contrast-lower);
      &::after {
        bottom: 1px;
        margin-right: 3px;
        border-bottom-width: 1px;
        margin-top: -6px;
        margin-left: -3px;
        transform: scale(1.5, 1.5);
        border-top-color: var(--color-contrast-lower);
      }
    }
  }
}
</style>
