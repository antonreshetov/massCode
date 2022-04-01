<template>
  <div class="app-alert">
    <div class="app-alert__body">
      <p>Hi 👋, Anton here.</p>
      <p>
        I am excited to announce that a new version of
        <span
          class="link"
          @click="onOpenLink('https://github.com/massCodeIO/massCode')"
        >massCode</span>
        is in active development. The masCode v1 code base is obsolete and I
        decided to start from scratch. Please support the new repository with a
        star. 🙏
      </p>
      <p>
        Stay tuned on
        <span
          class="link"
          @click="onOpenLink('https://twitter.com/anton_reshetov')"
        >Twitter</span>.
      </p>
    </div>
    <div
      class="app-alert__close"
      @click="onClose"
    >
      <AppIcon name="x" />
    </div>
  </div>
</template>

<script>
import AppIcon from './AppIcon.vue'
import { shell } from 'electron'
import electronStore from '@@/store'

export default {
  name: 'AppAlert',

  components: {
    AppIcon
  },

  data () {
    return {}
  },

  methods: {
    onOpenLink (link) {
      shell.openExternal(link)
    },
    onClose () {
      this.$store.commit('app/SET_NEXT_VERSION_NOTIFY', true)
      electronStore.app.set('nextVersionNotify', true)
    }
  }
}
</script>

<style lang="scss">
.app-alert {
  position: absolute;
  bottom: 20px;
  right: 20px;
  &__body {
    width: 350px;
    background-color: var(--color-contrast-lower);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
  &__close {
    position: absolute;
    cursor: pointer;
    top: -26px;
    right: var(--spacing-xs);
    svg {
      width: 18px;
    }
  }
  p {
    line-height: 1.2rem;
  }
  .link {
    cursor: pointer;
    color: var(--color-primary);
    text-decoration: underline;
  }
}
</style>
