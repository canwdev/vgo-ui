# 样式总览

库的样式契约：令牌、原生元素增强、基元、工具类，一份封闭的词汇表。业务代码里的颜色、间距、按钮、面板、列表都从这里取，不要新建自定义类；页尾是禁止清单。

只需要加类名即可生效。样式加载与主题挂载方式见安装文档。

## 令牌

### 结构标尺

`:root` 上的结构标尺与主题无关，任何主题下取值都相同。间距、字号、图标尺寸、控件高度、层级和过渡时长都从这里取，不要写字面量。

<!-- @scss:core-tokens -->

### 主题语义变量

语义变量来自当前的 default 主题，定义在 `body.vgo-theme-default` 上。换主题时只有这一层变化。

<!-- @scss:theme-tokens -->

圆角是派生的：覆盖 `--vgo-radius` 一个值，`--vgo-radius-lg` 会跟着走。

暗色模式在 `html.dark body.vgo-theme-default` 上覆盖其中一部分：

<!-- @scss:theme-tokens-dark -->

### 覆盖库样式

主题选择器是 `body.vgo-theme-default .vgo-x`，特异度 (0,2,1)，比一个 Vue scoped 类（`.x[data-v-xxx]`，(0,2,0)）高一档，所以不是所有东西都能直接覆盖：

| 想改 | 怎么做 |
| --- | --- |
| 面板外观（圆角、边框、阴影、底色） | 直接写 scoped 类，能盖住——面板的主题规则包在 `:where()` 里 |
| 按钮、列表项等其余基元 | 优先用现成的变体 / 修饰；确实要改就多嵌一层父选择器 |
| 任何吃令牌的属性 | 在元素上重新声明那个令牌，绕开特异度 |

最后一条往往最省事，令牌是按元素解析的，不用比特异度也不用 `!important`：

```scss
// 让这个面板用胶囊圆角，两种写法都可以
.zoom-toolbar { border-radius: var(--vgo-radius-pill); }  // 面板可以直接写
.zoom-toolbar { --vgo-radius: var(--vgo-radius-pill); }   // 换令牌，连带子元素一起
```

## 按钮

一个基类 + 5 个配色变体 + 4 个修饰，正交组合。

```
.vgo-button                 默认按钮（边框 + 表面色）
.vgo-button--primary        主操作
.vgo-button--danger         危险操作
.vgo-button--text           无边框透明，hover 有底色
.vgo-button--overlay        浮在媒体之上，深色底浅字
.vgo-button--overlay-light  浮在媒体之上，浅色底深字

.vgo-button--icon           正方形图标按钮
.vgo-button--round          圆形（FAB、封面按钮）
.vgo-button--sm / --lg      尺寸，默认 md

.vgo-button.is-active       选中态（运行时状态，非变体）
```

### 配色变体

```html
<button class="vgo-button">Default</button>
<button class="vgo-button vgo-button--primary">Primary</button>
<button class="vgo-button vgo-button--danger">Danger</button>
<button class="vgo-button vgo-button--text">Text</button>

```

<div class="vgo-u-flex-wrap-center">
  <button class="vgo-button">Default</button>
  <button class="vgo-button vgo-button--primary">Primary</button>
  <button class="vgo-button vgo-button--danger">Danger</button>
  <button class="vgo-button vgo-button--text">Text</button>
  <button class="vgo-button" disabled>Disabled</button>
  <button class="vgo-button vgo-button--primary" disabled>Primary</button>
  <button class="vgo-button vgo-button--danger" disabled>Danger</button>
  <button class="vgo-button vgo-button--text" disabled>Text</button>
</div>

### 尺寸

三档高度对应 `--vgo-control-sm` / `-md` / `-lg`，数值见上面的令牌表。默认的 `--vgo-control-md` 适合独立按钮，**密集工具栏显式用 `--sm`**。

