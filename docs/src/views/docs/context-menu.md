# ContextMenu

右键菜单和下拉菜单。外观跟随页面的明暗主题。

## 导入

```ts
import type { MenuBarOptions, MenuItem, MenuOptions } from '@canwdev/vgo-ui'
import { ContextMenu, ContextMenuBar, ContextMenuRoot, useContextMenuTrigger } from '@canwdev/vgo-ui'
```

样式已包含在 `@canwdev/vgo-ui/styles/core` 与 `@canwdev/vgo-ui/themes/default` 两个入口里，不需要额外引入。

## 函数式用法

```ts
import type { MenuItem } from '@canwdev/vgo-ui'
import { ContextMenu } from '@canwdev/vgo-ui'

const items: MenuItem[] = [
  { label: 'Open', shortcut: 'Enter', onClick: () => open() },
  {
    label: 'Open with',
    children: [
      { label: 'Browser', onClick: () => openWith('browser') },
      { label: 'Text editor', onClick: () => openWith('editor') },
    ],
  },
  { label: 'Delete', divided: true, onClick: () => remove() },
]

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
  ContextMenu.showContextMenu({ x: e.x, y: e.y, items })
}
```

`showContextMenu(options, customSlots?)` 返回菜单实例：

| 方法                   | 说明                                                    |
| ---------------------- | ------------------------------------------------------- |
| `closeMenu(fromItem?)` | 关闭菜单，`fromItem` 会原样传给 `onClose`               |
| `isClosed()`           | 是否已关闭                                              |
| `getMenuRef()`         | 根 `ContextSubMenuInstance`，菜单未显示时为 `undefined` |
| `getMenuDimensions()`  | 根菜单尺寸（像素）                                      |

插件对象上还有三个静态方法：

- `ContextMenu.closeContextMenu()` —— 关闭当前打开的菜单；
- `ContextMenu.isAnyContextMenuOpen()` —— 当前是否有菜单打开；
- `ContextMenu.transformMenuPosition(el, offsetX, offsetY, container?)` —— 把鼠标事件坐标换算成菜单坐标，`body` 处于 `transform: scale()` 缩放状态时使用。

也可以在 `app.use(ContextMenu)` 之后用 `this.$contextmenu(options)`（模板里 `$contextmenu` 的类型已随库导出）。

## 按钮触发（下拉）

「点按钮开菜单、再点关闭、按钮保持激活」用 `useContextMenuTrigger`。它是 headless 的：不渲染任何东西，触发元素和样式还是你自己的（通常配 `.vgo-button` + `.is-active`），hook 只负责定位到触发元素下方、开 / 关状态，以及和菜单「点击外部关闭」的时序。

```vue
<script setup lang="ts">
import { useContextMenuTrigger } from '@canwdev/vgo-ui'

const { setTriggerRef, isOpen, toggle } = useContextMenuTrigger({
  items: () => [
    { label: 'Open', onClick: () => open() },
    { label: 'Delete', divided: true, onClick: () => remove() },
  ],
  onClose: item => console.warn('菜单关闭，最后点击：', item?.label ?? '无'),
})
</script>

<template>
  <button
    :ref="setTriggerRef"
    class="vgo-button"
    :class="isOpen ? 'is-active' : ''"
    @click="toggle"
  >
    Actions
  </button>
</template>
```

要点：

- 触发元素用 `:ref="setTriggerRef"` 绑定。
- `items` 可以是数组，也可以是 getter / `ref`，每次打开都取最新值。位置由触发元素算出，配置里不要再传 `x` / `y`。`gap` 是按钮和菜单的间距，默认 `4`。贴着右边缘时，菜单会翻到按钮左边，仍然对齐按钮。
- 打开期间给按钮加 `.is-active`。Esc、点外部、滚动关闭时 `isOpen` 会自己变回 `false`。
- 再点同一个按钮会关闭菜单，不会关了又马上打开。
- 触发元素是单个元素。包了一层的话，把 `:ref` 绑在真正被点击的那个元素上。

### 手动实现

