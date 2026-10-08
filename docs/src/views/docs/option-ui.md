# OptionUI

用配置生成设置面板：顶层是分组，`children` 是分组里的一行。每一行的值按 `key` 读写。

使用前在应用里安装并注册 `element-plus`。

## 导入

```ts
import type { VgoOptionItem } from '@canwdev/vgo-ui'
import { OptionUI, VgoOptionType } from '@canwdev/vgo-ui'
```

## 使用

传入 `store` 后，控件读写 `store[item.key]`。不传时读写该项自己的 `value`。

```vue
<script setup lang="ts">
import type { VgoOptionItem } from '@canwdev/vgo-ui'
import { OptionUI, VgoOptionType } from '@canwdev/vgo-ui'
import { ref } from 'vue'

const settings = ref({
  enabled: false,
  name: '',
  theme: 'light',
})

const options: VgoOptionItem[] = [
  {
    label: '通用',
    key: 'general',
    children: [
      { label: '启用', key: 'enabled', type: VgoOptionType.SWITCH },
      { label: '名称', key: 'name', type: VgoOptionType.INPUT },
      {
        label: '主题',
        key: 'theme',
        type: VgoOptionType.SELECT,
        options: [
          { label: '浅色', value: 'light' },
          { label: '深色', value: 'dark' },
        ],
      },
    ],
  },
]
</script>

<template>
  <OptionUI :option-list="options" :store="settings" />
</template>
```

分组可以展开和收起，状态会记住。同一页有多份面板时，给每份一个不同的 `expandId`。

某一行也可以自带 `store`，该项就读写自己的 store，不再用面板上的那个。

## 属性

| 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `optionList` | — | 分组列表 |
| `store` | — | 与 `key` 对应的数据对象，可以是 `ref` 或 reactive |
| `expandId` | `''` | 区分多份面板各自记住的展开状态 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `updateValue` | 任一控件改值。参数为 `{ item, value }`。写 `store` 时也会发出 |

## VgoOptionItem

| 字段 | 说明 |
| --- | --- |
| `label` | 标题 |
| `key` | 数据字段名。分组本身也要有唯一 `key` |
| `type` | 控件类型，见 `VgoOptionType`。不填则这一行没有内置控件 |
| `value` | 没有 `store` 时的当前值。按钮类型下是按钮文字 |
| `store` | 这一项专用的数据对象，优先于面板的 `store` |
| `options` | 下拉和分段开关的 `VgoSelectItem[]` |
| `props` | 传给对应控件的属性，例如 `disabled`、`onClick`、`class` |
| `placeholder` | 下拉的占位文案 |
| `disabled` | 禁用。作用于数字框、日期和按钮；其他控件通过 `props` 传 |
| `subtitle` | 标题下的说明，按 HTML 渲染 |
| `tips` | 标题旁的提示，按 HTML 渲染 |
| `icon` | 行首图片地址 |
| `iconClass` | 行首图标的 class。有 `icon` 时不会使用 |
| `iconRender` | 行首自定义渲染，优先于 `icon` 和 `iconClass` |
| `children` | 分组内的行。只有这一层，行里再嵌套不会渲染 |
| `hidden` | 隐藏该分组 |
| `hideExpandIcon` | 有子项时仍不显示展开按钮 |
| `clickFn` | 点击这一行，参数为 `(event, item)` |
| `cls` | 额外类名 |
| `itemProps` | 绑到这一行根节点上的属性 |
| `actionRender` | 控件旁边再渲染一块内容，`() => VNode` |
| `render` | 替换整行内容，`() => VNode` |

### VgoSelectItem

下拉和分段开关的选项：`label`、`value`、可选的 `disabled`，其余字段可自行扩展。

### VgoOptionType

| 值 | 控件 | 值的类型 |
| --- | --- | --- |
| `switch` | 开关 | `boolean` |
| `multiple_switch` | 分段选择，选项来自 `options` | 选中项的 `value` |
| `select` | 下拉 | 选中项的 `value` |
| `input` | 文本框 | `string` |
| `input_number` | 数字框 | `number` |
| `date_picker` | 日期 | 与 Element Plus 日期框一致 |
| `color_picker` | 颜色，带一组内置预设色 | 颜色字符串 |
| `dynamic_tags` | 可增删的标签 | `string[]` |
| `button` | 按钮，文字是 `value` | — |

`OptionItem` 是分组，`ItemAction` 是行右侧的控件。需要把一行放到面板外面时再单独用，平时用 `OptionUI` 即可。
