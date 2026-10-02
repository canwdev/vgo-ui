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
| `adjustPosition`                      | `true`            | 自动翻转 / 回夹 / 限制高度以避免溢出容器                               |
| `anchorWidth`                         | —                 | 锚点元素宽度（仅根菜单）；翻到左边时右缘对齐锚点右缘                   |
| `minWidth` / `maxWidth` / `maxHeight` | `100` / `600` / — | 尺寸限制（像素）；子菜单的 `maxWidth` 默认 `300`                       |
| `zIndex`                              | `1100`            | 菜单层级，默认与 `--vgo-z-menu` 一致                                   |
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
| `menuTransitionProps`                 | —                 | 覆盖显示 / 隐藏的 Vue `Transition` props（传了就完全接管动画）         |
| `adjustPadding`                       | `{ x: 0, y: 10 }` | 子菜单位置微调留白                                                     |
| `getContainer`                        | —                 | 自定义挂载节点；此时 `x` / `y` 相对该容器，容器需 `position: relative` |
| `onClose`                             | —                 | 菜单关闭回调，参数为最后点击的菜单项                                   |
| `onClickOnOutside`                    | —                 | `clickCloseOnOutside: false` 时点击外部触发                            |
| `mouseScroll`                         | —                 | **兼容位，已忽略**。菜单改用原生滚动，内容溢出时滚轮始终可用           |

`subMenuOpenDelay` / `subMenuCloseDelay` 一起决定子菜单换向的手感。已展开子菜单时，悬停到另一个含子项的菜单项要等 `subMenuOpenDelay` 才切换；指针离开子菜单、或在斜向移向子菜单的途中扫过无子项的菜单项时，则给 `subMenuCloseDelay` 的宽限期，期间指针进入子菜单（或移回父项）就会取消这次收起。把 `subMenuCloseDelay` 设为 `0` 可退回「扫过同级项立即收起」的旧行为。

## 弹出动画

菜单的进出场是**淡入淡出**（`opacity`，时长走 `--vgo-duration-fast` 令牌，`html.reduce-motion` / 系统 `prefers-reduced-motion` 都会把它压到接近 0），不做缩放。子菜单同理。

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

## 边界处理

`adjustPosition`（默认开启）负责让菜单始终待在容器里，按这个顺序：

1. **翻转**：菜单从锚点向右 / 向下弹出后越界时，翻到锚点的另一侧；根菜单用 `anchorWidth` 对齐触发元素的边缘；
2. **让开父菜单**：子菜单放在父菜单的左侧或右侧（与父菜单之间留 2px 缝），方向逻辑给的位置如果会盖到父菜单上就换边 —— 典型是父菜单贴着容器右缘、子菜单从右边弹出时被回夹推了回来。取舍顺序是「不压父菜单 → 放得进可用区域 → 超出更少 → 离原位置更近」，并且**每个候选都可以夹窄**：
    - 一侧放得下原宽度 → 直接放那一侧（桌面常态，子菜单保持自然宽度）；
    - 两侧都放不下（窄屏常态：手机 390px 宽，父菜单 238、子菜单 220，横向根本没有并排空间）→ **把子菜单夹窄到那一侧的宽度**，仍然不压父菜单、也不出屏。手机上因此会出现一条较窄的子菜单（约 130~150px），长文案会省略号截断，但父菜单的入口完整保留、子菜单也点得到 —— 比「压住父菜单」和「一半在屏幕外」都好。菜单项自己的 `maxWidth` 仍然优先。
3. **回夹**：翻转后仍越界（或锚点本身就贴着容器左 / 上边缘）时，把菜单挪回容器内，四周至少留 4px；
4. **夹尺寸**：菜单比容器还高 / 还宽时没法靠挪位置解决 —— 高的情况贴住容器顶部，并把菜单项区域限制在剩余高度内，内容改为滚动（滚轮始终可用）；宽的情况把 `max-width` 收到容器宽度。子菜单默认 `max-width: 300`，比根菜单（`600`）窄一档，减少顶到容器边缘的机会。

传 `adjustPosition: false` 可以整体关掉这套修正，位置就完全按 `x` / `y` 和 `direction` 来。自定义容器（`getContainer`）时上、下、左、右都以该容器的可视区域为准，`zoom` 用于容器被 `transform: scale()` 缩放的情况。

## 全屏 demo

本页顶部的「打开全屏 demo」会铺满整个视口，用来一次试完上面这些行为：

- **四个角 + 中间各有一个按钮**，点击后在按钮下方弹出菜单 —— 按钮贴着视口四角时正好覆盖「向右弹出会越界，于是翻到左边 / 上边」以及回夹的分支；
- **其他位置右键**，菜单在光标处弹出；
- 每个按钮对应独立的菜单实例，各自保持自己的开 / 关与激活态；
- 菜单内容照搬 file-lite 的全局菜单结构（`use-file-lite-menu.ts`）：多层嵌套、勾选项、动态文案、`disabled`、`divided`、以及把图标解析成 VNode；
- 四角的按钮最容易试出「子菜单翻到父菜单左侧 / 右侧都不放不下」的边界情况。

demo 组件是 `src/components/ContextMenu/DemoContextMenuFullscreen.vue`；内嵌 demo 的菜单数据在 `demo-menu.ts`。

### 层级

菜单容器挂在 `body` 上，层级取 `MENU_CONST_OPTIONS.defaultZIndex`，默认 **1100**，和 `--vgo-z-menu` 令牌一致。它必须压过所有常驻界面层：

| 层          | 令牌                | 值   |
| ----------- | ------------------- | ---- |
| 窗口        | `--vgo-z-window`    | 100  |
| 拖拽 / 布局预览 | `--vgo-z-preview` | 1000 |
| 弹出层（菜单） | `--vgo-z-menu`    | 1100 |

写覆盖在页面之上的自定义层（全屏容器、抽屉、浮层）时，层级要**低于** `--vgo-z-menu`，否则菜单会被压在那层底下——上例的全屏容器就是用 `calc(var(--vgo-z-menu) - 1)`。确实需要反过来时，给 `showContextMenu` / `useContextMenuTrigger` 传 `zIndex` 把菜单提到更高。

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