```html
<button class="vgo-button vgo-button--sm">Small</button>
<button class="vgo-button">Medium</button>
<button class="vgo-button vgo-button--lg">Large</button>

```

<div class="vgo-u-flex-wrap-center">
  <button class="vgo-button vgo-button--sm">Small</button>
  <button class="vgo-button">Medium</button>
  <button class="vgo-button vgo-button--lg">Large</button>
  <button class="vgo-button vgo-button--primary vgo-button--sm">Small</button>
  <button class="vgo-button vgo-button--primary">Medium</button>
  <button class="vgo-button vgo-button--primary vgo-button--lg">Large</button>
</div>

### 图标按钮与圆形按钮

`--icon` 是正方形，`--round` 是圆形，两者都跟随尺寸修饰。

```html
<button class="vgo-button vgo-button--icon"><span class="mdi mdi-cog"></span></button>
<button class="vgo-button vgo-button--text vgo-button--icon"><span class="mdi mdi-cog"></span></button>
<button class="vgo-button vgo-button--primary vgo-button--round"><span class="mdi mdi-plus"></span></button>

```

<div class="vgo-u-flex-wrap-center">
  <button class="vgo-button vgo-button--icon vgo-button--sm" title="sm"><span class="mdi mdi-cog"></span></button>
  <button class="vgo-button vgo-button--icon" title="md"><span class="mdi mdi-cog"></span></button>
  <button class="vgo-button vgo-button--icon vgo-button--lg" title="lg"><span class="mdi mdi-cog"></span></button>
  <button class="vgo-button vgo-button--text vgo-button--icon" title="text icon"><span class="mdi mdi-palette"></span></button>
  <button class="vgo-button vgo-button--text vgo-button--icon" title="text icon"><span class="mdi mdi-weather-night"></span></button>
  <button class="vgo-button vgo-button--danger vgo-button--icon" title="danger icon"><span class="mdi mdi-delete"></span></button>
  <button class="vgo-button vgo-button--round" title="round"><span class="mdi mdi-chevron-left"></span></button>
  <button class="vgo-button vgo-button--primary vgo-button--round vgo-button--lg" title="fab"><span class="mdi mdi-plus"></span></button>
</div>

工具栏里的小图标按钮用 `.vgo-button--text .vgo-button--icon .vgo-button--sm`；浮动操作按钮用 `.vgo-button--primary .vgo-button--round .vgo-button--lg`。

### 选中态：`is-active`

导航当前项、开关按下、筛选条件生效——这类**运行时状态**用 `.is-active`，和配色变体正交。不要为此新建变体类，也不要拿 `--primary` 当高亮用，那是"主操作"的语义。

```html
<button class="vgo-button vgo-button--text is-active">文档</button>
<a class="vgo-button vgo-button--text is-active" href="#">当前页</a>

```

<div class="vgo-u-flex-wrap-center">
  <button class="vgo-button is-active">Default</button>
  <button class="vgo-button vgo-button--text">未选中</button>
  <button class="vgo-button vgo-button--text is-active">已选中</button>
  <button class="vgo-button vgo-button--text vgo-button--icon is-active"><span class="mdi mdi-star"></span></button>
  <button class="vgo-button vgo-button--text vgo-button--sm is-active">.*</button>
  <button class="vgo-button vgo-button--text is-active" disabled>禁用 + 选中</button>
</div>

配 `vue-router` 时把状态类交给它产出：

```html
<router-link to="/docs" class="vgo-button vgo-button--text" active-class="is-active"> </router-link>
```

`.vgo-list-item`、`.vgo-rect-switch__item`、`.vgo-window` 用同一个 `.is-active` 约定。

### 按钮组

```html
<div class="vgo-button-group">
  <button class="vgo-button">Previous</button>
  <button class="vgo-button">Current</button>
  <button class="vgo-button">Next</button>
</div>

```

