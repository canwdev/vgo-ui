# Changelog

## 0.3.1（测试版，含破坏性调整）

### 破坏性变更（Breaking）

- **`VueMonaco` 不再从主入口 `@canwdev/vgo-ui` 导出**。请改为 `import { VueMonaco } from '@canwdev/vgo-ui/vue-monaco'`，并在项目中安装 `monaco-editor`。这样未使用编辑器的应用无需安装 Monaco。
- 新增 **`exports["./vue-monaco"]`** 子路径（ESM/CJS + 类型）。
- **移除 QuickOptions 模块**：已删除 `QuickOptions`、`QuickContextMenu`、`QuickMenuStrip`、`DropdownMenu` 组件及类型 `QuickOptionItem`、`DynamicValueDisplayProps` 的导出；文档站中对应页面已移除。若仍需类似能力，请从本包历史版本或源码自行迁移。

### 变更

- 从 **`peerDependencies` 中移除 `monaco-editor`**（仅 VueMonaco 使用者按需安装）。
- 构建为 **双入口**：`index` 与 `vue-monaco`；主包 JS 不再包含对 `monaco-editor` 的静态引用。

## 0.3.0

### 破坏性变更（Breaking）

- 发布产物改为 **预构建的 `dist/`**（`index.js` / `index.cjs` / `index.css` 及 `.d.ts`），不再建议从包内任意路径直接引用未导出的源码文件；入口请使用 `package.json` 的 `exports` 字段。
- **样式**：推荐在应用入口使用 `import '@canwdev/vgo-ui/styles'`（对应打包后的 `index.css`）。若仍需在 SCSS 中 `@use` 源码，可使用 `node_modules/@canwdev/vgo-ui/src/styles/...`（发布包仍包含 `src`）。
- **Peer dependencies**：`element-plus`、`monaco-editor` 已列入 `peerDependencies`（在 `peerDependenciesMeta` 中可按需视为可选）；使用对应组件时请在项目中自行安装匹配版本。

### 新增

- 根目录 **Vite library 模式** 构建：`vite build` 输出 ESM + CJS，**`vite-plugin-dts`** 生成类型声明。
- **`src/index.ts`**：统一导出组件、组合式函数与类型；表单项配置接口因与组件 `AutoFormItem` 同名，在包入口以 **`AutoFormField`** 别名导出。
- **`package.json`**：`main` / `module` / `types` / `exports` / `files`；子路径 **`@canwdev/vgo-ui/styles`** 指向编译后样式。
- 脚本：`build`、`typecheck`；`bun:pack` 在打包前执行构建。
- 开发依赖：`vite`、`@vitejs/plugin-vue`、`vite-plugin-dts`、`vue-tsc`、`@vue/tsconfig`、`sass-embedded`、`vue-router`（供类型与部分组件）、`ajv`（dts 工具链）等。

### 变更

- **`tsconfig.json`**：继承 `@vue/tsconfig/tsconfig.dom.json`，补充 `types`、`skipLibCheck` 等与 Vue 工程一致选项。
- **类型**：修正 `src` 内多处 TypeScript 与模板类型问题（含 OptionUI、QuickOptions、ViewPortWindow、VueMonaco、ListPagination 等）。
- **文档**：更新 `README.md` 与 `docs/src/views/docs/*` 安装与使用说明，对齐 npm 包用法。
- **ESLint**：升级至 **`@antfu/eslint-config` v8** + ESLint 10，`eslint.config.js` 采用 flat config 与 `type: 'lib'` 等推荐写法。

### 修复

- `env.d.ts` 与 `vite/client` 类型在根工程下可正确解析；`.vue` 模块解析与 `vue-tsc` 检查通过。
