<script lang="ts" setup="">
import {toRefs} from "vue";

const props = withDefaults(
  defineProps<{
    text?: string
  }>(),
  {
    text: '',
  },
)
const emit = defineEmits([])
const {text} = toRefs(props)
</script>

<template>
  <div class="vgo-ui-demo">
    <h1>Vgo UI 基本样式示例</h1>

    <h2>按钮</h2>
    <button class="btn-no-style">无样式按钮</button>

    <h2>表单</h2>
    <input type="text" class="vp-input">

    <h2>布局</h2>
    <div class="flex-cols">
      <span>1</span>
      <span>2</span>
      <span>3</span>
    </div>
    <div class="flex-rows">
      <span>1</span>
      <span>2</span>
      <span>3</span>
    </div>
</div>
</template>

<style lang="scss" scoped>
.vgo-ui-demo {
  
}
</style>
