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
import '@canwdev/vgo-ui/styles'
```

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
