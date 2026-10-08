<script lang="ts" setup>
import type { VNode } from 'vue'
import type { WinOptions } from '../ViewPortWindow/enum'
import type { ModalWindowButton, ModalWindowContext, ModalWindowRender } from './types'
import { useEventListener } from '@vueuse/core'
import { computed, h, nextTick, onMounted, ref, useAttrs, watch } from 'vue'
import ViewPortWindow from '../ViewPortWindow/ViewPortWindow.vue'
import VueRender from '../VueRender.vue'
import ModalLayer from './ModalLayer.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  visible: boolean
  title?: ModalWindowRender
  content?: ModalWindowRender
  // 不传或空数组时不画底部，由内容自己画按钮
  buttons?: ModalWindowButton[]
  closable?: boolean
  maskClosable?: boolean
  // 打开后聚焦主按钮。没有主按钮时聚焦内容区域
  focusPrimary?: boolean
  initWinOptions?: Partial<WinOptions>
}>(), {
  closable: true,
  maskClosable: true,
  focusPrimary: true,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'resolve': [value: unknown]
  'closed': []
}>()

const attrs = useAttrs()
const layerRef = ref<{ getRoot?: () => HTMLElement | undefined }>()
const bodyRef = ref<HTMLElement>()
const busy = ref(false)
const loadingIndex = ref(-1)
// 函数式调用把 visible 写成常量 true，内部用 shown 才能关掉
const shown = ref(props.visible)
let settled = false
let released = false
let previousFocus: HTMLElement | null = null

watch(() => props.visible, (val) => {
  shown.value = val
})

const ctx: ModalWindowContext = {
  close: value => requestClose(value),
}

const windowInit = computed(() => ({
  width: '420px',
  // height stays auto so the window hugs the content; max-height still clamps it
  height: 'auto',
  ...props.initWinOptions,
}))

function requestClose(value?: unknown) {
  if (settled) {
    return
  }
  settled = true
  released = true
  restoreFocus()
  emit('resolve', value)
  emit('update:visible', false)
  shown.value = false
}

function restoreFocus() {
  if (previousFocus?.isConnected) {
    previousFocus.focus({ preventScroll: true })
  }
  previousFocus = null
}

function rememberFocus() {
  const active = document.activeElement
  if (active instanceof HTMLElement) {
    previousFocus = active
  }
}

function layerElement() {
  return layerRef.value?.getRoot?.()
}

function windowElement() {
  return layerElement()?.querySelector<HTMLElement>('.vgo-window') ?? undefined
}

function isTopLayer() {
  const layers = document.querySelectorAll('.vgo-window-modal.is-open')
  const top = layers[layers.length - 1]
  const layer = layerElement()
  return Boolean(layer && top === layer)
}

// The window is still display:none on the first frame, so focus is retried until it has a box.
function focusInitial(attempt = 0) {
  nextTick(() => {
    if (released || !shown.value) {
      return
    }
    const root = windowElement()
    const primary = props.focusPrimary
      ? root?.querySelector<HTMLElement>('.vgo-button--primary:not(:disabled)')
      : undefined
    if (primary) {
      if (!primary.getClientRects().length) {
        if (attempt < 8) {
          requestAnimationFrame(() => focusInitial(attempt + 1))
        }
        return
      }
      primary.focus({ preventScroll: true })
      return
    }
    const body = bodyRef.value
    if (body?.getClientRects().length) {
      body.focus({ preventScroll: true })
      return
    }
    if (attempt < 8) {
      requestAnimationFrame(() => focusInitial(attempt + 1))
    }
  })
}

const FOCUSABLE = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableItems(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => {
    return el.tabIndex >= 0 && el.getClientRects().length > 0
  })
}

