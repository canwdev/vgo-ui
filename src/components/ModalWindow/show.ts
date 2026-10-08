import type { ModalWindowHandle, ModalWindowOptions } from './types'
import { getCurrentInstance, h, render } from 'vue'
import ModalWindow from './ModalWindow.vue'

export type {
  ModalWindowButton,
  ModalWindowContext,
  ModalWindowHandle,
  ModalWindowOptions,
  ModalWindowRender,
} from './types'

/**
 * 以函数方式打开一个模态窗口，返回的 Promise 在关闭时兑现。
 *
 * ```ts
 * const name = await showModalWindow<string>({
 *   title: '重命名',
 *   content: ctx => h(NameField, { onSubmit: ctx.close }),
 *   buttons: [
 *     { label: '取消', value: undefined },
 *     { label: '确定', variant: 'primary', onClick: () => nameRef.value },
 *   ],
 * })
 * ```
 */
export function showModalWindow<R = unknown>(options: ModalWindowOptions = {}): ModalWindowHandle<R> {
  const mount = document.createElement('div')
  document.body.appendChild(mount)

  let settled = false
  let resolvePromise: (value: R | undefined) => void = () => {}
  let closeDialog: (value?: R) => void = () => {}

  const promise = new Promise<R | undefined>((resolve) => {
    resolvePromise = resolve
  }) as ModalWindowHandle<R>

  let disposed = false
  const dispose = () => {
    if (disposed) {
      return
    }
    disposed = true
    render(null, mount)
    mount.remove()
  }

  const { windowProps, appContext: _appContext, ...rest } = options
  const vnode = h(ModalWindow, {
    ...rest,
    ...windowProps,
    visible: true,
    onResolve: (value: unknown) => {
      if (settled) {
        return
      }
      settled = true
      resolvePromise(value as R | undefined)
    },
    onClosed: dispose,
  })

  const appContext = options.appContext ?? getCurrentInstance()?.appContext
  if (appContext) {
    vnode.appContext = appContext
  }

  render(vnode, mount)
  const exposed = vnode.component?.exposed as { close?: (value?: R) => void } | null
  closeDialog = value => exposed?.close?.(value)
  promise.close = value => closeDialog(value)
  return promise
}
