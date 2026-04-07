import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'

const entries = {
  index: resolve(__dirname, 'src/index.ts'),
  'vue-monaco': resolve(__dirname, 'src/vue-monaco.ts'),
}

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src'],
      outDir: 'dist',
      tsconfigPath: './tsconfig.json',
      compilerOptions: {
        declarationDir: 'dist',
        rootDir: 'src',
      },
    }),
  ],
  build: {
    lib: {
      entry: entries,
      name: 'VgoUI',
      fileName: (format, name) => {
        const ext = format === 'es' ? 'js' : 'cjs'
        return `${name}.${ext}`
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@vueuse/core', 'lodash-es', 'element-plus', 'monaco-editor'],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith('.css'))
            return 'index.css'
          return '[name][extname]'
        },
        globals: {
          'vue': 'Vue',
          '@vueuse/core': 'VueUse',
          'lodash-es': '_',
          'element-plus': 'ElementPlus',
          'monaco-editor': 'monaco',
        },
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
})
