<script lang="ts" setup>
import type { ILayout } from './enum.ts'
import { useVModel } from '@vueuse/core'
import { ref } from 'vue'
import { layoutList } from './enum.ts'
import LayoutPreview from './LayoutPreview.vue'

const props = withDefaults(defineProps<{
  visible?: boolean
}>(), {
  visible: false,
})
const emit = defineEmits(['update:visible', 'setWindowLayout'])

const mVisible = useVModel(props, 'visible', emit)

const previewData = ref<ILayout>()

function setWindowLayout(layout: ILayout) {
  emit('setWindowLayout', layout)
  mVisible.value = false
  setTimeout(() => {
    previewData.value = undefined
  })
}

function setLayout(layout: ILayout) {
  if (mVisible.value) {
    previewData.value = layout
  }
  else {
    previewData.value = undefined
  }
}
</script>

<template>
  <transition name="fade">
    <div v-if="mVisible" class="vgo-layout-helper vgo-panel" @mouseleave="mVisible = false">
      <div
        v-for="(layout, index) in layoutList"
        :key="index"
        class="vgo-layout-helper__item"
        @mouseover="setLayout(layout)"
        @mouseleave="previewData = undefined"
        @click="setWindowLayout(layout)"
      >
        <div
          :style="{
            top: `${layout.yRatio * 100}%`,
            left: `${layout.xRatio * 100}%`,
            width: `${layout.widthRatio * 100}%`,
            height: `${layout.heightRatio * 100}%`,
          }"
          class="vgo-layout-helper__preview"
        />
      </div>
    </div>
  </transition>
  <LayoutPreview :preview-data="previewData" />
</template>
