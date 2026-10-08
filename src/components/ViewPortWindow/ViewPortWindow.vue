<script lang="ts" setup>
import type { ILayout, StoredWindowState, WinOptions } from './enum'
import type { OnMoveParams } from './window-controller.ts'

import { useEventListener, useThrottleFn, useVModel, watchDebounced } from '@vueuse/core'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
  toRefs,
  watch,
} from 'vue'
import { checkWindowAttach, isSameLayout, layoutList, loadWindowState, windowStorageKey } from './enum'
import LayoutPreview from './LayoutPreview.vue'
import { useDynamicClassName } from './use-utils'
import { WindowController } from './window-controller'

const props = withDefaults(
  defineProps<{
    // 是否显示窗口
    visible: boolean
    // 是否显示关闭按钮
    showClose?: boolean
    // 是否允许最大化
    allowMaximum?: boolean
    // 外部传入的是否最大化属性，支持双向绑定
    maximized?: boolean
    allowMinimum?: boolean
    minimized?: boolean
    // 是否允许移动窗口
    allowMove?: boolean
    // 允许贴边快捷调整窗口大小
    allowSnap?: boolean
    // 允许拖动边框调整窗口大小
    allowResize?: boolean
    // 传入此参数用于保存窗口大小和位置
    wid?: string
    // 窗口初始化配置，可传入部分 WinOptions
    initWinOptions?: Partial<WinOptions>
    // 初始化使窗口在视口中间
    initCenter?: boolean
    // 窗口出现/隐藏的过度动画名字
    transitionName?: string
    // 不展示标题栏，拖动窗口内容
    noTitleBar?: boolean
    // 是否允许将窗体移动到视口之外
    allowOut?: boolean
    // 调视口口大小时，窗口重新定位的基础方向，默认靠左
    alignWhenViewPortResize?: 'start' | 'end'
  }>(),
  {
    showClose: true,
    allowMove: true,
    allowSnap: true,
    allowResize: true,
    initCenter: true,
    allowOut: true,
    alignWhenViewPortResize: 'start',
    transitionName: 'fade-scale',
  },
)

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'update:minimized', value: boolean): void
  (e: 'update:maximized', value: boolean): void
  (e: 'resize', value: WinOptions): void
  (e: 'onActive'): void
  (e: 'onClose'): void
  (e: 'onRestored'): void
  (e: 'onMinimized'): void
  (e: 'onMaximized'): void
  (e: 'onAfterLeave'): void
}>()

const { allowMaximum, allowMove, noTitleBar, allowSnap, allowResize } = toRefs(props)

const mVisible = useVModel(props, 'visible', emit)
const rootRef = ref()
const titleBarRef = ref()
const winBodyRef = ref()
const titleBarButtonsRef = ref()
const dWindow = shallowRef<WindowController | null>(null)

const isMaximized = useVModel(props, 'maximized', emit, { passive: true })
const isMinimized = useVModel(props, 'minimized', emit, { passive: true })
// 当前贴边分屏布局。贴边后再最大化时保留，取消最大化即回到分屏
const snapLayout = shallowRef<ILayout | null>(null)
// 贴边前的浮动位置和尺寸（px），拖出分屏时还原
interface FloatingRect { left: number, top: number, width: number, height: number }
let floatingRect: FloatingRect | null = null

watch(isMinimized, (val) => {
  if (val) {
    emit('onMinimized')
  }
  else if (mVisible.value) {
    emit('onRestored')
  }
})
onMounted(() => {
  if (!isMinimized.value && mVisible.value) {
    emit('onRestored')
  }
})

// 布局切换动画（--vgo-duration-base）结束所需的时间
const TRANSITION_SETTLE_MS = 300
const isTransition = ref(false)
function setIsTransition(val: boolean) {
  if (val) {
    isTransition.value = val
  }
  else {
    setTimeout(() => {
      isTransition.value = val
    }, TRANSITION_SETTLE_MS)
  }
}

