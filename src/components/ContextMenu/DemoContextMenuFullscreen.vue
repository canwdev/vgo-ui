<script lang="ts" setup>
import type { MenuItem } from './types'
import { h, reactive, ref } from 'vue'
import { useContextMenuTrigger } from '../../hooks/use-context-menu-trigger'
import ContextMenu from './show'

defineOptions({
  name: 'DemoContextMenuFullscreen',
})

const emit = defineEmits(['close'])

/** 四个角 + 中间：点按钮在下方弹出菜单，其他位置右键弹出菜单。 */
const spots = [
  { id: 'tl', label: '左上' },
  { id: 'tr', label: '右上' },
  { id: 'center', label: '中间' },
  { id: 'bl', label: '左下' },
  { id: 'br', label: '右下' },
] as const

/** 当前打开了哪个按钮的菜单；用来给按钮加激活态。 */
const opened = ref<string | null>(null)

/** 最后一次点到的菜单项，回显在提示区。 */
const lastAction = ref('（还没有点击任何菜单项）')

// #region 菜单数据
//
// 这一份照搬 file-lite 的全局菜单结构（use-file-lite-menu.ts），用来演示真实项目里
// 会遇到的形状：多层嵌套、勾选项、动态文案、disabled、divided、自定义图标 VNode。
// 图标是内联 SVG，不依赖图标字体，和菜单项自己的 icon 字段（string | VNode）保持一致。

