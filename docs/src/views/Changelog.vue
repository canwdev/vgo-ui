<script lang="ts" setup>
import changelogMd from '../../../CHANGELOG.md?raw'
import PageContent from '../components/PageContent.vue'
</script>

<template>
  <PageContent :text="changelogMd" />
</template>
