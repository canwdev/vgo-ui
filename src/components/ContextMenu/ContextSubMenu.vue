<script lang="ts" setup>
import type { ComputedRef, Ref } from 'vue'
import type { SubMenuContext, SubMenuParentContext } from './context'
import type {
  ContextMenuPositionData,
  ContextSubMenuInstance,
  MenuItem,
  MenuItemContext,
  MenuOptions,
  MenuPopDirection,
} from './types'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, toRefs, watch } from 'vue'
import ContextMenuItem from './ContextMenuItem.vue'
import ContextMenuSeparator from './ContextMenuSeparator.vue'
import { MENU_CONST_OPTIONS } from './types'
import {
  clampBoxToContainer,
  getOffsetLeft,
  getOffsetTop,
  resolveMenuTransitionProps,
  resolveSize,
  unwrapBoolean,
} from './utils'

defineOptions({
  name: 'ContextSubMenu',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    /** 菜单项。 */
    items?: MenuItem[] | null
    /** 是否显示。 */
    show?: boolean
    /** 关闭时是否销毁。 */
    destroyOnClose?: boolean
    /** 子菜单最大高度。 */
    maxHeight?: number
    /** 子菜单最大宽度。 */
    maxWidth?: number | string
    /** 子菜单最小宽度。 */
    minWidth?: number | string
    /** 是否自动调整位置避免溢出。 */
    adjustPosition?: boolean
    /** 弹出方向。 */
    direction?: MenuPopDirection
    /** 父菜单项实例。 */
    parentMenuItemContext?: MenuItemContext | null
  }>(),
  {
    items: null,
    show: false,
    destroyOnClose: true,
    maxHeight: 0,
    maxWidth: 0,
    minWidth: 0,
    adjustPosition: true,
    direction: 'br',
    parentMenuItemContext: null,
  },
)

const emit = defineEmits(['closeAnimFinished'])
const mounted = ref(false)

// #region 注入

const globalGetMenuHostId = inject('globalGetMenuHostId', '')
const globalIsDark = inject('globalIsDark') as Ref<boolean>
const parentContext = inject('menuContext') as SubMenuParentContext
const options = inject('globalOptions') as Ref<MenuOptions>
const interaction = inject<ComputedRef<'pc' | 'mobile'>>('globalInteraction', computed(() => 'pc'))
const pushSubMenuLayer = inject<(close: () => void) => void>('globalPushSubMenuLayer', () => {})
const removeSubMenuLayer = inject<(close: () => void) => void>('globalRemoveSubMenuLayer', () => {})
const popSubMenuLayer = inject<() => void>('globalPopSubMenuLayer', () => {})
const debugMenuItemNameDefault = ref('UnknownOrRoot')
const debugMenuItemName = inject<Ref<string>>('MenuItemName', debugMenuItemNameDefault)

// #endregion

const { zIndex, getParentWidth, getZoom } = parentContext
const { adjustPosition } = toRefs(props)

const scrollRef = ref<HTMLElement>()
const submenuRoot = ref<HTMLElement>()
const menu = ref<HTMLElement>()
const openedSubMenus = [] as (() => void)[]

// #region 键盘控制上下文

const globalSetCurrentSubMenu = inject('globalSetCurrentSubMenu') as (menu: SubMenuContext | null) => void

const menuItems = [] as MenuItemContext[]
let currentItem = null as MenuItemContext | null
let leaveTimeout = 0
let pendingOpenTimeout = 0

function blurCurrentMenu() {
  if (currentItem)
    currentItem.blur()
}

/** 取消挂起的「延迟收起子菜单」。 */
function clearLeaveTimeout() {
  if (leaveTimeout) {
    clearTimeout(leaveTimeout)
    leaveTimeout = 0
  }
}

/** 取消挂起的「延迟打开子菜单」。 */
function clearPendingOpenTimeout() {
  if (pendingOpenTimeout) {
    clearTimeout(pendingOpenTimeout)
    pendingOpenTimeout = 0
  }
}