const iconPaths = {
  puzzle: 'M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5A2.5 2.5 0 0 0 10.5 1A2.5 2.5 0 0 0 8 3.5V5H4a2 2 0 0 0-2 2v3.8h1.5A2.7 2.7 0 0 1 6.2 13.5A2.7 2.7 0 0 1 3.5 16.2H2V20a2 2 0 0 0 2 2h3.8v-1.5a2.7 2.7 0 0 1 2.7-2.7a2.7 2.7 0 0 1 2.7 2.7V22H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5',
  refresh: 'M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 0 0-8 8a8 8 0 0 0 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18a6 6 0 0 1-6-6a6 6 0 0 1 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z',
  clipboard: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-7 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h10v2H7z',
  theme: 'M7.5 2A4.5 4.5 0 0 0 3 6.5A4.5 4.5 0 0 0 7.5 11A4.5 4.5 0 0 0 12 6.5A4.5 4.5 0 0 0 7.5 2m0 3a1.5 1.5 0 0 1 1.5 1.5A1.5 1.5 0 0 1 7.5 8A1.5 1.5 0 0 1 6 6.5A1.5 1.5 0 0 1 7.5 5M17 7a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 6a5 5 0 0 0-5 5a5 5 0 0 0 5 5a5 5 0 0 0 5-5a5 5 0 0 0-5-5m0 2a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m-5.5-7A4.5 4.5 0 0 0 12 15a4.5 4.5 0 0 0 4.5-4.5A4.5 4.5 0 0 0 12 6a4.5 4.5 0 0 0-.5 4',
  cog: 'M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z',
  tune: 'M3 17v2h6v-2zM3 5v2h10V5zm10 16v-2h8v-2h-8v-2h-2v6zM7 9v2H3v2h4v2h2V9zm14 4v-2H11v2zm-6-4h2V7h4V5h-4V3h-2z',
  check: 'M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59z',
  filterCheck: 'M12 12v7l-2 2v-9L4 4h16z',
  filterOff: 'M12 12v7l-2 2v-9L4 4h16zM2.39 1.73L1.11 3l1.9 2.27H4l6 8v7l2-2v-5l7.61 7.61l1.27-1.27z',
  title: 'M5 4v3h5.5v12h3V7H19V4z',
  testTube: 'M7 2v2h1v14a4 4 0 0 0 4 4a4 4 0 0 0 4-4V4h1V2zm8 9v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-5z',
  bugPlay: 'M13.5 3.5a1.5 1.5 0 0 1 1.5 1.5v.5h1a3 3 0 0 1 3 3v1h2v2h-2v1a3 3 0 0 1-.2 1.06l3.44 3.44l-1.42 1.42l-3.07-3.08A3 3 0 0 1 16 18h-1v1.5a1.5 1.5 0 0 1-3 0V18H8a3 3 0 0 1-1.75-.56l-3.08 3.08l-1.41-1.42l3.44-3.44A3 3 0 0 1 5 14.6V9h14v5.6a3 3 0 0 1-.2 1.06M6.5 8a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3z',
  upload: 'M9 16v-6H5l7-7l7 7h-4v6zm-4 4v-2h14v2z',
  logout: 'M16 17v-3H9v-4h7V7l5 5zM14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z',
  eyeOff: 'M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.43-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7',
  imageMultiple: 'M22 16V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2m-11-4l2.03 2.71L16 11l4 5H8zM2 6v14a2 2 0 0 0 2 2h14v-2H4V6z',
  broom: 'M19.36 2.72l1.42 1.42l-5.72 5.71c1.07 1.54 1.22 3.39.32 4.59L9.06 8.12c1.2-.9 3.05-.75 4.59.32zM5.93 17.57c-2.01-2.01-3.24-4.41-3.19-6.24c.02-.65.34-1.16.81-1.4L8.65 12l-.71.71l-2.12-2.12c-.21.5-.19 1.06.06 1.65c.38.88 1.16 1.85 2.24 2.82l-2.19.81z',
  monitorEye: 'M4 4h18v12h-2V6H4zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9.5v-2H4V8zm4 12v3h5.5v-3zm8.5-1a1 1 0 0 1-1-1a1 1 0 0 1 1-1a1 1 0 0 1 1 1a1 1 0 0 1-1 1m0-4c-2.24 0-4.16 1.25-5 3c.84 1.75 2.76 3 5 3s4.16-1.25 5-3c-.84-1.75-2.76-3-5-3',
  fullscreen: 'M5 5h5v2H7v3H5zm9 0h5v5h-2V7h-3zM5 14h2v3h3v2H5zm12 0h2v5h-5v-2h3z',
  fullscreenExit: 'M14 14h5v2h-3v3h-2zm-9 0h2v5h3v2H5zm9-9h2v3h3v2h-5zM5 5h5v5H8V7H5z',
  speedometer: 'M12 16a3 3 0 0 0 3-3c0-1.5-1.5-2.5-3-3.5C10.5 10.5 9 11.5 9 13a3 3 0 0 0 3 3m0-13a10 10 0 0 1 10 10c0 2.5-1 4.8-2.5 6.5l-1.5-1.5A7.95 7.95 0 0 0 20 13a8 8 0 0 0-16 0c0 2 1 4 2.5 5.5L5 20a9.94 9.94 0 0 1-3-7A10 10 0 0 1 12 3',
  keyboard: 'M19 10h-2v2h2m0 2h-2v2h2m-4-4h-2v2h2m0 2h-2v2h2M7 10H5v2h2m0 2H5v2h2m8-2h-2v2h2M9 10H7v2h2m0 2H7v2h2m-4-6H3v2h2m0 2H3v2h2m14-8H5v2h14m2-6H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2',
  ip: 'M16 11h-2v2h2zm-4 0H9v2h3zM4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2m0 2v10h16V8zm6 6h2v-2h-2zm6 0h2v-2h-2z',
  internetExplorer: 'M12 2a10 10 0 0 1 10 10c0 1.5-.34 3-1 4.28c-.3.6-1.1.4-1.2-.26c-.15-1.05-.5-2-1-2.85c1.03-.9 1.7-1.85 1.7-2.67c0-.5-.3-.9-.85-1.1c-.6-.25-1.5-.3-2.5-.15c-.1-.5-.3-1-.55-1.5c1.6-.6 2.9-.6 3.4-.1c.3-.7.4-1.4.4-2A8 8 0 0 0 4 12c0 .6.07 1.2.2 1.75c-.9.85-1.5 1.8-1.5 2.6c0 .6.3 1.1.9 1.4c.7.35 1.8.4 3 .2c1 1.5 2.5 2.6 4.2 3.1c1.4 1 3.4 1.5 5.2 1.2c.9-.15 1.6-.55 1.9-1.1c.2-.4.2-.85 0-1.2c1.4-1.3 2.3-3 2.4-4.9A10 10 0 0 1 12 2M7 12a5 5 0 0 1 5-5c1.5 0 2.9.7 3.8 1.8c-1.3-.4-2.8-.4-4.2 0c-1.7.4-3.2 1.4-4.3 2.8c-.2-.5-.3-1-.3-1.6m.6 3.5c1-1.9 2.8-3.3 5-3.8c1.4-.3 2.9-.3 4.2 0c-.5 2.4-2.4 4.3-4.8 4.8c-1.4.3-2.9.3-4.2 0z',
  github: 'M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2',
} as const

