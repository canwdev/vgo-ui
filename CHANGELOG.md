# Changelog

## 0.4.0（破坏性样式重构）

样式层重写为「core 结构 + theme 外观」两层，并收敛出一份封闭的词汇表。词汇表见文档站的**「样式总览」**页，那是唯一参照。

### 破坏性变更（Breaking）

- **样式入口拆成两个**：删除 `@canwdev/vgo-ui/styles`，改为同时引入 `@canwdev/vgo-ui/styles/core` 与 `@canwdev/vgo-ui/themes/default`。core 是重置 / 结构 / 工具类，theme 只有令牌与外观。默认主题挂在 `body.vgo-theme-default`，暗色挂在 `html.dark`。
- **命名统一**：组件类 `vgo-` 前缀 BEM，状态类 `.is-*`，工具类 `.vgo-u-*`。迁移对照表见下。
- **删除 `FoldableSidebarLayout` 与 `TabLayout`** 及其样式。库、文档站、消费方三处零引用。分栏改用 Element Plus 的 `el-splitter`，标签页列表用 `.vgo-list-item` 组合。
- **`.vgo-button` 改为 `inline-flex`**，有默认高度（`--vgo-control-md`）和字号。此前只有 padding、高度由内容撑开，升级后按钮统一对齐到 `--vgo-control-sm` / `-md` / `-lg` 三档。
- `.vgo-option-item__subtitle` 由 `opacity: 0.6` 改为 `color: var(--vgo-text-secondary)`。

### 新增

- **令牌**。结构标尺（core，与主题无关）：`--vgo-space-1..4`、`--vgo-font-*`、`--vgo-icon-*`、`--vgo-control-*`、`--vgo-z-*`、`--vgo-duration-*`。派生圆角（主题层）：`--vgo-radius-lg`、`--vgo-radius-pill`，覆盖 `--vgo-radius` 即整套跟随。浮层配色：`--vgo-overlay-*`，不随亮暗翻转。
- **按钮**：`--text` / `--overlay` / `--overlay-light` 配色变体，`--icon` / `--round` / `--sm` / `--lg` 形状与尺寸修饰，两组正交组合；`.is-active` 表达运行时选中，与配色变体正交。
- **基元**：`.vgo-panel--flat`（贴边工具栏 / 头部 / 底栏）、`.vgo-panel--overlay` 与 `--overlay-light`（浮在图片视频上，模糊由库统一管理）、`.vgo-list-item`、`.vgo-empty`、`.vgo-badge`、`.vgo-progress`。
- **减少动态效果全部由库承担**。`html.reduce-motion`（应用挂的持久化开关）与系统 `prefers-reduced-motion` 都会压时长令牌，并对 `*` 兜底压住 `animation-duration` / `transition-duration`——令牌管不到 element-plus、播放器这类硬编码时长的第三方。前者比后者多做一步：去掉文字阴影与背景模糊，降低墨水屏刷新负担。消费方不必再自己写这套。
- **文档站新增「样式总览」页**，把原先的「CSS 样式」「原生 HTML 元素」两页并入，是令牌 / 基元 / 工具类 / 禁止清单的唯一参照。

### 变更

- **面板的主题外观改为零特异度默认值**（`:where(.vgo-panel)` 等）。此前使用方一个 scoped 类压不过 `body.vgo-theme-default .vgo-panel`，想把贴边头部补一条分隔线、或把浮层工具条改成胶囊圆角，只能多嵌一层父选择器或写 `!important`；现在直接写就生效。代价是面板修饰之间改由源码顺序决胜。按钮**不做**这个处理——它的变体之间本来就靠特异度分胜负。
- **浮层面板内部重指向 `--vgo-text` / `--vgo-text-secondary` / `--vgo-border` / `--vgo-hover`**。此前嵌在 `.vgo-panel--overlay` 里的 `.vgo-empty`、`.vgo-list-item` 会用主题正文色，亮色主题下是深色字压在半透明深色底上，看不清。
- 库内硬编码的过渡时长、`z-index`、图标字号全部改用令牌。
- `.vgo-list-item` 与 `.vgo-option-item__child.is-clickable` 共用同一份 hover 实现。
- 按钮内图标字号用 `:where()` 声明，特异度为 0，使用方加 `.vgo-u-icon-*` 即可覆盖。
- `<a class="vgo-button">` / `<a class="vgo-list-item">` 不再被浏览器加下划线、染成链接色。