<div class="vgo-button-group">
  <button class="vgo-button">Previous</button>
  <button class="vgo-button">Current</button>
  <button class="vgo-button">Next</button>
</div>

## 输入框

`input` / `textarea` / `select` 共用 `.vgo-input`。

```html
<input type="text" class="vgo-input" placeholder="Input" />
<input type="text" class="vgo-input" disabled placeholder="Input" />
<textarea class="vgo-input" placeholder="Textarea"></textarea>
<select class="vgo-input">
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>

```

<div class="vgo-u-flex-wrap-center">
  <input type="text" class="vgo-input" placeholder="Input">
  <input type="text" class="vgo-input" disabled placeholder="Input">
  <textarea class="vgo-input" placeholder="Textarea"></textarea>
  <select class="vgo-input">
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
  </select>
</div>

## 面板

`.vgo-panel` 是浮起的卡片；`.vgo-panel--flat` 是贴边的工具栏 / 头部 / 底栏，去掉圆角、阴影和边框，只留表面色，分隔线由使用处按需要指定方向：

```html
<div class="vgo-panel">卡片：边框 + 圆角 + 阴影</div>
<div class="vgo-panel vgo-panel--flat" style="border-bottom: 1px solid var(--vgo-border)">工具栏</div>

```

<div class="vgo-u-flex-column" style="gap: 10px;">
  <div class="vgo-panel" style="padding: 16px;">卡片：边框 + 圆角 + 阴影</div>
  <div class="vgo-panel vgo-panel--flat" style="padding: 8px; display: flex; gap: 8px; align-items: center; border-bottom: 1px solid var(--vgo-border);">
    <button class="vgo-button vgo-button--text vgo-button--icon vgo-button--sm"><span class="mdi mdi-arrow-left"></span></button>
    <button class="vgo-button vgo-button--text vgo-button--icon vgo-button--sm"><span class="mdi mdi-arrow-right"></span></button>
    <button class="vgo-button vgo-button--text vgo-button--icon vgo-button--sm"><span class="mdi mdi-refresh"></span></button>
    <span style="flex: 1"></span>
    <button class="vgo-button vgo-button--sm">工具栏</button>
  </div>
</div>

需要纯色填充而不要边框时用工具类 `.vgo-u-surface`。

### 浮层：`--overlay` 与 `--overlay-light`

浮在图片 / 视频之上的工具栏和卡片用 `--overlay` 系列。**两套配色都不随亮 / 暗模式翻转**——底下是任意媒体，选哪套取决于媒体本身的明暗，不取决于应用主题：

- `--overlay`：半透明深色底 + 浅色文字，压在偏亮的画面上。
- `--overlay-light`：半透明浅色底 + 深色文字，压在偏暗的画面上。

模糊由这两个修饰统一管理，业务代码不要自己写 `backdrop-filter`。按钮有对应的 `.vgo-button--overlay` / `--overlay-light`，可与 `--text`、`--round`、`--icon`、尺寸修饰自由组合。

把 `--overlay-light` 挂在容器上，内部的 `--overlay` 子元素会继承同一套配色：

```html
<div class="vgo-panel vgo-panel--overlay">
  <button class="vgo-button vgo-button--overlay vgo-button--icon vgo-button--round">
    <span class="mdi mdi-minus"></span>
  </button>
  <button class="vgo-button vgo-button--overlay vgo-button--text">Dismiss</button>
</div>

```

