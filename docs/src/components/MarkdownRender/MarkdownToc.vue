<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { getHeadings } from './markdown'

const props = defineProps<{
  text: string
}>()

const activeId = ref('')
const headings = computed(() => getHeadings(props.text))

let ticking = false

function headingElements(): HTMLElement[] {
  return headings.value
    .map(heading => document.getElementById(heading.id))
    .filter((el): el is HTMLElement => el !== null)
}

function headerOffset(): number {
  const header = document.querySelector<HTMLElement>('[data-docs-header]')
  return (header?.offsetHeight ?? 0) + 12
}

function updateActive() {
  const offset = headerOffset()
  const scrollY = window.scrollY
  let current = headings.value[0]?.id ?? ''

  for (const el of headingElements()) {
    const top = el.getBoundingClientRect().top + scrollY
    if (top <= scrollY + offset)
      current = el.id
    else
      break
  }

  activeId.value = current
}

function onScroll() {
  if (ticking)
    return
  ticking = true
  requestAnimationFrame(() => {
    updateActive()
    ticking = false
  })
}

function refresh() {
  nextTick(updateActive)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  updateActive()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

defineExpose({ refresh })
</script>

<template>
  <nav
    v-if="headings.length"
    class="markdown-toc vgo-u-scrollbar"
    aria-label="本页目录"
  >
    <a
      v-for="heading in headings"
      :key="heading.id"
      class="vgo-list-item toc-item"
      :class="[
        `toc-item--h${heading.level}`,
        { 'is-active': heading.id === activeId },
      ]"
      :href="`#${heading.id}`"
    >
      {{ heading.text }}
    </a>
  </nav>
</template>

<style lang="scss" scoped>
.toc-item {
  min-height: var(--vgo-control-sm);
  padding: var(--vgo-space-1) var(--vgo-space-2);
  font-size: var(--vgo-font-sm);
  color: var(--vgo-text-secondary);
  border-radius: var(--vgo-radius);
}

.toc-item--h1 {
  color: var(--vgo-text);
  font-weight: 600;
}

.toc-item--h2 {
  padding-left: var(--vgo-space-4);
}

.toc-item--h3 {
  padding-left: calc(var(--vgo-space-4) * 2);
}

.toc-item.is-active {
  color: var(--vgo-text);
}
</style>
