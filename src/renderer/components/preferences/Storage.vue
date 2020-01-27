<template>
  <AppForm>
    <AppFormItem label="Storage">
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
        To use sync services like iCloud Drive, Google Drive of Dropbox, simply
        move storage to the corresponding synced folders.
      </div>
    </AppFormItem>
  </AppForm>
</template>

<script>
import { mapState } from 'vuex'
import { dialog } from '@@/lib'
import { ipcRenderer } from 'electron'
import db from '@/datastore'

export default {
  name: 'Storage',

  data () {
    return {}
  },

  computed: {
    ...mapState(['app']),
    storagePath: {
      get () {
        return this.app.storagePath
      },
      set (v) {
        this.$store.commit('app/SET_STORAGE_PATH', v)
      }
    }
  },

  methods: {
    async onChangeStorage () {
      const dir = dialog.showOpenDialogSync({
        properties: ['openDirectory', 'createDirectory']
      })
      if (dir) {
        const path = dir[0]
        try {
          await db.move(path)
          this.updateData()
          this.$store.commit('app/SET_STORAGE_PATH', path)
        } catch (err) {
          ipcRenderer.send('message', {
            message: 'Error',
            type: 'error',
            detail:
              'Folder already contains db files. Please select another folder.'
          })
        }
      }
    },
    async onOpenStorage () {
      const dir = dialog.showOpenDialogSync({
        properties: ['openDirectory']
      })
      if (dir) {
        const path = dir[0]
        db.import(path)
        this.updateData()
        this.$store.commit('app/SET_STORAGE_PATH', path)
      }
    },
    async updateData () {
      this.$store.dispatch('snippets/setSelected', null)
      this.$store.dispatch('folders/setSelectedFolder', 'allSnippets')
      await this.$store.dispatch('folders/getFolders')
      await this.$store.dispatch('snippets/getSnippets')
    }
  }
}
</script>

<style lang="scss"></style>
