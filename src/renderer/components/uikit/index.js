import AppButton from './AppButton.vue'
import AppCheckbox from './AppCheckbox.vue'
import AppCheckboxGroup from './AppCheckboxGroup.vue'
import AppForm from './AppForm.vue'
import AppFormItem from './AppFormItem.vue'
import AppIcon from './AppIcon.vue'
import AppInput from './AppInput.vue'
import AppMenu from './AppMenu.vue'
import AppMenuItem from './AppMenuItem.vue'
import AppSelect from './AppSelect.vue'
import AppInputTags from './AppInputTags.vue'
import AppPopper from './AppPopper.vue'
import AppTree from './AppTree/AppTree.vue'
import AppTreeNode from './AppTree/AppTreeNode.vue'

const components = [
  AppButton,
  AppCheckbox,
  AppCheckboxGroup,
  AppForm,
  AppFormItem,
  AppIcon,
  AppInput,
  AppMenu,
  AppMenuItem,
  AppSelect,
  AppInputTags,
  AppPopper,
  AppTree,
  AppTreeNode
]

export default {
  install (Vue, options = {}) {
    components.forEach(component => {
      Vue.component(component.name, component)
    })
  }
}
