<script setup lang="ts">
import type { QuickOptionItem } from './enum'
import QuickOptions from './QuickOptions.vue'
import { useContextMenu } from './utils/use-context-menu'

withDefaults(
  defineProps<{
    options: QuickOptionItem[]
    transitionName?: string
  }>(),
  {
    transitionName: 'fade',
  },
)

const { menuRef, isShow, ctxMenuStyle, showMenu, showMenuByPoint, showMenuByElement, hideMenu }
  = useContextMenu()

defineExpose({
  isShow,
  menuRef,
  showMenu,
  showMenuByPoint,
  showMenuByElement,
  hideMenu,
})
</script>

<template>
  <transition :name="transitionName">
    <QuickOptions
      ref="menuRef"
      v-model:visible="isShow"
      :options="options"
      :style="ctxMenuStyle"
      v-bind="$attrs"
      :show-index="false"
      @click.stop
    />
  </transition>
</template>
