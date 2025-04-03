import {FormRules} from 'element-plus'
import {VNode} from 'vue'

export interface IOptionItem {
  value: string | number | boolean | null | undefined
  label: string
}

export enum AutoFormItemType {
  INPUT = 'input',
  INPUT_NUMBER = 'input_number',
  INPUT_AUTOCOMPLETE = 'input_autocomplete',
  SELECT = 'select',
  COLOR_PICKER = 'color_picker',
  BUTTON = 'button',
  DATE_PICKER = 'date_picker',
  CHECKBOX_GROUP = 'checkbox_group',
  RADIO_GROUP = 'radio_group',
  SWITCH = 'switch',
  // 需要哪些类型请自行实现
}

export type AutoFormItem = {
  key: string
  label?: string
  // 表单控件类型
  type?: AutoFormItemType
  placeholder?: string
  // 表单控件的属性
  props?: unknown
  // 当前FormItem的规则
  rules?: FormRules
  formItemProps?: unknown
  // SELECT下拉选项
  options?: IOptionItem[]
  // 渲染函数 h('div', {}, null)
  render?: () => VNode
  renderLabel?: () => VNode
  selectOptionRender?: () => VNode
  // 按钮的点击执行函数
  clickHandler?: (event: MouseEvent) => void
  // 类名
  cls?: unknown
  // form-item 样式覆盖
  style?: unknown
  disabled?: boolean
  width?: string
}

// 自定义列数
export type AutoFormRow = {
  cols: number
  children: AutoFormItem[]
}

export type MixedFormItems = (AutoFormRow | AutoFormItem)[] | AutoFormItem | AutoFormRow

// 表单架构
export type AutoFormSchema = {
  formItems: MixedFormItems[]
  model: unknown
  rules?: FormRules
  props?: unknown
  labelWidth?: string
  labelPosition?: string
}
