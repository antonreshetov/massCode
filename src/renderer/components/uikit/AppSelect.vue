<template>
  <div class="app-select">
    <select
      ref="select"
      class="app-select__inner"
      :value="value"
      v-bind="$attrs"
      @change="onChange"
    >
      <option
        v-for="(i, index) in options"
        :key="index"
        :value="i.value"
      >
        {{ i.label }}
      </option>
    </select>
    <AppIcon
      class="chevron"
      name="chevron-down"
    />
  </div>
</template>

<script>
export default {
  name: 'AppSelect',

  props: {
    value: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {}
  },

  methods: {
    onChange (v) {
      const value = this.$refs.select.value
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="scss">
@import '../../assets/scss/mixins';

.app-select {
  position: relative;
  display: inline-block;
  &__inner {
    @include form-input-default();
    background-color: var(--color-bg);
    -webkit-appearance: none;
    border: 1px solid var(--color-border);
    padding: 0 calc(var(--spacing-lg)) 0 var(--spacing-sm);
    width: 200px;
  }
  .chevron {
    position: absolute;
    right: var(--spacing-xs);
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    svg {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
