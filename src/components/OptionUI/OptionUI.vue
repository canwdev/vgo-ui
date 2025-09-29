<script lang="ts" setup>
import type { StOptionItem } from './enum'
import { provide, ref, toRefs } from 'vue'
import OptionItem from './OptionItem.vue'

const props = withDefaults(
  defineProps<{
    // 选项列表
    optionList: StOptionItem[]
    // 可选 配置存储对象 Ref，可以是 pinia store
    store?: unknown
    expandId?: string
  }>(),
  {
    expandId: '',
  },
)

const emit = defineEmits(['onToggleExpand', 'updateValue'])

const CONTROL_FOLDED_KEY_MAP = 'option_ui_folded_key_map'

const { expandId, store } = toRefs(props)
// 提供给所有子组件
provide('sharedStore', store)

// 保存展开状态
const foldedKeyMap = ref(
  JSON.parse(
    localStorage.getItem(CONTROL_FOLDED_KEY_MAP + expandId.value) || 'null',
  ) || {},
)

// 切换展开状态
function handleToggleExpand(item: StOptionItem) {
  if (foldedKeyMap.value[item.key]) {
    delete foldedKeyMap.value[item.key]
  }
  else {
    foldedKeyMap.value[item.key] = true
  }
  localStorage.setItem(
    CONTROL_FOLDED_KEY_MAP + expandId.value,
    JSON.stringify(foldedKeyMap.value),
  )
}
</script>

<template>
  <div class="option-ui">
    <OptionItem
      v-for="item in optionList"
      v-show="!item.hidden"
      :key="item.key"
      :item="item"
      :folded-key-map="foldedKeyMap"
      @on-toggle-expand="handleToggleExpand"
      @update-value="(v) => emit('updateValue', v)"
    />
  </div>
</template>
