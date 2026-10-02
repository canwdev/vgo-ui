import type { ComputedRef, VNode } from 'vue'
import type { MenuOptions } from './types'
import { defineComponent, toRefs } from 'vue'
import { MENU_CONST_OPTIONS } from './types'

/**
 * 获取元素相对指定祖先（默认 body）的绝对 y 坐标。
 *
 * @param el 目标元素
 * @param stopNode 递归终止节点，默认到 body
 */
export function getOffsetTop(el: HTMLElement, stopNode?: HTMLElement): number {
  let offset = el.offsetTop
  if (el.offsetParent != null && el.offsetParent !== stopNode) {
    offset -= el.offsetParent.scrollTop
    offset += getOffsetTop(el.offsetParent as HTMLElement, stopNode)
  }
  return offset
}

/**
 * 获取元素相对指定祖先（默认 body）的绝对 x 坐标。
 *
 * @param el 目标元素
 * @param stopNode 递归终止节点，默认到 body
 */
export function getOffsetLeft(el: HTMLElement, stopNode?: HTMLElement): number {
  let offset = el.offsetLeft
  if (el.offsetParent != null && el.offsetParent !== stopNode) {
    offset -= el.offsetParent.scrollLeft
    offset += getOffsetLeft(el.offsetParent as HTMLElement, stopNode)
  }
  return offset
}

/**
 * 把鼠标事件的 offset 换算成菜单坐标。
 *
 * body 处于缩放状态（如 `transform: scale(0.5)`）时，直接用 `MouseEvent.x/y`
 * 会让菜单位置偏移，此时用本函数换算后再传给 `showContextMenu`。
 *
 * ```ts
 * const pos = transformMenuPosition(e.target as HTMLElement, e.offsetX, e.offsetY)
 * showContextMenu({ ...menuData, ...pos })
 * ```
 */
export function transformMenuPosition(
  el: HTMLElement,
  offsetX: number,
  offsetY: number,
  container?: HTMLElement,
): { x: number, y: number } {
  return {
    x: getOffsetLeft(el, container) + offsetX,
    y: getOffsetTop(el, container) + offsetY,
  }
}

/**
 * 标记「点击不应关闭菜单」的元素。分隔线用它，避免点在分隔线上就把菜单收掉。
 */
export const NO_CLICK_CLASS = 'vgo-context-menu__no-click'

// #region 触摸补发的 click 重定向

let touchStartTarget: HTMLElement | null = null
let touchStartTime = 0
const TOUCH_CLICK_WINDOW = 700

/**
 * 记录一次 touchstart 的落点。
 *
 * 触摸屏上 tap 之后浏览器会补发 mouseenter → mousedown → click。如果 mouseenter
 * 里展开了子菜单，而子菜单正好出现在手指下方，浏览器会把同一次 tap 的 click
 * 派发到**新出现的**那个菜单项上——叶子项的 `clickClose` 会顺手把整个菜单关掉。
 * 三级菜单在窄屏上最容易被翻转/夹回父菜单上，所以这个现象最常出现在三级。
 */
export function recordTouchStart(target: EventTarget | null): void {
  touchStartTarget = (target as HTMLElement | null) ?? null
  touchStartTime = Date.now()
}

/**
 * 这个 click 是不是触摸后被浏览器重定向了：click 的 target 和 touchstart 的
 * 落点不在同一条路径上。是的话忽略这次点击，菜单保持打开。
 */
export function isRetargetedTouchClick(e: MouseEvent): boolean {
  if (!touchStartTarget || Date.now() - touchStartTime > TOUCH_CLICK_WINDOW)
    return false
  const clickTarget = e.target as Node | null
  if (!clickTarget)
    return false
  const retargeted = !touchStartTarget.contains(clickTarget) && !clickTarget.contains(touchStartTarget)
  if (retargeted)
    touchStartTarget = null
  return retargeted
}

// #endregion

// #region 触摸输入标记

let lastTouchAt = 0

/**
 * 记录一次触摸输入。
 *
 * 触摸屏上 tap 之后浏览器会补发整套鼠标事件，而这些补发事件**可能出现在子菜单刚展开
 * 之后**：指针其实已经落在新展开的子菜单里，却先收到一个 `mouseleave`，于是
 * `subMenuCloseDelay` 一到就把刚打开的子菜单收掉（表现为「手机上点不开子菜单」）。
 *
 * 这种补发的 mouseleave 没法靠坐标区分：它的 clientX/clientY 是浏览器内部的指针位置，
 * 不一定等于 tap 点。所以改成认输入方式 —— 最近一次输入是触摸时，忽略紧随其后的
 * mouseleave 触发的延迟收起；真正的离开会由后续的鼠标事件（进入别的菜单项）重新排程。
 */
