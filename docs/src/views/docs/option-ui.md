# OptionUI

基于 Element Plus 的选项面板组件，通过配置 `StOptionItem` 列表快速生成设置类界面。

## 依赖

- `element-plus`

## 使用

```ts
import { OptionUI, OptionItem, ItemAction } from '@canwdev/vgo-ui'
import type { StOptionItem, StOptionType } from '@canwdev/vgo-ui'
```

父级可通过 `provide('sharedStore', storeRef)` 注入与选项 `key` 绑定的响应式对象（详见 `ItemAction` 实现）。

0.4.0 的内部类采用 BEM，例如 `.vgo-option-item__header`、`.vgo-option-action__control`；展开、可点击等状态使用 `.is-expanded`、`.is-clickable`。core 提供结构，default 提供默认主题外观。请使用 `body.vgo-theme-default`，暗色模式使用 `html.dark`。
