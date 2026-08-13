<script lang="ts" setup>
import { watchThrottled } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { ref, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import markdown from './markdown'

interface Props {
  dark?: boolean
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  dark: false,
  text: '',
})
const { text } = toRefs(props)
const router = useRouter()

const renderedContent = ref('')
function renderMd() {
  renderedContent.value = markdown.render(text.value)
}
watchThrottled(
  text,
  () => {
    renderMd()
  },
  { throttle: 100, trailing: true, immediate: true },
)

function isInternalHref(href: string): boolean {
  return !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)
}

function handleClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element))
    return

  const link = target.closest('a')
  if (link) {
    const href = link.getAttribute('href')
    if (href && isInternalHref(href) && link.target !== '_blank') {
      event.preventDefault()
      router.push(href)
    } else if (href) {
      event.preventDefault()
      window.open(href)
    }
    return
  }

  // 处理代码块复制
  const actionButton = target.closest('._js-action-button')
  if (actionButton) {
    const code = actionButton.parentElement?.nextElementSibling?.textContent ?? ''

    switch (actionButton.getAttribute('data-action')) {
      case 'copy':
        navigator.clipboard.writeText(code)
        ElMessage.success('Code copied to clipboard')
        break
    }
  }
}
</script>

<template>
  <div
    class="markdown-body"
    :class="[dark ? 'markdown-body-dark' : 'markdown-body']"
    @click="handleClick"
  >
    <div v-html="renderedContent" />
    <slot />
  </div>
</template>

<style lang="scss">
.hljs-code-container {
  //background-color: #212121 !important;
  padding: 0 !important;
  overflow: unset !important;
  display: flex;
  flex-direction: column;
  & > code {
    padding: 8px !important;
    width: 100% !important;
    overflow: auto !important;
  }
}
.hljs-code-header {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 0.5em 1em;
  font-size: 12px;
  box-shadow: none !important;
  border-color: rgba(108, 108, 108, 0.1) !important;
  position: sticky;
  top: 0;
  border-radius: 4px 4px 0 0 !important;

  ._js-action-button {
  }
}
</style>
