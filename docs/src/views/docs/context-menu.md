# ContextMenu

右键菜单。函数式（`ContextMenu.showContextMenu`）用于「在光标处弹出一个由数据描述出来的菜单」，组件式（`ContextMenuRoot`）用于把菜单写进模板。核心移植自 `@imengyu/vue3-context-menu`，去掉了多套皮肤、MenuTrigger 与文档站，外观改为走 vgo-ui 的 `--vgo-*` 令牌，明暗随 `html.dark`。

## 依赖

无。菜单不依赖任何第三方滚动库或图标库。

## 导入

```ts
import { ContextMenu, ContextMenuBar, ContextMenuRoot } from '@canwdev/vgo-ui'
import type { MenuItem, MenuOptions, MenuBarOptions } from '@canwdev/vgo-ui'
```

样式已包含在 `@canwdev/vgo-ui/styles/core` 与 `@canwdev/vgo-ui/themes/default` 两个入口里，不需要额外引入。

## 函数式用法

```ts
import { ContextMenu } from '@canwdev/vgo-ui'
import type { MenuItem } from '@canwdev/vgo-ui'

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

| 方法 | 说明 |
| --- | --- |
| `closeMenu(fromItem?)` | 关闭菜单，`fromItem` 会原样传给 `onClose` |
| `isClosed()` | 是否已关闭 |
| `getMenuRef()` | 根 `ContextSubMenuInstance`，菜单未显示时为 `undefined` |
| `getMenuDimensions()` | 根菜单尺寸（像素） |

插件对象上还有三个静态方法：

- `ContextMenu.closeContextMenu()` —— 关闭当前打开的菜单；
- `ContextMenu.isAnyContextMenuOpen()` —— 当前是否有菜单打开；
- `ContextMenu.transformMenuPosition(el, offsetX, offsetY, container?)` —— 把鼠标事件坐标换算成菜单坐标，`body` 处于 `transform: scale()` 缩放状态时使用。

也可以在 `app.use(ContextMenu)` 之后用 `this.$contextmenu(options)`（模板里 `$contextmenu` 的类型已随库导出）。

## MenuItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string \| VNode \| (label) => VNode` | 菜单项文字 |
| `icon` | `string \| VNode \| (icon) => VNode` | 图标。字符串按图标字体 class 处理，VNode 直接渲染 |
| `svgIcon` / `svgProps` | `string` / `SVGAttributes` | 用 `<use xlink:href="#id">` 引用 svg symbol |
| `shortcut` | `string` | 右侧快捷键提示，仅显示，按键处理由业务负责 |
| `disabled` / `hidden` / `checked` | `boolean \| ComputedRef<boolean>` | 禁用 / 隐藏 / 勾选，传 `computed` 可随菜单打开期间实时变化 |
| `divided` | `boolean \| 'up' \| 'down' \| 'self'` | 分隔线位置；`'self'` 表示本项就是分隔线 |
| `children` | `MenuItem[]` | 子菜单，可无限嵌套 |
| `direction` | `MenuPopDirection` | 本项子菜单方向，默认继承 `options.direction` |
| `adjustSubMenuPosition` | `boolean` | 本项子菜单是否自动避免溢出 |
| `maxWidth` / `minWidth` / `maxHeight` | `number \| string` | 本项子菜单的尺寸限制 |
| `clickClose` | `boolean` | 点击后是否关闭菜单，默认 `true` |
| `clickableWhenHasChildren` | `boolean` | 含子菜单时是否仍触发自身点击，默认 `false` |
| `preserveIconWidth` | `boolean` | 是否为无图标项保留图标占位 |
| `iconFontClass` | `string` | 图标字体 class（本项） |
| `customClass` | `string` | 本项自定义类名 |
| `attrs` | `Record<string, unknown>` | 透传到菜单项元素上的属性 |
| `customRender` | `VNode \| (item) => VNode` | 完全自定义本项渲染 |
| `onClick` | `(e?) => void` | 点击（或键盘 `Enter`）回调 |
| `onSubMenuOpen` / `onSubMenuClose` | `(itemInstance?) => void` | 子菜单展开 / 收起 |

