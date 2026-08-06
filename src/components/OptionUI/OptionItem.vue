<script lang="ts" setup>
import type { StOptionItem } from './enum'
import { computed, toRefs } from 'vue'
import TransitionBodyCollapse from '../Transitions/TransitionBodyCollapse.vue'
import VueRender from '../VueRender.vue'
import ItemAction from './ItemAction.vue'

const props = withDefaults(
  defineProps<{
    item: StOptionItem
    foldedKeyMap?: Record<string, boolean>
  }>(),
  {
    foldedKeyMap: () => ({}),
  },
)
const emit = defineEmits(['onToggleExpand', 'updateValue'])
const { item, foldedKeyMap } = toRefs(props)
const isExpanded = computed(() => {
  return !foldedKeyMap.value[item.value.key]
})

function handleItemClick(e: MouseEvent, fn: StOptionItem['clickFn']) {
  if (typeof fn === 'function') {
    fn(e, item.value)
  }
}
</script>

<template>
  <div :key="item.key" class="vgo-option-item" :data-key="item.key" :class="[item.cls]">
    <div class="vgo-option-item__header vgo-u-surface">
      <div class="vgo-option-item__header-left" :title="item.label">
        <div class="vgo-option-item__label">
          {{ item.label }}
        </div>
      </div>
      <div class="vgo-option-item__header-right">
        <div
          v-if="!item.hideExpandIcon && item.children && item.children.length"
          class="vgo-option-item__expand-toggle vgo-u-button-reset"
          :class="{ 'is-expanded': isExpanded }"
          @click="$emit('onToggleExpand', item)"
        >
          <svg
            style="width: 20px; height: 20px"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 20 20"
          >
            <g fill="none">
              <path
                d="M15.794 7.733a.75.75 0 0 1-.026 1.06l-5.25 5.001a.75.75 0 0 1-1.035 0l-5.25-5a.75.75 0 0 1 1.034-1.087l4.734 4.509l4.733-4.51a.75.75 0 0 1 1.06.027z"
                fill="currentColor"
              />
            </g>
          </svg>
        </div>
        <ItemAction :item="item" @update-value="(v) => emit('updateValue', v)" />
      </div>
    </div>

    <TransitionBodyCollapse>
      <div v-if="item.children && item.children.length" v-show="isExpanded" class="vgo-option-item__body">
        <div
          v-for="(sItem, index) in item.children"
          :key="sItem.key || index"
          class="vgo-option-item__child"
          :class="[{ 'is-clickable': sItem.clickFn }, sItem.cls]"
          :data-key="sItem.key"
          v-bind="sItem.itemProps"
          @click="handleItemClick($event, sItem.clickFn)"
        >
          <VueRender v-if="sItem.render" :render-fn="sItem.render" />

          <template v-else>
            <div class="vgo-option-item__child-main">
              <div v-if="sItem.iconRender" class="vgo-option-item__icon" :title="sItem.label">
                <VueRender :render-fn="sItem.iconRender" />
              </div>
              <div v-else-if="sItem.icon" class="vgo-option-item__icon" :title="sItem.label">
                <img :src="sItem.icon" alt="icon">
              </div>
              <div v-else-if="sItem.iconClass" class="vgo-option-item__icon" :title="sItem.label">
                <i :class="sItem.iconClass" />
              </div>
              <div class="vgo-option-item__title">
                <div class="vgo-option-item__label-wrap">
                  <span class="vgo-option-item__label">{{ sItem.label }}</span>
                  <el-tooltip v-if="sItem.tips" effect="light">
                    <svg
                      style="width: 16px; height: 16px"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      viewBox="0 0 20 20"
                    >
                      <g fill="none">
                        <path
                          d="M10 2a8 8 0 1 1 0 16a8 8 0 0 1 0-16zm0 1a7 7 0 1 0 0 14a7 7 0 0 0 0-14zm0 10.5a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5zm0-8a2.5 2.5 0 0 1 1.651 4.377l-.154.125l-.219.163l-.087.072a1.968 1.968 0 0 0-.156.149c-.339.36-.535.856-.535 1.614a.5.5 0 0 1-1 0c0-1.012.293-1.752.805-2.298a3.11 3.11 0 0 1 .356-.323l.247-.185l.118-.1A1.5 1.5 0 1 0 8.5 8a.5.5 0 0 1-1 .001A2.5 2.5 0 0 1 10 5.5z"
                          fill="currentColor"
                        />
                      </g>
                    </svg>
                    <template #content>
                      <span v-html="sItem.tips" />
                    </template>
                  </el-tooltip>
                </div>
                <div v-if="sItem.subtitle" class="vgo-option-item__subtitle" v-html="sItem.subtitle" />
              </div>
            </div>
            <div class="vgo-option-item__child-actions">
              <ItemAction :item="sItem" @update-value="(v) => emit('updateValue', v)" />
            </div>
          </template>
        </div>
      </div>
    </TransitionBodyCollapse>
  </div>
</template>
