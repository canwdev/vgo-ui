<script setup lang="ts">
import { useRoute } from 'vue-router'

import PageContent from '../components/PageContent.vue'

const route = useRoute()
</script>

<template>
  <PageContent :text="route.meta?.content">
    <template #footer>
      <div v-if="route.meta?.component" class="demo-component">
        <!--  加载异步组件 -->
        <h2>Demo</h2>
        <component :is="route.meta?.component" />
      </div>
    </template>
  </PageContent>
</template>