// 请勿使用vue :class="{}" 进行类的绑定，因为vue会覆盖DOM动态添加的class
useDynamicClassName(rootRef, 'is-visible', mVisible)
useDynamicClassName(rootRef, 'is-maximized', isMaximized)
useDynamicClassName(rootRef, 'is-transitioning', isTransition)
useDynamicClassName(rootRef, 'is-titleless', noTitleBar)
const isResizeLocked = computed(() => !allowResize.value)
useDynamicClassName(rootRef, 'is-resize-locked', isResizeLocked)
const isAllowMove = computed(() => {
  return allowMove.value && !isMaximized.value
})
useDynamicClassName(rootRef, 'is-movable', isAllowMove)

const defaultWinOptions: WinOptions = {
  top: '10px',
  left: '10px',
  width: '300px',
  height: 'auto',
  maximized: false,
}

const winOptions = reactive<WinOptions>({
  ...defaultWinOptions,
  maximized: props.maximized ?? false,
})
// 卸载后防抖保存仍可能触发，不能再写回已被调用方清除的状态
let isUnmounted = false
onBeforeUnmount(() => {
  isUnmounted = true
})

// 几何信息始终是浮动状态下的位置和尺寸，最大化、分屏只记标记，刷新后在其上重新应用
function saveWindowState() {
  const root = rootRef.value as HTMLElement | undefined
  if (!props.wid || isUnmounted || !root) {
    return
  }
  // 隐藏时 offset 尺寸为 0，不保存
  if (!root.offsetWidth || !root.offsetHeight) {
    return
  }
  const rect = (snapLayout.value && floatingRect) || measureFloatingRect()
  const state: StoredWindowState = { ...rect }
  if (isMaximized.value) {
    state.maximized = true
  }
  if (snapLayout.value) {
    const { xRatio, yRatio, widthRatio, heightRatio } = snapLayout.value
    state.snap = { xRatio, yRatio, widthRatio, heightRatio }
  }
  localStorage.setItem(windowStorageKey(props.wid), JSON.stringify(state))
}

if (props.wid) {
  watchDebounced([winOptions, snapLayout], saveWindowState, { deep: true, debounce: 500 })
}

watch(allowMove, (val) => {
  if (!dWindow.value) {
    return
  }
  dWindow.value.allowMove = val
  if (val && !isMaximized.value) {
    dWindow.value.updateZIndex()
  }
})
watch(isMaximized, (val) => {
  if (val) {
    emit('onMaximized')
  }

  if (!dWindow.value) {
    return
  }
  dWindow.value.maximized = val

  winOptions.maximized = val

  // 无论由按钮、双击还是调用方 v-model 取消最大化，最大化期间视口可能变小，
  // 还原后都要把浮动窗口拉回视口内；拖出还原时位置由拖动决定，不干预。
  // 必须等还原动画结束：动画中窗口仍接近全屏尺寸，按它夹取会把位置压到 0,0
  const root = rootRef.value as HTMLElement | undefined
  if (!val && !snapLayout.value && root && !root.classList.contains('is-dragging')) {
    setTimeout(() => {
      if (!isMaximized.value && !snapLayout.value && !root.classList.contains('is-dragging')) {
        dWindow.value?.handleResizeDebounced()
      }
    }, TRANSITION_SETTLE_MS)
  }
})
watch(snapLayout, (val) => {
  if (dWindow.value) {
    dWindow.value.snapped = Boolean(val)
  }
})

const isInit = ref(false)
watch(mVisible, (val) => {
  if (val) {
    if (!isInit.value) {
      initWindowStyle()
    }
    dWindow.value?.updateZIndex()
  }
})

const handleSelfResize = useThrottleFn(() => {
  if (!mVisible.value || !rootRef.value) {
    return
  }

  const size = getComputedStyle(rootRef.value)

  winOptions.width = size.width
  winOptions.height = size.height
  emit('resize', winOptions)
}, 100)

