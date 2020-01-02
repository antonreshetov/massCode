import AppIcon from './AppIcon.vue'
import AppInput from './AppInput.vue'
import AppMenu from './AppMenu.vue'
import AppMenuItem from './AppMenuItem.vue'
import AppButton from './AppButton.vue'
import AppForm from './AppForm.vue'
import AppFormItem from './AppFormItem.vue'
import AppSelect from './AppSelect.vue'

const components = [
  AppIcon,
  AppInput,
  AppMenu,
  AppMenuItem,
  AppButton,
  AppForm,
  AppFormItem,
  AppSelect
]

export default {
  install (Vue, options = {}) {
    components.forEach(component => {
      Vue.component(component.name, component)
    })
  }
}
