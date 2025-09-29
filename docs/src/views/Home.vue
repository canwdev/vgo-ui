<script lang="ts" setup>
import PageContent from '../components/PageContent.vue'
import markdownContent from './index.md?raw'
</script>

<template>
  <div class="page-home">
    <PageContent :text="markdownContent" />
  </div>
</template>

<style lang="scss" scoped>
.page-home {
  padding: 20px 0;
}
</style>
