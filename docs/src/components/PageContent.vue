<script lang="ts" setup="">
import { computed, ref, toRefs } from 'vue'
import { isDark } from '../hooks/use-site-theme'
import { getHeadings } from './MarkdownRender/markdown'
import MarkdownRender from './MarkdownRender/MarkdownRender.vue'
import MarkdownToc from './MarkdownRender/MarkdownToc.vue'

const props = withDefaults(
  defineProps<{
    text?: string
  }>(),
  {
    text: '',
  },
)
const { text } = toRefs(props)

const tocRef = ref<InstanceType<typeof MarkdownToc> | null>(null)
const tocItems = computed(() => getHeadings(text.value))
</script>

<template>
  <div class="page-content">
    <div class="page-main">
      <slot name="header" />
      <MarkdownRender
        :text="text"
        :dark="isDark"
        @rendered="tocRef?.refresh()"
      >
        <slot />
      </MarkdownRender>
      <slot name="footer" />
    </div>
    <MarkdownToc
      v-if="tocItems.length"
      ref="tocRef"
      :text="text"
      class="page-toc"
    />
  </div>
</template>

<style lang="scss" scoped>
.page-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--vgo-space-4);
  align-items: start;
  max-width: 1280px;
  margin: 0 auto;
  padding: calc(var(--vgo-space-4) * 2) var(--vgo-space-4);
}

.page-main {
  width: 100%;
  min-width: 0;
  max-width: 1000px;
  justify-self: center;
}

.page-toc {
  position: sticky;
  top: var(--vgo-space-4);
  width: 220px;
  max-height: calc(100vh - var(--vgo-space-4) * 2);
  padding-left: var(--vgo-space-3);
  overflow: auto;
  border-left: 1px solid var(--vgo-border);
}

@media (max-width: 960px) {
  .page-toc {
    display: none;
  }
}
</style>
