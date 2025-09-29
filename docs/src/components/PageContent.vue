<script lang="ts" setup="">
import { toRefs } from 'vue'
import MarkdownRender from './MarkdownRender/MarkdownRender.vue'

const props = withDefaults(
  defineProps<{
    text?: string
  }>(),
  {
    text: '',
  },
)
const emit = defineEmits([])
const { text } = toRefs(props)
</script>

<template>
  <div
    class="page-content"
  >
    <slot name="header" />
    <MarkdownRender
      :text="text"
    >
      <slot />
    </MarkdownRender>
    <slot name="footer" />
  </div>
</template>

<style lang="scss" scoped>
.page-content {
  padding: 20px 20px;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