### 类名迁移对照

| 旧 | 新 |
| --- | --- |
| `.font-italic` / `.font-code` / `.font-emoji` | `.vgo-u-font-*` |
| `.btn-no-style` | `.vgo-u-button-reset` |
| `.scrollbar-mini` | `.vgo-u-scrollbar` |
| `.flex-rows` / `.flex-cols` / `.flex-row-center-gap` | `.vgo-u-flex-row` / `.vgo-u-flex-column` / `.vgo-u-flex-wrap-center` |
| `.vgo-bg` | `.vgo-u-surface` |
| `.vgo-button.primary` | `.vgo-button--primary` |
| `.auto-form-el-plus` / `.auto-form-grid` / `.auto-form-actions` / `.auto-form-item` | `.vgo-auto-form` / `.vgo-auto-form__grid` / `.vgo-auto-form__actions` / `.vgo-auto-form-item` |
| `.auto-table-el-plus` / `.common-pagination-wrap` | `.vgo-auto-table` / `.vgo-list-pagination` |
| `.c-panel-item` / `.panel-header` / `.sub-item` / `.option-item-action` / `.rect-switch` | `.vgo-option-item` / `.vgo-option-item__header` / `.vgo-option-item__child` / `.vgo-option-action` / `.vgo-rect-switch` |
| `.vgo-window-content` / `-title-bar` / `-body` / `-controls` / `.draggable-window-resize` | `.vgo-window__content` / `__title-bar` / `__body` / `__controls` / `__resize-handle` |
| `.expanded` / `.clickable` / `.active` / `._maximized` / `._dragging` / `._active` | `.is-expanded` / `.is-clickable` / `.is-active` / `.is-maximized` / `.is-dragging` / `.is-active` |

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

- 发布产物改为 **预构建的 `dist/`**，不再建议从包内任意路径直接引用未导出的源码文件；入口请使用 `package.json` 的 `exports` 字段。此处记录的是 0.3.x 构建结构，当前产物以 0.4.0 条目为准。
- **样式（0.3.x 旧用法）**：当时使用单一编译样式；该入口已在 0.4.0 删除，请按上方两个新入口迁移。
- **Peer dependencies**：`element-plus`、`monaco-editor` 已列入 `peerDependencies`（在 `peerDependenciesMeta` 中可按需视为可选）；使用对应组件时请在项目中自行安装匹配版本。

### 新增

- 根目录 **Vite library 模式** 构建：`vite build` 输出 ESM + CJS，**`vite-plugin-dts`** 生成类型声明。
- **`src/index.ts`**：统一导出组件、组合式函数与类型；表单项配置接口因与组件 `AutoFormItem` 同名，在包入口以 **`AutoFormField`** 别名导出。
- **`package.json`（0.3.x）**：补充 `main` / `module` / `types` / `exports` / `files` 和当时的单一样式子路径；当前导出以 0.4.0 条目为准。
- 脚本：`build`、`typecheck`；`bun:pack` 在打包前执行构建。
- 开发依赖：`vite`、`@vitejs/plugin-vue`、`vite-plugin-dts`、`vue-tsc`、`@vue/tsconfig`、`sass-embedded`、`vue-router`（供类型与部分组件）、`ajv`（dts 工具链）等。

### 变更

- **`tsconfig.json`**：继承 `@vue/tsconfig/tsconfig.dom.json`，补充 `types`、`skipLibCheck` 等与 Vue 工程一致选项。
- **类型**：修正 `src` 内多处 TypeScript 与模板类型问题（含 OptionUI、QuickOptions、ViewPortWindow、VueMonaco、ListPagination 等）。
- **文档**：更新 `README.md` 与 `docs/src/views/docs/*` 安装与使用说明，对齐 npm 包用法。
- **ESLint**：升级至 **`@antfu/eslint-config` v8** + ESLint 10，`eslint.config.js` 采用 flat config 与 `type: 'lib'` 等推荐写法。

### 修复

- `env.d.ts` 与 `vite/client` 类型在根工程下可正确解析；`.vue` 模块解析与 `vue-tsc` 检查通过。
