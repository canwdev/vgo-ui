<script setup lang="ts" generic="T">
import type { ManagedWindow, WindowManager } from './window-manager'
import { watch } from 'vue'
import ViewPortWindow from '../ViewPortWindow/ViewPortWindow.vue'

const props = defineProps<{
  manager: WindowManager<T>
  // 额外传给每个 ViewPortWindow 的属性，如 initWinOptions、allowSnap、class
  windowProps?: (win: ManagedWindow<T>) => Record<string, unknown>
  // 额外绑定到内容容器的属性，如 class、data-*
  contentAttrs?: (win: ManagedWindow<T>) => Record<string, unknown>
}>()

defineSlots<{
  default?: (props: { win: ManagedWindow<T>, close: () => Promise<boolean> }) => unknown
  title?: (props: { win: ManagedWindow<T> }) => unknown
  controls?: (props: { win: ManagedWindow<T> }) => unknown
}>()

const contentRefs = new Map<string, HTMLElement>()

type WindowInstance = InstanceType<typeof ViewPortWindow>

function bindWindow(id: string, el: unknown) {
  const instance = el as WindowInstance | null
  if (!instance) {
    props.manager.registerView(id, null)
    return
  }
  props.manager.registerView(id, {
    setActive: () => instance.setActive(),
    focus: () => focusContent(id),
  })
}

function bindContent(id: string, el: unknown) {
  if (el instanceof HTMLElement) {
    contentRefs.set(id, el)
  }
  else {
    contentRefs.delete(id)
  }
}

// 聚焦内容容器，键盘操作才落在当前窗口；焦点已在窗口内的控件上时不抢。
// 新窗口异步挂载，容器可能还没出现，稍后重试
function focusContent(id: string, attempts = 3) {
  const win = props.manager.get(id)
  if (!win || win.isClosing) {
    return
  }
  const el = contentRefs.get(id)
  if (el?.isConnected) {
    const active = document.activeElement
    if (active instanceof Node && el.contains(active) && active !== el) {
      return
    }
    el.focus({ preventScroll: true })
    return
  }
  if (attempts > 0) {
    setTimeout(focusContent, 50, id, attempts - 1)
  }
}

// 控制器挂载后会异步触发一次 onActive，刚打开就被最小化的窗口不能因此被还原
function handleActive(win: ManagedWindow<T>) {
  if (!win.minimized) {
    props.manager.activate(win.id)
  }
}

function handleRestored(win: ManagedWindow<T>) {
  setTimeout(() => focusContent(win.id))
}

watch(() => props.manager.activeId, (id) => {
  if (id) {
    focusContent(id)
  }
})
</script>

<template>
  <ViewPortWindow
    v-for="win in manager.stack"
    :key="win.id"
    :ref="(el: unknown) => bindWindow(win.id, el)"
    v-model:maximized="win.maximized"
    v-model:minimized="win.minimized"
    allow-maximum
    allow-minimum
    v-bind="windowProps?.(win)"
    :visible="!win.minimized && !win.isClosing"
    @on-active="handleActive(win)"
    @on-close="manager.requestClose(win.id)"
    @on-restored="handleRestored(win)"
  >
    <template #titleBarLeft>
      <slot name="title" :win="win">
        <span>{{ win.title }}</span>
      </slot>
    </template>
    <template v-if="$slots.controls" #titleBarRightControls>
      <slot name="controls" :win="win" />
    </template>
    <div
      :ref="(el: unknown) => bindContent(win.id, el)"
      class="vgo-window-stack__content vgo-u-scrollbar"
      tabindex="-1"
      v-bind="contentAttrs?.(win)"
    >
      <slot :win="win" :close="() => manager.requestClose(win.id)" />
    </div>
  </ViewPortWindow>
</template>
