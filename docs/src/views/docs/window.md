# ViewPortWindow

视口内的浮动窗口：可拖动、缩放、最小化、最大化，支持贴边分屏和布局菜单。

## 导入

```ts
import type { ILayout } from '@canwdev/vgo-ui'
import { LayoutPreset, removeWindowState, ViewPortWindow } from '@canwdev/vgo-ui'
```

## 使用

```vue
<script setup lang="ts">
import { ViewPortWindow } from '@canwdev/vgo-ui'
import { ref } from 'vue'

const visible = ref(true)
const minimized = ref(false)
const maximized = ref(false)
</script>

<template>
  <ViewPortWindow
    v-model:visible="visible"
    v-model:minimized="minimized"
    v-model:maximized="maximized"
    wid="my-window"
    allow-maximum
    allow-minimum
    :init-win-options="{ width: '480px', height: '320px' }"
    @on-minimized="visible = false"
  >
    <template #titleBarLeft>
      标题
    </template>
    窗口内容
  </ViewPortWindow>
</template>
```

## 属性

| 属性                      | 默认值         | 说明                                                                     |
| ------------------------- | -------------- | ------------------------------------------------------------------------ |
| `v-model:visible`         | —              | 是否显示                                                                 |
| `v-model:minimized`       | `false`        | 是否最小化。最小化后如何收起窗口由调用方决定                             |
| `v-model:maximized`       | `false`        | 是否最大化                                                               |
| `allowMaximum`            | `false`        | 显示最大化按钮，允许双击标题栏最大化                                     |
| `allowMinimum`            | `false`        | 显示最小化按钮                                                           |
| `showClose`               | `true`         | 显示关闭按钮                                                             |
| `allowMove`               | `true`         | 允许拖动                                                                 |
| `allowSnap`               | `true`         | 允许贴边分屏和布局菜单                                                   |
| `allowResize`             | `true`         | 允许拖动边框调整大小                                                     |
| `allowOut`                | `true`         | 允许把窗口拖出视口                                                       |
| `noTitleBar`              | `false`        | 隐藏标题栏，改为拖动内容区域。窗口不带边框、背景和圆角，外观由内容自己画 |
| `wid`                     | —              | 窗口 id，填写后记住浮动时的位置和尺寸，刷新后恢复                        |
| `initWinOptions`          | —              | 初始位置和尺寸：`{ top, left, width, height }`，单位 px                  |
| `initCenter`              | `true`         | 首次打开时居中                                                           |
| `transitionName`          | `'fade-scale'` | 显示 / 隐藏动画                                                          |
| `alignWhenViewPortResize` | `'start'`      | 视口变化时窗口靠左（`start`）还是靠右（`end`）                           |

## 插槽

| 插槽                    | 说明                                     |
| ----------------------- | ---------------------------------------- |
| 默认                    | 窗口内容                                 |
| `titleBarLeft`          | 标题栏左侧：图标、标题                   |
| `titleBarRightControls` | 插在内置按钮左侧的自定义按钮             |
| `titleBarRight`         | 替换全部内置按钮（最小化、最大化、关闭） |

## 事件

| 事件           | 说明                                 |
| -------------- | ------------------------------------ |
| `onActive`     | 窗口被点击、置顶                     |
| `onMaximized`  | 最大化                               |
| `onMinimized`  | 最小化                               |
| `onRestored`   | 从最小化还原或首次显示               |
| `onClose`      | 点击关闭按钮                         |
| `resize`       | 尺寸变化                             |
| `onAfterLeave` | 隐藏动画结束。函数式对话框用它来卸载 |

## 实例方法

通过 `ref` 拿到组件实例：

| 成员                      | 说明                                                            |
| ------------------------- | --------------------------------------------------------------- |
| `setWindowLayout(layout)` | 切换到指定布局，如 `LayoutPreset.LEFT`、`LayoutPreset.MAXIMIZE` |
| `snapLayout`              | 当前分屏布局，未分屏时为 `null`                                 |
| `toggleMaximized()`       | 切换最大化                                                      |
| `setActive()`             | 置顶窗口                                                        |
| `focus()`                 | 聚焦窗口                                                        |

`LayoutPreset` 提供 `LEFT`、`RIGHT`、`TOP_LEFT`、`TOP_RIGHT`、`BOTTOM_LEFT`、`BOTTOM_RIGHT`、`MAXIMIZE`；也可以传自定义比例，如 `{ xRatio: 0, yRatio: 0, widthRatio: 1, heightRatio: 0.5 }`。加上 `floating: true` 时只按比例摆放窗口，不进入分屏状态。

## 记住位置

设置 `wid` 后，窗口的位置、尺寸以及最大化、分屏状态会被保存，刷新后原样恢复，取消最大化、拖出分屏仍回到之前的浮动位置。保存的状态优先于 `maximized` 属性。调用 `removeWindowState(wid)` 清除，窗口下次挂载时回到初始位置；`loadWindowState(wid)` 读取当前保存的值。

## 交互

- **拖动**：拖动标题栏移动窗口，拖动边框和四角调整大小，点击窗口置顶。
- **最大化**：点击最大化按钮或双击标题栏；取消最大化回到最大化之前的位置。拖到顶边最大化的窗口，还原到拖动之前的位置。
- **贴边分屏**：把窗口拖到左 / 右边缘松开占半屏，拖到四角占四分之一屏，拖到顶边最大化；松开前会显示预览区域。
- **布局菜单**：鼠标停在最大化按钮上片刻，按钮下方弹出布局菜单，悬停某项预览，点击应用；当前布局高亮。第三行的三个居中尺寸只调整窗口位置和大小，窗口仍是普通浮动窗口。
- **还原**：拖动最大化或分屏窗口的标题栏，窗口恢复为之前的大小并跟随鼠标。
- **分屏后最大化**：取消最大化回到分屏位置。
- **视口变化**：分屏窗口按比例跟随；浮动窗口保持在视口内。

模态窗口和函数式对话框见 ModalWindow。
