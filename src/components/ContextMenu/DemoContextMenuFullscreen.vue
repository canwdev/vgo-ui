<script lang="ts" setup>
import type { MenuInteraction } from './types'
import { ref } from 'vue'
import { useContextMenuTrigger } from '../../hooks/use-context-menu-trigger'
import { buildMenuItems, lastAction, notify } from './demo-menu'
import ContextMenu from './show'

defineOptions({
  name: 'DemoContextMenuFullscreen',
})

const emit = defineEmits(['close'])

const interaction = defineModel<MenuInteraction>('interaction', { default: 'auto' })

const interactionModes: MenuInteraction[] = ['auto', 'pc', 'mobile']

/** 四个角 + 中间：点按钮在下方弹出菜单，其他位置右键弹出菜单。 */
const spots = [
  { id: 'tl', label: '左上' },
  { id: 'tr', label: '右上' },
  { id: 'center', label: '中间' },
  { id: 'bl', label: '左下' },
  { id: 'br', label: '右下' },
] as const

/** 当前打开了哪个按钮的菜单；用来给按钮加激活态。 */
const opened = ref<string | null>(null)

/**
 * 每个按钮一个独立的菜单实例（所以各自有独立的开 / 关与激活态）。
 * 这一次演示里 `useContextMenuTrigger` 只当作「按钮锚定的下拉」来用，
 * 一个 hook 对应一个按钮。
 */
const triggers = spots.map(spot => ({
  spot,
  trigger: useContextMenuTrigger(() => ({
    interaction: interaction.value,
    items: () => buildMenuItems(`${spot.label} / `),
    onClose: (item) => {
      opened.value = null
      notify(`菜单关闭，最后点击：${item?.label ?? '无'}`)
    },
  })),
}))

/** 触发按钮点击：已经开着的菜单先关掉，避免同时存在两个。 */
function onTriggerClick(id: string, trigger: (typeof triggers)[number]['trigger']) {
  if (opened.value && opened.value !== id)
    trigger.close()
  opened.value = trigger.isOpen.value ? null : id
  trigger.toggle()
}

/** 空白处右键：右键菜单按光标弹出。点在按钮上时不处理，交回按钮自己的点击逻辑。 */
function onSurfaceContextMenu(e: MouseEvent) {
  e.preventDefault()
  if (isDemoButton(e.target))
    return
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    interaction: interaction.value,
    items: buildMenuItems(),
    onClose: item => notify(`菜单关闭，最后点击：${item?.label ?? '无'}`),
  })
}

/** 事件落点是不是 demo 自己的按钮（触发按钮或「退出全屏」）。 */
function isDemoButton(target: EventTarget | null) {
  return target instanceof HTMLElement && !!target.closest('.vgo-context-menu-demo__spot, .vgo-context-menu-demo__hint .vgo-button')
}
</script>

<template>
  <div class="vgo-context-menu-demo" @contextmenu="onSurfaceContextMenu">
    <div class="vgo-context-menu-demo__hint">
      <strong>全屏 demo</strong>
      <span>四个角与中间：点按钮，菜单从按钮下方弹出；页面其他位置：右键，菜单在光标处弹出。</span>
      <span class="vgo-u-flex-wrap-center">
        <button
          v-for="mode in interactionModes"
          :key="mode"
          class="vgo-button vgo-button--sm"
          :class="{ 'is-active': interaction === mode }"
          @click="interaction = mode"
        >
          {{ mode }}
        </button>
      </span>
      <span class="vgo-context-menu-demo__state">{{ lastAction }}</span>
      <button class="vgo-button vgo-button--sm" @click="emit('close')">
        退出全屏
      </button>
    </div>

    <button
      v-for="{ spot, trigger } in triggers"
      :key="spot.id"
      :ref="el => trigger.setTriggerRef(el as HTMLElement | null)"
      class="vgo-button vgo-context-menu-demo__spot"
      :class="[`is-${spot.id}`, opened === spot.id ? 'is-active' : '']"
      @click="onTriggerClick(spot.id, trigger)"
    >
      {{ spot.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.vgo-context-menu-demo {
  position: fixed;
  // 把自己压在菜单层之下：菜单挂在 body 上，层级是 MENU_CONST_OPTIONS.defaultZIndex
  // （= --vgo-z-menu）。之前这里用 --vgo-z-preview（1000）比菜单层还高，
  // 于是菜单被整个盖在 demo 底下。
  z-index: calc(var(--vgo-z-menu) - 1);
  background-color: var(--vgo-surface);
  inset: 0;

  &__hint {
    position: absolute;
    top: var(--vgo-space-3);
    left: 50%;
    display: flex;
    flex-direction: column;
    gap: var(--vgo-space-1);
    align-items: center;
    max-width: min(520px, calc(100% - var(--vgo-space-4) * 2));
    padding: var(--vgo-space-3) var(--vgo-space-4);
    font-size: var(--vgo-font-sm);
    color: var(--vgo-text-secondary);
    text-align: center;
    transform: translateX(-50%);

    strong {
      font-size: var(--vgo-font-lg);
      color: var(--vgo-text);
    }
  }

  &__state {
    color: var(--vgo-primary);
  }

  // 按钮摆在容器四角与正中，好把「贴边 / 居中」几种锚点都试到
  &__spot {
    position: absolute;

    &.is-tl {
      top: var(--vgo-space-3);
      left: var(--vgo-space-3);
    }

    &.is-tr {
      top: var(--vgo-space-3);
      right: var(--vgo-space-3);
    }

    &.is-center {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &.is-bl {
      bottom: var(--vgo-space-3);
      left: var(--vgo-space-3);
    }

    &.is-br {
      right: var(--vgo-space-3);
      bottom: var(--vgo-space-3);
    }
  }
}
</style>