function setAndFocusNotDisableItem(isDown: boolean, startIndex?: number) {
  if (isDown) {
    for (let i = startIndex !== undefined ? startIndex : 0; i < menuItems.length; i++) {
      if (!menuItems[i].isDisabledOrHidden()) {
        setAndFocusCurrentMenu(i)
        break
      }
    }
  }
  else {
    for (let i = startIndex !== undefined ? startIndex : (menuItems.length - 1); i >= 0; i--) {
      if (!menuItems[i].isDisabledOrHidden()) {
        setAndFocusCurrentMenu(i)
        break
      }
    }
  }
}

function setAndFocusCurrentMenu(index?: number) {
  if (currentItem)
    blurCurrentMenu()
  if (index !== undefined)
    currentItem = menuItems[Math.max(0, Math.min(index, menuItems.length - 1))]
  if (!currentItem)
    return

  currentItem.focus()

  // 键盘移动时把当前项滚入视野
  const element = currentItem.getElement()
  if (element) {
    element.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
      inline: 'nearest',
    })
  }
}

function onSubMenuBodyClick() {
  // 鼠标点击也可以切换当前聚焦的子菜单
  globalSetCurrentSubMenu(thisMenuInsContext)
}

const thisMenuInsContext: SubMenuContext = {
  el: menu,
  name: debugMenuItemName,
  isTopLevel: () => parentContext.getParentContext() === null,
  closeSelfAndActiveParent: () => {
    const parent = thisMenuContext.getParentContext()
    if (parent) {
      parent.closeOtherSubMenu()
      const context = parent.getSubMenuInstanceContext()
      if (context) {
        context.focusCurrentItem()
        return true
      }
    }
    return false
  },
  closeCurrentSubMenu: () => thisMenuContext.getParentContext()?.closeOtherSubMenu(),
  moveCurrentItemFirst: () => setAndFocusNotDisableItem(true),
  moveCurrentItemLast: () => setAndFocusNotDisableItem(false),
  moveCurrentItemDown: () => setAndFocusNotDisableItem(true, (currentItem ? (menuItems.indexOf(currentItem) + 1) : 0)),
  moveCurrentItemUp: () => setAndFocusNotDisableItem(false, (currentItem ? (menuItems.indexOf(currentItem) - 1) : 0)),
  focusCurrentItem: () => setAndFocusCurrentMenu(),
  openCurrentItemSubMenu: () => {
    if (currentItem)
      return currentItem?.showSubMenu()
    return false
  },
  triggerCurrentItemClick: e => currentItem?.click(e),
}

let isOpenedByKeyboardFlag = false
let isMenuItemDataCollectedFlag = false

// #endregion

// #region 菜单控制上下文

