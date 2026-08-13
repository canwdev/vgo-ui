# 快速上手

## 安装 VgoUI 组件库

可以使用 `yarn`、`npm`、`pnpm`、`bun` 等包管理工具安装：

```shell
bun add @canwdev/vgo-ui
```

### 从 GitHub 安装

不走 npm 仓库时，装 Release 附件里的 tgz（`v*` tag 推送后由 CI 自动构建上传）：

```shell
bun add https://github.com/canwdev/vgo-ui/releases/download/v0.4.0/canwdev-vgo-ui-0.4.0.tgz
```

与 npm 上的是同一份产物，子路径导入照常可用；URL 会写进 lockfile，升级改 URL 即可。不建议 `bun add github:canwdev/vgo-ui`——仓库不提交 `dist`，装到的是未构建的源码。

### Peer dependencies

与组件功能对应的依赖需自行安装（版本需满足 `package.json` 中 `peerDependencies` 要求）：

```shell
bun add vue @vueuse/core lodash-es
```

| 场景                                                                 | 额外依赖                                    |
| -------------------------------------------------------------------- | ------------------------------------------- |
| AutoFormElPlus、AutoTableElPlus、OptionUI 等基于 Element Plus 的组件 | `element-plus`                              |
| ListPagination 与路由同步分页参数                                    | `vue-router`（需在应用中使用 `vue-router`） |

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

同时引入 core 和默认主题：

```ts
import '@canwdev/vgo-ui/styles/core'
import '@canwdev/vgo-ui/themes/default'
```

`styles/core` 提供重置、运行时基础、组件结构和 `vgo-u-*` 工具类；`themes/default` 提供默认主题的设计CSS变量和外观。

文档工程直接使用源码入口时，对应路径为：

```ts
import '../../src/styles/core.scss'
import '../../src/styles/themes/default/index.scss'
```

## 按需引入组件与类型

```ts
import type { StOptionItem, WinOptions } from '@canwdev/vgo-ui'
import { OptionUI, ViewPortWindow } from '@canwdev/vgo-ui'
```

使用 Element Plus 组件时，请在应用中按 [Element Plus 文档](https://element-plus.org/) 完成安装与全局/按需注册。

## 主题

默认主题类挂载在 `body`，暗色状态类挂载在 `html`：

```html
<!-- 亮色主题 -->
<body class="vgo-theme-default"></body>

<!-- 暗色主题（需在 html 上添加 class="dark"） -->
<html class="dark">
  <body class="vgo-theme-default"></body>
</html>
```

组件 CSS 类统一使用 `vgo-` 前缀和 BEM 命名（如 `.vgo-window__body`、`.vgo-button--primary`），状态类使用 `.is-*`，工具类使用 `.vgo-u-*`。这些类名在 0.4.0 中属于破坏性变更。

## 开发

### 本地开发（Link）

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