onMounted(() => {
  dWindow.value = new WindowController({
    dragHandleEl: props.noTitleBar ? winBodyRef.value : titleBarRef.value,
    dragTargetEl: rootRef.value,
    allowOut: props.allowOut,
    // opacify: 0.8,
    preventNode: titleBarButtonsRef.value,
    onMove: handleMove,
    onActive() {
      emit('onActive')
    },
    onDetach: handleDetach,
    onResizeStart() {
      snapLayout.value = null
      floatingRect = null
    },
    autoPosOnResize: true,
    isDebug: false,
    resizeable: true,
    maximized: isMaximized.value,
    alignWhenViewPortResize: props.alignWhenViewPortResize,
  })
  dWindow.value.allowMove = allowMove.value
  dWindow.value.maximized = isMaximized.value
  winOptions.maximized = isMaximized.value

  new ResizeObserver(() => {
    handleSelfResize()
  }).observe(rootRef.value)

  initWindowStyle()
})

type PositionKey = 'top' | 'left' | 'width' | 'height'

function setPos(dir: PositionKey, value: string) {
  rootRef.value.style[dir] = winOptions[dir] = value
}

function initWindowStyle() {
  if (!mVisible.value) {
    // 防止初始化不可见时的位置错误
    return
  }
  let defaultOptions = {
    ...defaultWinOptions,
  }
  if (props.initWinOptions) {
    defaultOptions = {
      ...defaultOptions,
      ...props.initWinOptions,
    }
  }

  const stored = props.wid ? loadWindowState(props.wid) : null
  if (stored) {
    setPos('left', `${stored.left}px`)
    setPos('top', `${stored.top}px`)
    setPos('width', `${stored.width}px`)
    setPos('height', `${stored.height}px`)
    if (stored.snap && allowSnap.value) {
      floatingRect = { left: stored.left, top: stored.top, width: stored.width, height: stored.height }
      snapLayout.value = { ...stored.snap }
      applyLayoutGeometry(snapLayout.value)
    }
    // 保存的状态是用户上次留下的，优先于调用方传入的 maximized
    isMaximized.value = Boolean(stored.maximized && allowMaximum.value)
  }
  else {
    setPos('left', defaultOptions.left)
    setPos('top', defaultOptions.top)
    setPos('width', defaultOptions.width)
    setPos('height', defaultOptions.height)
  }
  isInit.value = true

  setTimeout(() => {
    if (props.initCenter && !stored) {
      const { width, height } = measureFloatingRect()
      setPos('left', `${Math.round(window.innerWidth / 2 - width / 2)}px`)
      setPos('top', `${Math.round(window.innerHeight / 2 - height / 2)}px`)
    }
    else {
      // 初始化后检查窗口是否在视口外，如果在则修复
      dWindow.value?.handleResizeDebounced()
    }
  })
}

// 量浮动状态下的位置和尺寸：最大化时先临时去掉 is-maximized，否则量到的是整个视口，
// 居中位置会算成 0,0，取消最大化后窗口跑到左上角。
// 用 offset 尺寸而不是 getBoundingClientRect：进场动画的缩放会让后者偏小
function measureFloatingRect(): FloatingRect {
  const root = rootRef.value as HTMLElement
  const wasMaximized = root.classList.contains('is-maximized')
  const wasMovable = root.classList.contains('is-movable')
  if (wasMaximized) {
    root.classList.remove('is-maximized')
    root.classList.add('is-movable')
  }
  const rect = {
    left: Math.round(root.offsetLeft),
    top: Math.round(root.offsetTop),
    width: root.offsetWidth,
    height: root.offsetHeight,
  }
  if (wasMaximized) {
    root.classList.add('is-maximized')
    root.classList.toggle('is-movable', wasMovable)
  }
  return rect
}

function fixWindowInScreen(delayMs = 400): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const rect = rootRef.value.getBoundingClientRect()
      // console.log(rect)
      let flagFixed = false
      if (rect.y < 0) {
        setPos('top', `${0}px`)
        flagFixed = true
      }
      if (rect.x <= -rect.width) {
        setPos('left', `${0}px`)
        flagFixed = true
      }
      if (!flagFixed) {
        if (rect.y > window.innerHeight) {
          setPos('top', `${window.innerHeight - rect.height}px`)
        }
        if (rect.x > window.innerWidth) {
          setPos('left', `${window.innerWidth - rect.width}px`)
        }
      }

      resolve()
    }, delayMs)
  })
}