## MenuOptions

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `x` / `y` | 必填 | 显示坐标 |
| `items` | — | 菜单项数组 |
| `direction` | `'br'` | 主菜单相对坐标点的方向：`br` `b` `bl` `tr` `t` `tl` `l` `r` |
| `adjustPosition` | `true` | 自动翻转 / 限制高度以避免溢出容器 |
| `minWidth` / `maxWidth` / `maxHeight` | `100` / `600` / — | 尺寸限制（像素） |
| `zIndex` | `100` | 菜单层级 |
| `zoom` | `1` | 缩放系数，容器被 `transform: scale()` 缩放时同步设置 |
| `theme` | — | 见下方「明暗」。取值含 `dark` 即强制暗色 |
| `keyboardControl` | `true` | 键盘操作：`Esc` / `Enter` / 方向键 / `Home` / `End` |
| `clickCloseOnOutside` | `true` | 点击菜单外部是否关闭 |
| `closeWhenScroll` | `true` | 页面滚动是否关闭菜单 |
| `subMenuOpenDelay` | `200` | 已有子菜单展开时，悬停打开另一个子菜单的延迟（毫秒） |
| `destroyOnClose` | `true` | 关闭后是否销毁 |
| `customClass` | — | 菜单根元素自定义类名 |
| `ignoreClickClassName` | — | 命中该 class 的点击被忽略（不关闭、不触发） |
| `clickCloseClassName` | — | 命中该 class 的点击直接关闭整个菜单 |
| `iconFontClass` | — | 图标字体 class（全局） |
| `preserveIconWidth` | `true` | 是否为无图标项保留图标占位（全局） |
| `menuTransitionProps` | — | 显示 / 隐藏的 Vue `Transition` props |
| `adjustPadding` | `{ x: 0, y: 10 }` | 子菜单位置微调留白 |
| `getContainer` | — | 自定义挂载节点；此时 `x` / `y` 相对该容器，容器需 `position: relative` |
| `onClose` | — | 菜单关闭回调，参数为最后点击的菜单项 |
| `onClickOnOutside` | — | `clickCloseOnOutside: false` 时点击外部触发 |
| `mouseScroll` | — | **兼容位，已忽略**。菜单改用原生滚动，内容溢出时滚轮始终可用 |

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

| 插槽 | 参数 | 替换内容 |
| --- | --- | --- |
| `itemRender` | `MenuItemRenderData` | 整个菜单项 |
| `itemIconRender` | 同上 | 图标区 |
| `itemLabelRender` | 同上 | 文字 |
| `itemShortcutRender` | 同上 | 快捷键 |
| `itemRightArrowRender` | 同上 | 右侧箭头 |
| `separatorRender` | — | 分隔线 |

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

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `items` | — | 一级项目，点击后把 `children` 作为菜单弹出 |
| `mini` | `false` | 折叠成单个菜单按钮 |
| `barPopDirection` | `'bl'` | 折叠状态下主菜单的弹出方向 |
| `theme` | — | 同 `MenuOptions.theme` |

```vue
<ContextMenuBar :options="{
  items: [{ label: 'File', children: [{ label: 'New' }] }],
}" />
```

## 与 `@imengyu/vue3-context-menu` 的差异

| 原 | vgo-ui | 说明 |
| --- | --- | --- |
| `ContextMenuSperator`（拼写错误） | `ContextMenuSeparator` | 组件名与类名都改为正确拼写 |
| `.mx-context-menu-item-sperator` | `.vgo-context-menu__separator` | 类名整体换成 `vgo-` BEM |
| `--mx-menu-backgroud`（拼写错误） | `--vgo-*` 令牌 | 不再有独立的菜单变量表 |
| `MenuOptions.updownButtonSpaceholder` | 已移除 | 该选项原本没有实现 |
| `MenuOptions.mouseScroll` | 兼容位，忽略 | 原生滚动始终可用 |
| `MenuTrigger` 组件 | 未移植 | 用业务自己的按钮 + `showContextMenu` 代替 |
| `menuTransitionProps` 名称 | 不变 | 默认无动画 |
| `MenuBar` | `ContextMenuBar` | 导出名带 `ContextMenu` 前缀，避免与业务组件重名 |

内部上下文的拼写错误也一并修正：`getPositon` → `getPosition`、`closeOtherSubMenuWithTimeOut` → `closeOtherSubMenuWithTimeout`、`markThisOpenedByKeyBoard` → `markThisOpenedByKeyboard` 等。这些是内部类型，业务一般不会直接用到。

## 样式类

菜单内部类可供业务在必要时覆盖，但更推荐改令牌：

`.vgo-context-menu`、`__scroll`、`__items`、`__item-wrapper`、`__item`、`__row`、`__icon`、`__label`、`__shortcut`、`__arrow`、`__check`、`__separator`；菜单栏为 `.vgo-context-menu-bar`、`__content`、`__item`、`__icon`。菜单项复用 `.vgo-list-item` 基元，所以 hover / `.is-disabled` / `.is-active` 与列表行一致。

## Demo

页面底部的 Demo：在上方虚线框内点击右键，或点按钮在按钮处弹出；两个按钮分别在页面主题与强制暗色下弹出同一份菜单。下方菜单栏可切换亮 / 暗两种主题。