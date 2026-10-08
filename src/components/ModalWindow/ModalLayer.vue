<script lang="ts" setup>
import { ref } from 'vue'

defineOptions({ inheritAttrs: false })

defineProps<{
  // 窗口可见时为 true。遮罩跟着淡入淡出，层本身留着，窗口才能播完自己的退场动画
  open: boolean
  maskClosable?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const root = ref<HTMLElement>()

defineExpose({
  getRoot: () => root.value,
})
</script>

<template>
  <Teleport to="body">
    <div ref="root" class="vgo-window-modal" :class="{ 'is-open': open }">
      <transition name="fade">
        <div
          v-if="open"
          class="vgo-window-modal__mask"
          @click="maskClosable && emit('close')"
        />
      </transition>
      <slot />
    </div>
  </Teleport>
</template>
