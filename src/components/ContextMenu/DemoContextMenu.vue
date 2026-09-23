<script lang="ts" setup>
import type { MenuBarOptions, MenuItem } from './types'
import { computed, h, ref } from 'vue'
import { useContextMenuTrigger } from '../../hooks/use-context-menu-trigger'
import ContextMenuBar from './ContextMenuBar.vue'
import ContextMenu from './show'

/** 用内联 SVG 造菜单图标，避免文档站依赖任何图标字体。 */
function menuIcon(path: string) {
  return h('svg', { 'viewBox': '0 0 24 24', 'width': '1em', 'height': '1em', 'aria-hidden': 'true' }, [
    h('path', { fill: 'currentColor', d: path }),
  ])
}

const I = {
  folder: 'M6.1 10L4 18V8h17a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h15c.9 0 1.7-.6 1.9-1.5l2.3-8.5zM19 18H6l1.6-6h13z',
  openInNew: 'M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z',
  dots: 'M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2',
  doc: 'M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 2h7v5h5v11H6zm2 8v2h8v-2zm0 4v2h5v-2z',
  cut: 'm19 3l-6 6l2 2l7-7V3m-10 9.5a.5.5 0 0 1-.5-.5a.5.5 0 0 1 .5-.5a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5M6 20a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2M6 8a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2m3.64-.36c.23-.5.36-1.05.36-1.64a4 4 0 0 0-4-4a4 4 0 0 0-4 4a4 4 0 0 0 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1z',
  copy: 'M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z',
  check: 'M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59z',
  delete: 'M14.12 10.47L12 12.59l-2.13-2.12l-1.41 1.41L10.59 14l-2.12 2.12l1.41 1.41L12 15.41l2.12 2.12l1.41-1.41L13.41 14l2.12-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM8 9h8v10H8z',
  refresh: 'M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 0 0-8 8a8 8 0 0 0 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18a6 6 0 0 1-6-6a6 6 0 0 1 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z',
  info: 'M11 9h2V7h-2m1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m-1 15h2v-6h-2z',
  night: 'm17.75 4.09l-2.53 1.94l.91 3.06l-2.63-1.81l-2.63 1.81l.91-3.06l-2.53-1.94L12.44 4l1.06-3l1.06 3zm3.5 6.91l-1.64 1.25l.59 1.98l-1.7-1.17l-1.7 1.17l.59-1.98L15.75 11l2.06-.05L18.5 9l.69 1.95zm-2.28 4.95c.83-.08 1.72 1.1 1.19 1.85c-.32.45-.66.87-1.08 1.27C15.17 23 8.84 23 4.94 19.07c-3.91-3.9-3.91-10.24 0-14.14c.4-.4.82-.76 1.27-1.08c.75-.53 1.93.36 1.85 1.19c-.27 2.86.69 5.83 2.89 8.02a9.96 9.96 0 0 0 8.02 2.89m-1.64 2.02a12.08 12.08 0 0 1-7.8-3.47c-2.17-2.19-3.33-5-3.49-7.82c-2.81 3.14-2.7 7.96.31 10.98c3.02 3.01 7.84 3.12 10.98.31',
  list: 'M7 5h14v2H7zm0 8v-2h14v2zM4 4.5A1.5 1.5 0 0 1 5.5 6A1.5 1.5 0 0 1 4 7.5A1.5 1.5 0 0 1 2.5 6A1.5 1.5 0 0 1 4 4.5m0 6A1.5 1.5 0 0 1 5.5 12A1.5 1.5 0 0 1 4 13.5A1.5 1.5 0 0 1 2.5 12A1.5 1.5 0 0 1 4 10.5M7 19v-2h14v2zm-3-2.5A1.5 1.5 0 0 1 5.5 18A1.5 1.5 0 0 1 4 19.5A1.5 1.5 0 0 1 2.5 18A1.5 1.5 0 0 1 4 16.5',
  palette: 'M17.5 12a1.5 1.5 0 0 1-1.5-1.5A1.5 1.5 0 0 1 17.5 9a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m-3-4A1.5 1.5 0 0 1 13 6.5A1.5 1.5 0 0 1 14.5 5A1.5 1.5 0 0 1 16 6.5A1.5 1.5 0 0 1 14.5 8m-5 0A1.5 1.5 0 0 1 8 6.5A1.5 1.5 0 0 1 9.5 5A1.5 1.5 0 0 1 11 6.5A1.5 1.5 0 0 1 9.5 8m-3 4A1.5 1.5 0 0 1 5 10.5A1.5 1.5 0 0 1 6.5 9A1.5 1.5 0 0 1 8 10.5A1.5 1.5 0 0 1 6.5 12M12 3a9 9 0 0 0-9 9a9 9 0 0 0 9 9a1.5 1.5 0 0 0 1.5-1.5c0-.39-.15-.74-.39-1c-.23-.27-.38-.62-.38-1a1.5 1.5 0 0 1 1.5-1.5H16a5 5 0 0 0 5-5c0-4.42-4.03-8-9-8',
}

const lastAction = ref('（还没有点击任何菜单项）')
const showHidden = ref(false)
const barDark = ref(false)

function notify(label: string) {
  lastAction.value = label
}