// 提供给子级使用
const thisMenuContext: SubMenuParentContext = {
  zIndex: zIndex + 1,
  container: parentContext.container,
  adjustPadding: (options.value.adjustPadding as { x: number, y: number }) || MENU_CONST_OPTIONS.defaultAdjustPadding,
  getParentWidth: () => menu.value?.offsetWidth || 0,
  getParentHeight: () => menu.value?.offsetHeight || 0,
  getPosition: () => [position.value.x, position.value.y],
  getZoom: () => options.value.zoom || MENU_CONST_OPTIONS.defaultZoom,
  addOpenedSubMenu(closeFn: () => void) {
    openedSubMenus.push(closeFn)
    pushSubMenuLayer(closeFn)
  },
  closeOtherSubMenu() {
    clearLeaveTimeout()
    openedSubMenus.forEach(fn => fn())
    openedSubMenus.splice(0, openedSubMenus.length)
    globalSetCurrentSubMenu(thisMenuInsContext)
  },
  checkCloseOtherSubMenuTimeout() {
    if (leaveTimeout) {
      clearLeaveTimeout()
      return true
    }
    return false
  },
  closeOtherSubMenuWithTimeout() {
    // 点击模式不靠指针离开收起，遮罩负责关一层
    if (interaction.value === 'mobile')
      return
    // 没有打开的子菜单就没必要挂计时器
    if (openedSubMenus.length === 0)
      return
    // 重新计时：连续扫过多个同级项时，只以最后一次为准
    clearLeaveTimeout()
    const delay = options.value.subMenuCloseDelay ?? MENU_CONST_OPTIONS.defaultSubMenuCloseDelay
    if (delay <= 0) {
      thisMenuContext.closeOtherSubMenu()
      return
    }
    leaveTimeout = setTimeout(() => {
      leaveTimeout = 0
      thisMenuContext.closeOtherSubMenu()
    }, delay) as unknown as number
  },
  openSubMenuWithDelay(openFn: () => void, menuItemEl: HTMLElement) {
    clearPendingOpenTimeout()
    // 即将打开新的子菜单，之前挂起的收起已无意义
    clearLeaveTimeout()
    // 点击模式立即打开，不走悬停延迟
    if (interaction.value === 'mobile') {
      thisMenuContext.closeOtherSubMenu()
      openFn()
      return
    }
    const delay = options.value.subMenuOpenDelay ?? MENU_CONST_OPTIONS.defaultSubMenuOpenDelay
    const hasOpenedSubMenu = openedSubMenus.length > 0

    if (delay === 0 || !hasOpenedSubMenu) {
      thisMenuContext.closeOtherSubMenu()
      openFn()
    }
    else {
      pendingOpenTimeout = setTimeout(() => {
        pendingOpenTimeout = 0
        // 延迟期间鼠标可能已经移开，只对仍处于 hover 的项生效
        if (menuItemEl.matches(':hover')) {
          thisMenuContext.closeOtherSubMenu()
          openFn()
        }
        else {
          // 这次打开没等到：指针已经飘走，按「离开当前子菜单」处理，
          // 否则被这次打开取消掉的挂起收起就再也不会触发了。
          thisMenuContext.closeOtherSubMenuWithTimeout()
        }
      }, delay) as unknown as number
    }
  },
  cancelPendingOpen() {
    clearPendingOpenTimeout()
  },
  addChildMenuItem: (item: MenuItemContext, index?: number) => {
    if (index === undefined)
      menuItems.push(item)
    else
      menuItems.splice(index, 0, item)
  },
  removeChildMenuItem: (item: MenuItemContext) => {
    menuItems.splice(menuItems.indexOf(item), 1)
    item.getSubMenuInstance = () => undefined
  },
  markActiveMenuItem: (item: MenuItemContext, updateState = false) => {
    blurCurrentMenu()
    currentItem = item
    if (updateState)
      setAndFocusCurrentMenu()
  },
  markThisOpenedByKeyboard: () => {
    isOpenedByKeyboardFlag = true
  },
  isOpenedByKeyboardFlag: () => {
    if (isOpenedByKeyboardFlag) {
      isOpenedByKeyboardFlag = false
      return true
    }
    return false
  },
  isMenuItemDataCollectedFlag: () => isMenuItemDataCollectedFlag,
  getElement: () => menu.value || null,
  getParentContext: () => parentContext,
  getSubMenuInstanceContext: () => thisMenuInsContext,
  getMenuRoot: () => submenuRoot.value || null,
}
provide('menuContext', thisMenuContext)

/**
 * 指针进入子菜单：取消祖先链上所有挂起的「延迟收起」与「延迟打开」。
 *
 * 子菜单是 teleport 出来的，DOM 上并不是父菜单的后代，所以从外层子菜单移进
 * 内层子菜单时，外层先收到 mouseleave 并排了一次收起。这里把祖先链上的挂起
 * 操作全部取消，避免刚指向内层就把整条分支关掉、或让某个早已离开的兄弟项
 * 把当前子菜单覆盖掉。
 */
function onSubMenuMouseEnter() {
  if (interaction.value === 'mobile')
    return
  let ctx: SubMenuParentContext | null = parentContext
  while (ctx) {
    ctx.checkCloseOtherSubMenuTimeout()
    ctx.cancelPendingOpen()
    ctx = ctx.getParentContext()
  }
}

/** 指针离开子菜单：进入宽限期，移回父项或进入内层子菜单时会被取消。 */
function onSubMenuMouseLeave() {
  if (interaction.value === 'mobile')
    return
  parentContext.closeOtherSubMenuWithTimeout()
}

/** 点遮罩只关最上面一层，不关整棵菜单。 */
function onMaskClick(e: MouseEvent) {
  e.stopPropagation()
  popSubMenuLayer()
}

// #endregion

// #region 对外暴露的实例

