import type { ComponentPublicInstance, MaybeRefOrGetter, Ref } from 'vue'
import type { ContextMenuInstance, MenuItem, MenuOptions } from '../components/ContextMenu/types'
import { computed, onBeforeUnmount, ref, toValue } from 'vue'
import ContextMenu from '../components/ContextMenu/show'
import { MENU_CONST_OPTIONS } from '../components/ContextMenu/types'

/**
 * `useContextMenuTrigger` 的配置：在 `MenuOptions` 基础上去掉 `x` / `y` / `items`，
 * 坐标由触发元素算，菜单项支持传 getter 以便每次打开取最新值。
 *
 * `ignoreClickClassName` 与 `anchorWidth` 由本 hook 自己管理（前者自动加到触发元素上，
 * 后者取自触发元素宽度），所以不在配置里。
 */
export interface UseContextMenuTriggerOptions
  extends Omit<MenuOptions, 'x' | 'y' | 'items' | 'ignoreClickClassName' | 'anchorWidth'> {
  /** 菜单项。可以是数组，也可以是 `ref` / getter，点击打开时求值。 */
  items: MaybeRefOrGetter<MenuItem[]>
  /** 触发元素与菜单之间的间距（像素）。 @default 4 */
  gap?: number
}

export interface UseContextMenuTriggerReturn {
  /** 绑到触发元素上的模板 ref，用 `:ref="setTriggerRef"` 绑定（函数 ref）。 */
  setTriggerRef: (el: Element | ComponentPublicInstance | null) => void
  /** 触发元素；未挂载时为 `undefined`。只读用途。 */
  triggerRef: Readonly<Ref<HTMLElement | undefined>>
  /** 菜单是否打开，用于触发元素的激活态（`.is-active`）。 */
  isOpen: Readonly<Ref<boolean>>
  /** 自动附加到触发元素上的 class，一般不用管。 */
  triggerClass: string
  /** 打开 / 关闭；绑到触发元素的 `click` 上。 */
  toggle: () => void
  /** 显式打开。 */
  show: () => void
  /** 显式关闭。 */
  close: () => void
  /** 当前菜单实例；未打开时为 `null`。 */
  getInstance: () => ContextMenuInstance | null
}

let triggerUid = 0

/**
 * 让一个按钮点开一个函数式菜单：菜单贴在触发元素下方，打开期间触发元素保持激活，
 * 再次点击关闭。组件、样式仍由使用方自己写（通常配 `.vgo-button` + `.is-active`），
 * 本 hook 只负责定位、开 / 关状态，以及和菜单「点击外部关闭」的时序。
 *
 * 为什么需要这个 hook：菜单的「点击外部关闭」监听装在 document 捕获阶段，
 * 点触发按钮那一下会先跑到它那里把菜单关掉，按钮自己的 `click` 再把菜单打开，
 * 于是「永远关不上」。hook 会给触发元素加一个 class 并把它传给
 * `ignoreClickClassName`，让这一下被放过。
 *
 * ```vue
 * <script setup lang="ts">
 * import { useContextMenuTrigger } from '@canwdev/vgo-ui'
 *
 * const { setTriggerRef, isOpen, toggle } = useContextMenuTrigger({
 *   items: () => [{ label: 'Open' }, { label: 'Delete', divided: true }],
 *   onClose: item => console.warn('closed', item),
 * })
 * </script>
 *
 * <template>
 *   <button
 *     :ref="setTriggerRef"
 *     class="vgo-button"
 *     :class="isOpen ? 'is-active' : ''"
 *     @click="toggle"
 *   >
 *     Actions
 *   </button>
 * </template>
 * ```
 *
 * 触发元素用函数 ref `:ref="setTriggerRef"` 绑定：这样 hook 才能在挂载 / 卸载时
 * 维护触发元素上那个用于放过「点击外部」的 class；同时避免库自身 `noUnusedLocals`
 * 把字符串模板 ref 当成未使用变量。
 *
 * @param options 菜单配置或它的 getter / ref
 */
export function useContextMenuTrigger(
  options: MaybeRefOrGetter<UseContextMenuTriggerOptions>,
): UseContextMenuTriggerReturn {
  const triggerRef = ref<HTMLElement>()
  const isOpen = ref(false)
  let menu: ContextMenuInstance | null = null

  // 每个 hook 实例一个唯一 class，自动挂到触发元素上并交给菜单放过。
  const triggerClass = `vgo-context-menu-trigger-${++triggerUid}`

  /**
   * 触发元素的函数 ref。
   *
   * 用函数 ref 而不是 `ref="triggerRef"`：库自身的 `noUnusedLocals` 不把字符串
   * 模板 ref 算作「已使用」，而且 `:ref="triggerRef"` 在模板里会被自动解包成元素
   * 本身，传不进真 ref。函数 ref 两个问题都没有，并且能在挂载 / 卸载时维护 class。
   */
  function setTriggerRef(el: Element | ComponentPublicInstance | null) {
    const next = el instanceof HTMLElement ? el : undefined
    if (triggerRef.value && triggerRef.value !== next)
      triggerRef.value.classList.remove(triggerClass)
    triggerRef.value = next
    next?.classList.add(triggerClass)
  }

  function show() {
    const el = triggerRef.value
    if (!el || isOpen.value)
      return

    const { gap = 4, items, onClose, ...rest } = toValue(options)
    const rect = el.getBoundingClientRect()

    // 按弹出方向决定锚点的哪条边对齐菜单：向右弹出对左缘，向左弹出对右缘，
    // 居中弹出对中点。anchorWidth 只在向右弹出（默认 'br'）时给，右侧放不下时
    // 库据此把菜单翻到左边并对齐触发元素右缘，而不是对齐按钮左缘。
    const direction = rest.direction ?? MENU_CONST_OPTIONS.defaultDirection
    const x = direction.includes('l')
      ? rect.right
      : direction.includes('r')
        ? rect.left
        : rect.left + rect.width / 2

    isOpen.value = true
    menu = ContextMenu.showContextMenu({
      ...rest,
      items: toValue(items),
      x,
      y: rect.bottom + gap,
      anchorWidth: direction.includes('r') ? rect.width : 0,
      ignoreClickClassName: triggerClass,
      onClose: (item) => {
        isOpen.value = false
        menu = null
        onClose?.(item)
      },
    })
  }

  function close() {
    menu?.closeMenu()
  }

  function toggle() {
    if (isOpen.value)
      close()
    else
      show()
  }

  onBeforeUnmount(() => {
    close()
    menu = null
  })

  return {
    setTriggerRef,
    triggerRef: computed(() => triggerRef.value),
    isOpen: computed(() => isOpen.value),
    triggerClass,
    toggle,
    show,
    close,
    getInstance: () => menu,
  }
}
