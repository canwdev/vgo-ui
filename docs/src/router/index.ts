import { createRouter, createWebHistory } from 'vue-router'
import { docsRoutes } from './docs.ts'

export const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/changelog',
    component: () => import('../views/Changelog.vue'),
    meta: { title: '更新日志' },
  },
  {
    path: '/docs',
    component: () => import('../views/DocEntry.vue'),
    redirect: '/docs/install',
    children: docsRoutes,
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