不想用 hook 时，照着 hook 做三件事即可：拿 `showContextMenu` 返回的实例做开 / 关；把触发元素的 class 传给 `ignoreClickClassName`；在 `onClose` 里复位激活态。

```ts
const rect = triggerRef.value!.getBoundingClientRect()
const menu = ContextMenu.showContextMenu({
  x: rect.left,
  y: rect.bottom + 4,
  ignoreClickClassName: 'my-dropdown-trigger',
  items: [{ label: 'Open' }],
  onClose: () => { open.value = false },
})
```

## MenuItem

| 字段                                  | 类型                                  | 说明                                                       |
| ------------------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| `label`                               | `string \| VNode \| (label) => VNode` | 菜单项文字                                                 |
| `icon`                                | `string \| VNode \| (icon) => VNode`  | 图标。字符串按图标字体 class 处理，VNode 直接渲染          |
| `svgIcon` / `svgProps`                | `string` / `SVGAttributes`            | 用 `<use xlink:href="#id">` 引用 svg symbol                |
| `shortcut`                            | `string`                              | 右侧快捷键提示，仅显示，按键处理由业务负责                 |
| `disabled` / `hidden` / `checked`     | `boolean \| ComputedRef<boolean>`     | 禁用 / 隐藏 / 勾选，传 `computed` 可随菜单打开期间实时变化 |
| `divided`                             | `boolean \| 'up' \| 'down' \| 'self'` | 分隔线位置；`'self'` 表示本项就是分隔线                    |
| `children`                            | `MenuItem[]`                          | 子菜单，可无限嵌套                                         |
| `direction`                           | `MenuPopDirection`                    | 本项子菜单方向，默认继承 `options.direction`               |
| `adjustSubMenuPosition`               | `boolean`                             | 本项子菜单是否自动避免溢出                                 |
| `maxWidth` / `minWidth` / `maxHeight` | `number \| string`                    | 本项子菜单的尺寸限制                                       |
| `clickClose`                          | `boolean`                             | 点击后是否关闭菜单，默认 `true`                            |
| `clickableWhenHasChildren`            | `boolean`                             | 含子菜单时是否仍触发自身点击，默认 `false`                 |
| `preserveIconWidth`                   | `boolean`                             | 是否为无图标项保留图标占位                                 |
| `iconFontClass`                       | `string`                              | 图标字体 class（本项）                                     |
| `customClass`                         | `string`                              | 本项自定义类名                                             |
| `attrs`                               | `Record<string, unknown>`             | 透传到菜单项元素上的属性                                   |
| `customRender`                        | `VNode \| (item) => VNode`            | 完全自定义本项渲染                                         |
| `onClick`                             | `(e?) => void`                        | 点击（或键盘 `Enter`）回调                                 |
| `onSubMenuOpen` / `onSubMenuClose`    | `(itemInstance?) => void`             | 子菜单展开 / 收起                                          |

## MenuOptions

