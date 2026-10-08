<script lang="ts" setup>
import type { GlobalHasSlot, GlobalRenderSlot, SubMenuContext, SubMenuParentContext } from './context'
import type {
  ContextMenuInstance,
  ContextSubMenuInstance,
  MenuItem,
  MenuOptions,
  MenuPopDirection,
} from './types'
import { computed, h, onBeforeUnmount, onMounted, provide, ref, renderSlot, toRefs, useSlots, watch } from 'vue'
import ContextSubMenu from './ContextSubMenu.vue'
import { addOpenedContextMenu, removeOpenedContextMenu } from './mutex'
import { MENU_CONST_OPTIONS } from './types'
import { hasMenuTransitionAnimation, isDarkThemeName, MOBILE_MENU_INTERACTION_QUERY, resolveMenuInteraction } from './utils'

defineOptions({
  name: 'ContextSubMenuWrapper',
})

const props = withDefaults(
  defineProps<{
    /** 菜单配置。 */
    options: MenuOptions
    /**
     * 是否显示。
     *
     * 函数式菜单不传，由组件自己管理（`closeMenu` 直接收起）；
     * 组件式菜单传入并随 `v-model:show` 同步。
     */
    show?: boolean
    /** 关闭时是否销毁。 */
    destroyOnClose?: boolean
    /** 挂载容器（仅用于计算与滚动监听）。 */
    container?: HTMLElement | null
    /**
     * `container` 是否由使用方提供。
     *
     * 默认容器是铺满视口的 host，不会滚动；只有自定义容器才需要额外监听滚动。
     */
    useCustomContainer?: boolean
  }>(),
  {
    show: undefined,
    destroyOnClose: true,
    container: null,
    useCustomContainer: false,
  },
)

const emit = defineEmits(['close', 'closeAnimFinished'])

const slots = useSlots()
const submenuInstance = ref<ContextSubMenuInstance>()

const {
  options,
  destroyOnClose,
  container,
} = toRefs(props)

const innerShow = ref(props.show ?? true)
let closed = false

watch(() => props.show, (value) => {
  if (value !== undefined)
    innerShow.value = value
})
watch(innerShow, (value: boolean) => {
  if (value) {
    openMenu()
  }
  else {
    removeOpenedContextMenu(instance)
    removeBodyEvents()
  }
})

onMounted(() => {
  if (innerShow.value)
    openMenu()
})
onBeforeUnmount(() => {
  removeBodyEvents()
})

const instance: ContextMenuInstance = {
  closeMenu,
  isClosed,
  getMenuRef: () => submenuInstance.value,
  getMenuDimensions: () => submenuInstance.value?.getMenuDimensions() ?? { width: 0, height: 0 },
}

function openMenu() {
  installBodyEvents()
  addOpenedContextMenu(instance)
}
function closeMenu(fromItem?: MenuItem) {
  closed = true
  innerShow.value = false
  removeBodyEvents()
  emit('close', fromItem)
  // 有动画时卸载要等菜单自己的 after-leave，在这里就 render(null) 会把退场动画
  // 从中间掐断；`menuTransitionProps: { css: false }` 关掉了动画，after-leave
  // 永远不来，这时才需要自己收尾。
  if (!hasMenuTransitionAnimation(options.value.menuTransitionProps))
    emit('closeAnimFinished')
  removeOpenedContextMenu(instance)
}
function isClosed() {
  return closed
}

let bodyEventsTimer = 0
function installBodyEvents() {
  // 延迟安装：本次右键的 contextmenu 事件还在冒泡，立即安装会被自己触发而立刻关闭。
  // 关掉时必须取消这个定时器，否则监听会装到已经关闭的菜单上，外面的点击就关不掉当前菜单。
  window.clearTimeout(bodyEventsTimer)
  bodyEventsTimer = window.setTimeout(() => {
    bodyEventsTimer = 0
    if (closed)
      return
    document.addEventListener('click', onBodyClick, true)
    document.addEventListener('contextmenu', onBodyClick, true)
    document.addEventListener('scroll', onBodyScroll, true)
    if (props.useCustomContainer && container.value)
      container.value.addEventListener('scroll', onBodyScroll, true)
    if (options.value.keyboardControl !== false)
      document.addEventListener('keydown', onMenuKeyDown, true)
  }, 50)
}
function removeBodyEvents() {
  window.clearTimeout(bodyEventsTimer)
  bodyEventsTimer = 0
  document.removeEventListener('contextmenu', onBodyClick, true)
  document.removeEventListener('click', onBodyClick, true)
  document.removeEventListener('scroll', onBodyScroll, true)
  if (props.useCustomContainer && container.value)
    container.value.removeEventListener('scroll', onBodyScroll, true)
  if (options.value.keyboardControl !== false)
    document.removeEventListener('keydown', onMenuKeyDown, true)
}

