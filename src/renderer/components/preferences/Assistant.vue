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

export default {
  name: 'Assistant',

  data () {
    return {
      assistant: this.$electronStore.get('preferences.assistant.enable'),
      shortcut: this.$electronStore.get('preferences.assistant.shortcut'),
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
        this.$electronStore.set('preferences.assistant.enable', v)

        ipcRenderer.send('preferences:assistant', v)
      }
    }
  },

  watch: {
    shortcut (newVal) {
      const old = this.$electronStore.get('preferences.assistant.shortcut')
      if (old !== newVal) {
        this.disabled = false
      } else {
        this.disabled = true
      }
    }
  },

  methods: {
    onApply () {
      const old = this.$electronStore.get('preferences.assistant.shortcut')
      this.$electronStore.set('preferences.assistant.shortcut', this.shortcut)
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
