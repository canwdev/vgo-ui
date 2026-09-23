<script lang="ts" setup>
import type { Ref, SVGAttributes } from 'vue'
import type { GlobalHasSlot, GlobalRenderSlot, SubMenuParentContext } from './context'
import type { MenuItem, MenuItemContext, MenuOptions } from './types'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, toRefs } from 'vue'
import ContextMenuIconArrow from './ContextMenuIconArrow.vue'
import ContextMenuIconCheck from './ContextMenuIconCheck.vue'
import { hashCode, isRetargetedTouchClick, VNodeRender } from './utils'

defineOptions({
  name: 'ContextMenuItem',
})

const props = withDefaults(
  defineProps<{
    /** 是否禁用。 */
    disabled?: boolean
    /** 是否隐藏。 */
    hidden?: boolean
    /** 自定义渲染。 */
    customRender?: ((item: MenuItem) => unknown) | null
    /** 菜单项自定义类名。 */
    customClass?: string
    /** 点击回调。 */
    clickHandler?: ((e: MouseEvent | KeyboardEvent) => void) | null
    /** 菜单项文字。 */
    label?: string | object | ((label: string) => unknown)
    /** 菜单项图标。 */
    icon?: string | object | ((icon: string) => unknown)
    /** 自定义图标字体类名。 */
    iconFontClass?: string
    /** 是否勾选。 */
    checked?: boolean
    /** 快捷键显示文本。 */
    shortcut?: string
    /** svg symbol 图标名。 */
    svgIcon?: string
    /** svg 自定义属性。 */
    svgProps?: SVGAttributes | null
    /** 是否为无图标项保留图标占位。 */
    preserveIconWidth?: boolean
    /** 是否显示右侧箭头。 */
    showRightArrow?: boolean
    /** 是否含子菜单。 */
    hasChildren?: boolean
    /** 点击后是否关闭菜单。 */
    clickClose?: boolean
    /** 含子菜单时是否允许触发自身点击。 */
    clickableWhenHasChildren?: boolean
    /** 原始菜单项数据。 */
    rawMenuItem?: MenuItem
  }>(),
  {
    disabled: false,
    hidden: false,
    customRender: null,
    customClass: '',
    clickHandler: null,
    label: '',
    icon: '',
    iconFontClass: 'iconfont',
    checked: false,
    shortcut: '',
    svgIcon: '',
    svgProps: null,
    preserveIconWidth: true,
    showRightArrow: false,
    hasChildren: false,
    clickClose: true,
    clickableWhenHasChildren: false,
    rawMenuItem: undefined,
  },
)

const emit = defineEmits(['click', 'subMenuOpen', 'subMenuClose'])

const {
  clickHandler,
  clickClose,
  clickableWhenHasChildren,
  disabled,
  hidden,
  label,
  icon,
  iconFontClass,
  showRightArrow,
  shortcut,
  hasChildren,
} = toRefs(props)

const showSubMenu = ref(false)
const keyboardFocusMenu = ref(false)
const menuItemRef = ref<HTMLElement>()

const options = inject('globalOptions') as Ref<MenuOptions>
const globalIsDark = inject('globalIsDark') as Ref<boolean>
const globalHasSlot = inject('globalHasSlot') as GlobalHasSlot
const globalRenderSlot = inject('globalRenderSlot') as GlobalRenderSlot
const globalCloseMenu = inject('globalCloseMenu') as (fromItem: MenuItem | undefined) => void
const menuContext = inject('menuContext') as SubMenuParentContext

const nameForDebug = computed(() => {
  if (typeof label.value === 'string')
    return label.value
  if (typeof label.value === 'function')
    return String(hashCode(label.value.toString()))
  return 'MenuItem[unknown]'
})

provide('MenuItemName', nameForDebug)

/** 菜单项内部实例，键盘导航与父子联动都通过它。 */
const menuItemInstance: MenuItemContext = {
  getSubMenuInstance: () => undefined,
  showSubMenu: () => {
    if (showSubMenu.value) {
      menuContext.markActiveMenuItem(menuItemInstance, true)
      return true
    }
    else if (hasChildren.value) {
      onMouseEnter()
      return true
    }
    return false
  },
  hideSubMenu: () => {
    menuContext.closeOtherSubMenu()
  },
  isDisabledOrHidden: () => disabled.value || hidden.value,
  getElement: () => menuItemRef.value,
  focus: () => {
    keyboardFocusMenu.value = true
  },
  blur: () => {
    keyboardFocusMenu.value = false
  },
  click: onClick,
}