<div style="background: linear-gradient(120deg, #35506b, #7a5c8e 50%, #b06b52); padding: 24px; border-radius: var(--vgo-radius); display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
  <div class="vgo-panel vgo-panel--overlay" style="padding: var(--vgo-space-1); display: flex; gap: 4px; align-items: center; border-radius: var(--vgo-radius-pill);">
    <button class="vgo-button vgo-button--overlay vgo-button--icon vgo-button--round vgo-button--sm"><span class="mdi mdi-minus"></span></button>
    <span style="min-width: 42px; text-align: center; font-size: var(--vgo-font-sm);">100%</span>
    <button class="vgo-button vgo-button--overlay vgo-button--icon vgo-button--round vgo-button--sm"><span class="mdi mdi-plus"></span></button>
  </div>
  <button class="vgo-button vgo-button--overlay vgo-button--icon vgo-button--round vgo-button--lg"><span class="mdi mdi-chevron-up"></span></button>
  <button class="vgo-button vgo-button--overlay">普通</button>
  <button class="vgo-button vgo-button--overlay vgo-button--text">次要</button>
  <button class="vgo-button vgo-button--overlay" disabled>禁用</button>
</div>

同样的组合换成浅色一套，压在偏暗的画面上：

<div style="background: linear-gradient(120deg, #101018, #2a1f33 50%, #3a2118); padding: 24px; margin-top: 10px; border-radius: var(--vgo-radius); display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
  <div class="vgo-panel vgo-panel--overlay-light" style="padding: var(--vgo-space-1); display: flex; gap: 4px; align-items: center; border-radius: var(--vgo-radius-pill);">
    <button class="vgo-button vgo-button--overlay vgo-button--icon vgo-button--round vgo-button--sm"><span class="mdi mdi-minus"></span></button>
    <span style="min-width: 42px; text-align: center; font-size: var(--vgo-font-sm);">100%</span>
    <button class="vgo-button vgo-button--overlay vgo-button--icon vgo-button--round vgo-button--sm"><span class="mdi mdi-plus"></span></button>
  </div>
  <button class="vgo-button vgo-button--overlay-light vgo-button--icon vgo-button--round vgo-button--lg"><span class="mdi mdi-chevron-up"></span></button>
  <button class="vgo-button vgo-button--overlay-light">普通</button>
  <button class="vgo-button vgo-button--overlay-light vgo-button--text">次要</button>
  <button class="vgo-button vgo-button--overlay-light" disabled>禁用</button>
</div>

上面这组里，缩放条只在**容器**上写了 `--overlay-light`，内部三个控件仍是 `--overlay`，靠继承拿到浅色令牌。

可用令牌：`--vgo-overlay-surface`、`--vgo-overlay-border`、`--vgo-overlay-blur`、`--vgo-overlay-text`、`--vgo-overlay-text-secondary`、`--vgo-overlay-control`（及 `-hover` / `-active`）。

浮层面板内部把 `--vgo-text`、`--vgo-text-secondary`、`--vgo-border`、`--vgo-hover` 重指向浮层令牌，所以嵌进去的 `.vgo-empty`、`.vgo-list-item` 自动就是浮层配色，不用各写一份覆盖：

```html
<div class="vgo-panel vgo-panel--overlay vgo-empty">
  <div class="vgo-empty__icon mdi mdi-image-off-outline"></div>
  <div class="vgo-empty__title">没有更多了</div>
  <div class="vgo-empty__desc">已经到底部</div>
</div>

```

<div style="background: linear-gradient(120deg, #35506b, #7a5c8e 50%, #b06b52); padding: 24px; border-radius: var(--vgo-radius);">
  <div class="vgo-panel vgo-panel--overlay vgo-empty">
    <div class="vgo-empty__icon mdi mdi-image-off-outline"></div>
    <div class="vgo-empty__title">没有更多了</div>
    <div class="vgo-empty__desc">已经到底部</div>
  </div>
</div>

## 列表项

一个类三种状态，用于所有表格行、网格项、播放列表项、导航链接。

```html
<div class="vgo-list-item">默认</div>
<div class="vgo-list-item is-active">选中</div>
<div class="vgo-list-item is-disabled">禁用</div>

```