function onKeydown(event: KeyboardEvent) {
  if (!shown.value || released || !isTopLayer()) {
    return
  }
  if (event.key === 'Escape') {
    if (!props.closable || event.defaultPrevented) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    requestClose(undefined)
    return
  }
  if (event.key !== 'Tab') {
    return
  }
  const root = windowElement()
  if (!root) {
    return
  }
  const items = focusableItems(root)
  if (!items.length) {
    event.preventDefault()
    bodyRef.value?.focus({ preventScroll: true })
    return
  }
  // Move focus ourselves. A native Tab would leave the layer once the last control is reached,
  // and anything teleported beside the window can sit in between.
  event.preventDefault()
  event.stopPropagation()
  const active = document.activeElement
  const inside = active instanceof Node && root.contains(active)
  const first = items[0]
  const last = items[items.length - 1]
  if (!inside) {
    const target = event.shiftKey ? last : first
    target.focus({ preventScroll: true })
    return
  }
  const forward = items.filter(el => (active.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)
  const backward = items.filter(el => (active.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) !== 0)
  const target = event.shiftKey ? (backward.at(-1) ?? last) : (forward[0] ?? first)
  target.focus({ preventScroll: true })
}

// Tab 没拦住时（例如焦点被脚本挪走），拉回窗口里
function onFocusIn(event: FocusEvent) {
  if (!shown.value || released || !isTopLayer()) {
    return
  }
  const root = windowElement()
  const target = event.target
  if (!root || !(target instanceof Node) || root.contains(target)) {
    return
  }
  focusInitial()
}

useEventListener(window, 'keydown', onKeydown)
useEventListener(document, 'focusin', onFocusIn)

watch(shown, (val, prev) => {
  if (val) {
    settled = false
    released = false
    busy.value = false
    loadingIndex.value = -1
    rememberFocus()
    focusInitial()
    return
  }
  if (!prev) {
    return
  }
  // 标题栏关闭按钮直接改 visible，不经过 requestClose
  if (!settled) {
    requestClose(undefined)
    return
  }
  released = true
  restoreFocus()
}, { flush: 'post' })

onMounted(() => {
  if (shown.value) {
    rememberFocus()
    focusInitial()
  }
})

function renderSource(source: ModalWindowRender | undefined) {
  return (params: unknown): VNode => {
    if (typeof source === 'function') {
      const rendered = source(params as ModalWindowContext)
      if (rendered == null || rendered === false || rendered === '') {
        return h('span')
      }
      if (typeof rendered === 'string' || typeof rendered === 'number') {
        return h('span', String(rendered))
      }
      if (Array.isArray(rendered)) {
        return h('span', { class: 'vgo-modal-window__render' }, rendered)
      }
      if (rendered === true) {
        return h('span')
      }
      return rendered
    }
    if (source == null || source === '') {
      return h('span')
    }
    return h('span', String(source))
  }
}

const titleRender = computed(() => typeof props.title === 'function' ? renderSource(props.title) : undefined)
const contentRender = computed(() => props.content ? renderSource(props.content) : undefined)

function resolvedValue(button: ModalWindowButton, returned: unknown) {
  if ('value' in button) {
    return button.value
  }
  if (returned !== undefined) {
    return returned
  }
  return button.label
}

async function onButton(button: ModalWindowButton, index: number) {
  if (settled || busy.value) {
    return
  }
  busy.value = true
  loadingIndex.value = index
  try {
    const returned = button.onClick ? await button.onClick(ctx) : undefined
    if (settled) {
      return
    }
    if (returned === false) {
      return
    }
    requestClose(resolvedValue(button, returned))
  }
  catch (error) {
    console.error(error)
  }
  finally {
    busy.value = false
    loadingIndex.value = -1
  }
}

defineExpose({
  close: (value?: unknown) => requestClose(value),
})
</script>

<template>
  <ModalLayer
    ref="layerRef"
    :open="shown"
    :mask-closable="maskClosable"
    @close="requestClose(undefined)"
  >
    <ViewPortWindow
      v-bind="attrs"
      v-model:visible="shown"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      :allow-snap="false"
      :show-close="closable"
      :init-win-options="windowInit"
      @on-close="requestClose(undefined)"
      @on-after-leave="emit('closed')"
    >
      <template #titleBarLeft>
        <slot name="title">
          <VueRender v-if="titleRender" :render-fn="titleRender" :params="ctx" />
          <span v-else>{{ title }}</span>
        </slot>
      </template>
      <div class="vgo-modal-window">
        <div ref="bodyRef" class="vgo-modal-window__body vgo-u-scrollbar" tabindex="-1">
          <slot :close="ctx.close">
            <VueRender v-if="contentRender" :render-fn="contentRender" :params="ctx" />
          </slot>
        </div>
        <div v-if="buttons?.length" class="vgo-modal-window__footer">
          <button
            v-for="(button, index) in buttons"
            :key="index"
            type="button"
            class="vgo-button"
            :class="[
              button.variant ? `vgo-button--${button.variant}` : '',
              { 'is-loading': loadingIndex === index },
            ]"
            :disabled="busy"
            @click="onButton(button, index)"
          >
            {{ button.label }}
          </button>
        </div>
      </div>
    </ViewPortWindow>
  </ModalLayer>
</template>