provide('menuItemInstance', menuItemInstance)

onMounted(() => {
  if (menuContext.isMenuItemDataCollectedFlag()) {
    // 当前菜单项是在整体加载完成后才出现的，此时无法知道它在菜单中的顺序，
    // 只能在父元素里按 DOM 位置回推。
    nextTick(() => {
      let index = 0
      const parentEl = menuContext.getElement()
      if (parentEl) {
        let indexCounting = 0
        for (let i = 0; i < parentEl.children.length; i++) {
          const el = parentEl.children[i]
          if (el.getAttribute('data-type') === 'ContextMenuItem') {
            if (el === menuItemRef.value) {
              index = indexCounting
              break
            }
            indexCounting++
          }
        }
      }
      menuContext.addChildMenuItem(menuItemInstance, index)
    })
  }
  else {
    menuContext.addChildMenuItem(menuItemInstance)
  }
})
onBeforeUnmount(() => {
  menuContext.removeChildMenuItem(menuItemInstance)
})

/** 点击处理。 */
function onClick(e: MouseEvent | KeyboardEvent) {
  if (disabled.value)
    return

  // 触摸补发的 mouseenter 展开子菜单后，同一次 tap 的 click 可能被浏览器
  // 重定向到新出现的菜单项上；忽略它，否则叶子项会顺手关掉整个菜单。
  if (e instanceof MouseEvent && isRetargetedTouchClick(e))
    return

  // 命中特殊元素时忽略
  if (e) {
    const currentTarget = e.target as HTMLElement
    if (currentTarget.classList.contains('vgo-context-menu__no-click'))
      return
    if (options.value.ignoreClickClassName && currentTarget.classList.contains(options.value.ignoreClickClassName))
      return
    if (options.value.clickCloseClassName && currentTarget.classList.contains(options.value.clickCloseClassName)) {
      e.stopPropagation()
      globalCloseMenu(props.rawMenuItem)
      return
    }
  }

  if (hasChildren.value) {
    if (clickableWhenHasChildren.value) {
      if (typeof clickHandler.value === 'function')
        clickHandler.value(e)
      emit('click', e)
    }
    else if (!showSubMenu.value) {
      onMouseEnter()
    }
  }
  else {
    if (typeof clickHandler.value === 'function')
      clickHandler.value(e)
    emit('click', e)
    if (clickClose.value)
      globalCloseMenu(props.rawMenuItem)
  }
}

/** 鼠标进入：展开子菜单。 */
function onMouseEnter(e?: MouseEvent) {
  keyboardFocusMenu.value = false

  if (!disabled.value) {
    menuContext.markActiveMenuItem(menuItemInstance)

    if (hasChildren.value) {
      // 子菜单还开着（例如从兄弟项斜向移回来）：只取消挂起的收起，
      // 不要再走一遍延迟打开，否则会先关再开闪一下。
      if (showSubMenu.value) {
        menuContext.cancelPendingOpen()
        menuContext.checkCloseOtherSubMenuTimeout()
        return
      }

      if (!e)
        menuContext.markThisOpenedByKeyboard()

      menuContext.openSubMenuWithDelay(() => {
        menuContext.addOpenedSubMenu(closeSubMenu)
        showSubMenu.value = true
        nextTick(() => emit('subMenuOpen', menuItemInstance))
      }, menuItemRef.value!)
    }
    else {
      menuContext.cancelPendingOpen()
      // 不立即收起：斜向移动时常会短暂扫过无子项的行，给一段宽限期；
      // 指针若在宽限期内进入子菜单，这次收起会被取消。
      menuContext.closeOtherSubMenuWithTimeout()
    }
  }
}

/** 收起本项子菜单。 */
function closeSubMenu() {
  keyboardFocusMenu.value = false
  showSubMenu.value = false
  emit('subMenuClose', menuItemInstance)
}

