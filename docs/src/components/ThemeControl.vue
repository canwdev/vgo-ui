<script lang="ts" setup>
import type { Component } from 'vue'
import type { ThemeMode } from '../hooks/use-site-theme'
import { computed } from 'vue'
import MdiMotionPauseOutline from '~icons/mdi/motion-pause-outline'
import MdiMotionPlayOutline from '~icons/mdi/motion-play-outline'
import MdiPalette from '~icons/mdi/palette'
import MdiThemeLightDark from '~icons/mdi/theme-light-dark'
import MdiWeatherNight from '~icons/mdi/weather-night'
import MdiWeatherSunny from '~icons/mdi/weather-sunny'
import { primaryColor, reduceMotion, themeMode } from '../hooks/use-site-theme'

const themeModes: { value: ThemeMode, label: string, icon: Component }[] = [
  { value: 'auto', label: '跟随系统', icon: MdiThemeLightDark },
  { value: 'light', label: '亮色', icon: MdiWeatherSunny },
  { value: 'dark', label: '暗色', icon: MdiWeatherNight },
]

const currentMode = computed(
  () => themeModes.find(item => item.value === themeMode.value) ?? themeModes[0],
)

function cycleThemeMode() {
  const index = themeModes.findIndex(item => item.value === themeMode.value)
  themeMode.value = themeModes[(index + 1) % themeModes.length].value
}

function toggleReduceMotion() {
  reduceMotion.value = !reduceMotion.value
}

const colorThemeOptions = [
  { label: 'Node.js Green', rgb: '76,175,80' },
  { label: 'Golang Blue', rgb: '83,173,228' },
  { label: 'JavaScript Yellow', rgb: '247,223,30' },
  { label: 'Python Gold', rgb: '255,193,7' },
  { label: 'Swift Coral', rgb: '255,112,67' },
  { label: 'Apple Pink', rgb: '255,45,85' },
  { label: 'Ruby Red', rgb: '198,40,40' },
  { label: 'Rust Brown', rgb: '121,85,72' },
  { label: 'Kotlin Indigo', rgb: '63,81,181' },
  { label: 'PHP Lavender', rgb: '149,117,205' },
  { label: 'Haskell Slate', rgb: '96,125,139' },
  { label: 'Dart Teal', rgb: '0,150,136' },
]

const selectedColor = computed(() => primaryColor.value)
const dotColor = computed(() => {
  if (selectedColor.value)
    return `rgb(${selectedColor.value})`
  return 'var(--vgo-primary)'
})

function selectPreset(rgb: string) {
  primaryColor.value = rgb
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result)
    return ''
  return `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}`
}

function selectCustomColor(value: string | null) {
  if (value)
    primaryColor.value = hexToRgb(value)
}
</script>

<template>
  <div class="vgo-u-flex-wrap-center">
    <button
      class="vgo-button vgo-button--text vgo-button--icon"
      :title="`外观：${currentMode.label}（点击切换）`"
      @click="cycleThemeMode"
    >
      <component :is="currentMode.icon" class="vgo-u-icon-md" />
    </button>

    <button
      class="vgo-button vgo-button--text vgo-button--icon"
      :class="{ 'is-active': reduceMotion }"
      :title="reduceMotion ? '动效：已减弱（点击恢复）' : '动效：正常（点击减弱）'"
      @click="toggleReduceMotion"
    >
      <component
        :is="reduceMotion ? MdiMotionPauseOutline : MdiMotionPlayOutline"
        class="vgo-u-icon-md"
      />
    </button>

    <ElPopover trigger="click" :width="240" placement="bottom-end">
      <div class="theme-panel">
        <div class="theme-swatches">
          <button
            v-for="item in colorThemeOptions"
            :key="item.rgb"
            class="vgo-button vgo-button--icon vgo-button--sm theme-swatch"
            :class="{ 'is-active': selectedColor === item.rgb }"
            :style="{ backgroundColor: `rgb(${item.rgb})` }"
            :title="item.label"
            @click="selectPreset(item.rgb)"
          />
        </div>
        <div class="theme-custom vgo-u-flex-wrap-center">
          <span>自定义</span>
          <ElColorPicker
            :predefine="colorThemeOptions.map(item => `rgb(${item.rgb})`)"
            @change="selectCustomColor"
          />
        </div>
      </div>
      <template #reference>
        <button class="vgo-button vgo-button--text vgo-button--icon" title="主题色">
          <MdiPalette class="vgo-u-icon-md" :style="{ color: dotColor }" />
        </button>
      </template>
    </ElPopover>
  </div>
</template>

<style lang="scss" scoped>
.theme-panel {
  display: flex;
  flex-direction: column;
  gap: var(--vgo-space-2);
}

.theme-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vgo-space-1);
}

// 色块底色只能来自数据，选中态借 .is-active 表达，不写自定义阴影
.theme-swatch.is-active {
  outline: 2px solid var(--vgo-primary);
  outline-offset: 1px;
}

.theme-custom {
  padding-top: var(--vgo-space-2);
  font-size: var(--vgo-font-sm);
  color: var(--vgo-text-secondary);
  border-top: 1px solid var(--vgo-border);
}
</style>
