<script lang="ts" setup>
const version = __VGO_UI_PKG_VERSION__
</script>

<template>
  <div class="app-root">
    <div
      class="nav-menu flex-row-center-gap"
    >
      <router-link to="/" class="logo">
        <span class="logo-title">Vgo UI</span>
        <span class="logo-version" title="当前包版本">{{ version }}</span>
      </router-link>

      <div class="flex-row-center-gap nav-right">
        <router-link to="/docs">
          文档
        </router-link>
        <router-link to="/changelog">
          更新日志
        </router-link>
        <a
          href="https://github.com/canwdev/vgo-ui"
          target="_blank"
        >
          Github
        </a>
      </div>
    </div>
    <div class="app-content">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-root {
  display: flex;
  flex-direction: column;
  height: 100%;

  .nav-menu {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 60px;
    border-bottom: 1px solid var(--vgo-color-border);
    justify-content: space-between;
    .logo {
      gap: 10px;
      .logo-title {
        font-weight: 600;
      }
      .logo-version {
        font-size: 12px;
        font-weight: 500;
        color: var(--vgo-color-text-secondary, #909399);
        letter-spacing: 0.02em;
      }
    }
    a {
      height: 100%;
      padding-left: 20px;
      padding-right: 20px;
      text-decoration: none;
      display: flex;
      align-items: center;
      color: inherit;
      position: relative;
      &.router-link-active {
        color: var(--vgo-primary);
        &::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 4px;
          background-color: var(--vgo-primary);
        }
      }
    }
    .nav-right {
      height: 100%;
    }
  }
  .app-content {
    flex: 1;
    overflow: auto;
  }
}
</style>
