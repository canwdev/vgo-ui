import './styles/core.scss'

// ---- Components ----

// AutoFormElPlus
export { default as AutoFormElPlus } from './components/AutoFormElPlus/AutoFormElPlus.vue'
export { default as AutoFormItem } from './components/AutoFormElPlus/AutoFormItem.vue'

// AutoFormElPlus（与组件同名的表单项类型请从 AutoFormSchema / 源码 types 推断）
export type {
  AutoFormRow,
  AutoFormSchema,
  MixedFormItems,
} from './components/AutoFormElPlus/types'
export { AutoFormItemType } from './components/AutoFormElPlus/types'

export type { AutoFormItem as AutoFormField } from './components/AutoFormElPlus/types'
// AutoTableElPlus
export { default as AutoTableElPlus } from './components/AutoTableElPlus/AutoTableElPlus.vue'

export { default as ListPagination } from './components/AutoTableElPlus/ListPagination/index.vue'
// AutoTableElPlus
export type { AutoTableColumn } from './components/AutoTableElPlus/types'
// ContextMenu：函数式（ContextMenu.showContextMenu）+ 组件式
export {
  ContextMenu,
  ContextMenuBar,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuRoot,
  ContextMenuSeparator,
  ContextSubMenu,
} from './components/ContextMenu'
// ContextMenu
export type {
  ContextMenuGroupRef,
  ContextMenuInstance,
  ContextMenuPositionData,
  ContextSubMenuInstance,
  MenuBarOptions,
  MenuChildren,
  MenuInteraction,
  MenuItem,
  MenuItemContext,
  MenuItemRenderData,
  MenuOptions,
  MenuPopDirection,
} from './components/ContextMenu'
export { default as ModalWindow } from './components/ModalWindow/ModalWindow.vue'

export type {
  ModalWindowButton,
  ModalWindowContext,
  ModalWindowHandle,
  ModalWindowOptions,
  ModalWindowRender,
} from './components/ModalWindow/show'

export { showModalWindow } from './components/ModalWindow/show'
// OptionUI
export type { VgoOptionItem, VgoSelectItem } from './components/OptionUI/types'

export { VgoOptionType } from './components/OptionUI/types'

// ---- Types ----

export { default as ItemAction } from './components/OptionUI/ItemAction.vue'

export { default as OptionItem } from './components/OptionUI/OptionItem.vue'
// OptionUI
export { default as OptionUI } from './components/OptionUI/OptionUI.vue'
// Transitions
export { default as TransitionBodyCollapse } from './components/Transitions/TransitionBodyCollapse.vue'

// ViewPortWindow
export type { ILayout, LayoutRatios, StoredWindowState, WinOptions } from './components/ViewPortWindow/enum'
export { layoutList, LayoutPreset, loadWindowState, removeWindowState } from './components/ViewPortWindow/enum'
export { default as LayoutPreview } from './components/ViewPortWindow/LayoutPreview.vue'
// ViewPortWindow
export { default as ViewPortWindow } from './components/ViewPortWindow/ViewPortWindow.vue'
export { WindowController } from './components/ViewPortWindow/window-controller'

export type { OnMoveParams } from './components/ViewPortWindow/window-controller'

// VueRender
export { default as VueRender } from './components/VueRender.vue'

// WindowManager
export type {
  CloseGuard,
  ManagedWindow,
  OpenWindowOptions,
  WindowDockMenuLabels,
  WindowManager,
  WindowManagerOptions,
  WindowView,
} from './components/WindowManager/window-manager'
export { createWindowManager } from './components/WindowManager/window-manager'
export { default as WindowDock } from './components/WindowManager/WindowDock.vue'
export { default as WindowStack } from './components/WindowManager/WindowStack.vue'
// ---- Hooks ----
export { useBeforeUnload, useSaveShortcut, useUnSavedChanges } from './hooks/use-beforeunload'
export type {
  UseContextMenuTriggerOptions,
  UseContextMenuTriggerReturn,
} from './hooks/use-context-menu-trigger'
export { useContextMenuTrigger } from './hooks/use-context-menu-trigger'
export { rgbToHex, syncPrimaryColor, useElementPlusTheme } from './hooks/use-element-plus-theme'