/** 供自定义渲染使用的数据。 */
function getItemDataForChildren() {
  return {
    disabled: disabled.value,
    label: label.value,
    icon: icon.value,
    iconFontClass: iconFontClass.value,
    showRightArrow: showRightArrow.value,
    clickClose: clickClose.value,
    clickableWhenHasChildren: clickableWhenHasChildren.value,
    shortcut: shortcut.value,
    theme: (globalIsDark.value ? 'dark' : 'light') as 'light' | 'dark',
    isOpen: showSubMenu,
    hasChildren,
    onClick,
    onMouseEnter,
    closeMenu: globalCloseMenu,
  }
}

defineExpose(menuItemInstance)
</script>

<template>
  <div
    v-if="!hidden"
    ref="menuItemRef"
    class="vgo-context-menu__item-wrapper"
    data-type="ContextMenuItem"
    v-bind="{
      ...$attrs,
      ...(rawMenuItem?.attrs || {}),
    }"
  >
    <!-- 全局/单项自定义渲染 -->
    <VNodeRender
      v-if="globalHasSlot('itemRender')"
      :vnode="() => globalRenderSlot('itemRender', getItemDataForChildren())"
    />
    <VNodeRender
      v-else-if="customRender"
      :vnode="customRender"
      :data="getItemDataForChildren()"
    />
    <!-- 默认菜单项 -->
    <div
      v-else
      class="vgo-context-menu__item" :class="[
        disabled ? 'is-disabled' : '',
        keyboardFocusMenu || showSubMenu ? 'is-active' : '',
        customClass ? ` ${customClass}` : '',
      ]"
      @click="onClick"
      @mouseenter="onMouseEnter"
    >
      <slot>
        <div class="vgo-context-menu__row">
          <div
            class="vgo-context-menu__icon" :class="[
              preserveIconWidth ? 'vgo-context-menu__icon--preserve' : '',
            ]"
          >
            <slot name="icon">
              <VNodeRender
                v-if="globalHasSlot('itemIconRender')"
                :vnode="() => globalRenderSlot('itemIconRender', getItemDataForChildren())"
              />
              <svg
                v-else-if="typeof svgIcon === 'string' && svgIcon"
                class="vgo-context-menu__svg-icon"
                v-bind="svgProps"
              >
                <use :xlink:href="svgIcon" />
              </svg>
              <VNodeRender
                v-else-if="typeof icon !== 'string'"
                :vnode="icon"
                :data="icon"
              />
              <i
                v-else-if="icon !== ''"
                class="vgo-context-menu__icon-font"
                :class="[icon, iconFontClass, options.iconFontClass]"
              />
            </slot>
            <slot v-if="checked" name="check">
              <VNodeRender
                v-if="globalHasSlot('itemCheckRender')"
                :vnode="() => globalRenderSlot('itemCheckRender', getItemDataForChildren())"
              />
              <ContextMenuIconCheck />
            </slot>
          </div>
          <slot name="label">
            <VNodeRender
              v-if="globalHasSlot('itemLabelRender')"
              :vnode="() => globalRenderSlot('itemLabelRender', getItemDataForChildren())"
            />
            <span v-else-if="typeof label === 'string'" class="vgo-context-menu__label">{{ label }}</span>
            <VNodeRender v-else :vnode="label" :data="label" />
          </slot>
        </div>
        <div class="vgo-context-menu__row">
          <slot v-if="shortcut || $slots.shortcut" name="shortcut">
            <VNodeRender
              v-if="globalHasSlot('itemShortcutRender')"
              :vnode="() => globalRenderSlot('itemShortcutRender', getItemDataForChildren())"
            />
            <span v-else class="vgo-badge vgo-context-menu__shortcut">{{ shortcut }}</span>
          </slot>
          <slot v-if="showRightArrow" name="rightArrow">
            <VNodeRender
              v-if="globalHasSlot('itemRightArrowRender')"
              :vnode="() => globalRenderSlot('itemRightArrowRender', getItemDataForChildren())"
            />
            <ContextMenuIconArrow />
          </slot>
        </div>
      </slot>
    </div>

    <!-- 子菜单插槽 -->
    <slot name="submenu" :context="menuItemInstance" :show="showSubMenu" />
  </div>
</template>
