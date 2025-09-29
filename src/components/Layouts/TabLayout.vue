<script setup lang="ts">
import type { VNode } from 'vue'
import { useVModel } from '@vueuse/core'
import VueRender from '../VueRender.vue'

interface TabItem {
  label?: string
  value: string | number
  title?: string
  render?: () => VNode
}
const props = withDefaults(
  defineProps<{
    modelValue: string | number
    horizontal?: boolean
    options: TabItem[]
  }>(),
  {
    horizontal: false,
  },
)
const emit = defineEmits(['update:modelValue'])

const mValue = useVModel(props, 'modelValue', emit, { passive: true })
</script>

<template>
  <div class="vgo-tab-layout vgo-bg" :class="{ horizontal }">
    <div class="sidebar-wrap">
      <div class="vgo-tab-list">
        <div
          v-for="item in options"
          :key="item.value"
          :class="{ active: item.value === mValue }"
          class="list-item"
          :title="item.title"
          @click="mValue = item.value"
        >
          <VueRender v-if="item.render" :render-fn="item.render" />
          <div v-if="item.label" class="item-text">
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>
    <div class="content-wrap">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vgo-tab-layout {
  display: flex;
  align-items: center;
  height: 100%;
  overflow: hidden;
  line-height: 1.6;
  user-select: none;

  .sidebar-wrap {
    width: 120px;
    height: 100%;
    overflow-y: auto;
    border-right: 1px solid var(--vgo-color-border);

    .vgo-tab-list {
      .list-item {
        padding: 4px 8px;
        transition: background-color 0.3s;
        cursor: pointer;
        font-weight: 500;
        &:hover {
          background-color: var(--vgo-color-hover);
          transition: background-color 0.1s;
        }

        &.active {
          background-color: var(--vgo-primary-opacity);
        }
        &:active {
          color: white;
          background-color: var(--vgo-primary);
        }

        .item-text {
        }
      }
    }
  }

  &.horizontal {
    overflow: unset;
    justify-content: flex-start;
    flex-direction: column;

    .sidebar-wrap {
      min-width: fit-content;
      height: auto;
      border-right: 0;
      border-bottom: 1px solid var(--vgo-color-border);
      overflow: hidden;
      width: 100%;

      .vgo-tab-list {
        display: flex;
        .list-item {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          padding: 2px 12px;
        }
      }
    }
    .content-wrap {
      width: 100%;
    }
  }

  .content-wrap {
    flex: 1;
    overflow-y: auto;
    height: 100%;
  }
}
</style>