// 键盘事件需要知道当前活跃的子菜单
const currentOpenedMenu = ref<SubMenuContext | null>()
provide('globalSetCurrentSubMenu', (menu: SubMenuContext | null) => {
  currentOpenedMenu.value = menu
})
provide('globalGetMenuHostId', container.value?.id ?? '')

function onMenuKeyDown(e: KeyboardEvent) {
  let handled = true
  switch (e.key) {
    case 'Escape': {
      if (currentOpenedMenu.value?.isTopLevel() === false)
        currentOpenedMenu.value?.closeCurrentSubMenu()
      else
        closeMenu()
      break
    }
    case 'ArrowDown':
      currentOpenedMenu.value?.moveCurrentItemDown()
      break
    case 'ArrowUp':
      currentOpenedMenu.value?.moveCurrentItemUp()
      break
    case 'Home':
      currentOpenedMenu.value?.moveCurrentItemFirst()
      break
    case 'End':
      currentOpenedMenu.value?.moveCurrentItemLast()
      break
    case 'ArrowLeft': {
      if (!currentOpenedMenu.value?.closeSelfAndActiveParent())
        options.value.onKeyFocusMoveLeft?.()
      break
    }
    case 'ArrowRight':
      if (!currentOpenedMenu.value?.openCurrentItemSubMenu())
        options.value.onKeyFocusMoveRight?.()
      break
    case 'Enter':
      currentOpenedMenu.value?.triggerCurrentItemClick(e)
      break
    default:
      handled = false
      break
  }
  if (handled && currentOpenedMenu.value) {
    e.stopPropagation()
    e.preventDefault()
  }
}
function onBodyScroll(e: Event) {
  if (options.value.closeWhenScroll !== false)
    checkTargetAndClose(e.target as HTMLElement, null)
}
function onBodyClick(e: MouseEvent) {
  checkTargetAndClose(e.target as HTMLElement, e)
}

/** 从 target 沿父链找，看路径上是否有元素带指定 class。 */
function hasClassInPath(target: HTMLElement | null, className: string | undefined): boolean {
  if (!className)
    return false
  let el: HTMLElement | null = target
  while (el) {
    if (el.classList?.contains(className))
      return true
    el = el.parentNode as HTMLElement | null
  }
  return false
}

function checkTargetAndClose(target: HTMLElement, e: MouseEvent | null) {
  // 命中 ignoreClickClassName 的点击即使落在菜单外也忽略：这正是「按钮触发菜单」
  // 需要的语义——点触发按钮的那一下先由 document 捕获阶段跑到这里，放过它，
  // 按钮自己的 click 才能把菜单关掉，而不是关掉又被重新打开。
  if (hasClassInPath(target, options.value.ignoreClickClassName))
    return
  // 遮罩自己负责关一层。这里在捕获阶段先跑，不放过的话会把整棵菜单关掉。
  if (hasClassInPath(target, 'vgo-context-menu__mask'))
    return
  // 沿 target 向上找菜单根元素；点击发生在菜单内部时不关闭
  while (target) {
    if (target.classList && target.classList.contains('vgo-context-menu'))
      return
    target = target.parentNode as HTMLElement
  }
  if (e) {
    if (options.value.clickCloseOnOutside !== false) {
      removeBodyEvents()
      closeMenu()
    }
    else {
      options.value.onClickOnOutside?.(e)
    }
  }
  else {
    removeBodyEvents()
    closeMenu()
  }
}

