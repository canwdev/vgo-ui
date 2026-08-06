import { usePreferredDark, useStorage } from '@vueuse/core'
import { computed, watch } from 'vue'
import { syncPrimaryColor, useElementPlusTheme } from '../../../src/hooks/use-element-plus-theme'

export type ThemeMode = 'auto' | 'light' | 'dark'

export const primaryColor = useStorage('vgo-primary-color', '')

const { changeTheme } = useElementPlusTheme()

const preferredDark = usePreferredDark()

export const themeMode = useStorage<ThemeMode>('vgo-theme-mode', 'auto')

export const isDark = computed(() =>
  themeMode.value === 'auto' ? preferredDark.value : themeMode.value === 'dark',
)

watch(
  isDark,
  (dark) => {
    document.documentElement.classList.toggle('dark', dark)
  },
  { immediate: true },
)

// 库把 --vgo-duration-* 挂在 html.reduce-motion 上，这里只负责挂类
export const reduceMotion = useStorage('vgo-reduce-motion', false)

watch(
  () => reduceMotion.value,
  (reduced) => {
    document.documentElement.classList.toggle('reduce-motion', reduced)
  },
  { immediate: true },
)

watch(
  () => primaryColor.value,
  (rgb) => {
    syncPrimaryColor(rgb, changeTheme)
  },
  { immediate: true },
)
