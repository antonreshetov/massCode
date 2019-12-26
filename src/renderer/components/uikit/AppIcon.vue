<template>
  <span
    v-on="$listeners"
    v-html="icon"
  />
</template>

<script>
import feather from 'feather-icons'

export default {
  name: 'AppIcon',

  props: {
    name: {
      type: String,
      default: ''
    }
  },

  data () {
    return {}
  },

  computed: {
    icon () {
      if (!this.name) return
      return feather.icons[this.name].toSvg()
    }
  }
}
</script>

<style lang="scss" module></style>
