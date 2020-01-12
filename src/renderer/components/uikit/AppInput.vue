<template>
  <div
    :class="{
      'app-input': type !== 'textarea',
      'app-textarea': type === 'textarea',
      'app-input--prefix': $slots.prefix,
      'app-input--suffix': $slots.suffix,
      'app-input--prepend': $slots.prepend,
      'app-input--append': $slots.append
    }"
  >
    <div
      v-if="$slots.prefix && type !== 'textarea'"
      class="app-input__prefix"
    >
      <slot name="prefix" />
    </div>
    <div
      v-if="$slots.suffix && type !== 'textarea'"
      class="app-input__suffix"
    >
      <slot name="suffix" />
    </div>
    <div
      v-if="$slots.prepend && type !== 'textarea'"
      class="app-input__prepend"
    >
      <slot name="prepend" />
    </div>
    <input
      v-if="type !== 'textarea'"
      ref="input"
      :name="name"
      :type="type"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :max="max"
      :min="min"
      :autocomplete="[autocomplete ? 'off' : 'on']"
      class="app-input__inner"
      @input="onInput"
    >
    <textarea
      v-else
      ref="input"
      :name="name"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :value="value"
      :rows="rows"
      class="app-textarea__inner"
      @input="onInput"
    />
    <div
      v-if="this.$slots.append && type !== 'textarea'"
      class="app-input__append"
    >
      <slot name="append" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppInput',

  model: {
    prop: 'value',
    event: 'input'
  },

  props: {
    type: {
      type: String,
      default: 'text'
    },
    value: {
      type: [String, Number],
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    },
    autocomplete: {
      type: Boolean,
      default: false
    },
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    rows: {
      type: Number,
      default: 3
    }
  },

  methods: {
    onInput (e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>

<style lang="scss">
@import '../../assets/scss/mixins';

.app-input {
  $r: &;
  display: inline-block;
  position: relative;
  width: 100%;
  &__inner {
    position: relative;
    width: 100%;
    @include form-input-default();
    padding: 0 var(--spacing-xs);
    &[disabled] {
      background-color: var(--color-contrast-lower);
      color: var(--color-contrast-medium);
    }
    &[type='number'] {
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
      }
    }
  }
  &__prefix,
  &__suffix {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  &__prefix {
    left: 0;
  }
  &__suffix {
    right: 0;
  }
  &__prepend {
    display: table-cell;
    position: relative;
    width: 1px;
    white-space: nowrap;
  }
  &__append {
    display: table-cell;
    position: relative;
    width: 1px;
    white-space: nowrap;
  }
  &--prefix {
    #{$r}__inner {
      padding-left: 40px;
    }
  }
  &--suffix {
    #{$r}__inner {
      padding-right: 40px;
    }
  }
  &--prepend {
    display: inline-table;
    border-collapse: separate;
    #{$r}__inner {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
  &--append {
    display: inline-table;
    border-collapse: separate;
    #{$r}__inner {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
  &--small {
    #{$r}__inner {
      height: 32px;
    }
  }
  &[ghost] {
    #{$r}__inner {
      border: 1px solid transparent;
    }
  }
}

.app-textarea {
  &__inner {
    @include form-input-default();
    padding: 5px 15px;
    height: auto;
    line-height: 1.5;
    resize: vertical;
    &[disabled] {
      cursor: no-drop;
    }
  }
}
</style>
