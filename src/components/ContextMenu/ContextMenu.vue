<script lang="ts" setup>
import type { ContextMenuInstance, MenuItem, MenuOptions } from './types'
import { ref, toRefs, useSlots } from 'vue'
import ContextSubMenuWrapper from './ContextSubMenuWrapper.vue'
import { genContainer } from './utils'

defineOptions({
  name: 'ContextMenuRoot',
})

const props = withDefaults(
  defineProps<{
    /** 菜单配置。 */
    options: MenuOptions
    /** 是否显示，支持 `v-model:show`。 */
    show?: boolean
    /** 关闭时是否销毁。 */
    destroyOnClose?: boolean
  }>(),
  {
    show: false,
    destroyOnClose: true,
  },
)

const emit = defineEmits(['update:show', 'close'])

const { options, show, destroyOnClose } = toRefs(props)
const { isNew, container, eleId } = genContainer(options.value)

const menuRef = ref<ContextMenuInstance | null>(null)
const slots = useSlots() as Record<string, unknown>

function onClose(fromItem: MenuItem | undefined) {
  emit('update:show', false)
  emit('close')
  options.value.onClose?.(fromItem)
}

defineExpose({
  closeMenu: () => emit('update:show', false),
  isClosed: () => !show.value,
  getMenuRef: () => menuRef.value?.getMenuRef(),
  getMenuDimensions: () => menuRef.value?.getMenuDimensions() ?? { width: 0, height: 0 },
})
</script>

<template>
  <Teleport :to="`#${eleId}`">
    <ContextSubMenuWrapper
      ref="menuRef"
      :options="options"
      :show="show"
      :destroy-on-close="destroyOnClose"
      :container="container"
      :use-custom-container="!isNew"
      @close="onClose"
    >
      <template v-for="(_, name) in slots" #[name]="data">
        <slot :name="name" v-bind="data" />
      </template>
    </ContextSubMenuWrapper>
  </Teleport>
</template>
