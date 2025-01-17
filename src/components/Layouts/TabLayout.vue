<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import VueRender from '../VueRender.vue';
import type { PropType } from 'vue';

// 定义 TabItem 类型
type TabItem = {
  label?: string;
  value: string | number;
  title?: string;
  render?: any;
};

// 使用 defineProps 定义 props
const props = defineProps({
  /**
   * 当前选中的值
   */
  modelValue: {
    type: [String, Number],
    required: true,
  },
  /**
   * 是否水平布局
   */
  horizontal: {
    type: Boolean,
    default: false,
  },
  /**
   * 选项列表
   */
  options: {
    type: Array as PropType<TabItem[]>,
    default: () => [],
  },
});

// 使用 defineEmits 定义 emits
const emit = defineEmits(['update:modelValue']);

// 使用 useVModel 实现 v-model 双向绑定
const mValue = useVModel(props, 'modelValue', emit);
</script>

<template>
  <div class="mc-vertical-tab-layout vp-bg" :class="{horizontal}">
    <div class="sidebar-wrap">
      <div class="mc-tab-list">
        <div
          v-for="item in options"
          :key="item.value"
          :class="{active: item.value === mValue}"
          @click="mValue = item.value"
          class="list-item"
          :title="item.title"
        >
          <VueRender v-if="item.render" :render-fn="item.render"></VueRender>
          <div v-if="item.label" class="item-text">{{ item.label }}</div>
        </div>
      </div>
    </div>
    <div class="content-wrap">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mc-vertical-tab-layout {
  display: flex;
  align-items: center;
  height: 100%;
  overflow: hidden;
  line-height: 1.6;

  .sidebar-wrap {
    width: 120px;
    height: 100%;
    overflow-y: auto;
    border-right: 1px solid var(--color-border);

    .mc-tab-list {
      .list-item {
        padding: 4px 8px;
        transition: background-color 0.3s;
        cursor: pointer;
        &:hover {
          background-color: var(--color-border);
        }

        &.active {
          background-color: var(--primary-opacity);
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
      border-bottom: 1px solid var(--color-border);
      overflow: hidden;
      width: 100%;
      .mc-tab-list {
        display: flex;
        .list-item {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          padding: 4px 16px;
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
