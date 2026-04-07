# 安装

## 安装 VgoUI 组件库

可以使用 `yarn`、`npm`、`pnpm`、`bun` 等包管理工具安装：

```shell
bun add @canwdev/vgo-ui
```

### Peer dependencies

与组件功能对应的依赖需自行安装（版本需满足 `package.json` 中 `peerDependencies` 要求）：

```shell
bun add vue @vueuse/core lodash-es
```

| 场景 | 额外依赖 |
|------|----------|
| AutoFormElPlus、AutoTableElPlus、OptionUI 等基于 Element Plus 的组件 | `element-plus` |
| ListPagination 与路由同步分页参数 | `vue-router`（需在应用中使用 `vue-router`） |

**VueMonaco** 已从主包拆出：仅在使用编辑器时安装 `monaco-editor`，并从子路径导入（主入口 `@canwdev/vgo-ui` **不会**再依赖 Monaco）：

```shell
bun add monaco-editor
```

```ts
import { VueMonaco } from '@canwdev/vgo-ui/vue-monaco'
```

```shell
bun add element-plus
# 按需
bun add vue-router
```

## 引入样式

在入口文件（如 `main.ts`）中引入打包后的样式（对应 `package.json` 的 `exports["./styles"]`）：

```ts
import '@canwdev/vgo-ui/styles'
```

如需在 SCSS 中复用变量或按需扩展，可直接引用包内源码样式（发布包中包含 `src` 目录）：

```scss
@use "@canwdev/vgo-ui/src/styles/base" as *;
```

全局覆盖主题变量示例：

```scss
:root {
  /* 主题颜色(R,G,B) 覆盖（可选） */
  --vgo-primary-rgb: 83, 173, 228 !important;
}
```

## 按需引入组件与类型

```ts
import { ViewPortWindow, OptionUI } from '@canwdev/vgo-ui'
import type { WinOptions, StOptionItem } from '@canwdev/vgo-ui'
```

使用 Element Plus 组件时，请在应用中按 [Element Plus 文档](https://element-plus.org/) 完成安装与全局/按需注册。

## 主题

修改 `index.html`，在 `body` 上添加主题类：

```html
<!-- 亮色主题 -->
<body class="vgo-theme-default">
</body>

<!-- 暗色主题（需在 html 上添加 class="dark"） -->
<html class="dark">
  <body class="vgo-theme-default">
  </body>
</html>
```

自定义主题可参考包内 `src/styles/theme-default.scss`（路径示例：`node_modules/@canwdev/vgo-ui/src/styles/theme-default.scss`）。
