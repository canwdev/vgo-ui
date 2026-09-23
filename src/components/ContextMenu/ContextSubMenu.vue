<script lang="ts" setup>
import type { Ref } from 'vue'
import type { SubMenuContext, SubMenuParentContext } from './context'
import type {
  ContextMenuPositionData,
  ContextSubMenuInstance,
  MenuItem,
  MenuItemContext,
  MenuOptions,
  MenuPopDirection,
} from './types'
import { inject, nextTick, onBeforeUnmount, onMounted, provide, ref, toRefs, watch } from 'vue'
import ContextMenuItem from './ContextMenuItem.vue'
import ContextMenuSeparator from './ContextMenuSeparator.vue'
import { MENU_CONST_OPTIONS } from './types'
import { getOffsetLeft, getOffsetTop, resolveSize, unwrapBoolean } from './utils'

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
const debugMenuItemNameDefault = ref('UnknownOrRoot')
const debugMenuItemName = inject<Ref<string>>('MenuItemName', debugMenuItemNameDefault)

// #endregion

const { zIndex, getParentWidth, getParentHeight, getZoom } = parentContext
const { adjustPosition } = toRefs(props)

const scrollRef = ref<HTMLElement>()
const submenuRoot = ref<HTMLElement>()
const menu = ref<HTMLElement>()
const openedSubMenuClose = [] as (() => void)[]

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
    openedSubMenuClose.push(closeFn)
  },
  closeOtherSubMenu() {
    clearLeaveTimeout()
    openedSubMenuClose.forEach(fn => fn())
    openedSubMenuClose.splice(0, openedSubMenuClose.length)
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
    // 没有打开的子菜单就没必要挂计时器
    if (openedSubMenuClose.length === 0)
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
    const delay = options.value.subMenuOpenDelay ?? MENU_CONST_OPTIONS.defaultSubMenuOpenDelay
    const hasOpenedSubMenu = openedSubMenuClose.length > 0

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
  let ctx: SubMenuParentContext | null = parentContext
  while (ctx) {
    ctx.checkCloseOtherSubMenuTimeout()
    ctx.cancelPendingOpen()
    ctx = ctx.getParentContext()
  }
}

