<script lang="ts" setup>
import type { ContextMenuInstance, MenuBarOptions, MenuItem } from './types'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import ContextMenuBarIcon from './ContextMenuBarIcon.vue'
import ContextMenu from './show'
import { getOffsetLeft, getOffsetTop, isDarkThemeName } from './utils'

defineOptions({
  name: 'ContextMenuBar',
})

const props = defineProps<{
  /** 菜单栏配置。 */
  options: MenuBarOptions
}>()

const menuBarContent = ref<HTMLDivElement>()
const menuBarActive = ref(false)
// shallowRef：MenuItem 是递归类型，ref 的 UnwrapRef 会展开到无限深
const menuItems = shallowRef<MenuItem[]>([])
const menuActiveIndex = ref(-1)

const globalIsDark = computed(() => {
  return isDarkThemeName(props.options.theme) || document.documentElement.classList.contains('dark')
})

function onFocus() {
  menuBarActive.value = true
}
function onBlur() {
  menuBarActive.value = false
}

onMounted(() => {
  menuItems.value = props.options.items || []
})
watch(() => props.options, () => {
  menuItems.value = props.options.items || []
})

let currentMenu: ContextMenuInstance | null = null
let currentMenuIndex = -1

function showNextSubMenu() {
  if (currentMenuIndex < menuItems.value.length - 1)
    currentMenuIndex++
  else
    currentMenuIndex = 0
  showSubMenu(currentMenuIndex, menuItems.value[currentMenuIndex] as MenuItem)
}
function showPrevSubMenu() {
  if (currentMenuIndex > 0)
    currentMenuIndex--
  else
    currentMenuIndex = menuItems.value.length - 1
  showSubMenu(currentMenuIndex, menuItems.value[currentMenuIndex] as MenuItem)
}

/** 计算菜单栏项目下方菜单的弹出坐标。 */
function getMenuShowPosition(el: HTMLElement) {
  const direction = props.options.barPopDirection ?? 'bl'
  let x = 0
  let y = 0
  if (direction.startsWith('b'))
    y = getOffsetTop(el) + el.offsetHeight
  else if (direction.startsWith('t'))
    y = getOffsetTop(el)
  else
    y = getOffsetTop(el) + el.offsetHeight / 2

  if (direction.endsWith('l'))
    x = getOffsetLeft(el)
  else if (direction.endsWith('r'))
    x = getOffsetLeft(el) + el.offsetWidth
  else
    x = getOffsetLeft(el) + el.offsetWidth / 2

  return { x, y: y + 5 }
}

function showSubMenu(index: number, item: MenuItem) {
  currentMenuIndex = index
  if (!item.children)
    return
  if (currentMenu) {
    currentMenu.closeMenu()
    currentMenu = null
    menuBarActive.value = true
  }
  menuActiveIndex.value = index
  const el = menuBarContent.value?.children[index] as HTMLElement | undefined
  if (el) {
    const { x, y } = getMenuShowPosition(el)

    currentMenu = ContextMenu.showContextMenu({
      ...props.options,
      items: item.children,
      x,
      y,
      onKeyFocusMoveLeft() {
        showPrevSubMenu()
      },
      onKeyFocusMoveRight() {
        showNextSubMenu()
      },
      onClose() {
        if (menuActiveIndex.value === index) {
          menuBarActive.value = false
          menuActiveIndex.value = -1
        }
        if (typeof item.onSubMenuClose === 'function')
          item.onSubMenuClose(undefined)
      },
    })

    if (currentMenu && typeof item.onSubMenuOpen === 'function')
      item.onSubMenuOpen(undefined)
  }
}
function showAllSubMenu() {
  currentMenuIndex = 0
  const el = menuBarContent.value
  if (el) {
    const { x, y } = getMenuShowPosition(el)
    currentMenu = ContextMenu.showContextMenu({
      ...props.options,
      x,
      y,
    })
  }
}

function onItemClick(index: number, item: MenuItem | null) {
  if (item) {
    menuBarActive.value = true
    showSubMenu(index, item)
    if (
      item.onClick && (
        (item.clickableWhenHasChildren === true && item.children && item.children.length > 0)
        || !item.children || item.children.length === 0)
    ) {
      item.onClick()
    }
  }
  else {
    showAllSubMenu()
  }
}
function onItemEnter(index: number, item: MenuItem) {
  if (menuBarActive.value)
    showSubMenu(index, item)
}

function onItemIndexClick(index: number) {
  const item: MenuItem | undefined = menuItems.value[index]
  onItemClick(index, item ?? null)
}
function onItemIndexEnter(index: number) {
  const item = menuItems.value[index]
  if (item)
    onItemEnter(index, item)
}
</script>

<template>
  <div
    class="vgo-context-menu-bar" :class="[
      globalIsDark ? 'is-dark' : '',
      options.mini ? 'is-mini' : '',
    ]"
    @focus="onFocus"
    @blur="onBlur"
  >
    <slot name="prefix" />

    <div v-if="options.mini" ref="menuBarContent" class="vgo-context-menu-bar__content">
      <div class="vgo-context-menu-bar__item" @click="onItemIndexClick(0)">
        <ContextMenuBarIcon />
      </div>
    </div>
    <div v-else ref="menuBarContent" class="vgo-context-menu-bar__content">
      <!-- 用下标遍历：MenuItem 是递归类型，模板里直接绑定会撑爆 vue-tsc 的类型推导 -->
      <div
        v-for="index in menuItems.length"
        :key="index - 1"
        class="vgo-context-menu-bar__item" :class="[
          menuActiveIndex === index - 1 ? 'is-active' : '',
        ]"
        @click="onItemIndexClick(index - 1)"
        @mouseenter="onItemIndexEnter(index - 1)"
      >
        <span>{{ menuItems[index - 1]?.label }}</span>
      </div>
    </div>

    <slot name="suffix" />
  </div>
</template>
