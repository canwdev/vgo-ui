<script lang="ts" setup>
import type { QuickOptionItem } from './enum'
import { ref } from 'vue'
import QuickContextMenu from './QuickContextMenu.vue'
import QuickOptions from './QuickOptions.vue'

const menuOptions = ref<QuickOptionItem[]>([
  {
    label: '普通菜单项',
    iconClass: 'mdi mdi mdi-shape-plus-outline',
    props: {
      onClick: () => {
        console.log('普通菜单项 Click')
      },
    },
  },
  {
    label: '支持键盘上下左右控制',
    props: {
      onClick: () => {
        console.log('Click')
      },
    },
  },
  {
    label: '按 Q 或 Esc 键返回',
    props: {
      onClick: () => {
        console.log('Click')
      },
    },
  },
  {
    label: '子菜单',
    children: [
      {
        label: 'B.1',
        props: {
          onClick: () => {
            console.log('Click')
          },
        },
      },
      { label: 'B.2' },
      { label: 'B.3' },
      { label: '长文本自动适应，长文本自动适应，长文本自动适应' },
      { label: '屏幕边缘自动适应' },
      {
        label: '多层嵌套',
        children: [
          {
            label: 'B.1',
            props: {
              onClick: () => {
                console.log('Click')
              },
            },
          },
          { label: 'B.2' },
          { label: 'B.3' },
          { label: '长文本自动适应，长文本自动适应，长文本自动适应' },
          { label: '#' },
          { label: '#' },
          { label: '#' },
          { label: '#' },
          { label: '#' },
          { label: '#' },
          { label: '#' },
          { label: '#' },
          { label: '#' },
        ],
      },
    ],
  },
  { split: true },
  {
    label: '动态生成菜单',
    children: () => {
      return [{ label: `可以使用函数动态生成菜单` }, { label: `${String(new Date()).toLocaleString()}` }]
    },
  },
])

const isStaticMenu = ref(true)
const isShowMenu = ref(true)

const ctxMenuRef = ref()
function handleContextMenu(event) {
  ctxMenuRef.value.showMenu(event)
}
</script>

<template>
  <div class="quick-options-demo">
    <div class="common-menu-demo">
      <label>
        <input v-model="isStaticMenu" type="checkbox">
        静态菜单
      </label>
      <label v-if="!isStaticMenu">
        <input v-model="isShowMenu" type="checkbox">
        显示菜单
      </label>

      <QuickOptions
        v-if="isStaticMenu"
        class="vgo-bg"
        is-static
        visible
        :options="menuOptions"
        show-index
      />

      <QuickOptions v-else v-model:visible="isShowMenu" :options="menuOptions" show-index />
    </div>
    <div class="context-menu-demo" @contextmenu.prevent="handleContextMenu">
      <div class="inner-text">
        右键菜单 Demo，在此区域点击右键
      </div>
      <QuickContextMenu ref="ctxMenuRef" :options="menuOptions" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.quick-options-demo {
  //:deep(.option-item) {
  //  min-width: 240px;
  //  max-width: 300px;
  //}
  .common-menu-demo {
    height: 200px;
  }
  .context-menu-demo {
    width: 100%;
    height: 90vh;
    background-color: gray;
    display: flex;
    align-items: center;
    justify-content: center;
    .inner-text {
      font-size: 20px;
      opacity: 0.5;
      user-select: none;
    }
  }
}
</style>
