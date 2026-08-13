<script lang="ts" setup>
import { watchThrottled } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, ref, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'
import markdown, { getHighlightThemeCss } from './markdown'

interface Props {
  dark?: boolean
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  dark: false,
  text: '',
})
const emit = defineEmits<{ rendered: [] }>()
const { text, dark } = toRefs(props)
const router = useRouter()

const renderedContent = ref('')
let highlightStyle: HTMLStyleElement | null = null

function applyHighlightTheme(darkValue: boolean) {
  highlightStyle?.remove()
  const style = document.createElement('style')
  style.dataset.highlightTheme = ''
  style.textContent = getHighlightThemeCss(darkValue)
  document.head.appendChild(style)
  highlightStyle = style
}

watch(dark, applyHighlightTheme, { immediate: true })
onBeforeUnmount(() => highlightStyle?.remove())

function renderMd() {
  renderedContent.value = markdown.render(text.value)
  emit('rendered')
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
    }
    else if (href) {
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
.markdown-body :where(h1, h2, h3)[id] {
  scroll-margin-top: var(--docs-sticky-top);
}

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
