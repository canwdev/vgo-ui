<script lang="ts" setup="">
import { ref } from 'vue'
import ViewPortWindow from './ViewPortWindow.vue'

const visible = ref(true)
</script>

<template>
  <div class="demo">
    <button class="vgo-button primary" @click="visible = !visible">
      切换可见性
    </button>
    <ViewPortWindow
      v-model:visible="visible" allow-maximum allow-minimum
    >
      <template #titleBarLeft>
        <span>窗口标题</span>
      </template>
      <div style="padding: 100px; overflow: auto;height: 100%;">
        窗口内容
      </div>
    </ViewPortWindow>
  </div>
</template>
