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
