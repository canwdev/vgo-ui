import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const entries = {
  'index': resolve(__dirname, 'src/index.ts'),
  'vue-monaco': resolve(__dirname, 'src/vue-monaco.ts'),
}

export default defineConfig(({ mode }) => ({
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
      cssFileName: 'styles/core',
      fileName: (format, name) => {
        const ext = format === 'es' ? 'js' : 'cjs'
        return `${name}.${ext}`
      },
      formats: ['es', 'cjs'],
    },
    emptyOutDir: mode !== 'development',
    rollupOptions: {
      external: ['vue', '@vueuse/core', 'lodash-es', 'element-plus', 'monaco-editor'],
      output: {
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
  },
}))
