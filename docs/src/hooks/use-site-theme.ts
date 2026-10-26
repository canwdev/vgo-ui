import { usePreferredDark, useStorage } from '@vueuse/core'
import { computed, watch } from 'vue'
import { syncPrimaryColor, useElementPlusTheme } from '../../../src/hooks/use-element-plus-theme'

export enum ThemeMode {
  Auto = 'auto',
  Light = 'light',
  Dark = 'dark',
}

// 与 file-lite 保持一致：同一主题色在亮色 / 暗色下各取一档，暗色模式用更浅的
// 一档保证对比度，而不是把同一个 RGB 直接铺在两种背景上。
export const colorThemeOptions = [
  { label: 'Red', rgb: { light: '229,57,53', dark: '239,83,80' } },
  { label: 'Pink', rgb: { light: '233,30,99', dark: '240,98,146' } },
  { label: 'Purple', rgb: { light: '156,39,176', dark: '206,147,216' } },
  { label: 'Deep Purple', rgb: { light: '103,58,183', dark: '179,157,219' } },
  { label: 'Indigo', rgb: { light: '63,81,181', dark: '159,168,218' } },
  { label: 'Blue', rgb: { light: '25,118,210', dark: '100,181,246' } },
  { label: 'Light Blue', rgb: { light: '3,169,244', dark: '79,195,247' } },
  { label: 'Cyan', rgb: { light: '0,188,212', dark: '77,208,225' } },
  { label: 'Teal', rgb: { light: '0,150,136', dark: '128,203,196' } },
  { label: 'Green', rgb: { light: '67,160,71', dark: '129,199,132' } },
  { label: 'Light Green', rgb: { light: '124,179,66', dark: '174,213,129' } },
  { label: 'Lime', rgb: { light: '192,202,51', dark: '220,231,117' } },
  { label: 'Yellow', rgb: { light: '255,214,0', dark: '255,235,59' } },
  { label: 'Amber', rgb: { light: '255,171,0', dark: '255,193,7' } },
  { label: 'Orange', rgb: { light: '230,81,0', dark: '255,183,77' } },
  { label: 'Deep Orange', rgb: { light: '191,54,12', dark: '255,138,101' } },
  { label: 'Brown', rgb: { light: '121,85,72', dark: '161,136,127' } },
  { label: 'Grey', rgb: { light: '117,117,117', dark: '189,189,189' } },
  { label: 'Blue Grey', rgb: { light: '96,125,139', dark: '144,164,174' } },
]

const { changeTheme } = useElementPlusTheme()

const preferredDark = usePreferredDark()

/** 选中的预设主题色名称；空表示沿用库默认色。 */
export const colorTheme = useStorage('vgo-color-theme', '')

/** 自定义颜色会覆盖预设；选预设时清空。 */
export const customColor = useStorage('vgo-custom-color', '')

export const themeMode = useStorage<ThemeMode>('vgo-theme-mode', ThemeMode.Auto)

export const isDark = computed(() =>
  themeMode.value === ThemeMode.Auto
    ? preferredDark.value
    : themeMode.value === ThemeMode.Dark,
)

export function resolveThemeRgb(label: string, dark: boolean) {
  const option = colorThemeOptions.find(item => item.label === label)
  if (!option)
    return ''
  return dark ? option.rgb.dark : option.rgb.light
}

export function setColorTheme(label: string) {
  customColor.value = ''
  colorTheme.value = label
}

export function setCustomColor(rgb: string) {
  customColor.value = rgb
}

export const primaryRgb = computed(() => {
  if (customColor.value)
    return customColor.value
  return resolveThemeRgb(colorTheme.value, isDark.value)
})

watch(
  [primaryRgb, isDark],
  ([rgb, dark]) => {
    // vgo-ui 的暗色令牌与右键菜单跟随 html.dark，所以只切这一个类。
    // 先切类再应用颜色：空主题会读取计算后的 --vgo-primary-rgb。
    document.documentElement.classList.toggle('dark', dark)
    syncPrimaryColor(rgb, changeTheme)
  },
  { immediate: true },
)

// 库把减少动效样式挂在 body.reduce-motion 上，这里只负责挂类
export const reduceMotion = useStorage('vgo-reduce-motion', false)

watch(
  () => reduceMotion.value,
  (reduced) => {
    document.body.classList.toggle('reduce-motion', reduced)
  },
  { immediate: true },
)
