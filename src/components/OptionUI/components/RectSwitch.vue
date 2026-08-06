<script lang="ts" setup>
import type { PropType } from 'vue'
import type { SwitchOption } from '../enum.ts'
import { useVModel } from '@vueuse/core'
import { watch } from 'vue'

// 定义组件的 props
const props = defineProps({
  modelValue: {
    type: [Boolean, String, Number] as PropType<boolean | string | number>,
    default: false,
  },
  options: {
    type: Array as PropType<SwitchOption[]>,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isLabelHtml: {
    type: Boolean,
    default: false,
  },
})

// 定义组件的 emits
const emit = defineEmits(['update:modelValue', 'tabChange'])

// 使用 useVModel 实现双向绑定
const mValue = useVModel(props, 'modelValue', emit)

watch(mValue, (value) => {
  emit('tabChange', value)
})
</script>

<template>
  <div class="vgo-rect-switch" :class="{ 'is-disabled': disabled }">
    <div
      v-for="item in options"
      :key="item.value"
      class="vgo-rect-switch__item"
      :class="{ 'is-active': item.value === mValue }"
      @click="mValue = item.value"
    >
      <div v-if="isLabelHtml" v-html="item.label" />
      <template v-else>
        {{ item.label || item.value }}
      </template>
    </div>
  </div>
</template>
