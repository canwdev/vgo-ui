import type { ComputedRef, SVGAttributes, TransitionProps, VNode } from 'vue'

/**
 * 与主题无关的菜单结构常量。
 *
 * 外观相关的取值一律走 `--vgo-*` 令牌，不要在这里加颜色。
 */
export const MENU_CONST_OPTIONS = {
  defaultDirection: 'br',
  defaultMinWidth: 100,
  defaultMaxWidth: 600,
  defaultZIndex: 100,
  defaultZoom: 1,
  defaultAdjustPadding: { x: 0, y: 10 },
  defaultSubMenuOpenDelay: 200,
} as const

/** 菜单相对弹出锚点的方向：上/下 × 左/中/右。 */
export type MenuPopDirection = 'br' | 'b' | 'bl' | 'tr' | 't' | 'tl' | 'l' | 'r'

export type MenuChildren = MenuItem[]

/**
 * 函数式菜单实例（`ContextMenu.showContextMenu` 的返回值）。
 */
export interface ContextMenuInstance {
  /**
   * 关闭当前菜单。
   * @param fromItem 最后点击的菜单项，会原样传给 `MenuOptions.onClose`；没有点击项时为 `undefined`。
   */
  closeMenu: (fromItem?: MenuItem) => void
  /** 当前菜单是否已关闭。 */
  isClosed: () => boolean
  /** 获取根子菜单实例；菜单未显示时返回 `undefined`。 */
  getMenuRef: () => ContextSubMenuInstance | undefined
  /** 获取根菜单尺寸（像素）；菜单未显示时全为 0。 */
  getMenuDimensions: () => { width: number, height: number }
}

/**
 * 子菜单实例，可通过 `ContextMenuInstance.getMenuRef()` 或 `MenuItemContext.getSubMenuInstance()` 拿到。
 */
export interface ContextSubMenuInstance {
  /** 子菜单最外层元素。 */
  getSubmenuRoot: () => HTMLElement | undefined
  /** 子菜单内容容器（承载所有菜单项）。 */
  getMenu: () => HTMLElement | undefined
  /**
   * 按数组下标获取菜单项控制实例。
   * 只有父级子菜单已经显示后，子项才可被取到。
   */
  getChildItem: (index: number) => MenuItemContext | undefined
  /** 子菜单根元素尺寸（像素）。 */
  getMenuDimensions: () => { width: number, height: number }
  /** 当前滚动位置（等同 `element.scrollTop`）。 */
  getScrollValue: () => number
  /** 设置滚动位置（等同 `element.scrollTop`）。 */
  setScrollValue: (value: number) => void
  /** 内容总高度（等同 `element.scrollHeight`）。 */
  getScrollHeight: () => number
  /** 手动重新计算位置与可滚动高度，通常在菜单内容变化后调用。 */
  adjustPosition: () => void
  /** 当前允许的最大高度。 */
  getMaxHeight: () => number
  /** 当前相对父项的位置。 */
  getPosition: () => { x: number, y: number }
  /** 设置相对父项的位置。 */
  setPosition: (x: number, y: number) => void
}

/** `ContextMenuGroup` 组件 ref。 */
export interface ContextMenuGroupRef {
  /** 该分组对应的子菜单实例。 */
  getSubMenuRef: () => ContextSubMenuInstance
  /** 该分组对应的菜单项实例。 */
  getMenuItemRef: () => ContextSubMenuInstance
}

/**
 * 菜单项内部控制实例，用于键盘导航与联动。
 */
export interface MenuItemContext {
  /** 当前展开的子菜单实例；未展开时为 `undefined`。 */
  getSubMenuInstance: () => ContextSubMenuInstance | undefined
  /** 展开本项的子菜单，返回是否处理成功。 */
  showSubMenu: () => boolean
  /** 强制收起本项的子菜单。 */
  hideSubMenu: () => void
  /** 本项对应的 DOM 元素。 */
  getElement: () => HTMLElement | undefined
  /** 本项是否被禁用或隐藏。 */
  isDisabledOrHidden: () => boolean
  /** 标记为键盘焦点。 */
  focus: () => void
  /** 取消键盘焦点。 */
  blur: () => void
  /** 触发点击。 */
  click: (e: MouseEvent | KeyboardEvent) => void
}

