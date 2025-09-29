<script setup lang="ts">
import type { AutoTableColumn } from './types'
import { ref } from 'vue'
import VueRender from '../VueRender.vue'
import { useCustomColumns } from './use-custom-columns'

const props = withDefaults(defineProps<IAutoTableProps>(), {
  customizeColumnStorageKey: 'ate_hidden_column_keys',
})

defineEmits(['selectionChange'])

interface IAutoTableProps {
  columns: AutoTableColumn[]
  data: unknown
  customizeColumnStorageKey?: string
}
// 自定义表列
const {
  isShowColumnEdit,
  // hiddenColumnKeyMap,
  // tableColumnsOptions,
  filteredColumns,
  // handleUpdateCheck,
} = useCustomColumns(props)

const tableRef = ref()
defineExpose({
  tableRef,
})
</script>

<template>
  <el-table
    ref="tableRef"
    :data="data"
    class="auto-table-el-plus"
    v-bind="$attrs"
    @selection-change="(rows) => $emit('selectionChange', rows)"
  >
    <el-table-column
      v-for="item in filteredColumns"
      :key="item.key"
      :property="item.key"
      :label="item.label"
      :width="item.width"
      :min-width="item.minWidth"
      v-bind="item.props"
      :type="item.type"
      :fixed="item.fixed"
    >
      <template v-if="item.headerRender || item.isCustomizeColumn" #header>
        <template v-if="item.isCustomizeColumn">
          <el-button
            icon="ElIconOperation"
            size="small"
            text
            @click="isShowColumnEdit = true"
          />
        </template>
        <template v-if="item.headerRender">
          <VueRender :render-fn="item.headerRender" />
        </template>
      </template>
      <template v-if="item.formatter || item.render" #default="scope">
        <span v-if="item.formatter" v-html="item.formatter(scope)" />
        <template v-if="item.render">
          <VueRender :render-fn="item.render" :params="scope" />
        </template>
      </template>
    </el-table-column>
  </el-table>

  <!-- <el-dialog v-model="isShowColumnEdit" :title="'Custom Columns'" width="500px" top="5vh"> -->
  <!--  <el-checkbox -->
  <!--    v-for="vi in tableColumnsOptions" -->
  <!--    :key="vi.value" -->
  <!--    :label="vi.label" -->
  <!--    :value="vi.value" -->
  <!--    :model-value="!hiddenColumnKeyMap[vi.value]" -->
  <!--    @update:model-value="handleUpdateCheck(vi.value)" -->
  <!--  /> -->
  <!-- </el-dialog> -->
</template>

<style lang="scss">
.auto-table-el-plus {
  width: 100%;
}
</style>
