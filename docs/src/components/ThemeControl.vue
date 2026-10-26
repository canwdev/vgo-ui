<script lang="ts" setup>
import type { Component } from 'vue'
import { computed } from 'vue'
import MdiMotionPauseOutline from '~icons/mdi/motion-pause-outline'
import MdiMotionPlayOutline from '~icons/mdi/motion-play-outline'
import MdiPalette from '~icons/mdi/palette'
import MdiThemeLightDark from '~icons/mdi/theme-light-dark'
import MdiWeatherNight from '~icons/mdi/weather-night'
import MdiWeatherSunny from '~icons/mdi/weather-sunny'
import {
  colorTheme,
  colorThemeOptions,
  customColor,
  isDark,
  primaryRgb,
  reduceMotion,
  setColorTheme,
  setCustomColor,
  ThemeMode,
  themeMode,
} from '../hooks/use-site-theme'

const themeModes: { value: ThemeMode, label: string, icon: Component }[] = [
  { value: ThemeMode.Auto, label: '跟随系统', icon: MdiThemeLightDark },
  { value: ThemeMode.Light, label: '亮色', icon: MdiWeatherSunny },
  { value: ThemeMode.Dark, label: '暗色', icon: MdiWeatherNight },
]

const currentMode = computed(
  () => themeModes.find(item => item.value === themeMode.value) ?? themeModes[0],
)

function cycleThemeMode() {
  const index = themeModes.findIndex(item => item.value === themeMode.value)
  themeMode.value = themeModes[(index + 1) % themeModes.length].value
}

function setReduceMotion(value: string | number | boolean) {
  reduceMotion.value = Boolean(value)
}

const selectedLabel = computed(() => customColor.value ? '' : colorTheme.value)

const dotColor = computed(() => {
  if (primaryRgb.value)
    return `rgb(${primaryRgb.value})`
  return 'var(--vgo-primary)'
})

// 色块展示当前明暗模式下实际会应用的那一档颜色
function swatchRgb(item: (typeof colorThemeOptions)[number]) {
  return isDark.value ? item.rgb.dark : item.rgb.light
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result)
    return ''
  return `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}`
}

function selectCustomColor(value: string | null) {
  if (value)
    setCustomColor(hexToRgb(value))
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

    <ElPopover trigger="click" :width="240" placement="bottom-end">
      <div class="theme-panel">
        <div class="theme-swatches">
          <button
            v-for="item in colorThemeOptions"
            :key="item.label"
            class="vgo-button vgo-button--icon vgo-button--sm theme-swatch"
            :class="{ 'is-active': selectedLabel === item.label }"
            :style="{ backgroundColor: `rgb(${swatchRgb(item)})` }"
            :title="item.label"
            @click="setColorTheme(item.label)"
          />
        </div>
        <div class="theme-custom vgo-u-flex-wrap-center">
          <span>自定义</span>
          <ElColorPicker
            :predefine="colorThemeOptions.map(item => `rgb(${swatchRgb(item)})`)"
            @change="selectCustomColor"
          />
        </div>
        <div
          class="theme-motion"
          :title="reduceMotion ? '动效：已减弱（点击恢复）' : '动效：正常（点击减弱）'"
        >
          <span>动效</span>
          <ElSwitch
            :model-value="reduceMotion"
            :active-icon="MdiMotionPauseOutline"
            :inactive-icon="MdiMotionPlayOutline"
            inline-prompt
            @update:model-value="setReduceMotion"
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

.theme-motion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--vgo-space-2);
  padding-top: var(--vgo-space-2);
  font-size: var(--vgo-font-sm);
  color: var(--vgo-text-secondary);
  border-top: 1px solid var(--vgo-border);
}
</style>