type IconName = keyof typeof iconPaths

/** 把内置的图标路径渲染成菜单项能直接用的 VNode。 */
function icon(name: IconName) {
  return h('svg', { 'viewBox': '0 0 24 24', 'width': '1em', 'height': '1em', 'aria-hidden': 'true' }, [
    h('path', { fill: 'currentColor', d: iconPaths[name] }),
  ])
}

/** 勾选态图标：勾上就是 check，否则留空（菜单项会保留图标占位）。 */
function checkIcon(checked: boolean) {
  return checked ? icon('check') : undefined
}

function notify(label: string) {
  lastAction.value = label
}

/** demo 里可切换的几个开关，菜单打开期间勾选态会实时变化。 */
const demoState = reactive({
  themeMode: 'Auto',
  colorTheme: 'Aurora',
  sortFoldersFirst: true,
  disablePreview: false,
  openAppWithFilteredList: true,
  isNativePlayer: false,
  appSingleInstance: true,
  rememberLastMedia: true,
  reduceMotion: false,
  wakeLock: false,
  fullscreen: false,
})

const themeModes = ['Auto', 'Light', 'Dark']
const colorThemes = ['Aurora', 'Ocean', 'Sunset']

const plugins = ['Archive viewer', 'Subtitle loader', 'Exif panel']

/**
 * 照搬 file-lite 的全局菜单结构。
 *
 * `.filter(Boolean)` 那种「条件项」的写法也保留了：菜单项数组允许被过滤掉。
 */
