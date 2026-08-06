<script lang="ts" setup>
import type { ILayout } from './enum.ts'

interface Props {
  previewData: ILayout | undefined
}

withDefaults(defineProps<Props>(), {})
</script>

<template>
  <transition name="fade-scale">
    <div
      v-if="previewData"
      class="vgo-layout-preview"
      :style="{
        top: `${previewData.yRatio * 100}%`,
        left: `${previewData.xRatio * 100}%`,
        width: `${previewData.widthRatio * 100}%`,
        height: `${previewData.heightRatio * 100}%`,
      }"
    />
  </transition>
</template>
