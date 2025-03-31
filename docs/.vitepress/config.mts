import { defineConfig } from 'vitepress'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

function getSidebarItems(dir: string, basePath: string = ''): any[] {
  const items = []
  const files = readdirSync(dir)

  for (const file of files) {
    const fullPath = join(dir, file)
    const stat = statSync(fullPath)
    const relativePath = join(basePath, file).replace(/\\/g, '/')

    if (stat.isDirectory()) {
      // 将文件夹名转换为标题格式
      const text = file.charAt(0).toUpperCase() + file.slice(1)
      items.push({
        text,
        collapsed: false,
        items: getSidebarItems(fullPath, relativePath)
      })
    } else if (file.endsWith('.md') && file !== 'index.md') {
      // 将文件名转换为标题格式（移除.md后缀）
      const text = file.replace('.md', '').charAt(0).toUpperCase() + file.replace('.md', '').slice(1)
      items.push({
        text,
        link: `/components/${relativePath.replace('.md', '')}`
      })
    }
  }

  return items
}

const componentsDir = join(__dirname, '../components')


// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Vgo UI',
  description: 'Vgo UI Documentation Site',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/examples/' },
      { text: 'Components', link: '/components/' }
    ],

    sidebar: {
      '/examples/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Markdown Examples', link: '/examples/markdown-examples' },
            { text: 'Runtime API Examples', link: '/examples/api-examples' }
          ]
        },
      ],
      '/components/': [
        {
          text: 'Components',
          items: getSidebarItems(componentsDir)
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/canwdev/vgo-ui' },
      { icon: 'vitepress', link: 'https://vitepress.dev/reference/default-theme-config' }
    ]
  }
})