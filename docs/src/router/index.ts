import { createRouter, createWebHistory } from 'vue-router'
import { docsRoutes } from './docs.ts'

export const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/docs',
    component: () => import('../views/DocEntry.vue'),
    redirect: '/docs/install',
    children: docsRoutes,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
