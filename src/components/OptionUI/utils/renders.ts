import type { QuickOptionItem } from '../../QuickOptions/enum'
import { h } from 'vue'
import DropdownMenu from '../../QuickOptions/DropdownMenu.vue'

export function renderDropdownMenu(options: QuickOptionItem[] = [], props?) {
  return h(DropdownMenu, { options, props })
}
