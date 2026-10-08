<script lang="ts" setup>
import type { ManagedWindow } from './window-manager'
import { computed, onMounted } from 'vue'
import { createWindowManager } from './window-manager'
import WindowDock from './WindowDock.vue'
import WindowStack from './WindowStack.vue'

type DemoApp = 'notepad' | 'about' | 'settings' | 'viewer'

interface DemoWindowData {
  app: DemoApp
  text: string
  savedText: string
}

const appIcons: Record<DemoApp, string> = {
  notepad: '📝',
  about: 'ℹ️',
  settings: '⚙️',
  viewer: '🖼️',
}

function log(...args: unknown[]) {
  console.log('[WindowManager]', ...args)
}

const manager = createWindowManager<DemoWindowData>({
  onClose(win) {
    log(`已关闭「${win.title}」`)
  },
})

function createData(app: DemoApp): DemoWindowData {
  return { app, text: '', savedText: '' }
}

let notepadCount = 0
function openNotepad() {
  notepadCount++
  const win = manager.open(createData('notepad'), { title: `记事本 ${notepadCount}` })
  manager.setCloseGuard(win.id, () => {
    const confirmed = !isDirty(win) || window.confirm(`「${win.title}」有未保存的修改，确定关闭？`)
    if (!confirmed) {
      log(`「${win.title}」取消了关闭`)
    }
    return confirmed
  })
  log(`打开「${win.title}」`)
}

function openAbout() {
  const reused = Boolean(manager.findByKey('about'))
  manager.open(createData('about'), { key: 'about', title: '关于' })
  log(reused ? '「关于」已打开，直接激活' : '打开「关于」')
}

function toggleSettings() {
  const opened = Boolean(manager.findByKey('settings'))
  manager.toggle(createData('settings'), { key: 'settings', title: '设置' })
  log(opened ? '关闭「设置」' : '打开「设置」')
}

function openViewer() {
  manager.open(createData('viewer'), { title: '图片查看器', maximized: true })
  log('打开「图片查看器」')
}

function toggleDesktop() {
  manager.toggleDesktop()
  log(manager.desktopShown ? '显示桌面' : '还原显示桌面前的窗口')
}

async function closeAll() {
  for (const win of [...manager.windows]) {
    if (!await manager.requestClose(win.id)) {
      return
    }
  }
}

// 启动时打开所有程序并最小化，任务栏上直接可以操作
onMounted(() => {
  openNotepad()
  openAbout()
  toggleSettings()
  openViewer()
  manager.minimizeAll()
  log('启动：打开全部程序并最小化')
})

function isDirty(win: ManagedWindow<DemoWindowData>) {
  return win.data.text !== win.data.savedText
}

function save(win: ManagedWindow<DemoWindowData>) {
  win.data.savedText = win.data.text
}

const windowSizes: Record<DemoApp, { width: string, height: string }> = {
  notepad: { width: '360px', height: '240px' },
  about: { width: '300px', height: '180px' },
  settings: { width: '280px', height: '200px' },
  viewer: { width: '480px', height: '320px' },
}

// 多开的记事本层叠摆放，其余窗口居中
function windowProps(win: ManagedWindow<DemoWindowData>) {
  const size = windowSizes[win.data.app]
  if (win.data.app !== 'notepad') {
    return { initWinOptions: size, allowMinimum: win.data.app !== 'about' }
  }
  const index = manager.windows.filter(item => item.data.app === 'notepad').indexOf(win)
  return {
    initCenter: false,
    initWinOptions: { ...size, left: `${80 + index * 32}px`, top: `${80 + index * 32}px` },
  }
}

const dockMenuLabels = {
  close: '关闭',
  closeOthers: '关闭其他',
  closeToLeft: '关闭左侧',
  closeToRight: '关闭右侧',
}

const activeTitle = computed(() => manager.activeWindow?.title || '—')
const openCount = computed(() => manager.windows.filter(win => !win.isClosing).length)
</script>