export function recordTouchInput(): void {
  lastTouchAt = Date.now()
}

/** 最近是否刚发生过触摸输入（补发的鼠标事件窗口内）。 */
export function isRecentTouchInput(window = 350): boolean {
  return Date.now() - lastTouchAt < window
}

// #endregion

const DEFAULT_CONTAINER_ID = 'vgo-menu-container'
const GENERATED_CONTAINER_ID = 'vgo-menu-container-'
let containerId = 0

/** 移除挂载容器。 */
export function removeContainer(container: HTMLElement): void {
  container.parentNode?.removeChild(container)
}

/**
 * 解析菜单挂载容器。未指定 `getContainer` 时复用同一个全屏容器。
 */
export function genContainer(options: MenuOptions): {
  eleId: string
  container: HTMLElement
  isNew: boolean
} {
  const { getContainer, zIndex } = options

  if (getContainer) {
    const container = typeof getContainer === 'function' ? getContainer() : getContainer
    if (container) {
      let eleId = container.getAttribute('id')
      if (!eleId) {
        eleId = GENERATED_CONTAINER_ID + (containerId++)
        container.setAttribute('id', eleId)
      }
      return {
        eleId,
        container,
        isNew: false,
      }
    }
  }

  let container = document.getElementById(DEFAULT_CONTAINER_ID)
  if (!container) {
    container = document.createElement('div')
    container.setAttribute('id', DEFAULT_CONTAINER_ID)
    container.setAttribute('class', 'vgo-context-menu-host')
    document.body.appendChild(container)
  }
  container.style.zIndex = zIndex?.toString() || MENU_CONST_OPTIONS.defaultZIndex.toString()
  return {
    eleId: DEFAULT_CONTAINER_ID,
    container,
    isNew: true,
  }
}

/** 简易字符串哈希，用于给匿名菜单项生成调试名。 */
export function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return hash
}

/** 数字转 px，字符串原样返回。 */
export function resolveSize(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value
}

// #region 边界回夹

/** `clampBoxToContainer` 的输入 / 输出。 */
export interface ClampBoxInput {
  /** 菜单左上角，容器坐标系。 */
  x: number
  y: number
  /** 菜单自然宽度，`0` 表示测不到（此时不做水平回夹）。 */
  width: number
  /** 菜单自然高度。 */
  height: number
  /** 可用区域宽度，已换算到容器坐标系。 */
  containerWidth: number
  /** 可用区域高度，已换算到容器坐标系。 */
  containerHeight: number
  /** 菜单不应越过的边距。 */
  margin: number
  /**
   * 菜单要避开的一段水平区间（父菜单占据的横向范围，容器坐标系）。
   *
   * 用来让子菜单不盖住父菜单：菜单会被放到这段区间的左侧或右侧，取
   * 「不压到父菜单 → 放得进可用区域 → 超出最少 → 离原位置最近」里最好的一个。
   * 省略（根菜单）时只按 `margin` 收口。
   */
  avoid?: { left: number, right: number }
  /**
   * 调用方要求的最大高度；`0` / 省略表示不限制。
   *
   * 宽度不需要传：菜单自己的 `max-width` 已经把 `offsetWidth` 压到上限了。
   */
  maxHeight?: number
  /**
   * 菜单**内容**的自然宽度（`scrollWidth`，未受 max-width 影响时测得）。
   *
   * 回夹把菜单夹得比它还窄就会冒出横向滚动条，所以窄到它为止。
   * `0` / 省略表示测不到，此时不据此判断。
   */
  minContentWidth?: number
}

/** `clampBoxToContainer` 的结果。 */
export interface ClampBoxResult {
  x: number
  y: number
  /** 回夹后允许的最大宽度；没有夹窄时为 `undefined`（沿用菜单自身的 max-width）。 */
  maxWidth?: number
  /** 回夹后允许的最大高度；没有夹矮时为 `undefined`。 */
  maxHeight?: number
}

/**
 * 把菜单回夹进可用区域。
 *
 * 定位算法只处理「从锚点往外弹」的溢出，剩下的三种情况由这里收口：
 *
 * - 菜单右 / 下越界：直接挪回来（翻转已经做过，这里只兜底）；
 * - 菜单比可用区域还宽 / 还高：没法靠挪位置解决，改为夹住尺寸让内容自己滚动；
 * - 菜单左 / 上越界：锚点本来就贴着边缘，退回可用区域内侧。
 *
 * 高度上优先保住菜单底部：放下不的时候先把顶部往上挪，让内容尽量留在可见区域里，
 * 只有挪到顶边仍然放不下才夹高度。
 *
 * 传了 `avoid` 时（子菜单用）：位置会压到父菜单上就不再按边距收口，改从父菜单的
 * 左侧或右侧摆开，取舍顺序是「不压父菜单 → 放得进可用区域 → 超出最少 → 离原位置近」。
 */