const exposeContext: ContextSubMenuInstance = {
  getChildItem: (index: number) => menuItems[index],
  getMenuDimensions: () => {
    if (submenuRoot.value) {
      return {
        width: submenuRoot.value.offsetWidth,
        height: submenuRoot.value.offsetHeight,
      }
    }
    return { width: 0, height: 0 }
  },
  getSubmenuRoot: () => submenuRoot.value,
  getMenu: () => menu.value,
  getScrollValue: () => scrollRef.value?.scrollTop || 0,
  setScrollValue: (value: number) => scrollRef.value?.scrollTo({ top: value }),
  getScrollHeight: () => scrollRef.value?.scrollHeight || 0,
  adjustPosition: () => {
    doAdjustPosition()
  },
  getMaxHeight: () => scrollMaxHeight.value,
  getPosition: () => position.value,
  setPosition: (x: number, y: number) => {
    position.value.x = x
    position.value.y = y
  },
}

// #endregion

// #region 回填父菜单项上下文

const menuItemInstance = inject<MenuItemContext | undefined>('menuItemInstance', undefined)
if (menuItemInstance)
  menuItemInstance.getSubMenuInstance = () => exposeContext

// #endregion

const scrollMaxHeight = ref(0)
const scrollMaxWidth = ref(0)
const position = ref({ x: 0, y: 0 } as ContextMenuPositionData)
const maskBox = ref({ left: 0, top: 0, width: 0, height: 0 })

/** mobile 下，子菜单展开时盖住直接父菜单，点它只关一层。根菜单没有父级。 */
const showMask = computed(() => interaction.value === 'mobile' && props.show && !!parentContext.getMenuRoot())

function updateMaskBox() {
  const parentRoot = parentContext.getMenuRoot()
  const container = parentContext.container
  if (!parentRoot || !container)
    return
  maskBox.value = {
    left: getOffsetLeft(parentRoot, container),
    top: getOffsetTop(parentRoot, container),
    width: parentRoot.offsetWidth,
    height: parentRoot.offsetHeight,
  }
}

/**
 * max-width 的上限：使用方给的（含菜单项自己的）优先，否则按层级取默认值。
 *
 * 子菜单默认比根菜单窄一档：几层子菜单一起展开时，窄一点才不容易顶到容器边缘，
 * 也就更少出现「被迫盖住父菜单」的情况。
 */
const configuredMaxWidth = computed(() => {
  const configured = props.maxWidth ? Number.parseFloat(resolveSize(props.maxWidth)) || 0 : 0
  if (configured > 0)
    return configured
  return parentContext.getParentContext() === null
    ? MENU_CONST_OPTIONS.defaultMaxWidth
    : MENU_CONST_OPTIONS.defaultSubMenuMaxWidth
})
// 再和「回夹后能放下的宽度」取小值
const resolvedMaxWidth = computed(() => {
  const limit = Math.min(configuredMaxWidth.value, scrollMaxWidth.value || Infinity)
  return Number.isFinite(limit) ? `${limit}px` : 'none'
})

/** 菜单到可用区域边缘的最小留白（像素）。 */
const MENU_VIEWPORT_MARGIN = 4

/**
 * 子菜单要避开的横向区间：父菜单外框。
 *
 * 量的是 `.vgo-context-menu` 自己的 `offsetLeft` + `offsetWidth`（含边框），
 * 和子菜单的 `left` 用同一套坐标，两边外框相接、中间不留缝。
 * 父菜单被回夹之后这里读到的是它实际占据的位置。
 *
 * 返回 `undefined` 表示没有父菜单（根菜单），只按视口边距回夹。
 */
function getParentAvoid(isTopLevel: boolean): { left: number, right: number } | undefined {
  const container = parentContext.container
  const parentRoot = parentContext.getMenuRoot()
  if (isTopLevel || !parentRoot || !container)
    return undefined
  const left = getOffsetLeft(parentRoot, container)
  const width = parentRoot.offsetWidth
  if (width <= 0)
    return undefined
  return { left, right: left + width }
}

/**
 * 从父项（或根配置坐标）出发，按弹出方向摆开，再在溢出容器时翻转 / 回夹 / 限制尺寸。
 *
 * 每次都从锚点重新算：菜单是绝对定位、位置完全由锚点和自身尺寸决定，重入时若在
 * 上一次的结果上继续偏移，就会出现「位置越算越远」。
 */
