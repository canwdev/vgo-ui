<script lang="ts" setup>
import type { Ref } from 'vue'
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
const sharedStore = inject<Ref<Record<string, any>>>('sharedStore')

const dynamicValue = computed({
  get() {
    const store = item.value.store || sharedStore?.value
    if (store) {
      return (store as Record<string, any>)[item.value.key]
    }
    return item.value.value
  },
  set(val) {
    emit('updateValue', { item: item.value, value: val })
    const store = item.value.store || sharedStore?.value
    if (store) {
      (store as Record<string, any>)[item.value.key] = val
      return
    }
    item.value.value = val
  },
})
</script>

<template>
  <el-space class="vgo-option-action" size="small" align="center">
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
      class="vgo-option-action__control vgo-option-action__input"
      clearable
      v-bind="item.props"
    />

    <el-select
      v-else-if="item.type === StOptionType.SELECT"
      v-model="dynamicValue"
      :placeholder="item.placeholder"
      class="vgo-option-action__control"
      :teleported="false"
      v-bind="item.props"
    >
      <el-option v-for="vi in item.options" :key="vi.value" :label="vi.label" :value="vi.value" />
    </el-select>

    <DynamicTags
      v-else-if="item.type === StOptionType.DYNAMIC_TAGS"
      v-model="dynamicValue"
      class="vgo-option-action__tags"
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
      class="vgo-option-action__control"
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