export interface MenuOptions {
  /** 菜单项。 */
  items?: MenuItem[]
  /** 菜单显示位置的 x 坐标。 */
  x: number
  /** 菜单显示位置的 y 坐标。 */
  y: number
  /**
   * 菜单相对坐标点的弹出方向。
   *
   * 默认 `'br'`；`adjustPosition` 为 true 时会根据到屏幕边缘的距离自动翻转。
   *
   * @default 'br'
   */
  direction?: MenuPopDirection
  /** 菜单层级。 */
  zIndex?: number
  /** 菜单缩放。 */
  zoom?: number
  /** 自定义类名，挂在菜单根元素上。 */
  customClass?: string
  /**
   * 兼容位，当前实现忽略此选项。
   *
   * 菜单改用原生滚动容器，内容溢出时滚轮始终可用，不再需要开关。
   *
   * @deprecated 保留仅为兼容旧调用，传什么都不影响行为。
   */
  mouseScroll?: boolean
  /**
   * 外观主题开关。vgo-ui 的明暗由 `html.dark` 与 `--vgo-*` 令牌决定，
   * 这里只保留一个兼容位：
   *
   * - 取值包含 `dark`（如 `'dark'`、`'flat dark'`）→ 菜单强制使用暗色一套；
   * - 其他取值（旧主题名 `'flat'` / `'win10'` / `'mac'` / `'default'` 等）→ 跟随页面主题。
   *
   * 也就是说，旧项目的 `theme: 'flat dark'` 仍可直接迁移，不必改写调用处。
   */
  theme?: string
  /** 命中该 class 的元素上发生的点击会被忽略（不关闭菜单、不触发菜单项）。 */
  ignoreClickClassName?: string
  /**
   * 点击菜单外部时是否关闭菜单。
   *
   * @default true
   */
  clickCloseOnOutside?: boolean
  /** 命中该 class 的点击会关闭整个菜单。 */
  clickCloseClassName?: string
  /**
   * 自定义图标字体类名（全局）。
   *
   * 仅对字体图标有效；使用 svg 图标时无需设置。
   */
  iconFontClass?: string
  /** 菜单显示/隐藏时使用的 Vue Transition props。 */
  menuTransitionProps?: TransitionProps
  /**
   * 是否为无图标的菜单项保留固定宽度的图标占位（全局）。
   *
   * @default true
   */
  preserveIconWidth?: boolean
  /**
   * 是否允许键盘控制菜单。
   *
   * 默认开启，行为与 Windows 右键菜单一致：
   * `Escape` 关闭、`Enter` 点击当前项、`ArrowDown`/`ArrowUp` 上下移动、
   * `ArrowLeft` 返回上级、`ArrowRight` 展开子菜单、`Home`/`End` 跳到首/末项。
   *
   * @default true
   */
  keyboardControl?: boolean
  /** 主菜单最大宽度（像素）。 */
  maxWidth?: number
  /** 主菜单最大高度（像素）。 */
  maxHeight?: number
  /** 主菜单最小宽度（像素）。 */
  minWidth?: number
  /**
   * 关闭时是否销毁菜单。
   *
   * @default true
   */
  destroyOnClose?: boolean
  /**
   * 已有子菜单展开时，悬停到另一个含子项的菜单项后延迟打开子菜单的毫秒数。
   * 设为 0 表示立即打开。
   *
   * @default 200
   */
  subMenuOpenDelay?: number
  /**
   * 用户滚动页面时是否关闭菜单。
   *
   * @default true
   */
  closeWhenScroll?: boolean
  /**
   * 子菜单位置微调的内边距。
   *
   * @default { x: 0, y: 10 }
   */
  adjustPadding?: { x: number, y: number } | number
  /**
   * 是否自动调整菜单位置以避免溢出容器。
   *
   * @default true
   */
  adjustPosition?: boolean
  /**
   * 菜单的挂载节点。
   *
   * 挂载到自定义容器后，`x` / `y` 变成到容器左上角的距离，
   * 容器需要 `position: relative;`。此时可配合
   * `ContextMenu.transformMenuPosition` 换算坐标。
   */
  getContainer?: HTMLElement | (() => HTMLElement)
  /**
   * 菜单关闭时触发（函数式菜单常用）。
   * @param lastClickItem 最后点击的菜单项；没有点击项时为 `undefined`。
   */
  onClose?: (lastClickItem: MenuItem | undefined) => void
  /**
   * `clickCloseOnOutside` 为 `false` 时，点击菜单外部触发此事件。
   */
  onClickOnOutside?: (e: MouseEvent) => void
  /** `MenuBar` 组件用：左右方向键在菜单栏项目间移动。 */
  onKeyFocusMoveLeft?: () => void
  /** `MenuBar` 组件用：左右方向键在菜单栏项目间移动。 */
  onKeyFocusMoveRight?: () => void
}