function doAdjustPosition() {
  nextTick(() => {
    const menuEl = menu.value
    const submenuRootEl = submenuRoot.value

    if (menuEl && submenuRootEl && scrollRef.value) {
      const { container } = parentContext

      const parentWidth = getParentWidth?.() ?? 0

      const rootStyle = getComputedStyle(submenuRootEl)
      // 用菜单自身的内边距做翻转时的留白，避免翻过来后紧贴父菜单。
      // getComputedStyle 在某些时序下会返回空串，兜底成 0 以免坐标算成 NaN。
      const fillPaddingX = Number.parseFloat(rootStyle.paddingLeft) || 0
      const fillPaddingYTop = Number.parseFloat(rootStyle.paddingTop) || 0
      const fillPaddingYBottom = Number.parseFloat(rootStyle.paddingBottom) || 0
      const fillBorderY = (Number.parseFloat(rootStyle.borderTopWidth) || 0)
        + (Number.parseFloat(rootStyle.borderBottomWidth) || 0)

      const zoom = getZoom() || MENU_CONST_OPTIONS.defaultZoom
      // 可用区域取 clientWidth/Height（不含边框），才是可以真正放下菜单的盒子。
      // 容器被 transform: scale() 缩放过时这两个值仍是未缩放尺寸，要除回 zoom，
      // 才能和菜单自身的 offsetWidth/Height 放在同一坐标系里比。
      const availableWidth = container.clientWidth / zoom
      const availableHeight = container.clientHeight / zoom

      // 基准位置：有父菜单项就贴父项，根菜单用配置里的 x / y
      const parentElement = props.parentMenuItemContext?.getElement()
      if (parentElement) {
        position.value.x = getOffsetLeft(parentElement, container)
        position.value.y = getOffsetTop(parentElement, container)
      }
      else {
        const [x, y] = parentContext.getPosition()
        position.value.x = x
        position.value.y = y
      }

      // 方向偏移相对「父项」算：父项的 y 不一定要减内边距（子菜单向下弹时
      // 减了反而会压到父项上），只有父菜单存在时才让开这层留白。
      const fillPaddingY = parentContext.getParentContext() !== null ? fillPaddingYTop : 0
      const parentMenuRoot = parentContext.getMenuRoot()

      // 有父菜单时，水平位置贴着父菜单外框，不再按内容盒加一截缝。
      if (parentMenuRoot) {
        const parentLeft = getOffsetLeft(parentMenuRoot, container)
        const parentBoxWidth = parentMenuRoot.offsetWidth
        if (props.direction.includes('l'))
          position.value.x = parentLeft - menuEl.offsetWidth
        else if (props.direction.includes('r'))
          position.value.x = parentLeft + parentBoxWidth
        else
          position.value.x = parentLeft + (parentBoxWidth - menuEl.offsetWidth) / 2
      }
      else if (props.direction.includes('l')) {
        position.value.x -= menuEl.offsetWidth + fillPaddingX
      }
      else if (props.direction.includes('r')) {
        position.value.x += parentWidth + fillPaddingX
      }
      else {
        position.value.x += parentWidth / 2
        position.value.x -= (menuEl.offsetWidth + fillPaddingX) / 2
      }

      // y 方向
      if (props.direction.includes('t')) {
        const parentElement2 = props.parentMenuItemContext?.getElement()
        if (parentElement2)
          position.value.y += parentElement2.offsetHeight
        position.value.y -= (menuEl.offsetHeight + fillPaddingYTop) / zoom
      }
      else if (props.direction.includes('b')) {
        position.value.y -= fillPaddingY / zoom
      }
      else {
        position.value.y -= (menuEl.offsetHeight / 2) / zoom
      }

      // 溢出修正：先按老规矩从锚点方向翻到反侧，再统一回夹进可用区域。
      // 翻转只处理「从锚点弹出去越界」；右 / 下越界、菜单比可用区域还大、
      // 以及锚点本身贴着左 / 上边缘这三种情况由 clampBoxToContainer 兜底。
      const xOverflow = (getOffsetLeft(menuEl, container) + menuEl.offsetWidth) - availableWidth
      const isTopLevel = parentContext.getParentContext() === null
      // 菜单没被夹过的自然高度 = 滚动区内容高度 + 菜单根自身的上下内边距 / 边框
      const itemsHeight = scrollRef.value?.scrollHeight || 0
      // 内容自然宽度：夹得比它窄就会出横向滚动条
      const itemsScrollWidth = scrollRef.value?.scrollWidth || 0
      const requestedMaxHeight = props.maxHeight || 0
      const naturalHeight = itemsHeight + fillPaddingYTop + fillPaddingYBottom + fillBorderY
      const yOverflow = (getOffsetTop(menuEl, container) + naturalHeight) - availableHeight

      // 子菜单的左右翻转交给下面的回夹：它按父菜单外框贴边摆，这里再翻一次会对不齐。
      if (adjustPosition.value && xOverflow > 0 && !parentMenuRoot) {
        // 水平翻到锚点左侧。默认右缘对齐锚点 x（右键菜单按光标翻转）；
        // 根菜单若传了 anchorWidth（元素锚定的下拉），改对齐到 x + anchorWidth，
        // 也就是触发元素的右缘，翻过去仍然贴着按钮。
        // 子菜单不参与：它翻转时必须完整让开父菜单，不能用锚点宽度缩水，
        // 否则会盖到父菜单上。`globalOptions` 是所有层级共享的，所以要按层级判断。
        const anchorWidth = isTopLevel ? (options.value.anchorWidth ?? 0) : 0
        const ox = parentWidth + menuEl.offsetWidth - fillPaddingX - anchorWidth
        const maxSubWidth = getOffsetLeft(menuEl, container)
        position.value.x -= Math.max(0, ox > maxSubWidth ? maxSubWidth : ox)
      }

      const clampedYOverflow = adjustPosition.value && yOverflow > 0
      if (clampedYOverflow)
        position.value.y -= yOverflow

      const parentAvoid = getParentAvoid(isTopLevel)

      const clamped = clampBoxToContainer({
        x: position.value.x,
        y: position.value.y,
        width: menuEl.offsetWidth,
        height: naturalHeight,
        containerWidth: availableWidth,
        containerHeight: availableHeight,
        margin: MENU_VIEWPORT_MARGIN,
        avoid: parentAvoid,
        minContentWidth: itemsScrollWidth,
        maxHeight: requestedMaxHeight,
      })

      position.value.x = clamped.x
      position.value.y = clamped.y
      scrollMaxWidth.value = clamped.maxWidth ?? 0

      // 给内层滚动容器封顶。上限是所有约束里最紧的那条：
      // 回夹算出来的可用高度、使用方给的 maxHeight、以及自然高度本身。
      // 封顶只作用在滚动区上，所以还要把菜单根元素自己的内边距 / 边框减掉，
      // 否则菜单连同内边距会比可用区域高出一点，正好被贴边的容器切掉。
      const heightLimit = Math.min(
        clamped.maxHeight ?? Infinity,
        requestedMaxHeight || Infinity,
        naturalHeight,
      )
      scrollMaxHeight.value = Number.isFinite(heightLimit)
        ? Math.max(0, heightLimit - fillPaddingYTop - fillPaddingYBottom - fillBorderY)
        : 0
    }
  })
}

