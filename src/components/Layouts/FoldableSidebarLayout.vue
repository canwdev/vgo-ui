<script setup lang="ts">
import {useVModel} from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    expand?: boolean
  }>(),
  {
    expand: true,
  },
)
const emit = defineEmits(['update:expand'])

const isSidebarExpand = useVModel(props, 'expand', emit, {passive: true})
</script>

<template>
  <div class="vgo-foldable-sidebar-layout vgo-panel">
    <div class="layout-sidebar" :class="{_expand: isSidebarExpand}">
      <div class="sidebar-content">
        <slot name="sidebar"></slot>
      </div>

      <button class="btn-toggle-expand btn-no-style" @click="isSidebarExpand = !isSidebarExpand">
        <svg
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 16 16"
        >
          <g fill="none">
            <path
              d="M10.354 3.146a.5.5 0 0 1 0 .708L6.207 8l4.147 4.146a.5.5 0 0 1-.708.708l-4.5-4.5a.5.5 0 0 1 0-.708l4.5-4.5a.5.5 0 0 1 .708 0z"
              fill="currentColor"
            ></path>
          </g>
        </svg>
      </button>
    </div>
    <div class="layout-content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vgo-foldable-sidebar-layout {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;

  border-radius: 0;
  border: none;
  outline: none;

  .layout-sidebar {
    width: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.1s;

    .sidebar-content {
      height: 100%;
      overflow: hidden;
    }

    &._expand {
      width: 240px;
      border-right: 1px solid var(--vgo-color-border);
      .btn-toggle-expand {
        svg {
          transform: rotateY(0);
        }
      }
    }

    .btn-toggle-expand {
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      svg {
        transform: rotateY(180deg);
      }
    }
  }
  .layout-content {
    flex: 1;
    flex-shrink: 0;
    overflow: hidden;
  }
}
</style>
