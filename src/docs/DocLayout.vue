<script setup lang="ts">
import {pageRoutes} from './router/glob.ts'

console.log(pageRoutes)
</script>

<template>
  <div class="document-root">
    <div class="navbar">VProUI</div>

    <div class="flex-rows">
      <div>
        <ul>
          <li v-for="(item, index) in pageRoutes" :key="item.path">
            <RouterLink :to="item.path"> {{ item.path }} | {{ item.meta?.title }}</RouterLink>
          </li>
        </ul>
      </div>
      <div class="document-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.document-root {
  display: flex;
  flex-direction: column;
  height: 100%;

  .document-content {
    flex: 1;
    overflow: auto;
  }
}
</style>
