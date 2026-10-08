# AutoFormElPlus

用一份配置生成 [Element Plus](https://element-plus.org/) 表单。字段写进 `formSchema`，值写进其中的 `model`。

使用前在应用里安装并注册 `element-plus`。

## 导入

```ts
import type { AutoFormField, AutoFormSchema } from '@canwdev/vgo-ui'
import { AutoFormElPlus, AutoFormItemType } from '@canwdev/vgo-ui'
```

字段配置的类型名是 `AutoFormField`。`AutoFormItem` 是单字段组件。

## 使用

```vue
<script setup lang="ts">
import type { AutoFormSchema } from '@canwdev/vgo-ui'
import { AutoFormElPlus, AutoFormItemType } from '@canwdev/vgo-ui'
import { reactive } from 'vue'

const model = reactive({
  name: '',
  count: 0,
  enabled: true,
})

const formSchema: AutoFormSchema = {
  model,
  labelPosition: 'top',
  rules: {
    name: [{ required: true, trigger: 'blur' }],
  },
  formItems: [
    {
      cols: 2,
      children: [
        { type: AutoFormItemType.INPUT, key: 'name', label: '名称' },
        { type: AutoFormItemType.INPUT_NUMBER, key: 'count', label: '数量' },
      ],
    },
    { type: AutoFormItemType.SWITCH, key: 'enabled', label: '启用' },
  ],
}

function onSubmit(value: Record<string, unknown>) {
  console.log(value)
}
</script>

<template>
  <AutoFormElPlus :form-schema="formSchema" @on-submit="onSubmit" />
</template>
```

`formItems` 里每一项可以是：

- 一个字段：独占一行
- 字段数组：等分列，列数等于数组长度
- `{ cols, children }`：按 `cols` 分列

`key` 支持点号，用来读写嵌套字段，例如 `user.name`。

## 属性

| 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `formSchema` | — | 表单配置，见下表 |
| `hideActions` | `false` | 隐藏底部操作区 |
| `isLoading` | `false` | 禁用表单，并盖住一层 Loading |

### formSchema

| 字段 | 说明 |
| --- | --- |
| `model` | 表单数据。字段 `key` 对应该对象上的值 |
| `formItems` | 字段、字段数组，或 `{ cols, children }` |
| `rules` | Element Plus 的 `FormRules`，按字段 `key` 校验 |
| `labelWidth` | 标签宽度 |
| `labelPosition` | 标签位置：`left`、`right`、`top` |
| `props` | 额外传给 `el-form` 的属性 |

校验写在 `rules` 上。字段配置里的 `rules`、`formItemProps` 不会传给表单项。

## 字段 AutoFormField

| 字段 | 说明 |
| --- | --- |
| `key` | 数据路径，同时作为校验字段名 |
| `label` | 标签 |
| `type` | 控件类型，见 `AutoFormItemType`。不填则只渲染 `render` |
| `placeholder` | 占位文案。按钮类型下是按钮文字 |
| `options` | 下拉、单选、多选的 `VgoSelectItem[]`（`label`、`value`、可选 `disabled`，可扩展其他字段） |
| `props` | 传给对应 Element Plus 控件的属性 |
| `disabled` | 禁用该控件 |
| `width` | 表单项宽度 |
| `style` | 表单项样式，设置后不再使用 `width` |
| `cls` | 表单项类名 |
| `clickHandler` | 按钮点击 |
| `render` | 自定义内容，调用参数为 `(params, value, emit)`。表单里 `params` 为空，用 `emit('update:modelValue', next)` 写回当前值。设置了 `type` 时，它出现在控件旁边 |
| `renderLabel` | 自定义标签 |
| `selectOptionRender` | 自定义下拉选项，参数为当前字段；不传则用 `options` |

### AutoFormItemType

| 值 | 控件 |
| --- | --- |
| `input` | 文本框 |
| `input_number` | 数字框 |
| `input_autocomplete` | 自动完成 |
| `select` | 下拉 |
| `color_picker` | 颜色 |
| `date_picker` | 日期 |
| `checkbox_group` | 多选 |
| `radio_group` | 单选 |
| `switch` | 开关 |
| `button` | 按钮 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `actions` | 底部操作区。参数为 `{ submitForm }`。不传时是一颗 Submit 按钮 |
| 默认 | 操作区下方的额外内容 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `onSubmit` | 校验通过，参数为 `model` |
| `onInvalidForm` | 校验未通过 |
| `onMounted` | 表单挂载，参数为 Element Plus 的 form 实例 |
| `onBeforeUnmount` | 卸载前，参数同上 |

## 实例

| 成员 | 说明 |
| --- | --- |
| `submitForm()` | 校验并在通过时发出 `onSubmit` |
| `formRef` | Element Plus 的 form 实例，可调用 `validate`、`resetFields` 等 |

组件上还有单独导出的 `AutoFormItem`，传入 `item` 和 `model` 即可渲染一个字段。一般直接使用 `AutoFormElPlus`。
