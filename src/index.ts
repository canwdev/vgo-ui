// Styles
import './styles/base.scss'

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
// Layouts
export { default as FoldableSidebarLayout } from './components/Layouts/FoldableSidebarLayout.vue'

export { default as TabLayout } from './components/Layouts/TabLayout.vue'
// OptionUI
export type { StOptionItem, SwitchOption } from './components/OptionUI/enum'
export { StOptionType, swatches } from './components/OptionUI/enum'
export { default as ItemAction } from './components/OptionUI/ItemAction.vue'

export { default as OptionItem } from './components/OptionUI/OptionItem.vue'

// OptionUI
export { default as OptionUI } from './components/OptionUI/OptionUI.vue'
// Transitions
export { default as TransitionBodyCollapse } from './components/Transitions/TransitionBodyCollapse.vue'

// ---- Types ----

// ViewPortWindow
export type { ILayout, WinOptions } from './components/ViewPortWindow/enum'
export { layoutList, LayoutPreset } from './components/ViewPortWindow/enum'

export { default as LayoutHelper } from './components/ViewPortWindow/LayoutHelper.vue'

export { default as LayoutPreview } from './components/ViewPortWindow/LayoutPreview.vue'
// ViewPortWindow
export { default as ViewPortWindow } from './components/ViewPortWindow/ViewPortWindow.vue'
export { WindowController } from './components/ViewPortWindow/window-controller'

export type { OnMoveParams } from './components/ViewPortWindow/window-controller'

// VueRender
export { default as VueRender } from './components/VueRender.vue'
// ---- Hooks ----
export { useBeforeUnload, useSaveShortcut, useUnSavedChanges } from './hooks/use-beforeunload'
export { useElementPlusTheme } from './hooks/use-element-plus-theme'
