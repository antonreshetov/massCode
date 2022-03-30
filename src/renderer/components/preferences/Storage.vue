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
        <AppButton @click="onMoveStorage">
          Move storage
        </AppButton>
        <AppButton @click="onOpenStorageFolder">
          Open storage
        </AppButton>
      </div>
      <div class="desc">
        To use sync services like iCloud Drive, Google Drive of Dropbox, simply
        move storage to the corresponding synced folders.
      </div>
    </AppFormItem>
    <AppFormItem label="Backup">
      <div class="preferences__form-item">
        <AppInput
          v-model="app.backupPath"
          :readonly="true"
          bordered
          size="small"
          class="preferences__input"
        />
        <AppButton @click="onMoveBackup">
          Change folder
        </AppButton>
        <AppButton @click="onBackup">
          Backup now
        </AppButton>
      </div>
      <div class="desc">
        Backup will be created automatically when massCode is running.
      </div>
      <h5>Backups</h5>
      <div
        ref="backup"
        class="backups"
      >
        <div
          v-for="(i, index) in backups"
          :key="index"
          class="backups__item"
        >
          <span class="backups__item-date">{{ i.label }}</span>
          <span
            class="backups__item-action"
            @click="onRestore(i.date)"
          >Restore</span>
        </div>
      </div>
    </AppFormItem>
    <AppFormItem label="Migrate">
      <div class="preferences__form-item">
        <AppButton @click="onOpenMigrateFolder">
          Open folder
        </AppButton>
      </div>
      <div class="desc">
        You can migrate from massCode v1, select the folder with old DB files.
      </div>
    </AppFormItem>
    <AppFormItem label="Count">
      {{ countText }}
    </AppFormItem>
  </AppForm>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { dialog } from '@@/lib'
import { ipcRenderer } from 'electron'
import PerfectScrollbar from 'perfect-scrollbar'
import db from '@@/lib/datastore'

export default {
  name: 'Storage',

  data () {
    return {
      ps: null
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapGetters('app', ['backups']),
    ...mapGetters('snippets', ['count']),
    ...mapGetters('folders', ['systemAliases']),
    storagePath: {
      get () {
        return this.app.storagePath
      },
      set (v) {
        this.$store.commit('app/SET_STORAGE_PATH', v)
      }
    },
    countText () {
      return this.count === 1
        ? `${this.count} snippet`
        : `${this.count} snippets`
    }
  },

  watch: {
    $route (route) {
      if (route.name === 'preferences') {
        this.getData()
      }
    }
  },

  created () {
    this.getData()
  },

  mounted () {
    this.initPS()
  },

  methods: {
    async onMoveStorage () {
      const dir = dialog.showOpenDialogSync({
        properties: ['openDirectory', 'createDirectory']
      })
      if (dir) {
        const path = dir[0]
        try {
          await db.move(path)
          this.$store.commit('app/SET_STORAGE_PATH', path)
        } catch (err) {
          ipcRenderer.send('message', {
            message: 'Error',
            type: 'error',
            detail: 'Folder already contains DB. Please select another folder.'
          })
        }
      }
    },
    onOpenStorageFolder () {
      const dir = dialog.showOpenDialogSync({
        properties: ['openDirectory']
      })
      if (dir) {
        const path = dir[0]
        db.import(path)
        this.$store.commit('app/SET_STORAGE_PATH', path)
        this.$store.dispatch('folders/getFolders')
        this.$store.dispatch('snippets/getSnippets')
        this.$store.dispatch('snippets/getSnippetsCount')
        this.$store.dispatch('tags/getTags')
      }
    },
    async onBackup () {
      await db.removeEarliestBackup()
      await db.backup()
      await this.$store.dispatch('app/getBackups')
      this.$nextTick(() => {
        this.ps.update()
      })
    },
    async onRestore (time) {
      const buttonId = dialog.showMessageBoxSync({
        message: 'Are you sure you want to restore for this timestamp?',
        detail:
          'During restore from backup, the current library will be overwritten.',
        buttons: ['Confirm', 'Cancel'],
        defaultId: 0,
        cancelId: 1
      })

      if (buttonId === 1) return

      await db.restoreFromBackup(time)
      this.updateData()
    },
    async onMoveBackup () {
      const dir = dialog.showOpenDialogSync({
        properties: ['openDirectory', 'createDirectory']
      })
      if (dir) {
        const path = dir[0]
        try {
          db.moveBackup(path)
          this.$store.commit('app/SET_BACKUP_PATH', path)
        } catch (err) {
          ipcRenderer.send('message', {
            message: 'Error',
            type: 'error',
            detail: 'asdsada'
          })
        }
      }
    },
    async onOpenMigrateFolder () {
      const dir = dialog.showOpenDialogSync({
        properties: ['openDirectory']
      })
      const path = dir ? dir[0] : null

      if (!path) return

      const buttonId = dialog.showMessageBoxSync({
        message: 'Are you sure you want to migrate from v1?',
        detail:
          'During migrate from old DB, the current library will be overwritten.',
        buttons: ['Confirm', 'Cancel'],
        defaultId: 0,
        cancelId: 1
      })

      if (buttonId === 1) return

      try {
        await db.migrate(path)
        this.$store.dispatch('folders/getFolders')
        this.$store.dispatch('snippets/getSnippets')
        this.$store.dispatch('snippets/getSnippetsCount')
        this.$store.dispatch('tags/getTags')
      } catch (err) {
        dialog.showMessageBoxSync({
          title: 'Error',
          message: 'DB files not exist in this folder',
          type: 'error'
        })
      }
    },
    async updateData () {
      this.$store.dispatch('snippets/setSelected', null)
      this.$store.dispatch(
        'folders/setSelectedFolderById',
        this.systemAliases.allSnippets
      )
      this.$store.dispatch('folders/getFolders')
      this.$store.dispatch('snippets/getSnippets')
      this.$store.dispatch('snippets/getSnippetsCount')
      this.$store.dispatch('tags/getTags')
    },
    getData () {
      this.$store.dispatch('app/getBackups')
      this.$store.dispatch('snippets/getSnippetsCount')
    },
    initPS () {
      this.ps = new PerfectScrollbar(this.$refs.backup)
    }
  }
}
</script>

<style lang="scss">
.backups {
  // margin-top: var(--spacing-sm);
  border: 1px solid var(--color-border);
  max-width: 300px;
  height: 120px;
  padding: 2px var(--spacing-xs);
  position: relative;
  &__item {
    padding: 4px 0;
    display: flex;
    justify-content: space-between;
    -webkit-user-select: none;
    font-size: var(--text-sm);
    span {
      + span {
        margin-left: var(--spacing-xs);
      }
    }
    &-count {
      flex-grow: 1;
    }
    &-action {
      color: var(--color-contrast-medium);
      cursor: default;
      &:hover {
        color: var(--color-text);
      }
    }
  }
}
</style>