<div class="vgo-panel" style="overflow: hidden;">
  <div class="vgo-list-item"><span class="mdi mdi-folder"></span> Documents</div>
  <div class="vgo-list-item is-active"><span class="mdi mdi-folder"></span> Pictures（选中）</div>
  <div class="vgo-list-item"><span class="mdi mdi-file"></span> readme.md</div>
  <div class="vgo-list-item is-disabled"><span class="mdi mdi-file-lock"></span> secret.key（禁用）</div>
</div>

## 空态

```html
<div class="vgo-empty">
  <div class="vgo-empty__icon mdi mdi-folder-open-outline"></div>
  <div class="vgo-empty__title">这里什么都没有</div>
  <div class="vgo-empty__desc">拖拽文件到此处上传</div>
</div>

```

<div class="vgo-panel">
  <div class="vgo-empty">
    <div class="vgo-empty__icon mdi mdi-folder-open-outline"></div>
    <div class="vgo-empty__title">这里什么都没有</div>
    <div class="vgo-empty__desc">拖拽文件到此处上传</div>
  </div>
</div>

## 进度条

细条状的进度 / 占用量指示，用于磁盘占用条、传输进度条这类横条。高度用 `--vgo-progress-height` 就地调：

```html
<div class="vgo-progress">
  <div class="vgo-progress__value" style="width: 45%"></div>
</div>
<div class="vgo-progress vgo-progress--success">…</div>
<div class="vgo-progress vgo-progress--danger">…</div>

```

<div class="vgo-u-flex-column" style="gap: 14px;">
  <div class="vgo-progress"><div class="vgo-progress__value" style="width: 45%"></div></div>
  <div class="vgo-progress vgo-progress--success" style="--vgo-progress-height: 3px;"><div class="vgo-progress__value" style="width: 72%"></div></div>
  <div class="vgo-progress vgo-progress--danger" style="--vgo-progress-height: 6px;"><div class="vgo-progress__value" style="width: 30%"></div></div>
</div>

## 徽章

```html
<span class="vgo-badge">12</span>
<span class="vgo-badge vgo-badge--primary vgo-badge--pill">New</span>
<span class="vgo-badge vgo-badge--danger vgo-badge--pill">3</span>

```

<div class="vgo-u-flex-wrap-center">
  <span class="vgo-badge">12</span>
  <span class="vgo-badge vgo-badge--pill">99+</span>
  <span class="vgo-badge vgo-badge--primary">New</span>
  <span class="vgo-badge vgo-badge--primary vgo-badge--pill">New</span>
  <span class="vgo-badge vgo-badge--danger vgo-badge--pill">3</span>
</div>

## 工具类

最简单的字体、布局与表面类，不附带多余样式。

```html
<div class="vgo-u-flex-column" style="gap: 10px">
  <div class="vgo-u-font-italic">vgo-u-font-italic</div>
  <div class="vgo-u-font-code">vgo-u-font-code</div>
  <div class="vgo-u-font-emoji">⚠️⚡✨✖️✅🕒📋🖼️🌏📂🛑❌</div>

  <div>
    <button class="vgo-u-button-reset">vgo-u-button-reset</button>
  </div>

  <div class="vgo-u-scrollbar" style="height: 100px; width: 100px; overflow: auto">
    <div style="height: 200px"></div>
  </div>

  <div class="vgo-u-flex-wrap-center">…</div>
  <div class="vgo-u-flex-row">…</div>
  <div class="vgo-u-surface">主题表面颜色填充</div>
</div>

```

<div class="vgo-u-flex-column" style="gap: 10px;">
<div class="vgo-u-font-italic">vgo-u-font-italic</div>
<div class="vgo-u-font-code">vgo-u-font-code</div>
<div class="vgo-u-font-emoji">⚠️⚡✨✖️✅🕒📋🖼️🌏📂🛑❌</div>

<div>
<button class="vgo-u-button-reset">vgo-u-button-reset</button>
</div>

