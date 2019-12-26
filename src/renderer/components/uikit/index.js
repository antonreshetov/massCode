import AppIcon from './AppIcon.vue'
import AppInput from './AppInput.vue'

const components = [AppIcon, AppInput]

export default {
  install (Vue, options = {}) {
    components.forEach(component => {
      Vue.component(component.name, component)
    })
  }
}
