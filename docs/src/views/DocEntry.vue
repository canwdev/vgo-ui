<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import DocSidePanel from '../components/DocSidePanel.vue'
import MarkdownToc from '../components/MarkdownRender/MarkdownToc.vue'
import { docsRoutes } from '../router/docs.ts'

const route = useRoute()
const content = computed(() => typeof route.meta.content === 'string' ? route.meta.content : '')

const leftOpen = ref(false)
const rightOpen = ref(false)

function toggleLeft() {
  leftOpen.value = !leftOpen.value
  rightOpen.value = false
}

function toggleRight() {
  rightOpen.value = !rightOpen.value
  leftOpen.value = false
}
</script>

<template>
  <div class="docs-entry">
    <DocSidePanel
      class="docs-nav"
      side="left"
      :open="leftOpen"
      @close="leftOpen = false"
    >
      <router-link
        v-for="item in docsRoutes"
        :key="item.path"
        :to="item.path"
        class="vgo-list-item docs-nav__item"
        active-class="is-active"
        @click="leftOpen = false"
      >
        {{ item.meta?.title || '' }}
      </router-link>
    </DocSidePanel>

    <main class="docs-main vgo-panel">
      <router-view />
    </main>

    <DocSidePanel
      class="docs-toc"
      side="right"
      :open="rightOpen"
      @close="rightOpen = false"
    >
      <div v-if="content" @click="rightOpen = false">
        <MarkdownToc :text="content" />
      </div>
    </DocSidePanel>

    <div class="docs-fabs">
      <button
        class="vgo-button vgo-button--icon vgo-button--round"
        title="打开文档导航"
        @click="toggleLeft"
      >
        <span class="mdi mdi-menu" />
      </button>
      <button
        class="vgo-button vgo-button--icon vgo-button--round"
        title="打开本页目录"
        @click="toggleRight"
      >
        <span class="mdi mdi-format-list-bulleted" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.docs-entry {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--vgo-space-4);
  max-width: var(--docs-max-width);
  margin: 0 auto;
  padding: var(--vgo-space-3) var(--vgo-space-4);
}

.docs-nav {
  --doc-side-width: 200px;
}

.docs-toc {
  --doc-side-width: 240px;
}

.docs-main {
  min-width: 0;
}

.docs-nav__item {
  border-radius: var(--vgo-radius);
}

.docs-fabs {
  display: none;
}

@media (max-width: 960px) {
  .docs-entry {
    display: block;
    padding: var(--vgo-space-2);
  }

  .docs-fabs {
    position: fixed;
    right: var(--vgo-space-3);
    bottom: var(--vgo-space-3);
    z-index: var(--vgo-z-overlay);
    display: flex;
    flex-direction: column;
    gap: var(--vgo-space-2);
  }
}
</style>
