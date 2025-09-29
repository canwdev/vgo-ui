<script setup lang="ts">
import type { QuickOptionItem } from '../enum.ts'
import { toRefs } from 'vue'
import VueRender from '../../VueRender.vue'
import QuickOptions from '../QuickOptions.vue'
import { useHoverSubMenu } from '../utils/use-context-menu.ts'
import DynamicValueDisplay from './DynamicValueDisplay.vue'

const props = withDefaults(defineProps<{
  item: QuickOptionItem
  index?: number
  curIndex?: number
  itemCls?: string
  showIndex?: boolean
  isStatic?: boolean
}>(), {
  index: 0,
  curIndex: -1,
  itemCls: '',
  showIndex: true,
  isStatic: false,
})
const emit = defineEmits(['onArrowClick', 'onClose', 'onSubMenuHide'])
const { item } = toRefs(props)

const { subMenuRef, isMouseOver, isMouseOverSub, hasChildren, subChildren } = useHoverSubMenu(
  props,
  emit,
)
</script>

<template>
  <div
    class="option-item"
    :class="[
      {
        'focus': curIndex === index,
        'clickable': item?.props?.onClick || item?.props?.isBack || hasChildren,
        'disabled': item.disabled,
        'hover': isMouseOverSub,
        'show-index': showIndex,
      },
      itemCls,
      item.props?.class,
    ]"
    :style="item.props?.style"
    :data-index="index"
    @mouseover="isMouseOver = true"
    @mouseleave="isMouseOver = false"
  >
    <!-- 鼠标悬浮显示子菜单 -->
    <QuickOptions
      v-if="!isStatic && hasChildren && isMouseOver"
      ref="subMenuRef"
      visible
      :options="subChildren"
      :show-index="showIndex"
      class="sub-option-items"
      @mouseover="isMouseOverSub = true"
      @mouseleave="isMouseOverSub = false"
      @click.stop
      @on-close="$emit('onClose')"
    />

    <div v-if="showIndex && index < 9" class="index-wrap">
      <span>{{ index + 1 }}</span>
    </div>

    <div v-if="item.iconRender" class="item-icon">
      <VueRender :render-fn="item.iconRender" />
    </div>
    <div v-else-if="item.icon" class="item-icon">
      <img :src="item.icon" alt="icon">
    </div>
    <div v-else-if="item.iconClass" class="item-icon" :class="item.iconClass" />
    <div v-if="item.html" class="item-content" v-html="item.html" />
    <div v-else-if="item.render" class="item-content">
      <VueRender :render-fn="item.render" />
    </div>
    <div v-else-if="!!item.dynamicProps" class="item-content">
      <DynamicValueDisplay v-bind="item.dynamicProps" />
    </div>
    <div v-else class="item-content">
      {{ item.label }}
    </div>
    <div v-if="hasChildren" class="arrow-wrap" @click.stop="$emit('onArrowClick')">
      <div class="css-arrow right" />
    </div>
  </div>
</template>
