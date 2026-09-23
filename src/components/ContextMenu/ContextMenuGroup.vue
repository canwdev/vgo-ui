<script lang="ts">
import type { PropType, Ref, SVGAttributes } from 'vue'
import type { MenuItemContext, MenuOptions } from './types'
import { defineComponent, h, inject, ref, toRefs } from 'vue'
import ContextMenuItem from './ContextMenuItem.vue'
import ContextSubMenu from './ContextSubMenu.vue'
import { removeObjectKey } from './utils'

/**
 * 分组菜单项：自身是一个菜单项，`#default` 插槽内容渲染为它的子菜单。
 */
export default defineComponent({
  name: 'ContextMenuGroup',
  props: {
    /** 是否禁用。 */
    disabled: { type: Boolean, default: false },
    /** 是否隐藏。 */
    hidden: { type: Boolean, default: false },
    /** 点击回调。 */
    clickHandler: { type: Function as PropType<() => void>, default: null },
    /** 菜单项文字。 */
    label: { type: String, default: '' },
    /** 菜单项图标。 */
    icon: { type: String, default: '' },
    /** 自定义图标字体类名。 */
    iconFontClass: { type: String, default: 'iconfont' },
    /** 是否勾选。 */
    checked: { type: Boolean, default: false },
    /** 快捷键显示文本。 */
    shortcut: { type: String, default: '' },
    /** svg symbol 图标名。 */
    svgIcon: { type: String, default: '' },
    /** svg 自定义属性。 */
    svgProps: { type: Object as PropType<SVGAttributes>, default: null },
    /** 是否为无图标项保留图标占位。 */
    preserveIconWidth: { type: Boolean, default: true },
    /** 是否显示右侧箭头。 */
    showRightArrow: { type: Boolean, default: false },
    /** 点击后是否关闭菜单。 */
    clickClose: { type: Boolean, default: true },
    /** 是否自动调整子菜单位置避免溢出。 */
    adjustSubMenuPosition: { type: Boolean, default: undefined },
    /** 子菜单最大高度。 */
    maxHeight: { type: [String, Number], default: 0 },
    /** 子菜单最大宽度。 */
    maxWidth: { type: [String, Number], default: 0 },
    /** 子菜单最小宽度。 */
    minWidth: { type: [String, Number], default: 0 },
  },
  setup(props, ctx) {
    const options = inject('globalOptions') as Ref<MenuOptions>
    const { adjustSubMenuPosition, maxWidth, minWidth, maxHeight } = toRefs(props)
    const adjustSubMenuPositionValue = typeof adjustSubMenuPosition.value !== 'undefined'
      ? adjustSubMenuPosition.value
      : options.value.adjustPosition

    const subMenuRef = ref()
    const itemRef = ref()

    ctx.expose({
      getSubMenuRef: () => subMenuRef.value,
      getMenuItemRef: () => itemRef.value,
    })

    return () => h(ContextMenuItem, {
      ...props,
      ref: itemRef,
      showRightArrow: true,
      hasChildren: ctx.slots.default !== undefined,
    }, ctx.slots.default
      ? {
          submenu: (data: { show: boolean, context: unknown }) => h(ContextSubMenu, {
            ref: subMenuRef,
            show: data.show,
            maxWidth: maxWidth.value,
            minWidth: minWidth.value,
            maxHeight: maxHeight.value as number,
            adjustPosition: adjustSubMenuPositionValue as boolean | undefined,
            parentMenuItemContext: data.context as MenuItemContext | null,
          }, {
            default: ctx.slots.default,
          }),
          ...removeObjectKey(ctx.slots as Record<string, unknown>, 'default'),
        }
      : ctx.slots)
  },
})
</script>
