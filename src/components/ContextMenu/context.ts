import type { Ref, VNode } from 'vue'
import type { MenuItemContext } from './types'

/** 判断全局插槽是否存在。 */
export type GlobalHasSlot = (name: string) => boolean
/** 渲染全局插槽。 */
export type GlobalRenderSlot = (name: string, params: Record<string, unknown>) => VNode

/**
 * 子菜单实例侧的控制上下文，供键盘导航使用。
 */
export interface SubMenuContext {
  name: Ref<string>
  el: Ref<HTMLElement | undefined>
  /** 是否为最外层菜单。 */
  isTopLevel: () => boolean
  /** 收起自身并回到父级菜单。 */
  closeSelfAndActiveParent: () => boolean
  /** 展开当前项的子菜单。 */
  openCurrentItemSubMenu: () => boolean
  /** 收起当前子菜单。 */
  closeCurrentSubMenu: () => void
  /** 选中第一个可用项。 */
  moveCurrentItemFirst: () => void
  /** 选中最后一个可用项。 */
  moveCurrentItemLast: () => void
  /** 选中下一项。 */
  moveCurrentItemDown: () => void
  /** 选中上一项。 */
  moveCurrentItemUp: () => void
  /** 聚焦当前项。 */
  focusCurrentItem: () => void
  /** 触发当前项点击。 */
  triggerCurrentItemClick: (e: KeyboardEvent | MouseEvent) => void
}

/**
 * 父级子菜单提供给子级的上下文。根包装组件提供的是一份空实现。
 */
export interface SubMenuParentContext {
  /** 计算位置用的容器。 */
  container: HTMLElement
  zIndex: number
  adjustPadding: { x: number, y: number }

  // 位置控制
  getParentWidth: () => number
  getParentHeight: () => number
  getPosition: () => [number, number]
  getZoom: () => number

  // 子菜单互斥
  addOpenedSubMenu: (closeFn: () => void) => void
  closeOtherSubMenu: () => void
  closeOtherSubMenuWithTimeout: () => void
  checkCloseOtherSubMenuTimeout: () => boolean

  // 子菜单延迟打开
  openSubMenuWithDelay: (openFn: () => void, menuItemEl: HTMLElement) => void
  cancelPendingOpen: () => void

  // 菜单项控制
  addChildMenuItem: (item: MenuItemContext, index?: number) => void
  removeChildMenuItem: (item: MenuItemContext) => void
  markActiveMenuItem: (item: MenuItemContext, updateState?: boolean) => void
  markThisOpenedByKeyboard: () => void
  isOpenedByKeyboardFlag: () => boolean
  isMenuItemDataCollectedFlag: () => boolean

  // 其他
  getSubMenuInstanceContext: () => SubMenuContext | null
  getParentContext: () => SubMenuParentContext | null
  getElement: () => HTMLElement | null
}
