<script lang="ts" setup="">
import { computed, reactive, ref } from 'vue'
import { LayoutPreset, removeWindowState } from './enum'
import ViewPortWindow from './ViewPortWindow.vue'

const MAIN_WID = 'vgo-demo-main-window'

function createState() {
  return {
    main: {
      visible: false,
      minimized: false,
      maximized: false,
      allowMove: true,
      allowSnap: true,
    },
    titleless: false,
    unclosable: false,
    fixedSize: false,
  }
}

const state = reactive(createState())
// 重置时换 key，让所有窗口重新挂载，回到初始位置和尺寸
const renderKey = ref(0)
const mainRef = ref<InstanceType<typeof ViewPortWindow>>()

function resetDemo() {
  removeWindowState(MAIN_WID)
  Object.assign(state, createState())
  renderKey.value++
}

const snapNames: Record<string, string> = {
  LEFT: '左半屏',
  RIGHT: '右半屏',
  TOP_LEFT: '左上',
  TOP_RIGHT: '右上',
  BOTTOM_LEFT: '左下',
  BOTTOM_RIGHT: '右下',
}

const mainStatus = computed(() => {
  const { main } = state
  if (!main.visible) {
    return main.minimized ? '已最小化' : '已关闭'
  }
  const snap = mainRef.value?.snapLayout
  if (main.maximized) {
    return snap ? '最大化（还原后回到分屏）' : '最大化'
  }
  if (snap) {
    const key = Object.keys(snapNames).find(name => LayoutPreset[name] === snap)
    return `分屏：${key ? snapNames[key] : '自定义'}`
  }
  return '浮动'
})

function toggleMain() {
  if (state.main.visible) {
    state.main.visible = false
    return
  }
  state.main.minimized = false
  state.main.visible = true
}
</script>

<template>
  <div class="vgo-window-demo">
    <div class="vgo-u-flex-column" style="gap: var(--vgo-space-2); ">
      <div class="vgo-u-flex-wrap-center" style="justify-content: flex-start;">
        <button class="vgo-button" :class="{ 'is-active': state.main.visible }" @click="toggleMain">
          主窗口
        </button>
        <button
          class="vgo-button" :class="{ 'is-active': state.titleless }"
          @click="state.titleless = !state.titleless"
        >
          无标题栏窗口
        </button>
        <button
          class="vgo-button" :class="{ 'is-active': state.unclosable }"
          @click="state.unclosable = !state.unclosable"
        >
          不可关闭窗口
        </button>
        <button
          class="vgo-button" :class="{ 'is-active': state.fixedSize }"
          @click="state.fixedSize = !state.fixedSize"
        >
          固定尺寸窗口
        </button>
        <button class="vgo-button vgo-button--danger" @click="resetDemo">
          重置
        </button>
      </div>

      <div class="vgo-u-flex-wrap-center" style="justify-content: flex-start;">
        <span>主窗口：</span>
        <span class="vgo-badge vgo-badge--primary">{{ mainStatus }}</span>
        <label><input v-model="state.main.allowMove" type="checkbox"> 允许移动</label>
        <label><input v-model="state.main.allowSnap" type="checkbox"> 允许贴边与布局菜单</label>
      </div>
    </div>

    <ViewPortWindow
      :key="`main-${renderKey}`" ref="mainRef" v-model:visible="state.main.visible"
      v-model:minimized="state.main.minimized" v-model:maximized="state.main.maximized" :wid="MAIN_WID" allow-maximum
      allow-minimum :allow-move="state.main.allowMove" :allow-snap="state.main.allowSnap"
      :init-win-options="{ width: '420px', height: '260px' }" @on-minimized="state.main.visible = false"
    >
      <template #titleBarLeft>
        <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
          <path
            fill="currentColor"
            d="M3 12V6.75l6-1.32v6.48zm17-9v8.75l-10 .15V5.21zM3 13l6 .09v6.81l-6-1.15zm17 .25V22l-10-1.91V13.1z"
          />
        </svg>
        <span>主窗口</span>
      </template>
      <template #titleBarRightControls>
        <button
          title="居中"
          @click="mainRef?.setWindowLayout({ xRatio: 0.2, yRatio: 0.2, widthRatio: 0.6, heightRatio: 0.6, floating: true })"
        >
          <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 9a3 3 0 1 1 0 6a3 3 0 0 1 0-6M3 5a2 2 0 0 1 2-2h4v2H5v4H3zm0 14v-4h2v4h4v2H5a2 2 0 0 1-2-2M21 5v4h-2V5h-4V3h4a2 2 0 0 1 2 2m0 14a2 2 0 0 1-2 2h-4v-2h4v-4h2z"
            />
          </svg>
        </button>
      </template>
      <div
        class="vgo-u-flex-column"
        style="gap: var(--vgo-space-2); padding: var(--vgo-space-4); overflow: auto; height: 100%; box-sizing: border-box;"
      >
        <span>拖动标题栏到左 / 右边缘分屏，拖到顶部最大化。</span>
        <span>悬停最大化按钮，选择布局。</span>
        <span>拖动最大化或分屏窗口的标题栏即可还原。</span>
        <span>位置和尺寸会被记住，刷新页面试试。</span>
      </div>
    </ViewPortWindow>

    <ViewPortWindow
      :key="`titleless-${renderKey}`" v-model:visible="state.titleless" no-title-bar
      :init-win-options="{ width: '260px', height: '140px' }"
    >
      <div class="vgo-panel vgo-panel--overlay vgo-window-demo__glass">
        <span>没有标题栏。窗口本身没有边框和背景，这一层是内容自己画的。</span>
        <button class="vgo-button vgo-button--overlay vgo-button--sm" @click="state.titleless = false">
          关闭
        </button>
      </div>
    </ViewPortWindow>

    <ViewPortWindow
      :key="`unclosable-${renderKey}`" v-model:visible="state.unclosable" :show-close="false"
      :allow-out="false" :init-win-options="{ width: '280px', height: '160px' }"
    >
      <template #titleBarLeft>
        <span>不可关闭窗口</span>
      </template>
      <div style="padding: var(--vgo-space-4);">
        隐藏了关闭按钮，并且不能拖出视口。
      </div>
    </ViewPortWindow>

    <ViewPortWindow
      :key="`fixed-size-${renderKey}`" v-model:visible="state.fixedSize" :allow-resize="false"
      :allow-snap="false" :init-win-options="{ width: '300px', height: '150px' }"
    >
      <template #titleBarLeft>
        <span>固定尺寸窗口</span>
      </template>
      <div style="padding: var(--vgo-space-4);">
        不能拖动边框调整大小，也不会贴边分屏。
      </div>
    </ViewPortWindow>
  </div>
</template>

<style scoped lang="scss">
.vgo-window-demo__glass {
  display: flex;
  flex-direction: column;
  gap: var(--vgo-space-2);
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 100%;
  padding: var(--vgo-space-3);
  box-shadow: var(--vgo-window-shadow);
}
</style>
