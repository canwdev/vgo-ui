# WindowManager

多窗口管理：在页面里同时打开多个 `ViewPortWindow`，统一处理激活、最小化、单例复用、关闭确认和任务栏。

## 导入

```ts
import type { ManagedWindow } from '@canwdev/vgo-ui'
import { createWindowManager, WindowDock, WindowStack } from '@canwdev/vgo-ui'
```

## 使用

`createWindowManager` 创建一个管理器，`data` 是每个窗口自己的数据，类型由调用方决定。`WindowStack` 渲染所有窗口，`WindowDock` 渲染任务栏，两者都只需要传入管理器。

```vue
<script setup lang="ts">
import { createWindowManager, WindowDock, WindowStack } from '@canwdev/vgo-ui'

interface AppData {
  app: 'editor' | 'about'
  path?: string
}

const windows = createWindowManager<AppData>()

function openEditor(path: string) {
  windows.open({ app: 'editor', path }, { title: path })
}

function openAbout() {
  // 相同 key 只保留一个窗口，再次打开时激活它
  windows.open({ app: 'about' }, { key: 'about', title: '关于' })
}
</script>

<template>
  <WindowStack :manager="windows" :window-props="() => ({ initWinOptions: { width: '480px', height: '320px' } })">
    <template #default="{ win, close }">
      <MyEditor v-if="win.data.app === 'editor'" :path="win.data.path" @exit="close" />
      <AboutPage v-else />
    </template>
  </WindowStack>

  <WindowDock :manager="windows" class="my-dock">
    <template #icon="{ win }">
      <MyIcon :app="win.data.app" />
    </template>
  </WindowDock>
</template>
```

## createWindowManager

```ts
const windows = createWindowManager<T>({
  closeDelay: 300, // 关闭动画时长，之后才从列表移除
  onClose(win) {}, // 窗口开始关闭时调用，如把焦点交还给页面
})
```

| 成员                                                       | 说明                                                                                                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `windows`                                                  | 所有窗口，按任务栏顺序，响应式。关闭动画中的窗口 `isClosing` 为 `true`                                                                                  |
| `stack`                                                    | 所有窗口，按打开顺序，排序不影响。自己渲染窗口时按它循环，排序时窗口才不会重新挂载                                                                      |
| `activeId` / `activeWindow`                                | 当前窗口                                                                                                                                                |
| `open(data, options?)`                                     | 打开并激活窗口，返回窗口对象。`options`：`key`、`title`、`maximized`                                                                                    |
| `toggle(data, { key, ... })`                               | 已有该 `key` 的窗口就关闭，否则打开                                                                                                                     |
| `activate(id)`                                             | 激活窗口：还原最小化、置顶、聚焦                                                                                                                        |
| `toggleFromDock(id)`                                       | 任务栏点击：当前窗口切换最小化，其他窗口激活                                                                                                            |
| `minimize(id)`                                             | 最小化                                                                                                                                                  |
| `minimizeAll()`                                            | 最小化全部窗口，并清空当前窗口                                                                                                                          |
| `toggleDesktop()`                                          | 显示桌面，与 Windows 一致：第一次最小化所有可见窗口，第二次按原叠放顺序还原它们，并恢复当前窗口；期间打开或激活过窗口则不再还原，下次调用重新最小化全部 |
| `desktopShown`                                             | 是否处于显示桌面状态，可用来高亮按钮                                                                                                                    |
| `requestClose(id)`                                         | 经过关闭守卫后关闭，返回是否关闭。窗口的关闭按钮也走这里                                                                                                |
| `closeOthers(id)` / `closeToLeft(id)` / `closeToRight(id)` | 按任务栏顺序关闭其他 / 左侧 / 右侧的窗口，逐个经过关闭守卫；某个窗口取消时保留它，继续关其余的                                                          |
| `close(id)`                                                | 跳过守卫直接关闭                                                                                                                                        |
| `move(from, to)`                                           | 调整任务栏顺序，`to` 是插入位置 `0..windows.length`                                                                                                     |
| `setCloseGuard(id, guard)`                                 | 设置关闭守卫，返回 `false`（或 resolve `false`）取消关闭，如提示未保存的修改；传 `null` 移除                                                            |
| `get(id)` / `findByKey(key)`                               | 查找窗口                                                                                                                                                |