function buildMenuItems(): MenuItem[] {
  return resolveMenuIcons([
    plugins.length > 0 && {
      label: 'Plugins',
      icon: 'puzzle',
      children: [
        {
          label: 'Refresh',
          icon: 'refresh',
          divided: true,
          onClick: () => notify('Plugins → Refresh'),
        },
        ...plugins.map(name => ({
          label: name,
          icon: 'puzzle',
          shortcut: 'v1.0.0',
          onClick: () => notify(`Plugins → ${name}`),
        })),
      ],
    },
    {
      label: 'Text Sync',
      icon: 'clipboard',
      shortcut: 'F1',
      divided: true,
      onClick: () => notify('Text Sync'),
    },
    {
      label: `Theme: ${demoState.themeMode} ${demoState.colorTheme}`,
      icon: 'theme',
      children: [
        ...themeModes.map(mode => ({
          label: mode,
          icon: checkIcon(mode === demoState.themeMode),
          divided: mode === 'Dark',
          onClick: () => {
            demoState.themeMode = mode
            notify(`Theme: ${mode}`)
          },
        })),
        {
          label: 'Reduce Motion',
          icon: checkIcon(demoState.reduceMotion),
          divided: true,
          onClick: () => {
            demoState.reduceMotion = !demoState.reduceMotion
            notify(`Reduce Motion: ${demoState.reduceMotion ? 'On' : 'Off'}`)
          },
        },
        ...colorThemes.map(name => ({
          label: name,
          icon: checkIcon(name === demoState.colorTheme),
          onClick: () => {
            demoState.colorTheme = name
            notify(`Color Theme: ${name}`)
          },
        })),
      ],
    },
    {
      label: 'Config',
      icon: 'cog',
      divided: true,
      children: [
        {
          label: 'App Settings',
          // 只有子项、没有点击行为，用 divided 和下面几项分开
          divided: true,
          children: [
            {
              label: 'Use native video player',
              icon: checkIcon(demoState.isNativePlayer),
              onClick: () => {
                demoState.isNativePlayer = !demoState.isNativePlayer
              },
            },
            {
              label: 'App Single instance',
              icon: checkIcon(demoState.appSingleInstance),
              onClick: () => {
                demoState.appSingleInstance = !demoState.appSingleInstance
              },
            },
            {
              label: 'Remember last opened media in Media Player',
              icon: checkIcon(demoState.rememberLastMedia),
              onClick: () => {
                demoState.rememberLastMedia = !demoState.rememberLastMedia
              },
            },
            {
              label: demoState.openAppWithFilteredList
                ? 'Apps open with filtered list'
                : 'Apps open without filtered list',
              icon: demoState.openAppWithFilteredList ? 'filterCheck' : 'filterOff',
              onClick: () => {
                demoState.openAppWithFilteredList = !demoState.openAppWithFilteredList
              },
            },
            {
              label: 'Show folders first',
              icon: checkIcon(demoState.sortFoldersFirst),
              onClick: () => {
                demoState.sortFoldersFirst = !demoState.sortFoldersFirst
              },
            },
          ],
        },
        {
          label: 'Title: file-lite',
          icon: 'title',
          onClick: () => notify('Set Title'),
        },
        {
          label: 'Development',
          icon: 'testTube',
          divided: true,
          children: [
            {
              label: 'Enable Debug Console',
              icon: checkIcon(false),
              onClick: () => notify('Enable Debug Console'),
            },
            {
              label: 'Demo Transfer Window',
              icon: 'bugPlay',
              onClick: () => notify('Demo Transfer Window'),
            },
            {
              label: 'Update Backend Binary…',
              icon: 'upload',
              onClick: () => notify('Update Backend Binary'),
            },
            {
              label: 'Restart Backend',
              icon: 'refresh',
              onClick: () => notify('Restart Backend'),
            },
            {
              label: 'Exit Backend',
              icon: 'logout',
              onClick: () => notify('Exit Backend'),
            },
          ],
        },
        {
          label: 'Disable Preview',
          icon: checkIcon(demoState.disablePreview),
          onClick: () => {
            demoState.disablePreview = !demoState.disablePreview
            notify(`Disable Preview: ${demoState.disablePreview ? 'On' : 'Off'}`)
          },
        },
        {
          label: 'Image Cache: 128 items · 24.6 MB',
          icon: 'imageMultiple',
          onClick: () => notify('Clear Image Cache'),
        },
        {
          label: 'Clear Local Data',
          icon: 'broom',
          onClick: () => notify('Clear Local Data'),
        },
      ],
    },
    {
      label: `Browser Wake Lock: ${demoState.wakeLock ? 'On' : 'Off'}`,
      icon: demoState.wakeLock ? 'check' : 'monitorEye',
      onClick: () => {
        demoState.wakeLock = !demoState.wakeLock
      },
    },
    {
      label: `Fullscreen: ${demoState.fullscreen ? 'On' : 'Off'}`,
      icon: demoState.fullscreen ? 'fullscreenExit' : 'fullscreen',
      divided: true,
      onClick: () => {
        demoState.fullscreen = !demoState.fullscreen
      },
    },
    {
      label: 'Speed Test',
      icon: 'speedometer',
      onClick: () => notify('Speed Test'),
    },
    {
      label: 'Keyboard Shortcuts',
      icon: 'keyboard',
      shortcut: '?',
      divided: true,
      onClick: () => notify('Keyboard Shortcuts'),
    },
    {
      label: 'IP Chooser',
      icon: 'ip',
      onClick: () => notify('IP Chooser'),
    },
    {
      label: 'Legacy page for IE8...',
      icon: 'internetExplorer',
      onClick: () => notify('Legacy page'),
    },
    {
      label: 'file-lite v0.4.3',
      icon: 'github',
      onClick: () => notify('Open GitHub'),
    },
    {
      label: 'Logout',
      icon: 'logout',
      divided: true,
      onClick: () => notify('Logout'),
    },
  ].filter(Boolean) as MenuItem[])
}

/**
 * file-lite 里图标名会先经过一层解析换成 VNode；这里直接按名字取内置图标，
 * 让「图标也可以是 VNode」这条路径在 demo 里也走一遍。
 */
function resolveMenuIcons(items: MenuItem[]): MenuItem[] {
  return items.map(item => ({
    ...item,
    icon: typeof item.icon === 'string' && item.icon in iconPaths
      ? icon(item.icon as IconName)
      : item.icon,
    children: item.children ? resolveMenuIcons(item.children) : undefined,
  }))
}

// #endregion

