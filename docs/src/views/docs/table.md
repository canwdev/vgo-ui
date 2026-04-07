# AutoTableElPlus

基于 [Element Plus](https://element-plus.org/) `el-table` 封装的表格组件。

## 依赖

- `element-plus`

## 使用

```ts
import { AutoTableElPlus } from '@canwdev/vgo-ui'
import type { AutoTableColumn } from '@canwdev/vgo-ui'
```

通过 `columns` 传入列配置（`AutoTableColumn[]`），`data` 传入表格数据。支持自定义列显示等能力，详见类型 `AutoTableColumn`。

## ListPagination

分页条组件，可选与 `vue-router` 的 `query` 同步（`updateRouter` 为 `true` 时）。

使用 `ListPagination` 时请安装 `vue-router`，并在应用中使用 `createRouter` / `RouterView` 等标准用法。

```ts
import { ListPagination } from '@canwdev/vgo-ui'
```
