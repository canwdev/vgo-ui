# ViewPortWindow

可拖拽、缩放、贴边吸附的视口内浮动窗口组件。

## 依赖

- `@vueuse/core`

## 使用

```ts
import { ViewPortWindow, LayoutPreview, LayoutHelper } from '@canwdev/vgo-ui'
import type { WinOptions, ILayout } from '@canwdev/vgo-ui'
```

通过 `v-model:visible` 控制显示，使用 `wid` 可将位置与尺寸持久化到 `localStorage`（同 id 共享一份状态）。窗口行为由内部 `WindowController` 管理，高级用法可导出类型 `OnMoveParams` 等。

窗口内部类采用 BEM，例如 `.vgo-window__title-bar`、`.vgo-window__body`、`.vgo-window__resize-handle`；状态统一为 `.is-maximized`、`.is-dragging` 等。core 提供窗口结构与行为样式，default 提供默认主题外观。请使用 `body.vgo-theme-default`，暗色模式使用 `html.dark`。
