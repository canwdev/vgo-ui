<script lang="ts" setup="">
import type { QuickOptionItem } from './enum'
import { ref } from 'vue'
import VueRender from '../VueRender.vue'
import DynamicValueDisplay from './components/DynamicValueDisplay.vue'
import QuickContextMenu from './QuickContextMenu.vue'

withDefaults(
  defineProps<{
    options: QuickOptionItem[]
  }>(),
  {},
)
defineEmits([])

const verticalMenuRef = ref()

const menuChildren = ref<QuickOptionItem[]>([])
const activeIndex = ref(-1)

function handleMenuStripItemClick(event, item: QuickOptionItem, index) {
  console.log('handleMenuStripItemClick', item, index)
  if (item.props?.onClick) {
    item.props.onClick(event)
    return
  }
  if (item.props?.onContextmenu) {
    event.preventDefault()
    item.props.onContextmenu(event)
    return
  }
  if (!(item.children && item.children.length)) {
    return
  }
  const btn = event.target.closest('.btn-menu')
  verticalMenuRef.value.showMenuByElement(btn, 'bottom-left')
  setTimeout(() => {
    menuChildren.value = item.children || []
    activeIndex.value = index
  })
}
function handleVerticalMenuClose() {
  // console.log('handleVerticalMenuClose')
  menuChildren.value = []
  activeIndex.value = -1
}
</script>

<template>
  <div v-if="options && options.length" class="quick-menu-strip">
    <template v-for="(item, index) in options" :key="index">
      <div v-if="item.split" class="option-split" />
      <button
        v-else
        class="btn-no-style btn-menu"
        :class="{ active: activeIndex === index }"
        @click="handleMenuStripItemClick($event, item, index)"
      >
        <span v-if="item.iconRender" class="item-icon">
          <VueRender :render-fn="item.iconRender" />
        </span>
        <span v-else-if="item.icon" class="item-icon">
          <img :src="item.icon" alt="icon">
        </span>
        <span v-else-if="item.iconClass" class="item-icon" :class="item.iconClass" />

        <span v-if="item.html" class="item-content" v-html="item.html" />
        <span v-else-if="item.render" class="item-content">
          <VueRender :render-fn="item.render" />
        </span>
        <span v-else-if="!!item.dynamicProps" class="item-content">
          <DynamicValueDisplay v-bind="item.dynamicProps" />
        </span>
        <span v-else class="item-content">
          {{ item.label }}
        </span>
      </button>
    </template>

    <QuickContextMenu
      ref="verticalMenuRef"
      :options="menuChildren"
      @on-close="handleVerticalMenuClose"
    />
  </div>
</template>

<style lang="scss" scoped>
.quick-menu-strip {
  height: 32px;
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--vgo-color-border);
  box-sizing: border-box;
  .btn-menu {
    padding: 4px 8px;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      background-color: var(--vgo-primary-opacity);
    }

    &.active {
      background-color: var(--vgo-primary);
      color: white;
    }
  }
}
</style>
