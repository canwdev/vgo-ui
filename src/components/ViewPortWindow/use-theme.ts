import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'

export interface IOption {
  label: string
  value: string
}

export const DEFAULT_THEME = 'vgo-theme-default'
const defaultThemeOptions = [
  {
    label: 'Default',
    value: DEFAULT_THEME,
  },
]

function addCssFile(filename) {
  const head = document.getElementsByTagName('head')[0]
  const links = document.getElementsByTagName('link')
  for (let i = 0; i < links.length; i++) {
    if (links[i].href === filename) {
      return // 如果已经存在相同的文件，则不添加
    }
  }
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.href = filename
  link.id = filename
  head.appendChild(link)
}

function removeCssFile(filename) {
  const links = document.getElementsByTagName('link')
  for (let i = 0; i < links.length; i++) {
    console.log(links[i].id, filename)
    if (links[i].id === filename) {
      links[i].remove()
      return
    }
  }
}

const useThemeState = createGlobalState(() => {
  const isInitialized = ref(false)
  const themeOptions = ref<IOption[]>([...defaultThemeOptions])
  return {
    isInitialized,
    themeOptions,
  }
})
export function useThemeOptions(baseUrl = './resources/themes-dist') {
  const { themeOptions, isInitialized } = useThemeState()

  const themes = ref<IOption[]>([])

  const loadThemes = async () => {
    if (isInitialized.value) {
      return
    }

    const res = await fetch(`${baseUrl}/index.json`)
    themes.value = await res.json()

    themes.value.forEach((item) => {
      addCssFile(`${baseUrl}/${item.value}.css`)
    })

    themeOptions.value = [...defaultThemeOptions, ...themes.value]

    isInitialized.value = true
  }

  const removeThemes = () => {
    themes.value.forEach((item) => {
      removeCssFile(`./themes-dist/${item.value}.css`)
    })
  }

  return {
    themeOptions,
    loadThemes,
    removeThemes,
  }
}
