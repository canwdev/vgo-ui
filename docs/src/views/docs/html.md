# 原生 HTML 元素样式增强

以下组件使用原生 html 元素，只需要加上 css 类名即可生效。
打开控制台检查元素，查看源码。

## 按钮 `.vgo-button`

```html
<button class="vgo-button">Button</button>
<button class="vgo-button primary">Button</button>
<button class="vgo-button" disabled>Disabled</button>
```

<div class="flex-row-center-gap">
  <button class="vgo-button">Button</button>
  <button class="vgo-button primary">Button</button>
  <button class="vgo-button" disabled>Disabled</button>
</div>

## 输入框 `.vgo-input`

```html
<input type="text" class="vgo-input" placeholder="Input">
<input type="text" class="vgo-input" disabled placeholder="Input">
<textarea class="vgo-input" placeholder="Textarea"></textarea>
<select class="vgo-input">
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

<div class="flex-row-center-gap">
  <input type="text" class="vgo-input" placeholder="Input">
  <input type="text" class="vgo-input" disabled placeholder="Input">
  <textarea class="vgo-input" placeholder="Textarea"></textarea>
  <select class="vgo-input">
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
  </select>
</div>

## 面板 `.vgo-panel` `.vgo-bg`

```html
<div class="vgo-panel" style="padding: 20px;">Panel</div> 
<div class="vgo-bg">背景颜色填充</div>
```

带边框和背景的面板，用于亮暗色主题背景覆盖：
<div class="vgo-panel" style="padding: 20px;">Panel</div> 

只有背景颜色填充，用于亮暗色主题背景覆盖：
<div class="vgo-bg">背景颜色填充</div>