<div class="vgo-u-scrollbar" style="height: 100px; width: 100px; overflow: auto">
<div style="height: 200px; background: linear-gradient(45deg, black, transparent)"></div>
</div>
<div class="vgo-u-flex-wrap-center">
    <div style="background-color: #6f42c1; color:white;">flex</div>
    <div style="background-color: #6f42c1; color:white; height: 50px;">flex</div>
    <div style="background-color: #6f42c1; color:white;">flex</div>
</div>
<div class="vgo-u-flex-row">
    <div style="background-color: #6f42c1; color:white;">flex</div>
    <div style="background-color: #6f42c1; color:white;">flex</div>
    <div style="background-color: #6f42c1; color:white;">flex</div>
</div>
<div class="vgo-u-surface">主题表面颜色填充</div>
</div>

### 图标字号

`.vgo-u-icon-sm` / `-md` / `-lg` 就是三条 `font-size`，**加在图标元素本身**，和 `mdi` 平级，所以换别的图标字体或 `<svg>` 一样能用。

按钮里的图标默认是 `--vgo-icon-md`（`--lg` 按钮为 `--vgo-icon-lg`），**尺寸修饰只改盒子不改图标**。这条默认值特异度为 0，直接加工具类即可覆盖：

```html
<button class="vgo-button vgo-button--icon vgo-button--sm">
  <span class="mdi mdi-reload vgo-u-icon-sm"></span>
</button>
<span class="mdi mdi-star vgo-u-icon-lg"></span>

```

<div class="vgo-u-flex-wrap-center">
  <button class="vgo-button vgo-button--icon vgo-button--sm"><span class="mdi mdi-reload vgo-u-icon-sm"></span></button>
  <button class="vgo-button vgo-button--icon vgo-button--sm"><span class="mdi mdi-reload"></span></button>
  <button class="vgo-button vgo-button--icon"><span class="mdi mdi-reload"></span></button>
  <button class="vgo-button vgo-button--icon"><span class="mdi mdi-reload vgo-u-icon-lg"></span></button>
  <button class="vgo-button vgo-button--icon vgo-button--lg"><span class="mdi mdi-reload"></span></button>
  <span class="mdi mdi-star vgo-u-icon-sm"></span>
  <span class="mdi mdi-star vgo-u-icon-md"></span>
  <span class="mdi mdi-star vgo-u-icon-lg"></span>
</div>

## 减少动态效果

系统的 `prefers-reduced-motion: reduce` 会把两个时长令牌压到 `0.01ms`，并对 `*` 兜底压住 `animation-duration` / `transition-duration`，一并覆盖 element-plus、播放器这类硬编码时长的第三方。

`html.reduce-motion` 是留给应用挂的持久化开关，做上述全部，外加去掉文字阴影与背景模糊（降低墨水屏刷新负担）。

## 禁止清单

应用代码里不允许出现下列写法：

| 禁止                         | 替代                                                                      |
| ---------------------------- | ------------------------------------------------------------------------- |
| 字面量 hex / rgb 颜色        | `--vgo-*` 颜色令牌                                                        |
| 字面量 `border-radius` 数值  | `--vgo-radius` / `--vgo-radius-lg` / `--vgo-radius-pill`                  |
| 自定义 `box-shadow`          | `var(--vgo-shadow)`，或不要阴影                                           |
| `backdrop-filter` / 玻璃拟态 | 实心 `--vgo-surface` / `--vgo-surface-raised`，浮在媒体上时用 `--overlay` |
| 渐变背景                     | 纯色令牌                                                                  |
| 硬编码间距、字号、控件高度   | `--vgo-space-*` / `--vgo-font-*` / `--vgo-control-*`                      |
| 自己拼半透明浮层配色         | `.vgo-panel--overlay` / `--overlay-light` 及对应按钮修饰                  |
| 自己写两三像素高的进度条     | `.vgo-progress`                                                           |
| 新建按钮 / 面板 / 列表类     | 本页的基元组合                                                            |
