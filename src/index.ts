import './styles/core.scss'

// ---- Components ----

// AutoFormElPlus
export { default as AutoFormElPlus } from './components/AutoFormElPlus/AutoFormElPlus.vue'
export { default as AutoFormItem } from './components/AutoFormElPlus/AutoFormItem.vue'

// AutoFormElPlus（与组件同名的表单项类型请从 AutoFormSchema / 源码 enum 推断）
export type {
  AutoFormRow,
  AutoFormSchema,
  IOptionItem,
  MixedFormItems,
} from './components/AutoFormElPlus/enum'
export { AutoFormItemType } from './components/AutoFormElPlus/enum'

export type { AutoFormItem as AutoFormField } from './components/AutoFormElPlus/enum'
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
  MenuItem,
  MenuItemContext,
  MenuItemRenderData,
  MenuOptions,
  MenuPopDirection,
} from './components/ContextMenu'
// OptionUI
export type { StOptionItem, SwitchOption } from './components/OptionUI/enum'

export { StOptionType, swatches } from './components/OptionUI/enum'

export { default as ItemAction } from './components/OptionUI/ItemAction.vue'
export { default as OptionItem } from './components/OptionUI/OptionItem.vue'

// OptionUI
export { default as OptionUI } from './components/OptionUI/OptionUI.vue'

// ---- Types ----

// Transitions
export { default as TransitionBodyCollapse } from './components/Transitions/TransitionBodyCollapse.vue'

// ViewPortWindow
export type { ILayout, WinOptions } from './components/ViewPortWindow/enum'
export { LayoutPreset } from './components/ViewPortWindow/enum'

export { default as LayoutPreview } from './components/ViewPortWindow/LayoutPreview.vue'
// ViewPortWindow
export { default as ViewPortWindow } from './components/ViewPortWindow/ViewPortWindow.vue'
export { WindowController } from './components/ViewPortWindow/window-controller'

export type { OnMoveParams } from './components/ViewPortWindow/window-controller'

// VueRender
export { default as VueRender } from './components/VueRender.vue'
// ---- Hooks ----
export { useBeforeUnload, useSaveShortcut, useUnSavedChanges } from './hooks/use-beforeunload'
export { rgbToHex, syncPrimaryColor, useElementPlusTheme } from './hooks/use-element-plus-theme'
