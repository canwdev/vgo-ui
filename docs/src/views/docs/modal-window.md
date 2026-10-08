# ModalWindow

盖住页面的模态窗口。组件式用 `ModalWindow`，函数式用 `showModalWindow`。窗口本身是 `ViewPortWindow`，所以能拖动；它不贴边、不最小化，并被限制在视口内，超出的内容在窗口里滚动。

## 导入

```ts
import { ModalWindow, showModalWindow } from '@canwdev/vgo-ui'
```

## 组件

不传 `buttons` 时没有底部栏，按钮画在内容里。Esc 和 Tab 循环不用自己监听。

```vue
<script setup lang="ts">
import { ModalWindow } from '@canwdev/vgo-ui'
import { ref } from 'vue'

const visible = ref(false)
</script>

<template>
  <button class="vgo-button" @click="visible = true">
    打开
  </button>
  <ModalWindow v-model:visible="visible" title="提示">
    <p>自己画按钮。</p>
    <button class="vgo-button vgo-button--primary" @click="visible = false">
      知道了
    </button>
  </ModalWindow>
</template>
```

打开后默认聚焦窗口里的 `.vgo-button--primary`。没有主按钮时聚焦内容区域。`focusPrimary` 设为 `false` 则跳过主按钮，直接聚焦内容。

Tab 和 Shift+Tab 在窗口内循环，包括标题栏的关闭按钮、内容和底部按钮，不会跑到页面上。Esc 关闭最上层的模态窗口。关闭后焦点回到打开之前的元素。

### 属性

| 属性              | 默认值  | 说明                                                     |
| ----------------- | ------- | -------------------------------------------------------- |
| `v-model:visible` | —       | 是否显示                                                 |
| `title`           | —       | 标题。字符串，或 `(ctx) => VNode`。也可以用 `title` 插槽 |
| `buttons`         | —       | 底部按钮。不传或空数组则不显示底部                       |
| `closable`        | `true`  | 关闭按钮和 Esc                                           |
| `maskClosable`    | `true`  | 点击遮罩关闭                                             |
| `focusPrimary`    | `true`  | 打开后聚焦主按钮。没有主按钮时聚焦内容                   |
| `initWinOptions`  | 宽 420px，高随内容 | 初始尺寸。高度默认 `auto`，按内容撑开；超过视口时窗口被卡住，内容区滚动 |

其余属性透传给 `ViewPortWindow`，例如 `allowMaximum`、`allowResize`。贴边保持关闭。

默认插槽是内容，参数 `{ close }`。`title` 插槽替换标题。

## 函数式

`showModalWindow` 返回的 Promise 在关闭时兑现，上面还挂着 `close(value)`。

```ts
import { showModalWindow } from '@canwdev/vgo-ui'
import { h } from 'vue'

const result = await showModalWindow({
  title: '删除文件',
  content: () => h('p', '确定删除？'),
  buttons: [
    { label: '取消', value: undefined },
    {
      label: '删除',
      variant: 'primary',
      async onClick() {
        await removeFile()
        return { deleted: true }
      },
    },
  ],
})
```

`title` 和 `content` 可以是字符串，也可以是 `(ctx) => VNode`。渲染函数在窗口内部执行，读到的响应式数据会更新；`ctx.close(value)` 从内容里关闭。

### 选项

| 选项           | 默认值  | 说明                                                                          |
| -------------- | ------- | ----------------------------------------------------------------------------- |
| `title`        | —       | 标题。字符串，或 `(ctx) => VNode`                                             |
| `content`      | —       | 内容。字符串，或 `(ctx) => VNode`                                             |
| `buttons`      | —       | 不传则没有底部按钮，内容自己画                                                |
| `closable`     | `true`  | 关闭按钮和 Esc                                                                |
| `maskClosable` | `true`  | 点击遮罩关闭，Promise 得到 `undefined`                                        |
| `focusPrimary` | `true`  | 打开后聚焦主按钮                                                              |
| `windowProps`  | —       | 透传给 `ViewPortWindow`，如 `initWinOptions`、`allowMaximum`                  |
| `appContext`   | —       | 内容里的组件要用应用的插件或 `inject` 时传入。在 `setup` 里同步调用会自动带上 |

### 按钮

| 字段      | 说明                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ |
| `label`   | 按钮文字                                                                                   |
| `variant` | `'primary'`、`'danger'`、`'text'`。`primary` 是打开后默认聚焦的那个                        |
| `value`   | 显式给出时（包括 `undefined`），Promise 用这个值                                           |
| `onClick` | `(ctx) => 返回值`，可以是 async。没写 `value` 时，返回值就是结果；返回值也没有就用 `label` |

点击按钮后该按钮进入 `is-loading`，其余按钮禁用，然后等待 `onClick`。返回 `false` 或抛错时窗口保持打开，按钮恢复；抛错会 `console.error`。`ctx.close()` 已经关过的话，返回值被忽略。

关闭按钮、Esc、遮罩和 `handle.close()` 不传值时，Promise 得到 `undefined`。几个窗口可以同时开着，后开的叠在上面，Esc 和 Tab 只作用于最上面的。卸载发生在退场动画结束之后。

默认高度为 `auto`，窗口随内容撑开。比视口更大的宽高会被 `--vgo-space-4` 的边距卡住，内容在 `.vgo-modal-window__body` 里滚动。需要固定高度时通过 `initWinOptions.height` 传入。
