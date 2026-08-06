# AutoFormElPlus

基于 [Element Plus](https://element-plus.org/) 的自动表单组件。

## 依赖

- `element-plus`（请按官方文档在应用中安装并注册）
- `lodash-es`（表单项读写嵌套字段时使用）

## 使用

```ts
import { AutoFormElPlus, AutoFormItem } from '@canwdev/vgo-ui'
import type { AutoFormSchema, AutoFormField, AutoFormItemType } from '@canwdev/vgo-ui'
```

在模板中使用 `AutoFormElPlus`，通过 `formSchema` 传入 `AutoFormSchema` 配置（字段、校验规则、`model` 等）。单字段配置类型为 `AutoFormField`（与源码中 `AutoFormItem` 接口等价，因与组件 `AutoFormItem` 同名，在包入口中导出为 `AutoFormField`）。

core 提供 `.vgo-auto-form`、`.vgo-auto-form__grid`、`.vgo-auto-form__actions` 等 BEM 结构样式，default 提供默认主题外观。请将 `.vgo-theme-default` 挂载到 `body`，暗色模式将 `.dark` 挂载到 `html`；Element Plus 主题仍需单独配置。