| 字段                                  | 默认              | 说明                                                                   |
| ------------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| `x` / `y`                             | 必填              | 显示坐标                                                               |
| `items`                               | —                 | 菜单项数组                                                             |
| `direction`                           | `'br'`            | 主菜单相对坐标点的方向：`br` `b` `bl` `tr` `t` `tl` `l` `r`            |
| `adjustPosition`                      | `true`            | 尽量留在屏幕内；贴边时翻到另一侧，太高则滚动                           |
| `anchorWidth`                         | —                 | 锚点元素宽度（仅根菜单）；翻到左边时右缘对齐锚点右缘                   |
| `minWidth` / `maxWidth` / `maxHeight` | `100` / `600` / — | 尺寸限制（像素）；子菜单的 `maxWidth` 默认 `300`                       |
| `zIndex`                              | `1100`            | 菜单层级，默认与 `--vgo-z-menu` 一致                                   |
| `zoom`                                | `1`               | 缩放系数，容器被 `transform: scale()` 缩放时同步设置                   |
| `theme`                               | —                 | 见下方「明暗」。取值含 `dark` 即强制暗色                               |
| `keyboardControl`                     | `true`            | 键盘操作：`Esc` / `Enter` / 方向键 / `Home` / `End`                    |
| `clickCloseOnOutside`                 | `true`            | 点击菜单外部是否关闭                                                   |
| `closeWhenScroll`                     | `true`            | 页面滚动是否关闭菜单                                                   |
| `interaction`                         | `'auto'`          | 子菜单打开方式：`auto` / `pc` / `mobile`，见下方                       |
| `subMenuOpenDelay`                    | `200`             | PC 悬停时，已有子菜单展开后再悬停另一项，延迟打开的毫秒数             |
| `subMenuCloseDelay`                   | `200`             | PC 悬停时，离开子菜单或扫过其它行后，延迟收起的毫秒数                 |
| `destroyOnClose`                      | `true`            | 关闭后是否销毁                                                         |
| `customClass`                         | —                 | 菜单根元素自定义类名                                                   |
| `ignoreClickClassName`                | —                 | 命中该 class 的点击被忽略（不关闭、不触发），菜单外同样生效            |
| `clickCloseClassName`                 | —                 | 命中该 class 的点击直接关闭整个菜单                                    |
| `iconFontClass`                       | —                 | 图标字体 class（全局）                                                 |
| `preserveIconWidth`                   | `true`            | 是否为无图标项保留图标占位（全局）                                     |
| `menuTransitionProps`                 | —                 | 覆盖显示 / 隐藏的 Vue `Transition` props（传了就完全接管动画）         |
| `adjustPadding`                       | `{ x: 0, y: 10 }` | 子菜单位置微调留白                                                     |
| `getContainer`                        | —                 | 自定义挂载节点；此时 `x` / `y` 相对该容器，容器需 `position: relative` |
| `onClose`                             | —                 | 菜单关闭回调，参数为最后点击的菜单项                                   |
| `onClickOnOutside`                    | —                 | `clickCloseOnOutside: false` 时点击外部触发                            |
| `mouseScroll`                         | —                 | **兼容位，已忽略**。菜单改用原生滚动，内容溢出时滚轮始终可用           |

## 子菜单

`interaction` 决定子菜单怎么打开，默认 `auto`。

| 值       | 行为                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| `auto`   | 宽屏鼠标用悬停。触屏和小屏用点击。                                                           |
| `pc`     | 始终悬停打开，移开关闭。                                                                     |
| `mobile` | 始终点击打开。打开后上一层不能再点；点上一层只关闭最上面一层。点菜单外面仍然关闭整个菜单。 |

子菜单贴着父菜单，中间不留缝。旁边放不下时，子菜单会盖住父菜单的一部分，露出来的父菜单可以点，用来退回一层。

`subMenuOpenDelay` / `subMenuCloseDelay` 只在 PC 悬停下生效。已经展开子菜单时，悬停到另一项要等 `subMenuOpenDelay` 才切换；斜着移进子菜单时，扫过旁边的行不会马上把子菜单关掉，这段时间是 `subMenuCloseDelay`。设为 `0` 就是马上切换、马上收起。

## 弹出动画

菜单的进出场是淡入淡出。系统或页面开了「减少动态效果」时，这段动画会短到几乎看不见。子菜单一样。

要换掉这段动画就传 `menuTransitionProps`，它会整体接管 `Transition`（包括 `name`、`css`、`duration`）：

```ts
ContextMenu.showContextMenu({
  x: e.x,
  y: e.y,
  items,
  // 关掉动画（例如配合自己的自定义类）
  menuTransitionProps: { css: false },
})
```

## 边界

`adjustPosition` 默认开着：菜单尽量留在屏幕里。贴边时会翻到另一侧；太高就在菜单里滚动；文字太长会省略。`adjustPosition: false` 时位置完全按 `x` / `y` 和 `direction` 来。

子菜单默认比根菜单窄（最大宽度 300，根菜单 600）。旁边放得下时贴着父菜单展开；放不下时盖住父菜单的一部分，而不是跑到屏幕外。

## 全屏 demo

本页可以打开全屏 demo。四角和中间的按钮在按钮下方弹出菜单，其它位置右键在光标处弹出。页面上的 `auto` / `pc` / `mobile` 用来切换子菜单的打开方式，桌面上选 `mobile` 就能试「点击展开、点上一层退回一层」，不用把窗口缩窄。

