<script setup lang="ts">
import { docsRoutes } from '../router/docs.ts'
</script>

<template>
  <div class="docs-entry">
    <el-splitter>
      <el-splitter-panel size="200px" collapsible>
        <div class="link-list">
          <router-link v-for="item in docsRoutes" :key="item.path" :to="item.path" class="link-item" :index="item.path">
            {{ item.meta?.title || '' }}
          </router-link>
        </div>
      </el-splitter-panel>
      <el-splitter-panel :min="200">
        <div class="docs-content">
          <router-view />
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<style lang="scss" scoped>
.docs-entry {
  height: 100%;
  display: flex;
  overflow: hidden;

  .link-list {
    .link-item {
      box-sizing: border-box;
      width: 100%;
      padding-left: 20px;
      padding-right: 20px;
      text-decoration: none;
      display: flex;
      align-items: center;
      color: inherit;
      position: relative;
      height: 40px;
      &.router-link-active {
        color: var(--vgo-primary);
        &::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--vgo-primary);
        }
      }
    }
  }
  .docs-content {
    height: 100%;
    overflow: auto;
    .page-content {
      padding-top: 40px;
      padding-bottom: 40px;
    }
  }
}
</style>
