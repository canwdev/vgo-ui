<script setup lang="ts" generic="T">
import type { MenuItem, MenuOptions } from '../ContextMenu/types'
import type { ManagedWindow, WindowDockMenuLabels, WindowManager } from './window-manager'
import { useEventListener } from '@vueuse/core'
import { ref } from 'vue'
import ContextMenu from '../ContextMenu/show'

const props = withDefaults(defineProps<{
  manager: WindowManager<T>
  // 排列方向，决定拖动排序时按指针的 x 还是 y 判断插入位置
  orientation?: 'horizontal' | 'vertical'
  // 允许拖动排序
  sortable?: boolean
  // 右键菜单：false 关闭；传函数可在默认菜单项上增删改
  contextMenu?: boolean | ((win: ManagedWindow<T>, items: MenuItem[]) => MenuItem[])
  menuLabels?: Partial<WindowDockMenuLabels>
  menuOptions?: Partial<MenuOptions>
}>(), {
  orientation: 'horizontal',
  sortable: true,
  contextMenu: true,
})

defineSlots<{
  icon?: (props: { win: ManagedWindow<T>, active: boolean, minimized: boolean }) => unknown
}>()

const defaultLabels: WindowDockMenuLabels = {
  close: 'Close',
  closeOthers: 'Close others',
  closeToLeft: 'Close to the left',
  closeToRight: 'Close to the right',
}

/* ---------------- 拖动排序 ---------------- */
const DRAG_MIME = 'application/x-vgo-window-dock'
const dockRef = ref<HTMLElement>()
const dragId = ref<string | null>(null)
// 插入位置 0..windows.length，按指针落在按钮前半还是后半计算
const dropIndex = ref<number | null>(null)

function isDockDrag(event: DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes(DRAG_MIME)
}

function resetDrag() {
  dragId.value = null
  dropIndex.value = null
}

function handleDragStart(win: ManagedWindow<T>, event: DragEvent) {
  if (!props.sortable || !event.dataTransfer) {
    event.preventDefault()
    return
  }
  dragId.value = win.id
  event.dataTransfer.setData(DRAG_MIME, win.id)
  event.dataTransfer.effectAllowed = 'move'
}

function handleDragOver(index: number, event: DragEvent) {
  if (!isDockDrag(event)) {
    return
  }
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const after = props.orientation === 'vertical'
    ? event.clientY > rect.top + rect.height / 2
    : event.clientX > rect.left + rect.width / 2
  dropIndex.value = after ? index + 1 : index
}

function handleDrop(event: DragEvent) {
  if (!isDockDrag(event)) {
    return
  }
  event.preventDefault()
  const from = props.manager.windows.findIndex(win => win.id === dragId.value)
  const to = dropIndex.value
  resetDrag()
  if (from !== -1 && to !== null) {
    props.manager.move(from, to)
  }
}

function handleDragLeave(event: DragEvent) {
  const next = event.relatedTarget as Node | null
  if (next && dockRef.value?.contains(next)) {
    return
  }
  dropIndex.value = null
}

useEventListener(window, 'dragend', resetDrag)
useEventListener(window, 'drop', resetDrag)

/* ---------------- 右键菜单 ---------------- */
function buildMenu(win: ManagedWindow<T>): MenuItem[] {
  const labels = { ...defaultLabels, ...props.menuLabels }
  const open = props.manager.windows.filter(item => !item.isClosing)
  const index = open.indexOf(win)
  return [
    {
      label: labels.close,
      onClick: () => props.manager.requestClose(win.id),
    },
    {
      label: labels.closeOthers,
      disabled: open.length < 2,
      onClick: () => props.manager.closeOthers(win.id),
    },
    {
      label: labels.closeToLeft,
      disabled: index <= 0,
      onClick: () => props.manager.closeToLeft(win.id),
    },
    {
      label: labels.closeToRight,
      disabled: index === -1 || index === open.length - 1,
      onClick: () => props.manager.closeToRight(win.id),
    },
  ]
}

function handleContextMenu(win: ManagedWindow<T>, event: MouseEvent) {
  if (props.contextMenu === false || win.isClosing) {
    return
  }
  event.preventDefault()
  const defaults = buildMenu(win)
  const items = typeof props.contextMenu === 'function' ? props.contextMenu(win, defaults) : defaults
  if (!items.length) {
    return
  }
  ContextMenu.showContextMenu({
    x: event.clientX,
    y: event.clientY,
    ...props.menuOptions,
    items,
  })
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="manager.windows.length"
      ref="dockRef"
      class="vgo-window-dock"
      role="toolbar"
      :aria-orientation="orientation"
      @dragleave="handleDragLeave"
    >
      <button
        v-for="(win, index) in manager.windows"
        :key="win.id"
        type="button"
        class="vgo-window-dock__item vgo-u-button-reset"
        :class="{
          'is-active': win.id === manager.activeId,
          'is-minimized': win.minimized,
          'is-drag-source': win.id === dragId,
          'is-drop-before': dropIndex === index,
          'is-drop-after': dropIndex === index + 1 && index === manager.windows.length - 1,
        }"
        :title="win.title"
        :aria-pressed="win.id === manager.activeId && !win.minimized"
        :draggable="sortable"
        @click="manager.toggleFromDock(win.id)"
        @contextmenu="handleContextMenu(win, $event)"
        @dragstart="handleDragStart(win, $event)"
        @dragover="handleDragOver(index, $event)"
        @drop="handleDrop"
      >
        <span class="vgo-window-dock__icon">
          <slot name="icon" :win="win" :active="win.id === manager.activeId" :minimized="win.minimized">
            {{ win.title.slice(0, 1) }}
          </slot>
        </span>
        <span class="vgo-window-dock__indicator" aria-hidden="true" />
      </button>
    </div>
  </transition>
</template>
