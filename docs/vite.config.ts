import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootPkg = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf-8'),
) as { version: string }

// GitHub Pages 项目站点为 /<repo>/，CI 中设置 VITE_BASE_PATH（见 .github/workflows）
const base = process.env.VITE_BASE_PATH?.replace(/\/?$/, '/') || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  define: {
    __VGO_UI_PKG_VERSION__: JSON.stringify(rootPkg.version),
  },
  plugins: [vue(), AutoImport({
    resolvers: [ElementPlusResolver()],
  }), Components({
    resolvers: [ElementPlusResolver()],
  })],

})
