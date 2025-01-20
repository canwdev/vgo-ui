import DocPage from '../components/DocPage.vue'

const pages = import.meta.glob('../pages/**/*.ts', {
  eager: true,
  import: 'default',
})

export const pageRoutes = Object.entries(pages).map(([path, meta]) => {
  return {
    path: path.replace('../pages', '').replace('.ts', ''),
    component: meta.component || DocPage,
    meta: {
      title: meta.title,
    },
  }
})
