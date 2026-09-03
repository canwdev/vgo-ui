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

export interface ILayout {
  xRatio: number
  yRatio: number
  widthRatio: number
  heightRatio: number
  maximize?: boolean
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
