import DropdownMenu from '../../QuickOptions/DropdownMenu.vue'
import {QuickOptionItem} from '../../QuickOptions/enum'
import {h} from 'vue'

export const renderDropdownMenu = (options: QuickOptionItem[] = [], props?) => {
  return h(DropdownMenu, {options, props})
}
