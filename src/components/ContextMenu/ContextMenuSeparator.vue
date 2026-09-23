<script lang="ts" setup>
import type { GlobalHasSlot, GlobalRenderSlot } from './context'
import { inject } from 'vue'
import { NO_CLICK_CLASS, VNodeRender } from './utils'

defineOptions({
  name: 'ContextMenuSeparator',
})

const globalHasSlot = inject('globalHasSlot') as GlobalHasSlot
const globalRenderSlot = inject('globalRenderSlot') as GlobalRenderSlot
</script>

<template>
  <VNodeRender
    v-if="globalHasSlot('separatorRender')"
    :vnode="() => globalRenderSlot('separatorRender', {})"
  />
  <div v-else class="vgo-context-menu__separator" :class="[NO_CLICK_CLASS]" />
</template>
