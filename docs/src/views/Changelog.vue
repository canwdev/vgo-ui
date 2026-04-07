<script lang="ts" setup>
import PageContent from '../components/PageContent.vue'
import changelogMd from '../../../CHANGELOG.md?raw'
</script>

<template>
  <div class="page-changelog">
    <PageContent :text="changelogMd" />
  </div>
</template>

<style lang="scss" scoped>
.page-changelog {
  padding: 20px 0;
}
</style>
