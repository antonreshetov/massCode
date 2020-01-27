<template>
  <AppFormItem label="Theme">
    <AppSelect
      v-model="themeSelected"
      :options="themes"
    />
  </AppFormItem>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Interface',

  data () {
    return {
      themes: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' }
      ]
    }
  },

  computed: {
    ...mapState(['app']),
    themeSelected: {
      get () {
        return this.app.theme
      },
      set (v) {
        this.$store.dispatch('app/setTheme', v)
      }
    }
  }
}
</script>

<style lang="scss"></style>
