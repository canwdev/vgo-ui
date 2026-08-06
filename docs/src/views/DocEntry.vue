<script setup lang="ts">
import { docsRoutes } from '../router/docs.ts'
</script>

<template>
  <div class="docs-entry">
    <el-splitter>
      <el-splitter-panel size="200px" collapsible>
        <div class="link-list vgo-u-scrollbar">
          <router-link
            v-for="item in docsRoutes"
            :key="item.path"
            :to="item.path"
            class="vgo-list-item"
            active-class="is-active"
            :index="item.path"
          >
            {{ item.meta?.title || '' }}
          </router-link>
        </div>
      </el-splitter-panel>
      <el-splitter-panel :min="200">
        <div class="docs-content vgo-u-scrollbar">
          <router-view />
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<style lang="scss" scoped>
.docs-entry {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.link-list {
  box-sizing: border-box;
  padding: var(--vgo-space-1);
}

.vgo-list-item {
  border-radius: var(--vgo-radius);
}

.link-list,
.docs-content {
  height: 100%;
  overflow: auto;
}
</style>
