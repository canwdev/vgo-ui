<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import PageContent from '../components/PageContent.vue'

const route = useRoute()
const content = computed(() => {
  return typeof route.meta.content === 'string' ? route.meta.content : ''
})
</script>

<template>
  <PageContent :text="content" :toc="false">
    <template #header>
      <div v-if="route.meta?.component" class="demo-component">
        <!--  加载异步组件 -->
        <component :is="route.meta?.component" />
      </div>
    </template>
  </PageContent>
</template>

<style lang="scss" scoped>
.demo-component {
  outline: 1px dashed var(--vgo-border);
  margin-bottom: var(--vgo-space-4);
  padding: var(--vgo-space-2);
}
</style>
