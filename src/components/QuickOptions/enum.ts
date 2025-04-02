import {VNode} from 'vue'

export interface DynamicValueDisplayProps {
  text: string
  label: string
  formatFn?: (text: string) => string
}

export type QuickOptionItem = {
  label?: string
  // 是否为分割线
  split?: boolean
  // 搜索过滤用
  search?: string
  // 渲染内容为HTML
  html?: string
  // 如果传入，展示img为图标
  icon?: string
  iconClass?: string
  iconRender?: () => VNode
  // 渲染函数
  render?: () => VNode
  // 支持传入函数以动态渲染，函数支持直接返回vue3计算属性
  children?: QuickOptionItem[] | (() => QuickOptionItem[])
  // 传入此选项以启用 DynamicValueDisplay 组件
  dynamicProps?: DynamicValueDisplayProps
  disabled?: boolean
  props?: {
    // 点击的同时返回，传入数字表示要返回的层数
    isBack?: boolean | number
    onClick?: (event: MouseEvent) => void
    onContextmenu?: (event: MouseEvent) => void
    style?: Record<string, string>
    class?: string
  }
}
