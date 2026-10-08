// 初始化窗口状态
export interface WinOptions {
  // 使用px作为单位的字符串
  top: string
  left: string
  width: string
  height: string
  // 窗口是否最大化
  maximized?: boolean
}

export type LayoutRatios = Pick<ILayout, 'xRatio' | 'yRatio' | 'widthRatio' | 'heightRatio'>

// 按 wid 持久化的窗口状态。left / top / width / height 是浮动位置和尺寸（px），
// 也是取消最大化、拖出分屏时的还原目标
export interface StoredWindowState {
  left: number
  top: number
  width: number
  height: number
  maximized?: true
  // 分屏布局，按视口比例记录
  snap?: LayoutRatios
}

export function windowStorageKey(wid: string) {
  return `vgo-window:${wid}`
}

const RECT_KEYS = ['left', 'top', 'width', 'height'] as const
const RATIO_KEYS = ['xRatio', 'yRatio', 'widthRatio', 'heightRatio'] as const

export function loadWindowState(wid: string): StoredWindowState | null {
  try {
    const value = JSON.parse(localStorage.getItem(windowStorageKey(wid)) || 'null')
    if (!value || !RECT_KEYS.every(key => Number.isFinite(value[key]))) {
      return null
    }
    const state: StoredWindowState = {
      left: value.left,
      top: value.top,
      width: value.width,
      height: value.height,
    }
    if (value.maximized === true) {
      state.maximized = true
    }
    const snap = value.snap
    if (snap && RATIO_KEYS.every(key => Number.isFinite(snap[key]) && snap[key] >= 0 && snap[key] <= 1)) {
      state.snap = {
        xRatio: snap.xRatio,
        yRatio: snap.yRatio,
        widthRatio: snap.widthRatio,
        heightRatio: snap.heightRatio,
      }
    }
    return state
  }
  catch {}
  return null
}

// 清除保存的位置和尺寸，窗口下次挂载时回到初始状态
export function removeWindowState(wid: string) {
  localStorage.removeItem(windowStorageKey(wid))
}

export interface ILayout {
  xRatio: number
  yRatio: number
  widthRatio: number
  heightRatio: number
  maximize?: boolean
  // 只按比例摆放位置和尺寸，窗口仍是普通浮动窗口，不进入分屏状态
  floating?: boolean
}

export const LayoutPreset: { [key: string]: ILayout } = Object.freeze({
  TOP_LEFT: { xRatio: 0, yRatio: 0, widthRatio: 0.5, heightRatio: 0.5 },
  TOP_RIGHT: { xRatio: 0.5, yRatio: 0, widthRatio: 0.5, heightRatio: 0.5 },
  LEFT: { xRatio: 0, yRatio: 0, widthRatio: 0.5, heightRatio: 1 },
  RIGHT: { xRatio: 0.5, yRatio: 0, widthRatio: 0.5, heightRatio: 1 },
  BOTTOM_LEFT: { xRatio: 0, yRatio: 0.5, widthRatio: 0.5, heightRatio: 0.5 },
  BOTTOM_RIGHT: { xRatio: 0.5, yRatio: 0.5, widthRatio: 0.5, heightRatio: 0.5 },
  MAXIMIZE: { xRatio: 0, yRatio: 0, widthRatio: 1, heightRatio: 1, maximize: true },
})

// 悬停最大化按钮时弹出的布局菜单，3 个一行
export const layoutList: ILayout[] = Object.freeze([
  LayoutPreset.LEFT,
  LayoutPreset.MAXIMIZE,
  LayoutPreset.RIGHT,

  LayoutPreset.TOP_LEFT,
  { xRatio: 0, yRatio: 0, widthRatio: 1, heightRatio: 0.5 },
  LayoutPreset.TOP_RIGHT,

  { xRatio: 0.1, yRatio: 0.1, widthRatio: 0.8, heightRatio: 0.8, floating: true },
  { xRatio: 0.2, yRatio: 0.2, widthRatio: 0.6, heightRatio: 0.6, floating: true },
  { xRatio: 0.3, yRatio: 0.3, widthRatio: 0.4, heightRatio: 0.4, floating: true },

  LayoutPreset.BOTTOM_LEFT,
  { xRatio: 0, yRatio: 0.5, widthRatio: 1, heightRatio: 0.5 },
  LayoutPreset.BOTTOM_RIGHT,
]) as ILayout[]

export function isSameLayout(a: ILayout, b: ILayout) {
  return a.xRatio === b.xRatio
    && a.yRatio === b.yRatio
    && a.widthRatio === b.widthRatio
    && a.heightRatio === b.heightRatio
}

// 贴边快捷调整窗口大小 (Aero Snap)
// 窗口边缘贴靠检测
export function checkWindowAttach({ x, y }: { x: number, y: number }): ILayout | undefined {
  if (y <= 0) {
    if (x <= 0) {
      return LayoutPreset.TOP_LEFT
    }
    else if (x >= window.innerWidth - 1) {
      return LayoutPreset.TOP_RIGHT
    }
    else {
      return LayoutPreset.MAXIMIZE
    }
  }
  else if (x <= 0) {
    if (y >= window.innerHeight - 1) {
      return LayoutPreset.BOTTOM_LEFT
    }
    else {
      return LayoutPreset.LEFT
    }
  }
  else if (x >= window.innerWidth - 1) {
    if (y >= window.innerHeight - 1) {
      return LayoutPreset.BOTTOM_RIGHT
    }
    else {
      return LayoutPreset.RIGHT
    }
  }
}