// 已打开的子菜单，从外到内。遮罩点击和键盘回退都只弹出最上面一层。
const subMenuLayerStack: (() => void)[] = []
function pushSubMenuLayer(close: () => void) {
  if (!subMenuLayerStack.includes(close))
    subMenuLayerStack.push(close)
}
function removeSubMenuLayer(close: () => void) {
  const index = subMenuLayerStack.lastIndexOf(close)
  if (index >= 0)
    subMenuLayerStack.splice(index, 1)
}
function popSubMenuLayer() {
  const close = subMenuLayerStack.pop()
  close?.()
}
provide('globalPushSubMenuLayer', pushSubMenuLayer)
provide('globalRemoveSubMenuLayer', removeSubMenuLayer)
provide('globalPopSubMenuLayer', popSubMenuLayer)

const mobileQueryMatches = ref(resolveMenuInteraction(options.value.interaction) === 'mobile')
let mobileQuery: MediaQueryList | null = null
function syncMobileQuery() {
  mobileQueryMatches.value = mobileQuery?.matches ?? false
}
onMounted(() => {
  mobileQuery = window.matchMedia(MOBILE_MENU_INTERACTION_QUERY)
  mobileQuery.addEventListener('change', syncMobileQuery)
  syncMobileQuery()
})
onBeforeUnmount(() => {
  mobileQuery?.removeEventListener('change', syncMobileQuery)
})
const interaction = computed<'pc' | 'mobile'>(() => {
  const specified = options.value.interaction
  if (specified === 'pc' || specified === 'mobile')
    return specified
  return mobileQueryMatches.value ? 'mobile' : 'pc'
})
provide('globalInteraction', interaction)

// 提供给子级
provide('globalOptions', options)
provide('globalCloseMenu', closeMenu)
provide(
  'globalIsDark',
  computed(() => isDarkThemeName(options.value.theme) || document.documentElement.classList.contains('dark')),
)
provide('globalHasSlot', ((name: string) => {
  return (slots as Record<string, unknown>)[name] !== undefined
}) as GlobalHasSlot)
provide('globalRenderSlot', ((name: string, params: Record<string, unknown>) => {
  return renderSlot(slots, name, { ...params }, () => [h('span', 'Render slot failed')], false)
}) as GlobalRenderSlot)
// 根级菜单上下文：没有父菜单，所以控制方法都是空实现
provide('menuContext', {
  zIndex: options.value.zIndex || MENU_CONST_OPTIONS.defaultZIndex,
  container: container.value as unknown as HTMLElement,
  adjustPadding: { x: 0, y: 0 },
  getZoom: () => options.value.zoom || MENU_CONST_OPTIONS.defaultZoom,
  getParentWidth: () => 0,
  getParentHeight: () => 0,
  getPosition: () => [options.value.x, options.value.y],
  closeOtherSubMenuWithTimeout: () => {},
  checkCloseOtherSubMenuTimeout: () => false,
  openSubMenuWithDelay: openFn => openFn(),
  cancelPendingOpen: () => {},
  addOpenedSubMenu: () => {},
  closeOtherSubMenu: () => {},
  getParentContext: () => null,
  getSubMenuInstanceContext: () => null,
  getElement: () => null,
  getMenuRoot: () => null,
  addChildMenuItem: () => {},
  removeChildMenuItem: () => {},
  markActiveMenuItem: () => {},
  markThisOpenedByKeyboard: () => {},
  isOpenedByKeyboardFlag: () => false,
  isMenuItemDataCollectedFlag: () => false,
} as SubMenuParentContext)

defineExpose(instance)
</script>

<template>
  <ContextSubMenu
    ref="submenuInstance"
    :show="innerShow"
    :destroy-on-close="destroyOnClose"
    :items="options.items"
    :adjust-position="options.adjustPosition"
    :max-width="options.maxWidth || MENU_CONST_OPTIONS.defaultMaxWidth"
    :min-width="options.minWidth || MENU_CONST_OPTIONS.defaultMinWidth"
    :max-height="options.maxHeight"
    :direction="(options.direction || MENU_CONST_OPTIONS.defaultDirection as MenuPopDirection)"
    @close-anim-finished="emit('closeAnimFinished')"
  >
    <slot />
  </ContextSubMenu>
</template>
