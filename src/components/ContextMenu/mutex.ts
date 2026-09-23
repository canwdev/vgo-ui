import type { ContextMenuInstance } from './types'

let currentOpenedContextMenu: ContextMenuInstance | null = null

/** 当前是否有菜单打开。 */
export function checkOpenedContextMenu(): boolean {
  return currentOpenedContextMenu !== null
}

/** 登记一个已打开的菜单，同时关闭上一个。 */
export function addOpenedContextMenu(instance: ContextMenuInstance): void {
  if (currentOpenedContextMenu)
    closeContextMenu()
  currentOpenedContextMenu = instance
}

/** 注销一个菜单（仅当它就是当前打开的那个）。 */
export function removeOpenedContextMenu(instance: ContextMenuInstance): void {
  if (instance === currentOpenedContextMenu)
    currentOpenedContextMenu = null
}

/** 关闭当前打开的菜单。 */
export function closeContextMenu(): void {
  if (currentOpenedContextMenu) {
    currentOpenedContextMenu.closeMenu()
    currentOpenedContextMenu = null
  }
}
