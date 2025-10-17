# Vgo UI

- 实用型 Vue 3 组件库
- ⚠️ 用于个人项目和学习使用，不建议用于生产环境

## 文档

进入 `docs` 目录，运行 `bun run dev:docs` 即可启动文档网站。

## Link to development

Run the following command to link the package to the local development environment.

```shell
# install dependencies
bun i

# in this folder
bun link

# in dev project folder
bun link @canwdev/vgo-ui
```

## Pack and Publish

```shell
# change package.json version first
bun run bun:pack

# publish to npm registry (注意修改版本号！)
bun publish --access public .\canwdev-vgo-ui-0.2.1.tgz
```
