<script lang="ts" setup>
import {PropType, watch} from 'vue'
import {SwitchOption} from '../enum'
import {useVModel} from '@vueuse/core'

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
  <div class="rect-switch" :class="{disabled}">
    <div
      v-for="item in options"
      :key="item.value"
      class="r-item"
      @click="mValue = item.value"
      :class="{active: item.value === mValue}"
    >
      <div v-if="isLabelHtml" v-html="item.label"></div>
      <template v-else>
        {{ item.label || item.value }}
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.rect-switch {
  width: fit-content;
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 2px;
  border: 1px solid var(--vgo-color-border);
  flex-wrap: wrap;

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed !important;
    .r-item {
      pointer-events: none;
    }
  }

  .r-item {
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 14px;
    transition: all 0.3s;
    cursor: pointer;
    line-height: 1.3;
    text-align: center;

    &.active {
      background-color: var(--vgo-primary);
      color: white;
    }
  }
}
</style>
