<script lang="ts" setup="">
import { reactive } from 'vue'
import ViewPortWindow from './ViewPortWindow.vue'

const win1 = reactive({
  visible: true,
  minimized: false,
})

// 点击标题栏「最小化」后触发：组件内部已把 minimized 置为 true，
// 这里负责把窗口从屏幕上收起（最小化的窗口收进"任务栏"等待还原）
function handleMinimized() {
  win1.visible = false
}

function restoreWin1() {
  win1.minimized = false
  win1.visible = true
}

function toggleWin1Visible() {
  if (win1.visible) {
    win1.visible = false
  }
  else {
    restoreWin1()
  }
}
</script>

<template>
  <div class="vgo-window-demo">
    <div class="vgo-u-flex-row" style="flex-wrap: wrap; gap: var(--vgo-space-2); align-items: center;">
      <button class="vgo-button" @click="toggleWin1Visible">
        {{ win1.visible ? '隐藏窗口1' : '显示窗口1' }}
      </button>
      <button v-if="win1.minimized" class="vgo-button vgo-button--primary" @click="restoreWin1">
        还原窗口1
      </button>
      <span v-if="win1.minimized">窗口1已最小化</span>
    </div>
    <ViewPortWindow
      v-model:visible="win1.visible" v-model:minimized="win1.minimized" allow-maximum allow-minimum
      :init-center="false" :init-win-options="{
        top: '300px',
        left: '300px',
        width: '400px',
        height: '200px',
      }" @on-minimized="handleMinimized"
    >
      <template #titleBarLeft>
        <span class="mdi mdi-microsoft-windows-classic" @dblclick.stop="toggleWin1Visible" />
        <span>窗口1</span>
      </template>
      <div style="padding:  var(--vgo-space-4); overflow: auto; height: 100%;">
        <div class="vgo-panel vgo-u-flex-wrap-center" style="padding: var(--vgo-space-4);">
          <input type="text" class="vgo-input" placeholder="Input">
          <button class="vgo-button">
            OK
          </button>
        </div>
      </div>
    </ViewPortWindow>
    <ViewPortWindow visible :show-close="false">
      <template #titleBarLeft>
        <span class="mdi mdi-microsoft-windows" />
        <span>窗口2</span>
      </template>
      <div style="padding: 100px; overflow: auto;height: 100%;">
        窗口内容2
      </div>
    </ViewPortWindow>
  </div>
</template>
