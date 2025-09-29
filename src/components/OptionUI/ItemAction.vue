<script lang="ts" setup>
import type { StOptionItem } from './enum'
import { computed, inject, toRefs } from 'vue'
import VueRender from '../VueRender.vue'
import DynamicTags from './components/DynamicTags.vue'
import RectSwitch from './components/RectSwitch.vue'
import { StOptionType, swatches } from './enum'

const props = defineProps<{
  item: StOptionItem
}>()
const emit = defineEmits(['updateValue'])
const { item } = toRefs(props)
// 顶层父组件的数据
const sharedStore = inject('sharedStore')

const dynamicValue = computed({
  get() {
    const store = item.value.store || sharedStore.value
    if (store) {
      return store[item.value.key]
    }
    return item.value.value
  },
  set(val) {
    emit('updateValue', { item: item.value, value: val })
    const store = item.value.store || sharedStore.value
    if (store) {
      store[item.value.key] = val
      return
    }
    item.value.value = val
  },
})
</script>

<template>
  <el-space class="option-item-action" size="small" align="center">
    <el-switch
      v-if="item.type === StOptionType.SWITCH"
      v-model="dynamicValue"
      v-bind="item.props"
    />

    <RectSwitch
      v-else-if="item.type === StOptionType.MULTIPLE_SWITCH"
      v-model="dynamicValue"
      :options="item.options"
      v-bind="item.props"
    />

    <el-input
      v-else-if="item.type === StOptionType.INPUT"
      v-model="dynamicValue"
      class="option-select option-input"
      clearable
      v-bind="item.props"
    />

    <el-select
      v-else-if="item.type === StOptionType.SELECT"
      v-model="dynamicValue"
      :placeholder="item.placeholder"
      class="option-select"
      :teleported="false"
      v-bind="item.props"
    >
      <el-option v-for="vi in item.options" :key="vi.value" :label="vi.label" :value="vi.value" />
    </el-select>

    <DynamicTags
      v-else-if="item.type === StOptionType.DYNAMIC_TAGS"
      v-model="dynamicValue"
      class="dynamic-tags"
      v-bind="item.props"
    />

    <el-color-picker
      v-else-if="item.type === StOptionType.COLOR_PICKER"
      v-model="dynamicValue"
      v-bind="item.props"
      :predefine="swatches"
    />

    <!-- 高级的数字输入框 -->
    <el-input-number
      v-else-if="item.type === StOptionType.INPUT_NUMBER"
      v-model="dynamicValue"
      :disabled="item.disabled"
      v-bind="item.props"
    />

    <el-date-picker
      v-else-if="item.type === StOptionType.DATE_PICKER"
      v-model="dynamicValue"
      :disabled="item.disabled"
      class="option-select"
      v-bind="item.props"
    />

    <button
      v-else-if="item.type === StOptionType.BUTTON"
      :disabled="item.disabled"
      v-bind="item.props"
      class="vgo-button"
    >
      {{ item.value }}
    </button>

    <VueRender v-if="item.actionRender" :render-fn="item.actionRender" />
  </el-space>
</template>

<style lang="scss">
.option-item-action {
  .option-slider-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    .option-slider {
      width: 180px;
    }
    .number-input-wrap {
      width: 74px;
    }
  }
  .option-select {
    width: 200px;
    &.el-date-editor {
      width: 200px;
    }
  }
  .dynamic-tags {
    width: 250px;
  }
  .option-input {
    font-size: 12px;
  }
  .el-select-dropdown__list {
    text-align: left;
  }
}
</style>
