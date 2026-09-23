# ContextMenu

右键菜单。核心移植自 `@imengyu/vue3-context-menu`，去掉了多套皮肤、MenuTrigger 与文档站，外观改为走 vgo-ui 的 `--vgo-*` 令牌，明暗随 `html.dark`。

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

- **触发元素用函数 ref `:ref="setTriggerRef"` 绑定**，不要写 `ref="triggerRef"`。原因有两个：一是 hook 要在挂载 / 卸载时维护触发元素上那个「放过点击外部」的 class；二是 `:ref="triggerRef"` 在模板里会被自动解包成元素本身，传不进真 ref，而字符串 ref 又会被 `noUnusedLocals` 判成未使用变量。
- `items` 可以是数组，也可以是 getter / `ref`（上面用 getter，每次打开都取最新值）。`x` / `y` 由触发元素的 `getBoundingClientRect()` 算出，配置里不能再传；`gap` 控制按钮与菜单的间距（默认 `4`）。菜单在右侧放不下时会翻到按钮左边，并对齐到按钮的右缘（靠 `anchorWidth`，hook 自动填），所以贴右边的按钮不会出现菜单整体跑到按钮左侧的错位。
- 返回 `{ setTriggerRef, triggerRef, isOpen, triggerClass, toggle, show, close, getInstance }`。`isOpen` 是只读的，打开期间给按钮加 `.is-active` 即可；Esc、点外部、滚动关闭时它也会自动复位。
- hook 会给触发元素自动加一个唯一 class 并把它设成 `ignoreClickClassName`。原因：菜单的「点击外部关闭」监听在 document 捕获阶段先跑，不放过点触发按钮这一下的话，按钮的 click 会「先把菜单关掉、再自己重新打开」，于是永远关不上。手动实现时才需要自己传这个 class。
- 触发元素必须是**单个 HTMLElement**；如果包了一层 wrapper，把函数 ref 绑在真正被点击的那个元素上。

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
| `adjustPosition`                      | `true`            | 自动翻转 / 限制高度以避免溢出容器                                      |
| `anchorWidth`                         | —                 | 锚点元素宽度（仅根菜单）；翻到左边时右缘对齐锚点右缘                   |
| `minWidth` / `maxWidth` / `maxHeight` | `100` / `600` / — | 尺寸限制（像素）                                                       |
| `zIndex`                              | `100`             | 菜单层级                                                               |
| `zoom`                                | `1`               | 缩放系数，容器被 `transform: scale()` 缩放时同步设置                   |
| `theme`                               | —                 | 见下方「明暗」。取值含 `dark` 即强制暗色                               |
| `keyboardControl`                     | `true`            | 键盘操作：`Esc` / `Enter` / 方向键 / `Home` / `End`                    |
| `clickCloseOnOutside`                 | `true`            | 点击菜单外部是否关闭                                                   |
| `closeWhenScroll`                     | `true`            | 页面滚动是否关闭菜单                                                   |
| `subMenuOpenDelay`                    | `200`             | 已有子菜单展开时，悬停打开另一个子菜单的延迟（毫秒）                   |
| `subMenuCloseDelay`                   | `200`             | 离开子菜单或扫过无子项的行后，延迟收起的毫秒数（进入子菜单会取消）     |
| `destroyOnClose`                      | `true`            | 关闭后是否销毁                                                         |
| `customClass`                         | —                 | 菜单根元素自定义类名                                                   |
| `ignoreClickClassName`                | —                 | 命中该 class 的点击被忽略（不关闭、不触发），菜单外同样生效            |
| `clickCloseClassName`                 | —                 | 命中该 class 的点击直接关闭整个菜单                                    |
| `iconFontClass`                       | —                 | 图标字体 class（全局）                                                 |
| `preserveIconWidth`                   | `true`            | 是否为无图标项保留图标占位（全局）                                     |
| `menuTransitionProps`                 | —                 | 显示 / 隐藏的 Vue `Transition` props                                   |
| `adjustPadding`                       | `{ x: 0, y: 10 }` | 子菜单位置微调留白                                                     |
| `getContainer`                        | —                 | 自定义挂载节点；此时 `x` / `y` 相对该容器，容器需 `position: relative` |
| `onClose`                             | —                 | 菜单关闭回调，参数为最后点击的菜单项                                   |
| `onClickOnOutside`                    | —                 | `clickCloseOnOutside: false` 时点击外部触发                            |
| `mouseScroll`                         | —                 | **兼容位，已忽略**。菜单改用原生滚动，内容溢出时滚轮始终可用           |

`subMenuOpenDelay` / `subMenuCloseDelay` 一起决定子菜单换向的手感。已展开子菜单时，悬停到另一个含子项的菜单项要等 `subMenuOpenDelay` 才切换；指针离开子菜单、或在斜向移向子菜单的途中扫过无子项的菜单项时，则给 `subMenuCloseDelay` 的宽限期，期间指针进入子菜单（或移回父项）就会取消这次收起。把 `subMenuCloseDelay` 设为 `0` 可退回「扫过同级项立即收起」的旧行为。

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