const layoutPreviewData = ref<ILayout | undefined>(undefined)
// 窗口边缘贴靠检测 (Aero Snap)
const checkSnap = useThrottleFn(
  (params) => {
    layoutPreviewData.value = checkWindowAttach(params)
  },
  150,
  true,
)

async function handleMove(data: OnMoveParams) {
  // console.log('[onMove]', data)
  if (data.moveStop) {
    setTimeout(() => {
      layoutPreviewData.value = undefined
    }, 151)

    await fixWindowInScreen(0)
    if (allowSnap.value && data.attachLayout) {
      setWindowLayout(data.attachLayout, data.origin)
    }
    return
  }
  const { top, left, pointerX, pointerY } = data

  if (allowSnap.value) {
    checkSnap({ x: pointerX, y: pointerY })
  }

  if (top !== undefined)
    winOptions.top = top
  if (left !== undefined)
    winOptions.left = left
}

onBeforeUnmount(() => {
  if (dWindow.value) {
    dWindow.value.destroy()
  }
})

function setActive() {
  dWindow.value?.updateZIndex({ preventOnActive: true })
}

function toggleMaximized() {
  if (allowMaximum.value) {
    setIsTransition(true)
    isMaximized.value = !isMaximized.value
    setIsTransition(false)
  }
}

// 拖动最大化或贴边的窗口：同步还原为浮动尺寸，控制器随后按新尺寸让窗口跟随指针
function handleDetach() {
  const root = rootRef.value as HTMLElement
  if (isMaximized.value) {
    isMaximized.value = false
    // 类名由 watch 异步切换，这里同步切换，控制器才能立即量到还原后的尺寸
    root.classList.remove('is-maximized')
    root.classList.add('is-movable')
  }
  if (snapLayout.value) {
    snapLayout.value = null
    // 位置也写回：控制器把拖动开始时的内联位置当作还原点，之后拖到顶边最大化再还原会回到这里
    if (floatingRect) {
      setPos('left', `${floatingRect.left}px`)
      setPos('top', `${floatingRect.top}px`)
      setPos('width', `${floatingRect.width}px`)
      setPos('height', `${floatingRect.height}px`)
    }
  }
  floatingRect = null
}

function applyLayoutGeometry(layout: ILayout) {
  const { innerWidth: maxWidth, innerHeight: maxHeight } = window
  setPos('left', `${Math.ceil(maxWidth * layout.xRatio)}px`)
  setPos('top', `${Math.ceil(maxHeight * layout.yRatio)}px`)
  setPos('width', `${Math.ceil(maxWidth * layout.widthRatio)}px`)
  setPos('height', `${Math.ceil(maxHeight * layout.heightRatio)}px`)
}

// 分屏窗口按视口比例跟随调整；最大化时也更新，保证取消最大化后回到正确的分屏位置
useEventListener(window, 'resize', useThrottleFn(() => {
  if (snapLayout.value) {
    applyLayoutGeometry(snapLayout.value)
  }
}, 50, true))

function handleClose() {
  mVisible.value = false
  emit('onClose')
}

