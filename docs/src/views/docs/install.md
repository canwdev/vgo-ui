# 安装

## 安装 VgoUI 组件库

可以使用 `yarn` `npm` `pnpm` `bun` 等包管理工具安装依赖

```shell
bun i @canwdev/vgo-ui
```

## 引入样式

编辑项目的 `style.scss` 文件

```scss
@use "@canwdev/vgo-ui/src/styles/base" as *;

:root {
  // 主题颜色(R,G,B) 覆盖（可选）
  --vgo-primary-rgb: 83, 173, 228 !important;
}
```

## 主题

修改 `index.html`，在 `body` 添加类

```html
<!--亮色主题-->
<body class="vgo-theme-default">
</body>

<!--暗色主题（需要在 html 上添加 class="dark"）-->
<html class="dark">
  <body class="vgo-theme-default">
  </body>
</html>
```

可以参考 `src/styles/theme-default.scss` 编写自定义主题