/** 展开时的处理。 */
function showSolve() {
  updateMaskBox()
  nextTick(() => {
    globalSetCurrentSubMenu(thisMenuInsContext)
    menu.value?.focus({ preventScroll: true })

    // 键盘打开的子菜单默认选中第一项
    if (parentContext.isOpenedByKeyboardFlag())
      nextTick(() => setAndFocusNotDisableItem(true))

    isMenuItemDataCollectedFlag = true
  })

  // 位置每次展开都从锚点重算，关闭时销毁的菜单因此每次都从同一处摆开
  doAdjustPosition()
}

watch(() => props.show, (value) => {
  if (value)
    showSolve()
})

onMounted(() => {
  mounted.value = true
  // 初值就是显示的菜单（函数式菜单的根菜单永远走这条）不会触发 watch，
  // 要在这里补一次布局；`show` 中途变化的情况由 watch 负责。
  if (props.show)
    showSolve()
  else
    doAdjustPosition()
})

onBeforeUnmount(() => {
  mounted.value = false
  clearLeaveTimeout()
  clearPendingOpenTimeout()
  openedSubMenus.forEach(fn => removeSubMenuLayer(fn))
  openedSubMenus.splice(0, openedSubMenus.length)
  if (menuItemInstance)
    menuItemInstance.getSubMenuInstance = () => undefined
})