/**
 * 每个按钮一个独立的菜单实例（所以各自有独立的开 / 关与激活态）。
 * 这一次演示里 `useContextMenuTrigger` 只当作「按钮锚定的下拉」来用，
 * 一个 hook 对应一个按钮。
 */
const triggers = spots.map(spot => ({
  spot,
  trigger: useContextMenuTrigger({
    items: () => buildMenuItems(),
    onClose: (item) => {
      opened.value = null
      if (item)
        lastAction.value = `菜单关闭，最后点击：${item.label ?? '无'}`
    },
  }),
}))

/** 触发按钮点击：已经开着的菜单先关掉，避免同时存在两个。 */
function onTriggerClick(id: string, trigger: (typeof triggers)[number]['trigger']) {
  if (opened.value && opened.value !== id)
    trigger.close()
  opened.value = trigger.isOpen.value ? null : id
  trigger.toggle()
}

/** 空白处右键：右键菜单按光标弹出。点在按钮上时不处理，交回按钮自己的点击逻辑。 */
function onSurfaceContextMenu(e: MouseEvent) {
  e.preventDefault()
  if (isDemoButton(e.target))
    return
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: buildMenuItems(),
    onClose: item => lastAction.value = `菜单关闭，最后点击：${item?.label ?? '无'}`,
  })
}

/** 事件落点是不是 demo 自己的按钮（触发按钮或「退出全屏」）。 */
function isDemoButton(target: EventTarget | null) {
  return target instanceof HTMLElement && !!target.closest('.vgo-context-menu-demo__spot, .vgo-context-menu-demo__hint .vgo-button')
}
</script>

<template>
  <div class="vgo-context-menu-demo" @contextmenu="onSurfaceContextMenu">
    <div class="vgo-context-menu-demo__hint">
      <strong>全屏 demo · file-lite 菜单结构</strong>
      <span>四个角与中间：点按钮，菜单从按钮下方弹出；页面其他位置：右键，菜单在光标处弹出。</span>
      <span class="vgo-context-menu-demo__state">{{ lastAction }}</span>
      <button class="vgo-button vgo-button--sm" @click="emit('close')">
        退出全屏
      </button>
    </div>

    <button
      v-for="{ spot, trigger } in triggers"
      :key="spot.id"
      :ref="el => trigger.setTriggerRef(el as HTMLElement | null)"
      class="vgo-button vgo-context-menu-demo__spot"
      :class="[`is-${spot.id}`, opened === spot.id ? 'is-active' : '']"
      @click="onTriggerClick(spot.id, trigger)"
    >
      {{ spot.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.vgo-context-menu-demo {
  position: fixed;
  // 把自己压在菜单层之下：菜单挂在 body 上，层级是 MENU_CONST_OPTIONS.defaultZIndex
  // （= --vgo-z-menu）。之前这里用 --vgo-z-preview（1000）比菜单层还高，
  // 于是菜单被整个盖在 demo 底下。
  z-index: calc(var(--vgo-z-menu) - 1);
  background-color: var(--vgo-surface);
  inset: 0;

  &__hint {
    position: absolute;
    top: var(--vgo-space-3);
    left: 50%;
    display: flex;
    flex-direction: column;
    gap: var(--vgo-space-1);
    align-items: center;
    max-width: min(520px, calc(100% - var(--vgo-space-4) * 2));
    padding: var(--vgo-space-3) var(--vgo-space-4);
    font-size: var(--vgo-font-sm);
    color: var(--vgo-text-secondary);
    text-align: center;
    transform: translateX(-50%);

    strong {
      font-size: var(--vgo-font-lg);
      color: var(--vgo-text);
    }
  }

  &__state {
    color: var(--vgo-primary);
  }

  // 按钮摆在容器四角与正中，好把「贴边 / 居中」几种锚点都试到
  &__spot {
    position: absolute;

    &.is-tl {
      top: var(--vgo-space-3);
      left: var(--vgo-space-3);
    }

    &.is-tr {
      top: var(--vgo-space-3);
      right: var(--vgo-space-3);
    }

    &.is-center {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &.is-bl {
      bottom: var(--vgo-space-3);
      left: var(--vgo-space-3);
    }

    &.is-br {
      right: var(--vgo-space-3);
      bottom: var(--vgo-space-3);
    }
  }
}
</style>
