import {defineConfig} from 'vitepress'
// import {readdirSync, statSync} from 'fs'
// import {join} from 'path'

// function getSidebarItems(dir: string, basePath: string = ''): any[] {
//   const items = []
//   const files = readdirSync(dir)
//
//   for (const file of files) {
//     const fullPath = join(dir, file)
//     const stat = statSync(fullPath)
//     const relativePath = join(basePath, file).replace(/\\/g, '/')
//
//     if (stat.isDirectory()) {
//       // 将文件夹名转换为标题格式
//       const text = file.charAt(0).toUpperCase() + file.slice(1)
//       items.push({
//         text,
//         collapsed: false,
//         items: getSidebarItems(fullPath, relativePath),
//       })
//     } else if (file.endsWith('.md') && file !== 'index.md') {
//       // 将文件名转换为标题格式（移除.md后缀）
//       const text =
//         file.replace('.md', '').charAt(0).toUpperCase() + file.replace('.md', '').slice(1)
//       items.push({
//         text,
//         link: `/components/${relativePath.replace('.md', '')}`,
//       })
//     }
//   }
//
//   return items
// }
//
// const componentsDir = join(__dirname, '../components')

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Vgo UI',
  description: 'Vgo UI Documentation Site',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {text: '首页', link: '/'},
      {text: '文档', link: '/components/install'},
    ],

    sidebar: {
      '/components/': [
        {
          text: '入门',
          items: [{text: '安装', link: '/components/install'}],
        },
        {
          text: 'Auto 组件',
          items: [
            {text: '说明', link: '/components/auto/index'},
            {text: 'AutoFormElPlus', link: '/components/auto/form'},
            {text: 'AutoTableElPlus', link: '/components/auto/table'},
            {text: 'OptionUI', link: '/components/auto/option-ui'},
            {text: 'QuickOptions', link: '/components/auto/quick-options'},
          ],
        },
        {
          text: '实用组件',
          items: [{text: '原生 HTML 元素加样式', link: '/components/html'}],
        },
      ],
    },

    socialLinks: [{icon: 'github', link: 'https://github.com/canwdev/vgo-ui'}],
  },
  vite: {},
})
