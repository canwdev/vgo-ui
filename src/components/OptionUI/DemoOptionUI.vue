<script lang="ts" setup>
import type { StOptionItem } from './enum.ts'
import { computed, h, ref } from 'vue'
import { StOptionType } from './enum.ts'
import OptionUI from './OptionUI.vue'

const options = computed((): StOptionItem[] => {
  return [
    {
      label: '选项组 1',
      key: 'group_1',
      children: [
        {
          label: '切换开关',
          key: 'switch',
          // iconClass: 'mdi mdi-dock-window',
          type: StOptionType.SWITCH,
        },
        {
          label: '多切换开关',
          key: 'multiple_switch',
          type: StOptionType.MULTIPLE_SWITCH,
          options: [
            {
              label: '选项 1',
              value: 'option_1',
            },
            {
              label: '选项 2',
              value: 'option_2',
            },
            {
              label: '选项 3',
              value: 'option_3',
            },
          ],
        },
        {
          label: '选择框',
          key: 'select',
          type: StOptionType.SELECT,
          options: [
            {
              label: '选项 1',
              value: 'option_1',
            },
            {
              label: '选项 2',
              value: 'option_2',
            },
            {
              label: '选项 3',
              value: 'option_3',
            },
          ],
        },
        {
          label: '文本输入框',
          key: 'input',
          type: StOptionType.INPUT,
        },
        {
          label: '数字输入框',
          key: 'input_number',
          type: StOptionType.INPUT_NUMBER,
        },
        {
          label: '日期选择器',
          key: 'date_picker',
          type: StOptionType.DATE_PICKER,
        },
        {
          label: '颜色选择器',
          key: 'color_picker',
          type: StOptionType.COLOR_PICKER,
        },
        {
          label: '动态标签',
          key: 'dynamic_tags',
          type: StOptionType.DYNAMIC_TAGS,
        },
      ],
    },
    {
      label: '选项组 2',
      key: 'group_2',
      children: [
        {
          label: '按钮',
          key: 'button',
          type: StOptionType.BUTTON,
          value: '点击我',
          props: {
            class: 'primary',
            onClick: () => {
              alert('点击按钮')
            },
          },
        },
        {
          label: '自定义渲染',
          key: 'custom_render',
          actionRender: () => {
            return h('div', { style: { color: 'red' } }, '自定义渲染内容')
          },
        },
      ],
    },
  ]
})
const settingsStore = ref({
  switch: false,
  multiple_switch: 'option_1',
  select: 'option_1',
  input: 'input value',
  input_number: 42,
  date_picker: '',
  color_picker: '#00ccff',
  dynamic_tags: ['标签 1', '标签 2'],
})
</script>

<template>
  <div class="option-ui-demo">
    <OptionUI :option-list="options" :store="settingsStore" />
    <pre>{{ settingsStore }}</pre>
  </div>
</template>

<style scoped lang="scss">
.option-ui-demo {
  max-width: 500px;
}
</style>
