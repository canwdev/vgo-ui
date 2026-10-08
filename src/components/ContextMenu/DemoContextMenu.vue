<script lang="ts" setup>
import type { MenuBarOptions, MenuInteraction } from './types'
import { computed, ref } from 'vue'
import { useContextMenuTrigger } from '../../hooks/use-context-menu-trigger'
import ContextMenuBar from './ContextMenuBar.vue'
import { buildMenuItems, lastAction, notify } from './demo-menu'
import DemoContextMenuFullscreen from './DemoContextMenuFullscreen.vue'
import ContextMenu from './show'

const barDark = ref(false)
/** 是否切到覆盖整个视口的全屏 demo。 */
const fullscreen = ref(false)
const interactionModes: MenuInteraction[] = ['auto', 'pc', 'mobile']
const interaction = ref<MenuInteraction>('auto')

function showMenu(event: MouseEvent, theme?: string) {
  event.preventDefault()
  ContextMenu.showContextMenu({
    x: event.x,
    y: event.y,
    theme,
    interaction: interaction.value,
    items: buildMenuItems(),
    onClose: item => notify(`菜单关闭，最后点击：${item?.label ?? '无'}`),
  })
}

// 函数式：按钮触发、菜单贴在按钮下方、按钮保持激活 / 再点关闭。
// 开 / 关、定位、以及和「点击外部关闭」的时序都抽在 useContextMenuTrigger 里。
const {
  setTriggerRef: setDropdownTriggerRef,
  isOpen: dropdownOpen,
  toggle: toggleDropdownMenu,
} = useContextMenuTrigger(() => ({
  interaction: interaction.value,
  items: () => buildMenuItems(),
  onClose: item => notify(`菜单关闭，最后点击：${item?.label ?? '无'}`),
}))

const menuBarOptions = computed((): MenuBarOptions => ({
  theme: barDark.value ? 'dark' : '',
  interaction: interaction.value,
  closeWhenScroll: false,
  items: ['File', 'View', 'Help'].map(label => ({
    label,
    children: buildMenuItems(`${label} / `),
  })),
}))
</script>

<template>
  <div class="vgo-u-flex-column" :style="{ gap: 'var(--vgo-space-3)' }">
    <div class="vgo-u-flex-wrap-center">
      <span :style="{ color: 'var(--vgo-text-secondary)' }">子菜单</span>
      <button
        v-for="mode in interactionModes" :key="mode" class="vgo-button vgo-button--sm"
        :class="{ 'is-active': interaction === mode }" @click="interaction = mode"
      >
        {{ mode }}
      </button>
    </div>

    <div class="vgo-u-flex-wrap-center">
      <button class="vgo-button vgo-button--primary" @click="fullscreen = true">
        打开全屏 demo
      </button>
      <span :style="{ color: 'var(--vgo-text-secondary)' }">
        覆盖整个视口：四角与中间的按钮点开下拉菜单，其他位置右键弹菜单
      </span>
    </div>

    <div class="context-menu-demo__target" @contextmenu="showMenu">
      在此区域内点击右键
    </div>

    <div class="vgo-u-flex-wrap-center">
      <button class="vgo-button" @click="showMenu($event as MouseEvent)">
        在按钮处弹出
      </button>
      <button
        :ref="setDropdownTriggerRef" class="vgo-button" :class="dropdownOpen ? 'is-active' : ''"
        @click="toggleDropdownMenu"
      >
        按钮菜单{{ dropdownOpen ? '（点击关闭）' : '' }}
      </button>
      <button class="vgo-button" @click="showMenu($event as MouseEvent, 'dark')">
        强制暗色菜单
      </button>
      <span :style="{ color: 'var(--vgo-text-secondary)' }">{{ lastAction }}</span>
    </div>

    <div class="vgo-u-flex-wrap-center">
      <button class="vgo-button" @click="barDark = !barDark">
        菜单栏主题：{{ barDark ? '暗色' : '亮色' }}
      </button>
      <span :style="{ color: 'var(--vgo-text-secondary)' }">点击下方菜单栏的 File / View / Help</span>
    </div>

    <ContextMenuBar :options="menuBarOptions" />

    <DemoContextMenuFullscreen v-if="fullscreen" v-model:interaction="interaction" @close="fullscreen = false" />
  </div>
</template>

<style scoped lang="scss">
.context-menu-demo__target {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: var(--vgo-text-secondary);
  border: 1px dashed var(--vgo-border);
  border-radius: var(--vgo-radius);
}
</style>