/** 指针离开子菜单：进入宽限期，移回父项或进入内层子菜单时会被取消。 */
function onSubMenuMouseLeave() {
  parentContext.closeOtherSubMenuWithTimeout()
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

const contentHeight = ref(0)
const scrollMaxHeight = ref(0)
const overflow = ref(false)
const position = ref({ x: 0, y: 0 } as ContextMenuPositionData)

/**
 * 计算子菜单相对父项的位置，并在溢出容器时翻转 / 限制高度。
 */
function doAdjustPosition() {
  nextTick(() => {
    const menuEl = menu.value
    const submenuRootEl = submenuRoot.value

    if (menuEl && submenuRootEl && scrollRef.value) {
      const { container } = parentContext

      const parentWidth = getParentWidth?.() ?? 0
      const parentHeight = getParentHeight?.() ?? 0

      const rootStyle = getComputedStyle(submenuRootEl)
      // 用菜单自身的内边距做翻转时的留白，避免翻过来后紧贴父菜单。
      // getComputedStyle 在某些时序下会返回空串，兜底成 0 以免坐标算成 NaN。
      const fillPaddingX = Number.parseFloat(rootStyle.paddingLeft) || 0
      const fillPaddingYAlways = Number.parseFloat(rootStyle.paddingTop) || 0
      const fillPaddingY = parentHeight > 0 ? fillPaddingYAlways : 0

      const zoom = getZoom()
      const windowHeight = document.documentElement.scrollHeight / zoom
      const windowWidth = document.documentElement.scrollWidth / zoom

      const availableWidth = Math.min(windowWidth, container.offsetWidth)
      const availableHeight = Math.min(windowHeight, container.offsetHeight)

      // x 方向
      if (props.direction.includes('l')) {
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
        const parentElement = props.parentMenuItemContext?.getElement()
        if (parentElement)
          position.value.y += parentElement.offsetHeight
        position.value.y -= (menuEl.offsetHeight + fillPaddingYAlways) / zoom
      }
      else if (props.direction.includes('b')) {
        position.value.y -= fillPaddingYAlways / zoom
      }
      else {
        position.value.y -= (menuEl.offsetHeight / 2) / zoom
      }

      // 溢出修正
      nextTick(() => {
        const absX = getOffsetLeft(menuEl, container)
        const absY = getOffsetTop(menuEl, container)

        const height = scrollRef.value?.scrollHeight || 0
        const maxHeight = props.maxHeight

        contentHeight.value = props.maxHeight ? Math.min(height, props.maxHeight) : height

        const xOverflow = (absX + menuEl.offsetWidth) - availableWidth
        const yOverflow = (absY + contentHeight.value + fillPaddingY * 2) - availableHeight
        overflow.value = yOverflow > 0

        if (adjustPosition.value && xOverflow > 0) {
          // 水平翻到锚点左侧。默认右缘对齐锚点 x（右键菜单按光标翻转）；
          // 根菜单若传了 anchorWidth（元素锚定的下拉），改对齐到 x + anchorWidth，
          // 也就是触发元素的右缘，翻过去仍然贴着按钮。
          // 子菜单不参与：它翻转时必须完整让开父菜单，不能用锚点宽度缩水，
          // 否则会盖到父菜单上。`globalOptions` 是所有层级共享的，所以要按层级判断。
          const isTopLevel = parentContext.getParentContext() === null
          const anchorWidth = isTopLevel ? (options.value.anchorWidth ?? 0) : 0
          const ox = parentWidth + menuEl.offsetWidth - fillPaddingX - anchorWidth
          const maxSubWidth = absX
          position.value.x -= Math.max(0, ox > maxSubWidth ? maxSubWidth : ox)
        }

        if (overflow.value) {
          if (adjustPosition.value) {
            const oy = yOverflow
            const maxSubHeight = absY
            position.value.y -= oy > maxSubHeight ? maxSubHeight - fillPaddingY : oy - fillPaddingY
          }
          scrollMaxHeight.value = availableHeight - (position.value.y + fillPaddingYAlways)
        }
        else {
          scrollMaxHeight.value = maxHeight || 0
        }
      })
    }
  })
}

/** 展开时的处理。 */
function showSolve() {
  const parentElement = props.parentMenuItemContext?.getElement()
  if (parentElement) {
    position.value.x = getOffsetLeft(parentElement, parentContext.container)
    position.value.y = getOffsetTop(parentElement, parentContext.container)
  }
  else {
    const [x, y] = parentContext.getPosition()
    position.value.x = x
    position.value.y = y
  }

  nextTick(() => {
    globalSetCurrentSubMenu(thisMenuInsContext)
    menu.value?.focus({ preventScroll: true })

    // 键盘打开的子菜单默认选中第一项
    if (parentContext.isOpenedByKeyboardFlag())
      nextTick(() => setAndFocusNotDisableItem(true))

    isMenuItemDataCollectedFlag = true
  })

  doAdjustPosition()
}

watch(() => props.show, (value) => {
  if (value)
    showSolve()
})

onMounted(() => {
  mounted.value = true
  if (props.show)
    showSolve()
  else
    doAdjustPosition()
})

onBeforeUnmount(() => {
  mounted.value = false
  clearLeaveTimeout()
  clearPendingOpenTimeout()
  if (menuItemInstance)
    menuItemInstance.getSubMenuInstance = () => undefined
})

defineExpose(exposeContext)
</script>

<template>
  <Teleport v-if="mounted" :to="`#${globalGetMenuHostId}`">
    <Transition
      appear
      v-bind="options.menuTransitionProps || { duration: 10 }"
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
          maxWidth: (maxWidth ? resolveSize(maxWidth) : `${MENU_CONST_OPTIONS.defaultMaxWidth}px`),
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