function buildItems(): MenuItem[] {
  return [
    { label: 'Open', icon: menuIcon(I.folder), shortcut: 'Enter', onClick: () => notify('Open') },
    { label: 'Open in new tab', icon: menuIcon(I.openInNew), onClick: () => notify('Open in new tab'), divided: true },
    {
      label: 'Open with',
      icon: menuIcon(I.dots),
      children: [
        { label: 'Browser', icon: menuIcon(I.openInNew), onClick: () => notify('Open with Browser') },
        { label: 'Text editor', icon: menuIcon(I.doc), onClick: () => notify('Open with Text editor'), divided: true },
        {
          label: 'More apps',
          children: [
            { label: 'Terminal', icon: menuIcon(I.doc), onClick: () => notify('Open with Terminal') },
            { label: 'Image viewer', icon: menuIcon(I.doc), disabled: true },
          ],
        },
      ],
    },
    {
      label: 'Submenu (n subs)',
      icon: menuIcon(I.dots),
      children: [...Array.from({ length: 50 }, (_, i) => ({ label: `Submenu ${String(i + 1).padStart(3, '0')}` })), {
        label: 'Submenu 3',
        icon: menuIcon(I.dots),
        children: [
          { label: 'Submenu A' },
          { label: 'Submenu B' },
        ],
      }],
    },
    { label: 'Cut', icon: menuIcon(I.cut), shortcut: 'Ctrl+X', onClick: () => notify('Cut') },
    { label: 'Copy', icon: menuIcon(I.copy), shortcut: 'Ctrl+C', onClick: () => notify('Copy') },
    {
      label: 'Show hidden files',
      checked: computed(() => showHidden.value),
      clickClose: false,
      onClick: () => {
        showHidden.value = !showHidden.value
      },
    },
    { divided: 'self' },
    { label: 'Refresh', icon: menuIcon(I.refresh), onClick: () => notify('Refresh') },
    { label: 'Delete', icon: menuIcon(I.delete), onClick: () => notify('Delete') },
  ]
}

function showMenu(event: MouseEvent, theme?: string) {
  event.preventDefault()
  ContextMenu.showContextMenu({
    x: event.x,
    y: event.y,
    theme,
    items: buildItems(),
    onClose: item => notify(`菜单关闭，最后点击：${item?.label ?? '无'}`),
  })
}

// 函数式：按钮触发、菜单贴在按钮下方、按钮保持激活 / 再点关闭。
// 开 / 关、定位、以及和「点击外部关闭」的时序都抽在 useContextMenuTrigger 里。
const {
  setTriggerRef: setDropdownTriggerRef,
  isOpen: dropdownOpen,
  toggle: toggleDropdownMenu,
} = useContextMenuTrigger({
  items: buildItems,
  onClose: item => notify(`菜单关闭，最后点击：${item?.label ?? '无'}`),
})

const menuBarOptions = computed((): MenuBarOptions => ({
  theme: barDark.value ? 'dark' : '',
  closeWhenScroll: false,
  items: [
    {
      label: 'File',
      children: [
        { label: 'New', icon: menuIcon(I.doc), shortcut: 'Ctrl+N', onClick: () => notify('File → New') },
        { label: 'Open…', icon: menuIcon(I.folder), shortcut: 'Ctrl+O', onClick: () => notify('File → Open'), divided: true },
        { label: 'Save', shortcut: 'Ctrl+S', onClick: () => notify('File → Save') },
      ],
    },
    {
      label: 'View',
      children: [
        { label: 'List', icon: menuIcon(I.list), onClick: () => notify('View → List') },
        { label: 'Icons', icon: menuIcon(I.palette), divided: true, onClick: () => notify('View → Icons') },
        { label: 'Refresh', icon: menuIcon(I.refresh), onClick: () => notify('View → Refresh') },
      ],
    },
    {
      label: 'Help',
      children: [
        { label: 'About', icon: menuIcon(I.info), onClick: () => notify('Help → About') },
      ],
    },
  ],
}))
</script>

<template>
  <div class="vgo-u-flex-column" :style="{ gap: 'var(--vgo-space-3)' }">
    <div class="context-menu-demo__target" @contextmenu="showMenu">
      在此区域内点击右键
    </div>

    <div class="vgo-u-flex-wrap-center">
      <button class="vgo-button" @click="showMenu($event as MouseEvent)">
        在按钮处弹出
      </button>
      <button :ref="setDropdownTriggerRef" class="vgo-button" :class="dropdownOpen ? 'is-active' : ''"
        @click="toggleDropdownMenu">
        按钮菜单{{ dropdownOpen ? '（点击关闭）' : '' }}
      </button>
      <button class="vgo-button" @click="showMenu($event as MouseEvent, 'dark')">
        强制暗色菜单
      </button>
      <span :style="{ color: 'var(--vgo-text-secondary)' }">{{ lastAction }}</span>
    </div>

    <div class="vgo-u-flex-wrap-center">
      <button class="vgo-button" @click="barDark = !barDark">
        菜单栏主题：{{ barDark ? '暗色' : '亮色' }}
      </button>
      <span :style="{ color: 'var(--vgo-text-secondary)' }">点击下方菜单栏的 File / View / Help</span>
    </div>

    <ContextMenuBar :options="menuBarOptions" />
  </div>
</template>

<style scoped lang="scss">
.context-menu-demo__target {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: var(--vgo-text-secondary);
  border: 1px dashed var(--vgo-border);
  border-radius: var(--vgo-radius);
}
</style>
