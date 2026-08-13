<script lang="ts" setup>
import ThemeControl from './components/ThemeControl.vue'

const version = __VGO_UI_PKG_VERSION__
</script>

<template>
  <div class="app-root">
    <div
      data-docs-header
      class="nav-menu vgo-panel vgo-panel--flat vgo-u-flex-wrap-center"
    >
      <router-link to="/" class="vgo-button vgo-button--text">
        <span class="logo-title">Vgo UI</span>
        <span class="logo-version vgo-badge vgo-badge--primary">v{{ version }}</span>
      </router-link>

      <div class="vgo-u-flex-wrap-center">
        <router-link to="/docs" class="vgo-button vgo-button--text" active-class="is-active">
          <span class="mdi mdi-book-open-page-variant-outline" />
          文档
        </router-link>
        <router-link to="/changelog" class="vgo-button vgo-button--text" active-class="is-active">
          <span class="mdi mdi-history" />
          更新日志
        </router-link>
        <ThemeControl />
        <a
          class="vgo-button vgo-button--text vgo-button--icon"
          href="https://github.com/canwdev/vgo-ui"
          target="_blank"
          title="GitHub"
        >
          <span class="mdi mdi-github" />
        </a>
        <a
          class="vgo-button vgo-button--text vgo-button--icon"
          href="https://www.npmjs.com/package/@canwdev/vgo-ui"
          target="_blank"
          title="npm"
        >
          <span class="mdi mdi-npm vgo-u-icon-lg" />
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
  min-height: 100vh;
}

.nav-menu {
  position: sticky;
  top: 0;
  z-index: var(--vgo-z-sticky);
  justify-content: space-between;
  padding: var(--vgo-space-2) var(--vgo-space-4);
  border-bottom: 1px solid var(--vgo-border);
}

.logo-title {
  font-weight: 600;
}

.logo-version {
  font-size: var(--vgo-font-sm);
  color: var(--vgo-text-secondary);
}

.app-content {
  flex: 1;
}
</style>
