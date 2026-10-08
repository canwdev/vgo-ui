# AutoTableElPlus

用列配置生成 [Element Plus](https://element-plus.org/) 表格。未声明的属性和事件会传给内部的 `el-table`，例如 `row-key`、`stripe`、`row-click`。

使用前在应用里安装并注册 `element-plus`。

## 导入

```ts
import type { AutoTableColumn } from '@canwdev/vgo-ui'
import { AutoTableElPlus } from '@canwdev/vgo-ui'
```

## 使用

```vue
<script setup lang="ts">
import type { AutoTableColumn } from '@canwdev/vgo-ui'
import { AutoTableElPlus } from '@canwdev/vgo-ui'
import { h, ref } from 'vue'

const data = ref([
  { id: 1, name: 'Alpha' },
  { id: 2, name: 'Beta' },
])

const columns: AutoTableColumn[] = [
  { type: 'selection', label: '', width: 48 },
  { key: 'id', label: 'ID', width: 80 },
  {
    key: 'name',
    label: '名称',
    render: scope => h('span', scope.row.name),
  },
]

const selected = ref<unknown[]>([])
</script>

<template>
  <AutoTableElPlus
    :data="data"
    :columns="columns"
    row-key="id"
    @selection-change="rows => selected = rows"
  />
</template>
```

## 属性

| 属性 | 说明 |
| --- | --- |
| `columns` | 列配置 |
| `data` | 表格数据 |

### AutoTableColumn

| 字段 | 说明 |
| --- | --- |
| `key` | 行数据字段名，也是该列的 key |
| `label` | 表头文字 |
| `width` / `minWidth` | 列宽 |
| `type` | 传给 `el-table-column`，如 `selection`、`index`、`expand` |
| `fixed` | 固定列：`true`、`left`、`right` |
| `props` | 传给 `el-table-column` 的其他属性，如 `sortable`、`reserveSelection`、`align` |
| `formatter` | `(scope) => string`，返回值按 HTML 插入 |
| `render` | `(scope) => VNode`，自定义单元格。`scope` 含 `row`、`$index` |
| `headerRender` | `() => VNode`，自定义表头 |

`formatter` 与 `render` 可以同时存在，会都渲染出来。

## 事件

| 事件 | 说明 |
| --- | --- |
| `selectionChange` | 多选变化，参数为当前选中行 |

其余 `el-table` 事件按原名监听即可。

## 实例

| 成员 | 说明 |
| --- | --- |
| `tableRef` | 内部 `el-table` 实例，例如 `clearSelection()` |

## ListPagination

分页条。`updateRouter` 为 `true` 时，把 `pageSize`、`pageNum` 同步到当前路由的 query，刷新后会读回来。

```ts
import { ListPagination } from '@canwdev/vgo-ui'
```

```vue
<script setup lang="ts">
import { ListPagination } from '@canwdev/vgo-ui'
import { reactive } from 'vue'

const paginationData = reactive({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
})

function load() {
  // 用 paginationData.currentPage / pageSize 请求列表
}
</script>

<template>
  <ListPagination
    :pagination-data="paginationData"
    @page-init-ready="load"
    @current-change="load"
    @size-change="load"
  />
</template>
```

| 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `paginationData` | — | `{ currentPage, pageSize, totalItems }`，页码和每页条数会写回这个对象 |
| `updateRouter` | `true` | 是否与路由 query 同步 |
| `hideOnSinglePage` | `false` | 只有一页时隐藏 |
| `layout` | `total, sizes, prev, pager, next, jumper` | 传给 `el-pagination` 的布局 |
| `pageSizes` | `[5, 10, 20, 50, 100, 200, 500]` | 每页条数选项 |

| 事件 | 说明 |
| --- | --- |
| `pageInitReady` | 已从路由读完初始页码，可以开始请求 |
| `currentChange` | 页码变化，参数为新页码 |
| `sizeChange` | 每页条数变化，参数为新的条数。若当时停在最后一页，会把页码收到新的最后一页 |