窗口对象 `ManagedWindow<T>`：`id`、`key`、`title`、`data`、`minimized`、`maximized`、`isClosing`，除 `id` 外都可以直接修改，例如应用打开文件后改标题 `win.title = name`。

## WindowStack

| 属性           | 说明                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| `manager`      | 管理器                                                                                                              |
| `windowProps`  | `(win) => props`，额外传给每个窗口的 `ViewPortWindow` 属性，如 `initWinOptions`、`initCenter`、`allowSnap`、`class` |
| `contentAttrs` | `(win) => attrs`，绑定到窗口内容容器的属性，如 `class`、`data-*`                                                    |

| 插槽       | 参数             | 说明                                     |
| ---------- | ---------------- | ---------------------------------------- |
| 默认       | `{ win, close }` | 窗口内容；`close()` 等同于点击关闭按钮   |
| `title`    | `{ win }`        | 标题栏左侧，默认显示 `win.title`         |
| `controls` | `{ win }`        | 插在最小化 / 最大化 / 关闭按钮左侧的按钮 |

窗口默认可以最小化、最大化，可通过 `windowProps` 返回 `allowMinimum: false` 等覆盖。

## WindowDock

任务栏：每个窗口一个按钮，没有窗口时隐藏。它是无头组件，只提供结构、布局和状态类名，尺寸、颜色、指示点和放在页面哪里都由调用方定义。

```html
<div class="vgo-window-dock">
  <!-- flex 横排 -->
  <button class="vgo-window-dock__item is-active">
    <!-- 当前窗口；还有 is-minimized，拖动排序时有 is-drag-source、is-drop-before、is-drop-after -->
    <span class="vgo-window-dock__icon">图标插槽</span>
    <span class="vgo-window-dock__indicator" />
    <!-- 空元素，用来画指示点 -->
  </button>
</div>
```

```vue
<WindowDock :manager="windows" class="my-dock" />

<style scoped>
.my-dock {
  position: fixed;
  bottom: 8px;
  gap: 4px;
}

.my-dock :deep(.vgo-window-dock__item.is-active) {
  background-color: var(--vgo-primary-opacity);
}
</style>
```

| 属性          | 默认值         | 说明                                                                        |
| ------------- | -------------- | --------------------------------------------------------------------------- |
| `manager`     | —              | 管理器                                                                      |
| `sortable`    | `true`         | 允许拖动按钮排序                                                            |
| `orientation` | `'horizontal'` | 排列方向。竖排任务栏传 `'vertical'`，拖动时按上下半判断插入位置             |
| `contextMenu` | `true`         | 右键菜单。`false` 关闭；传 `(win, items) => items` 可在默认菜单项上增删改   |
| `menuLabels`  | 英文           | 菜单文案：`{ close, closeOthers, closeToLeft, closeToRight }`，可只传一部分 |
| `menuOptions` | —              | 传给 `ContextMenu.showContextMenu` 的其他选项，如 `theme`                   |

| 插槽   | 参数                         | 说明                       |
| ------ | ---------------------------- | -------------------------- |
| `icon` | `{ win, active, minimized }` | 按钮图标，默认显示标题首字 |

拖动排序时的插入线和半透明效果同样由调用方用上面的状态类名来画，例如：

```css
.my-dock :deep(.vgo-window-dock__item) {
  position: relative;
}

.my-dock :deep(.vgo-window-dock__item.is-drop-before::after) {
  content: '';
  position: absolute;
  inset-block: 4px;
  left: -2px;
  width: 2px;
  background-color: var(--vgo-primary);
}
```

## 交互

- **激活**：点击窗口、点击任务栏按钮或再次打开单例窗口，窗口置顶并获得焦点；焦点已在窗口内的输入框上时保持不动。
- **任务栏**：点击当前窗口最小化，再点一次还原；点击其他窗口激活它。拖动按钮调整顺序，排序不会让窗口重新加载。
- **右键菜单**：关闭、关闭其他、关闭左侧、关闭右侧。
- **关闭**：关闭当前窗口后激活前一个仍打开的窗口；前一个窗口已最小化时只设为当前项，不弹出。
- **关闭确认**：设置了关闭守卫的窗口，关闭按钮、内容插槽的 `close()`、`requestClose`、`toggle`、右键菜单都会先询问（管理器的 `close(id)` 除外），询问前先把该窗口激活到最前。批量关闭一次只弹一个确认框，取消的窗口保留，其余照常关闭。