export function clampBoxToContainer(input: ClampBoxInput): ClampBoxResult {
  const { x, y, width, height, containerWidth, containerHeight, margin, avoid } = input
  const maxHeight = input.maxHeight ?? 0
  const minContentWidth = input.minContentWidth ?? 0

  // 可用区域比边距还窄时兜底成 0，避免算出负的尺寸
  const availableWidth = Math.max(0, containerWidth - margin * 2)
  const availableHeight = Math.max(0, containerHeight - margin * 2)

  const widthLimited = width > availableWidth
  const clampedMaxWidth = widthLimited && width > 0 ? availableWidth : 0
  const boxWidth = clampedMaxWidth || width

  const minX = margin
  const maxX = Math.max(minX, containerWidth - margin - boxWidth)
  let clampedX = Math.min(Math.max(x, minX), maxX)

  let clampedMaxWidthFromParent = 0
  if (avoid && avoid.right > avoid.left && width > 0) {
    // 和父菜单之间留出一点缝：两侧边界各自外扩 GAP，避免「刚好贴住」时因为
    // 边框取整（offsetWidth 不含边框、rect 含边框）压进去 1~2px。
    const GAP = 2
    const avoidLeft = avoid.left - GAP
    const avoidRight = avoid.right + GAP
    const marginRight = containerWidth - margin
    const fitsOnScreen = (left: number, w: number) => left >= minX && left + w <= marginRight
    const clearsAvoid = (left: number, w: number) => left + w <= avoidLeft || left >= avoidRight
    // 还会不会出现横向滚动条：宽度不小于内容自然宽度才滚不出来
    const scrollsHorizontally = (w: number) => minContentWidth > 0 && w < minContentWidth
    // 排序（越小越好）：
    //   1. 不出横向滚动条；
    //   2. 窄屏并排放不下时：**贴屏幕左边缘**（用户要的形态）优先，其次不许压到
    //      父菜单右侧之外，最后才挑位置 —— 否则「让开父菜单」会把整块推到屏幕外；
    //   3. 宽屏照常：先让开父菜单，再放得进可用区域，最后离原位置近。
    const idealRank = (left: number, w: number) => [
      scrollsHorizontally(w) ? 1 : 0,
      cannotFitBeside ? (left <= 0 ? 0 : (left + w <= avoidLeft ? 1 : 2)) : (clearsAvoid(left, w) ? 0 : 1),
      fitsOnScreen(left, w) ? 0 : 1,
      Math.abs(left - x),
    ]
    const compare = <T extends number[]>(ar: T, br: T) => {
      for (let i = 0; i < ar.length; i++) {
        if (ar[i] !== br[i])
          return ar[i] < br[i] ? -1 : 1
      }
      return 0
    }
    const better = (a: [number, number], b: [number, number]) =>
      compare(idealRank(a[0], a[1]), idealRank(b[0], b[1])) <= 0 ? a : b
    // 候选：原位置 / 父菜单左侧整块 / 父菜单右侧整块 / 保持原宽度往左挪到屏幕内。
    // 最后这个就是「从左往右延伸、压住父菜单一小条」：窄屏上让开父菜单必然要么
    // 出屏要么被夹到出滚动条，宁可让子菜单压住父菜单左边一小段。
    const placeSide = (toLeft: boolean, w: number): [number, number] =>
      [toLeft ? avoidLeft - w : avoidRight, w]
    // 窄屏专用：两块并排塞不下时，子菜单**最左侧贴住屏幕边缘**（左缘 0），右边压住
    // 父菜单一部分。这是用户要的形态（左移、父菜单右侧仍露出来），比「夹窄出横向
    // 滚动条」和「让开父菜单但整块跑到屏幕外」都好用。
    // 只在并排放不下时启用；桌面/平板照常待在父菜单旁边。
    const cannotFitBeside = containerWidth < (avoid.right - avoid.left) + boxWidth + GAP * 2
    const flushLeft = (w: number): [number, number] => [0, w]
    const shifted = Math.max(minX, marginRight - boxWidth)
    const candidates: [number, number][] = [
      [clampedX, boxWidth],
      placeSide(true, boxWidth),
      placeSide(false, boxWidth),
      [shifted, boxWidth],
    ]
    if (cannotFitBeside)
      candidates.unshift(flushLeft(boxWidth))

    // 夹窄只作为「不夹就会出横向滚动条 / 出屏」时的备选，且夹到内容宽度为止
    const narrowFloor = minContentWidth > 0 ? Math.min(minContentWidth, boxWidth) : 0
    if (narrowFloor > 0 && narrowFloor < boxWidth) {
      candidates.push(placeSide(true, narrowFloor), placeSide(false, narrowFloor))
    }
    for (let i = 1; i < candidates.length; i++)
      candidates[0] = better(candidates[0], candidates[i])

    // 收口：flushLeft 是「贴屏幕边缘」，允许到 0；其余候选仍守 margin
    const lowerBound = candidates[0][0] === 0 ? 0 : minX
    clampedX = Math.min(Math.max(candidates[0][0], lowerBound), Math.max(lowerBound, marginRight - candidates[0][1]))
    if (candidates[0][1] < boxWidth && candidates[0][1] > 0)
      clampedMaxWidthFromParent = candidates[0][1]
  }

  // 先按内容高度试放：超过可用高度时先往上挪，挪到顶边还不够才夹高度。
  const fitsNaturally = height <= availableHeight
  const minY = margin
  const maxY = Math.max(minY, containerHeight - margin - height)
  let clampedY = Math.min(Math.max(y, minY), maxY)

  let clampedMaxHeight = 0
  if (!fitsNaturally) {
    clampedY = minY
    const requested = maxHeight > 0 ? Math.min(maxHeight, height) : height
    clampedMaxHeight = Math.min(requested, availableHeight)
  }
  else if (maxHeight > 0 && maxHeight < height) {
    // 调用方自己限制了高度：位置不用动，只在比可用空间更小时夹一下
    clampedMaxHeight = Math.min(maxHeight, availableHeight)
  }

  return {
    x: clampedX,
    y: clampedY,
    maxWidth: (clampedMaxWidth > 0 && clampedMaxWidthFromParent > 0)
      ? Math.min(clampedMaxWidth, clampedMaxWidthFromParent)
      : (clampedMaxWidth || clampedMaxWidthFromParent || undefined),
    maxHeight: clampedMaxHeight || undefined,
  }
}

