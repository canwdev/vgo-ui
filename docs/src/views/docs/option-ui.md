# OptionUI

基于 Element Plus 的选项面板组件，通过配置 `StOptionItem` 列表快速生成设置类界面。

## 依赖

- `element-plus`

## 使用

```ts
import { OptionUI, OptionItem, ItemAction } from '@canwdev/vgo-ui'
import type { StOptionItem, StOptionType } from '@canwdev/vgo-ui'
```

父级可通过 `provide('sharedStore', storeRef)` 注入与选项 `key` 绑定的响应式对象（详见 `ItemAction` 实现）。样式依赖安装文档中的 `import '@canwdev/vgo-ui/styles'`。
