<script lang="ts" setup="">
import { ref } from 'vue'
import ViewPortWindow from './ViewPortWindow.vue'

const visible = ref(true)

function handleMinimize() {
  alert('handleMinimize')
}
</script>

<template>
  <div class="vgo-window-demo">
    <button class="vgo-button vgo-button--primary" @click="visible = !visible">
      切换窗口1可见性
    </button>
    <ViewPortWindow
      v-model:visible="visible" allow-maximum allow-minimum :init-center="false" :init-win-options="{
        top: '300px',
        left: '300px',
        width: '400px',
        height: '200px',
      }" @on-minimized="handleMinimize"
    >
      <template #titleBarLeft>
        <span class="mdi mdi-microsoft-windows-classic" @dblclick.stop="visible = !visible" />
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