// #endregion

// #region 弹出动画

/**
 * 菜单进出的 Transition props。
 *
 * `name` 必须指向库自带的 `.vgo-context-menu-pop-*` 过渡类；使用方传了
 * `menuTransitionProps` 时整体让位给使用方（含 `css: false` 这类关掉 CSS 过渡的用法）。
 */
export function resolveMenuTransitionProps(custom?: MenuOptions['menuTransitionProps']): Record<string, unknown> {
  if (custom)
    return { ...custom }
  return {
    name: 'vgo-context-menu-pop',
    appear: true,
  }
}

/**
 * 这组 Transition props 还会不会跑 CSS 过渡 / 动画。
 *
 * 关掉之后 `after-leave` 不会触发，函数式菜单的卸载就不能再等它，
 * 必须在 `closeMenu` 里直接收掉。
 */
export function hasMenuTransitionAnimation(custom?: MenuOptions['menuTransitionProps']): boolean {
  return !custom || custom.css !== false
}

// #endregion

/** 把 `boolean | ComputedRef<boolean>` 解析成普通布尔值。 */
export function unwrapBoolean(value: boolean | ComputedRef<boolean> | undefined): boolean {
  if (value && typeof value === 'object')
    return value.value
  return value === true
}

/**
 * 判断 `theme` 选项是否要求暗色。
 *
 * vgo-ui 的明暗由 `html.dark` + `--vgo-*` 令牌决定，这里保留旧主题名兼容：
 * 只要取值里含 `dark`（`'dark'`、`'flat dark'`…）就用暗色一套。
 */
export function isDarkThemeName(theme: string | null | undefined): boolean {
  return typeof theme === 'string' && theme.toLowerCase().includes('dark')
}

/**
 * 返回去掉指定键的新对象。
 */
export function removeObjectKey<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const other = { ...obj }
  delete other[key]
  return other
}

/**
 * 渲染一个 VNode；vnode 为回调时把 `data` 作为第一个参数传入。
 */
export const VNodeRender = defineComponent({
  props: {
    /** 可以是 VNode，也可以是 `(data: unknown) => VNode`。 */
    vnode: {
      type: null,
      default: undefined,
    },
    /** vnode 为回调时传入的第一个参数。 */
    data: {
      type: null,
      default: null,
    },
  },
  setup(props) {
    const { vnode, data } = toRefs(props)
    return () => typeof vnode.value === 'function'
      ? (vnode.value as unknown as (data: unknown) => VNode)(data.value)
      : vnode.value as unknown as VNode
  },
})
