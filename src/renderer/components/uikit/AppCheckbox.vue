<template>
  <div class="app-checkbox">
    <label
      :class="{
        'app-checkbox--checked': isChecked,
        'app-checkbox--disabled': disabled
      }"
      class="app-checkbox"
    >
      <input
        :id="`app-checkbox-${_uid}`"
        :checked="isChecked"
        :name="name"
        :disabled="disabled"
        :value="value"
        type="checkbox"
        @change="onChange"
      >
      <div class="app-checkbox__inner">
        <AppIcon
          v-if="isChecked"
          name="check"
        />
      </div>
      <span class="app-checkbox__label">
        <span v-if="label">{{ label }}</span>
        <slot v-else />
      </span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'AppCheckbox',

  model: {
    prop: 'checked',
    event: 'change'
  },

  props: {
    checked: Boolean,
    value: {
      type: [String, Number, Boolean],
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    isGroup () {
      return this.$parent.$options.name === 'AppCheckboxGroup'
    },
    isChecked () {
      if (!this.isGroup) return this.checked
      if (this.$parent.modelValue) {
        if (typeof this.value === 'object') {
          return !!this.$parent.modelValue.find(
            item => item.id === this.value.id
          )
        }
        if (typeof this.value === 'string' || typeof this.value === 'number') {
          return !!this.$parent.modelValue.find(item => item === this.value)
        }
      }
      return false
    }
  },

  methods: {
    onChange () {
      if (this.disabled) return
      if (!this.isGroup) return this.$emit('change', !this.checked)

      if (!this.isChecked) {
        this.$parent.value.push(this.value)
      } else {
        this.$parent.value.find(item => {
          if (typeof this.value === 'object') {
            this.$nextTick(() => {
              if (item.id === this.value.id) { this.$parent.value.splice(this.$parent.value.indexOf(item), 1) }
            })
          }
          if (
            typeof this.value === 'string' ||
            typeof this.value === 'number'
          ) {
            this.$nextTick(() => {
              if (item === this.value) { this.$parent.value.splice(this.$parent.value.indexOf(item), 1) }
            })
          }
        })
      }
    }
  }
}
</script>

<style lang="scss">
.app-checkbox {
  $r: &;
  font-size: 14px;
  cursor: pointer;
  display: inline-table;
  + #{$r} {
    margin-left: 10px;
  }
  &--checked {
    svg {
      width: 12px;
      height: 12px;
      stroke: var(--color-contrast-high);
    }
    #{$r}__inner {
      background-color: var(--color-contrast-low);
    }
    &#{$r}--bordered {
      border-color: var(--color-primary);
    }
    &#{$r}--disabled {
      #{$r}__inner {
        border-color: var(--color-contrast-medium);
      }
    }
  }
  &--disabled {
    cursor: no-drop;
    #{$r}__inner {
      background-color: var(--color-contrast-medium);
      cursor: no-drop;
    }
    #{$r}__label {
      color: var(--color-contrast-medium);
    }
  }
  &:last-of-type {
    margin-right: 0;
  }
  &__label {
    display: table-cell;
    width: 100%;
    -webkit-user-select: none;
  }
  &__inner {
    top: 1px;
    width: 14px;
    height: 14px;
    margin-right: 5px;
    border: 1px solid var(--color-contrast-low);
    border-radius: 3px;
    position: relative;
    cursor: pointer;
    display: inline-block;
    margin-right: 10px;
  }
  input {
    display: none;
  }
}
</style>
