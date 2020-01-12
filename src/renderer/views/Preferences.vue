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
            <AppForm>
              <AppFormItem label="Location">
                <div class="preferences__form-item">
                  <AppInput
                    v-model="storagePath"
                    :readonly="true"
                    bordered
                    size="small"
                    class="preferences__input"
                  />
                  <AppButton @click="onChangeStorage">
                    Move storage
                  </AppButton>
                  <AppButton @click="onOpenStorage">
                    Open storage
                  </AppButton>
                </div>
                <div class="desc">
                  To use sync services like iCloud Drive, Google Drive of
                  Dropbox, simply move storage to the corresponding synced
                  folders.
                </div>
              </AppFormItem>
            </AppForm>
          </AppMenuItem>
          <AppMenuItem
            label="Interface"
            value="interface"
          >
            <AppForm>
              <AppFormItem label="Theme">
                <AppSelect
                  v-model="themeSelected"
                  :options="themes"
                />
              </AppFormItem>
            </AppForm>
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
import { mapState, mapGetters } from 'vuex'
import { dialog } from '@@/lib'
import db from '@/datastore'
import { defaultLibraryQuery } from '@/util/helpers'
import Assistant from '@/components/preferences/Assistant.vue'

export default {
  name: 'Preferences',

  components: {
    Assistant
  },

  data () {
    return {
      active: 'storage',
      themes: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' }
      ]
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapGetters('folders', ['selectedId', 'selectedIds']),
    storagePath: {
      get () {
        return this.app.storagePath
      },
      set (v) {
        this.$store.commit('app/SET_STORAGE_PATH', v)
      }
    },
    themeSelected: {
      get () {
        return this.app.theme
      },
      set (v) {
        this.$store.dispatch('app/setTheme', v)
      }
    }
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
    async onChangeStorage () {
      const dir = dialog.showOpenDialogSync({
        properties: ['openDirectory', 'createDirectory']
      })
      if (dir) {
        db.move(dir[0])
        this.updateData()
      }
    },
    async onOpenStorage () {
      const dir = dialog.showOpenDialogSync({
        properties: ['openDirectory']
      })
      if (dir) {
        db.import(dir[0])
        this.updateData()
      }
    },
    async updateData () {
      await this.$store.dispatch('folders/getFolders')
      const defaultQuery = { folderId: { $in: this.selectedIds } }
      const query = defaultLibraryQuery(defaultQuery, this.selectedId)
      await this.$store.dispatch('snippets/getSnippets', query)
    },
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
  &__wrapper {
    padding-top: var(--title-bar-height);
    padding: 0 var(--spacing-lg);
    margin: 0 auto;
    max-width: 1200px;
  }
  &__header {
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
    &.app-input {
      width: 300px;
      margin-right: var(--spacing-sm);
    }
  }
  &__form {
    &-item {
      display: flex;
    }
  }
  &__body {
  }
}
</style>
