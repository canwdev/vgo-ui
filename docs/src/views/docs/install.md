# 快速上手

## 安装

```shell
bun add @canwdev/vgo-ui
```

`npm`、`pnpm`、`yarn` 同样可以。

### 从 GitHub 安装

不走 npm 时，安装对应 Release 里的 tgz。把下面 URL 中的版本号换成目标 Release：

```shell
bun add https://github.com/canwdev/vgo-ui/releases/download/v0.4.3/canwdev-vgo-ui-0.4.3.tgz
```

产物与 npm 上的相同，子路径导入可用。升级时改 URL。不要使用 `bun add github:canwdev/vgo-ui`，那样装到的是未构建的源码。

### 依赖

这些依赖需要自己安装，版本见包内 `peerDependencies`：

```shell
bun add vue @vueuse/core lodash-es
```

| 场景 | 依赖 |
| --- | --- |
| 使用组件库 | `vue`、`@vueuse/core`、`lodash-es` |
| AutoFormElPlus、AutoTableElPlus、OptionUI | 再安装并注册 `element-plus` |
| ListPagination 与路由同步页码 | 再安装 `vue-router`，并在应用里使用 |
| VueMonaco | 再安装 `monaco-editor`，并从子路径导入 |

VueMonaco 不在主入口里，用到编辑器时再装：

```shell
bun add monaco-editor
```

```ts
import { VueMonaco } from '@canwdev/vgo-ui/vue-monaco'
```

Element Plus 的安装与注册见[官方文档](https://element-plus.org/)。

## 样式与主题

同时引入结构样式和默认主题：

```ts
import '@canwdev/vgo-ui/styles/core'
import '@canwdev/vgo-ui/themes/default'
```

默认主题类在 `body` 上，暗色类在 `html` 上：

```html
<body class="vgo-theme-default"></body>

<html class="dark">
  <body class="vgo-theme-default"></body>
</html>
```

类名、CSS 变量和禁止写法见[样式总览](/docs/styles)。

## 引入组件

```ts
import type { VgoOptionItem, WinOptions } from '@canwdev/vgo-ui'
import { OptionUI, ViewPortWindow } from '@canwdev/vgo-ui'
```

## 本地联调

在本仓库构建并 link，再到使用方项目 link 同名包。改完组件或样式后重新构建，使用方刷新即可。

```shell
# 安装依赖
bun i

# 构建开发组件库
bun run dev

# 在本包目录下执行 link
bun link

# 在使用该包的项目目录下执行
# rm -rf node_modules/@canwdev/vgo-ui node_modules/.vite node_modules/.vite-temp
bun link @canwdev/vgo-ui
```

### 打包发布

```shell
# 先修改 package.json 中的版本号
bun run build

# 可选：本地打包（不推荐）
# bun run bun:pack

# 发布到 npm
bun publish --access public
```
