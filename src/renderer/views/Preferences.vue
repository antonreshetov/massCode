<template>
  <div class="preferences">
    <div class="preferences__wrapper">
      <div class="preferences__header">
        <h3>Preferences</h3>
        <AppIcon
          class="close"
          name="x"
          @click="close"
        />
      </div>
      <div class="preferences__body">
        <AppMenu v-model="active">
          <AppMenuItem
            label="Storage"
            value="storage"
          >
            <Storage v-if="active === 'storage'" />
          </AppMenuItem>
          <AppMenuItem
            label="Interface"
            value="interface"
          >
            <AppForm>
              <Interface v-if="active === 'interface'" />
            </AppForm>
          </AppMenuItem>

          <AppMenuItem
            label="Editor"
            value="editor"
          >
            <Editor v-if="active == 'editor'" />
          </AppMenuItem>
          <AppMenuItem
            label="Assistant"
            value="assistant"
          >
            <Assistant v-if="active == 'assistant'" />
          </AppMenuItem>
        </AppMenu>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Storage from '@/components/preferences/Storage.vue'
import Interface from '@/components/preferences/Interface.vue'
import Assistant from '@/components/preferences/Assistant.vue'
import Editor from '@/components/preferences/Editor.vue'

export default {
  name: 'Preferences',

  components: {
    Storage,
    Interface,
    Assistant,
    Editor
  },

  data () {
    return {
      active: 'storage'
    }
  },

  computed: {
    ...mapState(['app'])
  },

  created () {
    document.addEventListener('keydown', e => {
      if (e.keyCode === 27) {
        if (this.$route.name === 'preferences') {
          this.close()
        }
      }
    })
  },

  methods: {
    close () {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss">
.preferences {
  background-color: var(--color-bg);
  height: 100vh;
  overflow: hidden;
  &__wrapper {
    padding-top: var(--title-bar-height);
    padding: 0 var(--spacing-lg);
    margin: 0 auto;
    max-width: 1200px;
  }
  &__header {
    height: var(--menu-header);
    display: flex;
    align-items: center;
    justify-content: space-between;
    .close {
      &:hover {
        svg {
          stroke: var(--color-contrast-high);
        }
      }
      svg {
        width: 18px;
        height: 18px;
        stroke: var(--color-contrast-medium);
      }
    }
  }
  &__input {
    // &.app-input {
    //   width: 300px;
    //   margin-right: var(--spacing-sm);
    // }
  }
  &__form {
    &-item {
      display: flex;
    }
  }
  &__body {
  }
  .app-input {
    width: 300px;
    margin-right: var(--spacing-sm);
  }
}
</style>
