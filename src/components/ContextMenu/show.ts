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
  // 每次弹出单独挂一个节点。宿主上如果反复 render 同一个组件类型，
  // Vue 会复用正在关闭的实例：closed 已经是 true，新菜单就再也不会出现。
  // 关动画结束时也只拆自己的节点，避免把后打开的菜单一起卸掉。
  const mount = document.createElement('div')
  mount.className = 'vgo-context-menu-mount'
  container.appendChild(mount)

  let disposed = false
  const dispose = () => {
    if (disposed)
      return
    disposed = true
    render(null, mount)
    mount.remove()
  }

  const vnode = h(ContextSubMenuWrapper, {
    options,
    show: true,
    container,
    useCustomContainer,
    onCloseAnimFinished: dispose,
    onClose: (item?: MenuItem) => {
      options.onClose?.(item)
    },
  }, customSlots)
  render(vnode, mount)
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
