<script lang="ts" setup="">
import { useVModel } from '@vueuse/core'
import { nextTick, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string[]
  }>(),
  {
    modelValue: () => [],
  },
)
const emit = defineEmits([])

const dynamicTags = useVModel(props, 'modelValue', emit)
const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref()

function handleClose(tag: string) {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1)
}

function showInput() {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

function handleInputConfirm() {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>

<template>
  <div class="vgo-dynamic-tags">
    <el-tag
      v-for="tag in dynamicTags"
      :key="tag"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)"
    >
      {{ tag }}
    </el-tag>
    <el-input
      v-if="inputVisible"
      ref="InputRef"
      v-model="inputValue"
      class="vgo-dynamic-tags__input"
      size="small"
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm"
    />
    <el-button v-else class="vgo-dynamic-tags__add" size="small" @click="showInput">
      + New Tag
    </el-button>
  </div>
</template>