// origin：拖动贴边时传入拖动开始前的位置，作为浮动窗口的还原位置
function setWindowLayout(layout: ILayout, origin?: { left: string, top: string }) {
  if (layout.maximize) {
    if (!isMaximized.value) {
      // 最大化只加类名，内联位置就是还原位置；最大化类同一轮生效，这次改动不会被看到
      if (origin && !snapLayout.value) {
        setPos('left', origin.left)
        setPos('top', origin.top)
      }
      toggleMaximized()
    }
    return
  }

  if (layout.floating) {
    snapLayout.value = null
    floatingRect = null
    if (isMaximized.value) {
      isMaximized.value = false
    }
    setIsTransition(true)
    setTimeout(() => {
      applyLayoutGeometry(layout)
      setIsTransition(false)
    })
    return
  }

  if (!snapLayout.value) {
    floatingRect = measureFloatingRect()
    if (origin) {
      floatingRect.left = Math.round(Number.parseFloat(origin.left)) || floatingRect.left
      floatingRect.top = Math.round(Number.parseFloat(origin.top)) || floatingRect.top
    }
  }
  snapLayout.value = layout

  if (isMaximized.value) {
    isMaximized.value = false
  }
  setIsTransition(true)

  setTimeout(() => {
    applyLayoutGeometry(layout)
    setIsTransition(false)
  })
}

// 悬停最大化按钮弹出的布局菜单
const LAYOUT_MENU_SHOW_DELAY = 600
const LAYOUT_MENU_HIDE_DELAY = 300
const LAYOUT_MENU_EDGE = 4
const maximizeButtonRef = ref<HTMLElement>()
const layoutMenuRef = ref<HTMLElement>()
const isLayoutMenuVisible = ref(false)
const layoutMenuPos = reactive({ top: 0, left: 0 })
let layoutMenuShowTimer: ReturnType<typeof setTimeout> | undefined
let layoutMenuHideTimer: ReturnType<typeof setTimeout> | undefined

async function showLayoutMenu() {
  const button = maximizeButtonRef.value
  if (!allowSnap.value || !button) {
    return
  }
  const rect = button.getBoundingClientRect()
  layoutMenuPos.top = Math.round(rect.bottom)
  layoutMenuPos.left = Math.round(rect.left + rect.width / 2)
  isLayoutMenuVisible.value = true

  // 菜单居中于按钮下方，量到实际宽度后再收进视口
  await nextTick()
  const menu = layoutMenuRef.value
  if (!menu) {
    return
  }
  const width = menu.offsetWidth
  const maxLeft = window.innerWidth - width - LAYOUT_MENU_EDGE
  layoutMenuPos.left = Math.round(
    Math.max(LAYOUT_MENU_EDGE, Math.min(maxLeft, layoutMenuPos.left - width / 2)),
  )
}

function hideLayoutMenu() {
  clearTimeout(layoutMenuShowTimer)
  clearTimeout(layoutMenuHideTimer)
  layoutMenuShowTimer = undefined
  layoutMenuHideTimer = undefined
  if (isLayoutMenuVisible.value) {
    isLayoutMenuVisible.value = false
    layoutPreviewData.value = undefined
  }
}

function handleMaximizeEnter() {
  if (isLayoutMenuVisible.value) {
    return
  }
  clearTimeout(layoutMenuShowTimer)
  layoutMenuShowTimer = setTimeout(showLayoutMenu, LAYOUT_MENU_SHOW_DELAY)
}

function handleMaximizeLeave() {
  clearTimeout(layoutMenuShowTimer)
  layoutMenuShowTimer = undefined
}

function isInLayoutMenuArea(target: EventTarget | null) {
  const node = target as Node | null
  return Boolean(node && (maximizeButtonRef.value?.contains(node) || layoutMenuRef.value?.contains(node)))
}

// 收起由全局指针位置判定，而不是成对的 mouseenter / mouseleave：
// 菜单出现在指针之外、按钮被重新渲染、指针快速移出页面时，leave 事件都可能缺失，菜单就会残留
useEventListener(document, 'mousemove', (event: MouseEvent) => {
  if (!isLayoutMenuVisible.value) {
    return
  }
  if (isInLayoutMenuArea(event.target)) {
    clearTimeout(layoutMenuHideTimer)
    layoutMenuHideTimer = undefined
  }
  else if (!layoutMenuHideTimer) {
    layoutMenuHideTimer = setTimeout(hideLayoutMenu, LAYOUT_MENU_HIDE_DELAY)
  }
}, { passive: true })
useEventListener(document, 'mousedown', (event: MouseEvent) => {
  if (isLayoutMenuVisible.value && !isInLayoutMenuArea(event.target)) {
    hideLayoutMenu()
  }
}, { capture: true })
useEventListener(document.documentElement, 'mouseleave', hideLayoutMenu)
useEventListener(window, 'blur', hideLayoutMenu)

