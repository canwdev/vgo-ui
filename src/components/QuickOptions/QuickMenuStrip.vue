<script lang="ts" setup="">
import {QuickOptionItem} from './enum'
import QuickContextMenu from './QuickContextMenu.vue'
import {ref} from 'vue'

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

const handleMenuStripItemClick = (event, item: QuickOptionItem, index) => {
  verticalMenuRef.value.showMenuByElement(event.target, 'bottom-left')
  setTimeout(() => {
    menuChildren.value = item.children || []
    activeIndex.value = index
  })
}
const handleVerticalMenuClose = () => {
  // console.log('handleVerticalMenuClose')
  menuChildren.value = []
  activeIndex.value = -1
}
</script>

<template>
  <div v-if="options && options.length" class="quick-menu-strip">
    <template v-for="(item, index) in options" :key="index">
      <div v-if="item.split" class="option-split"></div>
      <button
        v-else
        class="btn-no-style btn-menu"
        :class="{active: activeIndex === index}"
        @click="handleMenuStripItemClick($event, item, index)"
      >
        {{ item.label }}
      </button>
    </template>

    <QuickContextMenu
      ref="verticalMenuRef"
      @onClose="handleVerticalMenuClose"
      :options="menuChildren"
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
    padding: 0px 8px;

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
