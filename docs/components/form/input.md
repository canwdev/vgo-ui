# Input 输入框

基础的输入框组件示例。

## 基础用法

<script setup>
import { ref } from 'vue'
const value = ref('')
</script>

  <input 
    v-model="value"
    class="custom-input" 
    placeholder="请输入内容"
  />
 <div> {{value}}</div>

<style>
.custom-input {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  width: 200px;
}
</style>

## 代码示例

```vue
<template>
  <input 
    v-model="value"
    class="custom-input" 
    placeholder="请输入内容"
  >
</template>
```