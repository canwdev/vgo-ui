<script lang="ts" setup="">
import { ref } from 'vue'
import ViewPortWindow from './ViewPortWindow.vue'

const visible = ref(true)
</script>

<template>
  <div class="demo">
    <button class="vgo-button primary" @click="visible = !visible">
      切换窗口1可见性
    </button>
    <ViewPortWindow
      v-model:visible="visible" allow-maximum allow-minimum
      :init-center="false"
      :init-win-options="{
        top: '100px',
        left: '100px',
        width: '400px',
        height: '300px',
      }"
    >
      <template #titleBarLeft>
        <span>窗口1</span>
      </template>
      <div style="padding: 100px; overflow: auto;height: 100%;">
        窗口内容1
      </div>
    </ViewPortWindow>
    <ViewPortWindow
      visible
      :show-close="false"
    >
      <template #titleBarLeft>
        <span>窗口2</span>
      </template>
      <div style="padding: 100px; overflow: auto;height: 100%;">
        窗口内容2
      </div>
    </ViewPortWindow>
  </div>
</template>
