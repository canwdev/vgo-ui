<script lang="ts" setup>
import DefaultTheme from 'vitepress/theme'
import {onMounted} from 'vue'

const {Layout} = DefaultTheme
onMounted(() => {
  const body = document.body
  body.classList.add('vgo-theme-default')

  const style = document.createElement('style')
  style.textContent = `
    :root {
      --primary-rgb: 83, 173, 228;
    }
  `
  document.head.appendChild(style)
})
</script>

<template>
  <ClientOnly>
    <Layout> </Layout>
  </ClientOnly>
</template>
