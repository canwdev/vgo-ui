import type { App, Slot } from 'vue'
import type { ContextMenuInstance, MenuItem, MenuOptions } from './types'
import { h, render } from 'vue'
import ContextMenuRoot from './ContextMenu.vue'
import ContextMenuGroup from './ContextMenuGroup.vue'
import ContextMenuItem from './ContextMenuItem.vue'
import ContextMenuSeparator from './ContextMenuSeparator.vue'
import ContextSubMenu from './ContextSubMenu.vue'
import ContextSubMenuWrapper from './ContextSubMenuWrapper.vue'
import { checkOpenedContextMenu, closeContextMenu } from './mutex'
import { genContainer, transformMenuPosition } from './utils'

declare module 'vue' {
  export interface ComponentCustomProperties {
    /**
     * 以函数方式弹出一个右键菜单，等同于 `ContextMenu.showContextMenu`。
     *
     * ```ts
     * this.$contextmenu({ x: e.x, y: e.y, items: [{ label: 'Open' }] })
     * ```
     */
    $contextmenu: (options: MenuOptions, customSlots?: Record<string, Slot>) => ContextMenuInstance
  }
}

function initInstance(
  options: MenuOptions,
  container: HTMLElement,
  useCustomContainer: boolean,
  customSlots?: Record<string, Slot>,
) {
  const vnode = h(ContextSubMenuWrapper, {
    options,
    show: true,
    container,
    useCustomContainer,
    onCloseAnimFinished: () => {
      render(null, container)
    },
    onClose: (item?: MenuItem) => {
      options.onClose?.(item)
    },
  }, customSlots)
  render(vnode, container)
  return vnode.component
}

/**
 * 以函数方式弹出一个右键菜单。
 *
 * ```ts
 * function onContextMenu(e: MouseEvent) {
 *   e.preventDefault()
 *   ContextMenu.showContextMenu({
 *     x: e.x,
 *     y: e.y,
 *     items: [
 *       { label: 'A menu item', onClick: () => alert('clicked') },
 *       { label: 'A submenu', children: [{ label: 'Item1' }, { label: 'Item2' }] },
 *     ],
 *   })
 * }
 * ```
 *
 * @param options 菜单配置
 * @param customSlots 自定义渲染插槽，与 `ContextMenuRoot` 组件的插槽一致
 * @returns 菜单实例
 */
export function showContextMenu(options: MenuOptions, customSlots?: Record<string, Slot>): ContextMenuInstance {
  const container = genContainer(options)
  const component = initInstance(options, container.container, !container.isNew, customSlots)
  return (component as unknown as { exposed: ContextMenuInstance }).exposed
}

/**
 * 右键菜单插件。
 *
 * ```ts
 * import { createApp } from 'vue'
 * import { ContextMenu } from '@canwdev/vgo-ui'
 *
 * createApp(App).use(ContextMenu)
 * ```
 */
const ContextMenu = {
  install(app: App): void {
    app.config.globalProperties.$contextmenu = showContextMenu
    app.component('ContextMenu', ContextMenuRoot)
    app.component('ContextMenuItem', ContextMenuItem)
    app.component('ContextMenuGroup', ContextMenuGroup)
    app.component('ContextMenuSeparator', ContextMenuSeparator)
    app.component('ContextSubMenu', ContextSubMenu)
  },
  showContextMenu,
  /** 当前是否有菜单打开。 */
  isAnyContextMenuOpen: checkOpenedContextMenu,
  /** 关闭当前打开的菜单。 */
  closeContextMenu,
  /** 把鼠标事件坐标换算成菜单坐标。 */
  transformMenuPosition,
}

export default ContextMenu