function previewLayout(layout: ILayout | undefined) {
  // 淡出中的菜单仍在 DOM 里，不能再改预览，否则预览会残留
  if (isLayoutMenuVisible.value) {
    layoutPreviewData.value = layout
  }
}

function handleMaximizeClick() {
  hideLayoutMenu()
  toggleMaximized()
}

function isLayoutActive(layout: ILayout) {
  if (layout.floating) {
    return false
  }
  if (layout.maximize) {
    return Boolean(isMaximized.value)
  }
  return !isMaximized.value && Boolean(snapLayout.value && isSameLayout(snapLayout.value, layout))
}

function chooseLayout(layout: ILayout) {
  hideLayoutMenu()
  setWindowLayout(layout)
}

watch(mVisible, (val) => {
  if (!val) {
    hideLayoutMenu()
  }
})

onBeforeUnmount(() => {
  clearTimeout(layoutMenuShowTimer)
  clearTimeout(layoutMenuHideTimer)
})

function focus() {
  rootRef.value.focus()
}

defineExpose({
  isInit,
  mVisible,
  handleClose,
  setActive,
  isMaximized,
  isMinimized,
  toggleMaximized,
  isTransition,
  setWindowLayout,
  snapLayout,
  setPos,
  layoutPreviewData,
  focus,
})
</script>

<template>
  <transition :name="transitionName" @after-leave="emit('onAfterLeave')">
    <div v-show="isInit && mVisible" :id="wid" ref="rootRef" class="vgo-window">
      <LayoutPreview :preview-data="layoutPreviewData" />
      <div class="vgo-window__content">
        <div v-show="!noTitleBar" ref="titleBarRef" class="vgo-window__title-bar" @dblclick="toggleMaximized">
          <div class="vgo-window__title vgo-u-text-overflow">
            <slot name="titleBarLeft" />
          </div>
          <div ref="titleBarButtonsRef" class="vgo-window__controls" @dblclick.stop>
            <slot name="titleBarRightControls" />
            <slot name="titleBarRight">
              <button v-if="allowMinimum && !isMinimized" class="is-minimize" @click="isMinimized = true" />

              <button
                v-if="allowMaximum" ref="maximizeButtonRef" :class="[isMaximized ? 'is-restore' : 'is-maximize']"
                @click="handleMaximizeClick"
                @mouseenter="handleMaximizeEnter"
                @mouseleave="handleMaximizeLeave"
              />

              <button v-if="showClose" title="Close" class="is-close" @click="handleClose" />
            </slot>
          </div>
        </div>

        <div ref="winBodyRef" class="vgo-window__body vgo-u-scrollbar">
          <slot />
        </div>
      </div>
      <transition name="fade">
        <div
          v-if="isLayoutMenuVisible"
          ref="layoutMenuRef"
          class="vgo-window__layouts vgo-panel"
          :style="{ top: `${layoutMenuPos.top}px`, left: `${layoutMenuPos.left}px` }"
        >
          <button
            v-for="(layout, index) in layoutList"
            :key="index"
            type="button"
            class="vgo-window__layout vgo-u-button-reset"
            :class="{ 'is-active': isLayoutActive(layout) }"
            @mouseenter="previewLayout(layout)"
            @mouseleave="previewLayout(undefined)"
            @click="chooseLayout(layout)"
          >
            <span
              class="vgo-window__layout-preview"
              :style="{
                top: `${layout.yRatio * 100}%`,
                left: `${layout.xRatio * 100}%`,
                width: `${layout.widthRatio * 100}%`,
                height: `${layout.heightRatio * 100}%`,
              }"
            />
          </button>
        </div>
      </transition>
    </div>
  </transition>
</template>
