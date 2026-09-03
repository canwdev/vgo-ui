<script lang="ts" setup>
import type { ILayout, WinOptions } from './enum'
import type { OnMoveParams } from './window-controller.ts'

import { useThrottleFn, useVModel, watchDebounced } from '@vueuse/core'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
  toRefs,
  watch,
} from 'vue'
import { checkWindowAttach } from './enum'
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
}>()

const LS_KEY_VP_WINDOW_OPTION = 'vp_window'

const { allowMaximum, allowMove, noTitleBar, allowSnap } = toRefs(props)

const storageKey = `${LS_KEY_VP_WINDOW_OPTION}_${props.wid}`
const mVisible = useVModel(props, 'visible', emit)
const rootRef = ref()
const titleBarRef = ref()
const winBodyRef = ref()
const titleBarButtonsRef = ref()
const dWindow = shallowRef<WindowController | null>(null)

const isMaximized = useVModel(props, 'maximized', emit, { passive: true })
const isMinimized = useVModel(props, 'minimized', emit, { passive: true })

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

const isTransition = ref(false)
function setIsTransition(val: boolean) {
  if (val) {
    isTransition.value = val
  }
  else {
    setTimeout(() => {
      // 等待动画播放结束
      isTransition.value = val
    }, 300)
  }
}

// 请勿使用vue :class="{}" 进行类的绑定，因为vue会覆盖DOM动态添加的class
useDynamicClassName(rootRef, 'is-visible', mVisible)
useDynamicClassName(rootRef, 'is-maximized', isMaximized)
useDynamicClassName(rootRef, 'is-transitioning', isTransition)
useDynamicClassName(rootRef, 'is-titleless', noTitleBar)
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
watchDebounced(
  winOptions,
  () => {
    if (isMaximized.value) {
      // 最大化时只更新最大化状态
      const s = JSON.parse(localStorage.getItem(storageKey) || 'null')
      if (s) {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            ...s,
            maximized: isMaximized.value,
          }),
        )
      }
      return
    }
    if (props.wid) {
      // console.log(`save ${storageKey}`, {...winOptions})
      localStorage.setItem(storageKey, JSON.stringify({ ...winOptions }))
    }
  },
  { deep: Boolean(props.wid), debounce: 500 },
)

watch(allowMove, (val) => {
  if (!dWindow.value) {
    return
  }
  dWindow.value.allowMove = val && !isMaximized.value
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
  dWindow.value.allowMove = allowMove.value && !val
  dWindow.value.maximized = val

  winOptions.maximized = val
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
    autoPosOnResize: true,
    isDebug: false,
    resizeable: true,
    maximized: isMaximized.value,
    alignWhenViewPortResize: props.alignWhenViewPortResize,
  })
  dWindow.value.allowMove = allowMove.value && !isMaximized.value
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

  let lsState: WinOptions
  let lsVal: WinOptions | null = null
  if (!props.wid) {
    lsState = defaultOptions
  }
  else {
    lsVal = JSON.parse(localStorage.getItem(storageKey) || 'null') as WinOptions | null
    // console.log(`load ${storageKey}`, lsVal)
    lsState = lsVal || defaultOptions
  }
  setPos('left', lsState.left)
  setPos('top', lsState.top)
  setPos('width', lsState.width)
  setPos('height', lsState.height)
  isInit.value = true

  setTimeout(() => {
    if (props.initCenter && !lsVal) {
      const rect = rootRef.value.getBoundingClientRect()
      // console.log(rect)
      const cx = Math.round(window.innerWidth / 2 - rect.width / 2)
      const cy = Math.round(window.innerHeight / 2 - rect.height / 2)

      winOptions.left = rootRef.value.style.left = `${cx}px`
      winOptions.top = rootRef.value.style.top = `${cy}px`
    }
    else {
      // 初始化后检查窗口是否在视口外，如果在则修复
      dWindow.value?.handleResizeDebounced()
    }
  })
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
    if (allowSnap.value) {
      if (data.attachLayout) {
        setWindowLayout(data.attachLayout)
      }
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

function handleClose() {
  mVisible.value = false
  emit('onClose')
}

function setWindowLayout(layout: ILayout) {
  const { xRatio, yRatio, widthRatio, heightRatio, maximize } = layout
  if (maximize) {
    toggleMaximized()
    return
  }

  const { innerWidth: maxWidth, innerHeight: maxHeight } = window
  const left = Math.ceil(maxWidth * xRatio)
  const top = Math.ceil(maxHeight * yRatio)
  const width = Math.ceil(maxWidth * widthRatio)
  const height = Math.ceil(maxHeight * heightRatio)

  if (isMaximized.value) {
    isMaximized.value = false
  }
  setIsTransition(true)

  setTimeout(() => {
    setPos('left', `${left}px`)
    setPos('top', `${top}px`)
    setPos('width', `${width}px`)
    setPos('height', `${height}px`)
    setIsTransition(false)
  })
}

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
  setPos,
  layoutPreviewData,
  focus,
})
</script>

<template>
  <transition :name="transitionName">
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
                v-if="allowMaximum" :class="[isMaximized ? 'is-restore' : 'is-maximize']"
                @click="toggleMaximized"
              />

              <button v-if="showClose" title="Close" class="is-close" @click="handleClose" />
            </slot>
          </div>
        </div>

        <div ref="winBodyRef" class="vgo-window__body vgo-u-scrollbar">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>
