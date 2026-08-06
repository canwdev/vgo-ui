# Vgo UI

- 实用型 Vue 3 组件库
- ⚠️ 用于个人项目和学习使用，不建议用于生产环境

更新日志：[CHANGELOG.md](./CHANGELOG.md)

## 文档

进入 `docs` 目录，运行 `bun run dev:docs` 即可启动文档网站。

## 安装

```shell
bun add @canwdev/vgo-ui
```

## 使用

```ts
import { OptionUI, ViewPortWindow } from '@canwdev/vgo-ui'
import '@canwdev/vgo-ui/styles/core'
import '@canwdev/vgo-ui/themes/default'
```

`styles/core` 提供结构和工具类，`themes/default` 提供当前默认主题外观。请在 `body` 上挂载 `vgo-theme-default`；暗色模式同时在 `html` 上挂载 `dark`。组件类使用 `vgo-` 前缀 BEM，状态类使用 `is-*`，工具类使用 `vgo-u-*`。

样式基元是一份封闭的契约：按钮只有 `.vgo-button` 一个基类（5 个配色变体 + `--icon` / `--round` / `--sm` / `--lg` 修饰），面板只有 `.vgo-panel` 及 `--flat` / `--overlay` / `--overlay-light`，列表行只有 `.vgo-list-item`，另有 `.vgo-empty`、`.vgo-badge`、`.vgo-progress`。间距、字号、控件高度、层级和过渡时长全部走 `--vgo-*` 令牌，应用代码不应写字面量颜色、圆角或自定义阴影。完整清单见文档站的「样式总览」。

使用 **VueMonaco** 时需单独安装 `monaco-editor`，并从子路径导入（避免主包拉取 Monaco）：

```ts
import { VueMonaco } from '@canwdev/vgo-ui/vue-monaco'
```

## 本地开发（Link）

```shell
# 安装依赖
bun i

# 构建组件库
bun run build

# 在本包目录下执行 link
bun link

# 在使用该包的项目目录下执行
# rm -rf node_modules/@canwdev/vgo-ui
# rm -rf node_modules/.vite
bun link @canwdev/vgo-ui
```

## 打包发布

```shell
# 先修改 package.json 中的版本号
bun run build

# 可选：本地打包（不推荐）
# bun run bun:pack

# 发布到 npm
bun publish --access public
```