<template>
  <div class=" vgo-u-flex-column" style="gap: var(--vgo-space-2); ">
    <div class="vgo-u-flex-wrap-center" style="justify-content: flex-start;">
      <button class="vgo-button" @click="openNotepad">
        新建记事本
      </button>
      <button class="vgo-button" @click="openAbout">
        关于（单例）
      </button>
      <button class="vgo-button" :class="{ 'is-active': manager.findByKey('settings') }" @click="toggleSettings">
        设置（开关）
      </button>
      <button class="vgo-button" @click="openViewer">
        图片查看器（最大化打开）
      </button>
      <button
        class="vgo-button"
        :class="{ 'is-active': manager.desktopShown }"
        :disabled="!openCount"
        @click="toggleDesktop"
      >
        显示桌面
      </button>
      <button class="vgo-button vgo-button--danger" :disabled="!openCount" @click="closeAll">
        全部关闭
      </button>
    </div>

    <div class="vgo-u-flex-wrap-center" style="justify-content: flex-start;">
      <span class="vgo-badge">窗口：{{ openCount }}</span>
      <span class="vgo-badge vgo-badge--primary">当前：{{ activeTitle }}</span>
    </div>

    <div class="vgo-panel " style="padding: var(--vgo-space-1); min-height: var(--vgo-control-lg);">
      <WindowDock :manager="manager" class="demo-dock" :menu-labels="dockMenuLabels">
        <template #icon="{ win }">
          {{ appIcons[win.data.app] }}
        </template>
      </WindowDock>
      <span v-if="!openCount" class="vgo-empty">任务栏：打开窗口后出现在这里，可拖动排序、右键关闭</span>
    </div>
  </div>

  <WindowStack :manager="manager" :window-props="windowProps">
    <template #title="{ win }">
      <span>{{ appIcons[win.data.app] }}</span>
      <span>{{ win.title }}{{ win.data.app === 'notepad' && isDirty(win) ? ' *' : '' }}</span>
    </template>

    <template #controls="{ win }">
      <button v-if="win.data.app === 'notepad'" title="保存" :disabled="!isDirty(win)" @click="save(win)">
        保存
      </button>
    </template>

    <template #default="{ win, close }">
      <textarea
        v-if="win.data.app === 'notepad'"
        v-model="win.data.text"
        placeholder="输入内容后不保存直接关闭，会先询问"
        style="display: block; box-sizing: border-box; width: 100%; height: 100%; resize: none; border: 0; padding: var(--vgo-space-2);"
      />
      <div v-else class="vgo-u-flex-column" style="gap: var(--vgo-space-2); padding: var(--vgo-space-4);">
        <template v-if="win.data.app === 'about'">
          <span>单例窗口：再次点击「关于」不会多开，只会激活这个窗口。</span>
          <span>不允许最小化。</span>
        </template>
        <template v-else-if="win.data.app === 'settings'">
          <span>再次点击「设置」按钮关闭本窗口。</span>
        </template>
        <template v-else>
          <span>以最大化状态打开，取消最大化回到居中位置。</span>
          <span>点击任务栏上的当前窗口可最小化，再点一次还原。</span>
          <span>拖动任务栏按钮排序；右键按钮可关闭当前、其他、左侧或右侧的窗口。</span>
        </template>
        <div>
          <button class="vgo-button vgo-button--sm" @click="close">
            关闭
          </button>
        </div>
      </div>
    </template>
  </WindowStack>
</template>

<style lang="scss" scoped>
// WindowDock 只有布局，外观由使用方定义
.demo-dock {
  gap: var(--vgo-space-1);

  :deep(.vgo-window-dock__item) {
    position: relative;
    gap: 2px;
    padding: var(--vgo-space-1) var(--vgo-space-2) 2px;
    border-radius: var(--vgo-radius);
    transition: background-color var(--vgo-duration-fast);

    &:hover {
      background-color: var(--vgo-hover);
    }

    &.is-active {
      background-color: var(--vgo-primary-opacity);
    }
  }

  :deep(.vgo-window-dock__icon) {
    width: var(--vgo-control-md);
    height: var(--vgo-control-md);
    font-size: var(--vgo-icon-lg);
    line-height: 1;
    transition: opacity var(--vgo-duration-fast);
  }

  :deep(.vgo-window-dock__item.is-minimized .vgo-window-dock__icon) {
    opacity: 0.5;
  }

  :deep(.vgo-window-dock__indicator) {
    width: 16px;
    height: 3px;
    background-color: var(--vgo-text-secondary);
    border-radius: var(--vgo-radius-pill);
    transition:
      width var(--vgo-duration-fast),
      background-color var(--vgo-duration-fast);
  }

  :deep(.vgo-window-dock__item.is-active .vgo-window-dock__indicator) {
    width: 24px;
    background-color: var(--vgo-primary);
  }

  :deep(.vgo-window-dock__item.is-minimized .vgo-window-dock__indicator) {
    width: 6px;
  }

  :deep(.vgo-window-dock__item.is-drag-source) {
    opacity: 0.5;
  }

  :deep(.vgo-window-dock__item.is-drop-before::after),
  :deep(.vgo-window-dock__item.is-drop-after::after) {
    position: absolute;
    top: var(--vgo-space-1);
    bottom: var(--vgo-space-1);
    width: 2px;
    content: '';
    background-color: var(--vgo-primary);
    pointer-events: none;
  }

  :deep(.vgo-window-dock__item.is-drop-before::after) {
    left: calc(var(--vgo-space-1) * -0.5 - 1px);
  }

  :deep(.vgo-window-dock__item.is-drop-after::after) {
    right: calc(var(--vgo-space-1) * -0.5 - 1px);
  }
}
</style>
