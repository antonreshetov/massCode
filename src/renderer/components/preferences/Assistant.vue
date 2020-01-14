<template>
  <AppForm>
    <AppFormItem label="Appearance">
      <AppCheckbox
        v-model="isAssistant"
        :disabled="app.os !== 'darwin'"
      >
        Enable Assistant
      </AppCheckbox>
      <div class="desc">
        App Assistant lets you access snippets right from the Tray. (masOS only)
      </div>
    </AppFormItem>
    <AppFormItem label="Shortcut">
      <AppInput
        v-model="shortcut"
        class="preferences__input"
        :disabled="!assistant"
      />
      <AppButton
        :disabled="disabled"
        @click="onApply"
      >
        Apply
      </AppButton>
    </AppFormItem>
  </AppForm>
</template>

<script>
import { mapState } from 'vuex'
import { ipcRenderer } from 'electron'
import electronStore from '@@/store'

export default {
  name: 'Assistant',

  data () {
    return {
      assistant: electronStore.preferences.get('assistant'),
      shortcut: electronStore.preferences.get('assistantShortcut'),
      disabled: true
    }
  },

  computed: {
    ...mapState(['app']),
    isAssistant: {
      get () {
        return this.assistant
      },
      set (v) {
        this.assistant = v
        electronStore.preferences.set('assistant', v)

        ipcRenderer.send('preferences:assistant', v)
      }
    }
  },

  watch: {
    shortcut (newVal) {
      const old = electronStore.preferences.get('assistantShortcut')
      if (old !== newVal) {
        this.disabled = false
      } else {
        this.disabled = true
      }
    }
  },

  methods: {
    onApply () {
      const old = electronStore.preferences.get('assistantShortcut')
      electronStore.preferences.set('assistantShortcut', this.shortcut)
      ipcRenderer.send('preferences:assistant:shortcut', {
        old,
        new: this.shortcut
      })
      this.disabled = true
    }
  }
}
</script>

<style lang="scss"></style>
