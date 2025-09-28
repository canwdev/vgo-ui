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
  // 主题颜色(R,G,B) 可以根据需要自定义
  --primary-rgb: 83, 173, 228;
}
```

## 主题

修改 `index.html`，在 `body` 添加类

```html
<!--亮色主题-->
<body class="vgo-theme-default">
</body>

<!--暗色主题-->
<body class="vgo-theme-default dark">
</body>
```

## 在项目中使用组件

在侧边栏的组件列表中，找到需要使用的组件，点击链接即可跳转到组件的文档页面。
