<script lang="ts" setup>
import { ref } from 'vue'
import DocSidePanel from './components/DocSidePanel.vue'
import ThemeControl from './components/ThemeControl.vue'

const version = __VGO_UI_PKG_VERSION__
const navOpen = ref(false)
</script>

<template>
  <div class="app-root">
    <div data-docs-header class="nav-menu vgo-panel vgo-panel--flat">
      <div class="nav-content">
        <router-link to="/" class="vgo-button vgo-button--text">
          <span class="logo-title">Vgo UI</span>
          <span class="logo-version vgo-badge vgo-badge--primary">v{{ version }}</span>
        </router-link>

        <div class="nav-menus vgo-u-flex-wrap-center">
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

        <button
          class="nav-menu-button vgo-button vgo-button--icon vgo-button--round"
          title="打开导航"
          @click="navOpen = !navOpen"
        >
          <span class="mdi mdi-menu" />
        </button>
      </div>
    </div>

    <DocSidePanel class="nav-drawer" side="right" :open="navOpen" @close="navOpen = false">
      <div class="nav-drawer__list">
        <router-link to="/docs" class="vgo-list-item" @click="navOpen = false">
          <span class="mdi mdi-book-open-page-variant-outline vgo-u-icon-lg" />
          文档
        </router-link>
        <router-link to="/changelog" class="vgo-list-item" @click="navOpen = false">
          <span class="mdi mdi-history vgo-u-icon-lg" />
          更新日志
        </router-link>
        <div class="nav-drawer__theme">
          <ThemeControl />
        </div>
        <a
          class="vgo-list-item"
          href="https://github.com/canwdev/vgo-ui"
          target="_blank"
          @click="navOpen = false"
        >
          <span class="mdi mdi-github vgo-u-icon-lg" />
          GitHub
        </a>
        <a
          class="vgo-list-item"
          href="https://www.npmjs.com/package/@canwdev/vgo-ui"
          target="_blank"
          @click="navOpen = false"
        >
          <span class="mdi mdi-npm vgo-u-icon-lg" />
          npm
        </a>
      </div>
    </DocSidePanel>

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
  border-bottom: 1px solid var(--vgo-border);
}

.nav-content {
  display: flex;
  gap: var(--vgo-space-2);
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: var(--docs-max-width);
  margin: 0 auto;
  padding: var(--vgo-space-2) var(--vgo-space-4);
  box-sizing: border-box;
}

.logo-title {
  font-weight: 600;
}

.logo-version {
  font-size: var(--vgo-font-sm);
  color: var(--vgo-text-secondary);
}

.nav-menu-button {
  display: none;
}

.nav-drawer {
  display: none;
}

.nav-drawer__list {
  display: flex;
  flex-direction: column;
  gap: var(--vgo-space-1);
}

.nav-drawer__list .vgo-list-item {
  border-radius: var(--vgo-radius);
}

.nav-drawer__theme {
  padding: var(--vgo-space-1) var(--vgo-space-2);
}

.app-content {
  flex: 1;
}

@media (max-width: 960px) {
  .nav-menus {
    display: none;
  }

  .nav-menu-button {
    display: inline-flex;
  }

  .nav-drawer {
    display: block;
  }
}
</style>