export interface MenuItem {
  /**
   * 菜单项文字。
   *
   * 也可以是回调，用 `h` 渲染自定义内容：
   *
   * ```ts
   * { label: h('div', { style: { color: '#f98' } }, 'custom') }
   * ```
   */
  label?: string | VNode | ((label: string) => VNode)
  /** 菜单项图标。 */
  icon?: string | VNode | ((icon: string) => VNode)
  /**
   * 自定义图标字体类名。
   *
   * 仅对字体图标有效；使用 svg 图标时无需设置。
   */
  iconFontClass?: string
  /**
   * 是否为无图标的菜单项保留固定宽度的图标占位（本项）。
   *
   * 默认继承 `MenuOptions.preserveIconWidth`。
   */
  preserveIconWidth?: boolean
  /** 使用 svg symbol（`<use xlink:href="#name">`）作为图标，`icon` 为空时生效。 */
  svgIcon?: string
  /** 使用 `svgIcon` 时传给 svg 标签的自定义属性。 */
  svgProps?: SVGAttributes
  /** 是否禁用。 */
  disabled?: boolean | ComputedRef<boolean>
  /** 是否隐藏。 */
  hidden?: boolean | ComputedRef<boolean>
  /**
   * 是否勾选。
   *
   * 勾选标记显示在图标左侧，所以不建议同时显示图标。
   */
  checked?: boolean | ComputedRef<boolean>
  /**
   * 右侧显示的快捷键文本。
   *
   * 这里只负责显示，按键处理需要业务自己完成。
   */
  shortcut?: string
  /**
   * 子菜单相对本项的弹出方向。
   *
   * 默认继承 `MenuOptions.direction`。
   */
  direction?: MenuPopDirection
  /**
   * 是否自动调整子菜单位置以避免溢出容器。
   *
   * 默认继承 `MenuOptions.adjustPosition`。
   */
  adjustSubMenuPosition?: boolean
  /** 本项含子菜单时，是否仍允许触发自身点击，默认 false。 */
  clickableWhenHasChildren?: boolean
  /** 点击本项后是否关闭菜单。 */
  clickClose?: boolean
  /**
   * 是否与相邻菜单项分隔。
   *
   * - `true` / `'down'`：在本项下方显示分隔线；
   * - `'up'`：在本项上方显示分隔线；
   * - `'self'`：本项自身就是一条分隔线；
   * - `false`：不显示。
   */
  divided?: boolean | 'up' | 'down' | 'self'
  /** 子菜单自定义类名。 */
  customClass?: string
  /** 子菜单最大高度（像素）。 */
  maxHeight?: number
  /** 子菜单最大宽度（像素或 CSS 长度）。 */
  maxWidth?: number | string
  /** 子菜单最小宽度（像素或 CSS 长度）。 */
  minWidth?: number | string
  /**
   * 菜单项元素的自定义属性。
   *
   * ```ts
   * { attrs: { 'data-test-id': 'menu-item-1' } }
   * ```
   */
  attrs?: Record<string, unknown>
  /**
   * 菜单项点击事件。
   *
   * @param e 触发点击或键盘确认的事件
   */
  onClick?: (e?: MouseEvent | KeyboardEvent) => void
  /**
   * 本项子菜单收起时触发。
   *
   * @param itemInstance 本项实例；顶层为 `undefined`。
   */
  onSubMenuClose?: (itemInstance?: MenuItemContext) => void
  /**
   * 本项子菜单展开时触发。
   *
   * @param itemInstance 本项实例；顶层为 `undefined`。
   */
  onSubMenuOpen?: (itemInstance?: MenuItemContext) => void
  /** 自定义渲染当前菜单项。 */
  customRender?: VNode | ((item: MenuItem) => VNode)
  /** 子菜单项（函数式菜单中使用）。 */
  children?: MenuChildren
}

export interface ContextMenuPositionData {
  x: number
  y: number
}

/** 自定义渲染插槽收到的数据。 */
export interface MenuItemRenderData extends Omit<MenuItem, 'children' | 'customRender' | 'onClick'> {
  /** 当前菜单是暗色还是亮色。 */
  theme: 'light' | 'dark'
  /** 当前子菜单是否展开。 */
  isOpen: boolean
  /** 当前项是否含子菜单。 */
  hasChildren: boolean
  /** 供自定义元素绑定的点击回调（菜单内部事件）。 */
  onClick: (e: MouseEvent) => void
  /** 供自定义元素绑定的 mouseenter 回调（菜单内部事件）。 */
  onMouseEnter: (e: MouseEvent) => void
}

/**
 * `MenuBar` 组件的配置：`MenuOptions` 去掉定位相关字段，加上菜单栏自己的开关。
 */
export interface MenuBarOptions extends Omit<MenuOptions, 'x' | 'y' | 'getContainer'> {
  /**
   * 是否折叠为单项菜单。
   *
   * @default false
   */
  mini?: boolean
  /**
   * 折叠状态下主菜单的弹出方向。
   *
   * @default 'bl'
   */
  barPopDirection?: MenuPopDirection
}