defineExpose(exposeContext)
</script>

<template>
  <Teleport v-if="mounted" :to="`#${globalGetMenuHostId}`">
    <div
      v-if="showMask"
      class="vgo-context-menu__mask"
      :style="{
        zIndex,
        left: `${maskBox.left}px`,
        top: `${maskBox.top}px`,
        width: `${maskBox.width}px`,
        height: `${maskBox.height}px`,
      }"
      @click="onMaskClick"
    />
    <Transition
      v-bind="resolveMenuTransitionProps(options.menuTransitionProps)"
      @after-leave="emit('closeAnimFinished')"
    >
      <div
        v-if="!destroyOnClose || show"
        v-show="show"
        ref="submenuRoot"
        v-bind="$attrs"
        class="vgo-context-menu" :class="[
          options.customClass ? options.customClass : '',
          globalIsDark ? 'is-dark' : '',
        ]"
        :style="{
          maxWidth: resolvedMaxWidth,
          minWidth: minWidth ? resolveSize(minWidth) : `${MENU_CONST_OPTIONS.defaultMinWidth}px`,
          zIndex,
          left: `${position.x}px`,
          top: `${position.y}px`,
        }"
        data-type="ContextSubMenu"
        @mouseenter="onSubMenuMouseEnter"
        @mouseleave="onSubMenuMouseLeave"
        @click="onSubMenuBodyClick"
      >
        <!-- 原生滚动容器：只保留结构，滚动条外观走 .vgo-u-scrollbar -->
        <div
          ref="scrollRef"
          class="vgo-context-menu__scroll vgo-u-scrollbar"
          :style="scrollMaxHeight ? { maxHeight: `${scrollMaxHeight}px` } : undefined"
        >
          <div ref="menu" class="vgo-context-menu__items" tabindex="-1">
            <slot>
              <template v-for="(item, index) in items" :key="index">
                <ContextMenuSeparator v-if="item.hidden !== true && item.divided === 'up'" />
                <ContextMenuSeparator v-if="item.hidden !== true && item.divided === 'self'" />
                <!-- 菜单项 -->
                <ContextMenuItem
                  v-else
                  :click-handler="item.onClick ? (e: MouseEvent | KeyboardEvent) => item.onClick!(e) : undefined"
                  :disabled="unwrapBoolean(item.disabled)"
                  :hidden="unwrapBoolean(item.hidden)"
                  :icon="item.icon"
                  :icon-font-class="item.iconFontClass"
                  :svg-icon="item.svgIcon"
                  :svg-props="item.svgProps"
                  :label="item.label"
                  :custom-render="(item.customRender as ((item: MenuItem) => unknown) | undefined)"
                  :custom-class="item.customClass"
                  :checked="unwrapBoolean(item.checked)"
                  :shortcut="item.shortcut"
                  :click-close="item.clickClose"
                  :clickable-when-has-children="item.clickableWhenHasChildren"
                  :preserve-icon-width="item.preserveIconWidth !== undefined ? item.preserveIconWidth : options.preserveIconWidth"
                  :show-right-arrow="!!(item.children && item.children.length > 0)"
                  :has-children="!!(item.children && item.children.length > 0)"
                  :raw-menu-item="item"
                  @sub-menu-open="(v: MenuItemContext | undefined) => item.onSubMenuOpen?.(v)"
                  @sub-menu-close="(v: MenuItemContext | undefined) => item.onSubMenuClose?.(v)"
                >
                  <template v-if="item.children && item.children.length > 0" #submenu="{ context, show: submenuShow }">
                    <!-- 子菜单 -->
                    <ContextSubMenu
                      :show="submenuShow"
                      :destroy-on-close="destroyOnClose"
                      :parent-menu-item-context="context"
                      :items="item.children"
                      :max-width="item.maxWidth"
                      :min-width="item.minWidth"
                      :max-height="item.maxHeight"
                      :adjust-position="item.adjustSubMenuPosition !== undefined ? item.adjustSubMenuPosition : options.adjustPosition"
                      :direction="item.direction !== undefined ? item.direction : options.direction"
                    />
                  </template>
                </ContextMenuItem>
                <!-- 分隔线 -->
                <ContextMenuSeparator v-if="item.hidden !== true && (item.divided === 'down' || item.divided === true)" />
              </template>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
