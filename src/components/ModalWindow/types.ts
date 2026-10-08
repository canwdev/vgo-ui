import type { AppContext, VNodeChild } from 'vue'
import type { WinOptions } from '../ViewPortWindow/enum'

export interface ModalWindowContext {
  // 用给定的值关掉对话框。不传值时 Promise 得到 undefined
  close: (value?: unknown) => void
}

export interface ModalWindowButton {
  label: string
  variant?: 'primary' | 'danger' | 'text'
  // 显式给出时，Promise 用这个值，包括 undefined。
  // 没给出时用 onClick 的返回值，返回值也没有就用 label
  value?: unknown
  // 返回 false 或抛错时对话框保持打开。可以是 async
  onClick?: (ctx: ModalWindowContext) => unknown
}

export type ModalWindowRender = string | ((ctx: ModalWindowContext) => VNodeChild)

export interface ModalWindowOptions {
  title?: ModalWindowRender
  content?: ModalWindowRender
  // 不传、或空数组：不画底部按钮，内容自己画
  buttons?: ModalWindowButton[]
  // 关闭按钮和 Esc。默认 true
  closable?: boolean
  // 点击遮罩关闭。默认 true
  maskClosable?: boolean
  // 打开后聚焦主按钮（.vgo-button--primary）。默认 true。
  // 没有主按钮时聚焦内容区域
  focusPrimary?: boolean
  // 透传给 ViewPortWindow，如 initWinOptions、allowMaximum、allowResize
  windowProps?: Record<string, unknown> & { initWinOptions?: Partial<WinOptions> }
  // 内容里的组件需要应用的插件或 inject 时传入。
  // 在 setup 里同步调用时会自动带上当前应用的上下文
  appContext?: AppContext
}

export interface ModalWindowHandle<R = unknown> extends Promise<R | undefined> {
  close: (value?: R) => void
}