### 层级

菜单默认画在窗口和预览层上面（`--vgo-z-menu`，1100）。全屏容器、抽屉、浮层要低于这个值，否则菜单会被盖住，例如 `z-index: calc(var(--vgo-z-menu) - 1)`。需要菜单待在更低的层时，给 `showContextMenu` / `useContextMenuTrigger` 传 `zIndex`。

## 明暗

菜单外观只读 `--vgo-*` 令牌，所以：

- 亮色：`body.vgo-theme-default`；
- 暗色：`html.dark body.vgo-theme-default`。

`theme` 选项是为兼容旧调用保留的开关，取值只要包含 `dark`（`'dark'`、`'flat dark'` 都行），就会把暗色令牌钉在菜单根上，不依赖 `html.dark`；其他取值都跟随页面主题。旧的 `'flat'` / `'win10'` / `'mac'` / `'default'` 等皮肤名不再改变外观，vgo-ui 只有一套菜单样式。

要自定义菜单外观，直接覆盖设计令牌即可，不要改组件内部类：

```scss
body.vgo-theme-default .vgo-context-menu {
  --vgo-surface-raised: #f6f6f6;
  --vgo-radius: 8px;
}
```

## 组件式用法

`ContextMenuRoot` 与函数式共享同一套 `MenuOptions`，用 `v-model:show` 控制显示：

```vue
<script setup lang="ts">
import { ContextMenuGroup, ContextMenuItem, ContextMenuRoot } from '@canwdev/vgo-ui'
import { reactive } from 'vue'

const menu = reactive({ show: false })
</script>

<template>
  <ContextMenuRoot v-model:show="menu.show" :options="{ x: 0, y: 0 }">
    <ContextMenuItem label="Open" :click-handler="() => open()" />
    <ContextMenuGroup label="Open with">
      <ContextMenuItem label="Browser" />
      <ContextMenuItem label="Text editor" />
    </ContextMenuGroup>
  </ContextMenuRoot>
</template>
```

`ContextSubMenu` 也可单独使用，但需要处于 `ContextMenuRoot` / `ContextMenuGroup` 提供的上下文里。

## 自定义渲染插槽

`showContextMenu` 的第二个参数与 `ContextMenuRoot` 的插槽同名，可用于整体换皮：

| 插槽                   | 参数                 | 替换内容   |
| ---------------------- | -------------------- | ---------- |
| `itemRender`           | `MenuItemRenderData` | 整个菜单项 |
| `itemIconRender`       | 同上                 | 图标区     |
| `itemLabelRender`      | 同上                 | 文字       |
| `itemShortcutRender`   | 同上                 | 快捷键     |
| `itemRightArrowRender` | 同上                 | 右侧箭头   |
| `separatorRender`      | —                    | 分隔线     |

```ts
ContextMenu.showContextMenu(options, {
  itemRender: data => h('div', {
    class: ['my-item', data.disabled ? 'is-disabled' : ''],
    onClick: data.onClick,
    onMouseenter: data.onMouseEnter,
  }, data.label),
})
```

`MenuItemRenderData` 里额外带 `theme`（`'light' | 'dark'`）、`isOpen`（子菜单是否展开）、`hasChildren` 与绑定好的 `onClick` / `onMouseEnter`。

## MenuBar

`ContextMenuBar` 是嵌在页面里的横向菜单栏，`MenuBarOptions` 继承 `MenuOptions`（去掉 `x` / `y` / `getContainer`）并加上：

| 字段              | 默认    | 说明                                       |
| ----------------- | ------- | ------------------------------------------ |
| `items`           | —       | 一级项目，点击后把 `children` 作为菜单弹出 |
| `mini`            | `false` | 折叠成单个菜单按钮                         |
| `barPopDirection` | `'bl'`  | 折叠状态下主菜单的弹出方向                 |
| `theme`           | —       | 同 `MenuOptions.theme`                     |

```vue
<ContextMenuBar :options="{
  items: [{ label: 'File', children: [{ label: 'New' }] }],
}"
/>
```
