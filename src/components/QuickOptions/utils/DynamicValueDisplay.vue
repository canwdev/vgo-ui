<script lang="ts" setup>
import {watchDebounced} from '@vueuse/core'
import {ref, toRefs} from 'vue'
import {DynamicValueDisplayProps} from '../enum.ts'

const props = withDefaults(defineProps<DynamicValueDisplayProps>(), {
  text: '',
})

const {text} = toRefs(props)

const textDisplay = ref('')
watchDebounced(
  text,
  () => {
    if (typeof props.formatFn === 'function') {
      textDisplay.value = props.formatFn(text.value)
    } else {
      textDisplay.value = text.value
    }
  },
  {debounce: 300, immediate: true},
)
</script>

<template>
  <div class="dynamic-value-display">
    {{ textDisplay }}
    <span class="d-label" v-if="label">{{ label }}</span>
  </div>
</template>

<style lang="scss" scoped>
.dynamic-value-display {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 4px;
  align-items: center;
  .d-label {
    display: inline-block;
    font-size: 12px;
    opacity: 0.7;
    font-weight: 400;
    word-break: keep-all;
  }
}
</style>
