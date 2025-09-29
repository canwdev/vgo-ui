# CSS 样式

## 全局 CSS 变量

全局 CSS 变量定义了 VGO 组件的颜色和样式，你可以根据需要使用这些变量。

```css
:root {
  // 主色 RGB 值
  --vgo-primary-rgb: 37, 130, 146;
  // 主色
  --vgo-primary: rgb(var(--vgo-primary-rgb));
  // 主色透明度
  --vgo-primary-opacity: rgba(var(--vgo-primary-rgb), .25);

  // 边框颜色
  --vgo-color-border: rgba(91, 85, 85, 0.3);
  // 悬停颜色
  --vgo-color-hover: rgba(91, 85, 85, 0.1);
  // 圆角
  --vgo-radius: 4px;
}
```

使用：

```css
.test-style {
  color: var(--vgo-primary);
  border-radius: var(--vgo-radius);
  border: 1px solid var(--vgo-color-border);
}
```

<style >
.test-style {
  color: var(--vgo-primary);
  border-radius: var(--vgo-radius);
  border: 2px solid var(--vgo-color-border);
  padding: 10px;
  display: inline-block;
}
</style>
<div class="test-style">
  这是一个测试样式
</div>


## CSS 类

提供了最简单的 flex 布局类，不添加额外的样式。你可以根据需要添加其他样式。

```html
<div class="flex-cols" style="gap: 10px;">
    <div class="font-italic">font-italic</div>
    <div class="font-code">font-code</div>
    <div class="font-emoji">⚠️⚡✨✖️✅🕒📋🖼️🌏📂🛑❌</div>
        
    <div>
        <button class="btn-no-style">btn-no-style</button>
    </div>
    
    <div class="scrollbar-mini" style="height: 100px; width: 100px; overflow: auto">
        <div style="height: 200px; background: linear-gradient(45deg, black, transparent)"></div>
    </div>
      
    <div class="flex-row-center-gap">
        <div style="background-color: #6f42c1; color:white;">flex</div>
        <div style="background-color: #6f42c1; color:white; height: 50px;">flex</div>
        <div style="background-color: #6f42c1; color:white;">flex</div>
    </div>
      
    <div class="flex-rows">
        <div style="background-color: #6f42c1; color:white;">flex</div>
        <div style="background-color: #6f42c1; color:white;">flex</div>
        <div style="background-color: #6f42c1; color:white;">flex</div>
    </div>
</div>
```

<div class="flex-cols" style="gap: 10px;">
<div class="font-italic">font-italic</div>
<div class="font-code">font-code</div>
<div class="font-emoji">⚠️⚡✨✖️✅🕒📋🖼️🌏📂🛑❌</div>
    
<div>
<button class="btn-no-style">btn-no-style</button>
</div>

<div class="scrollbar-mini" style="height: 100px; width: 100px; overflow: auto">
<div style="height: 200px; background: linear-gradient(45deg, black, transparent)"></div>
</div>
<div class="flex-row-center-gap">
    <div style="background-color: #6f42c1; color:white;">flex</div>
    <div style="background-color: #6f42c1; color:white; height: 50px;">flex</div>
    <div style="background-color: #6f42c1; color:white;">flex</div>
</div>
<div class="flex-rows">
    <div style="background-color: #6f42c1; color:white;">flex</div>
    <div style="background-color: #6f42c1; color:white;">flex</div>
    <div style="background-color: #6f42c1; color:white;">flex</div>
</div>
</div>