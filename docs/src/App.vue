<script lang="ts" setup>

</script>

<template>
  <div class="app-root">
    <div
      class="nav-menu flex-row-center-gap"
    >
      <router-link to="/" class="logo">
        Vgo UI
      </router-link>

      <div class="flex-row-center-gap nav-right">
        <router-link to="/docs">
          文档
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
