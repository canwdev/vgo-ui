<script lang="ts" setup>
import PageContent from '../components/PageContent.vue'
import markdownContent from './index.md?raw'
</script>

<template>
  <PageContent :text="markdownContent" />
</template>
