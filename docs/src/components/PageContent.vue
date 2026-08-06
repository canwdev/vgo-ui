<script lang="ts" setup="">
import { toRefs } from 'vue'
import { isDark } from '../hooks/use-site-theme'
import MarkdownRender from './MarkdownRender/MarkdownRender.vue'

const props = withDefaults(
  defineProps<{
    text?: string
  }>(),
  {
    text: '',
  },
)
const { text } = toRefs(props)
</script>

<template>
  <div
    class="page-content"
  >
    <slot name="header" />
    <MarkdownRender
      :text="text"
      :dark="isDark"
    >
      <slot />
    </MarkdownRender>
    <slot name="footer" />
  </div>
</template>

<style lang="scss" scoped>
// 唯一一处正文留白，首页 / 更新日志 / 文档详情共用
.page-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: calc(var(--vgo-space-4) * 2) var(--vgo-space-4);
}
</style>
