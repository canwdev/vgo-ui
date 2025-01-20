import {createRouter, createWebHashHistory} from 'vue-router'
import {formatSiteTitle} from './router-utils'
import DocLayout from '../components/DocLayout.vue'
import {pageRoutes} from './glob'

const history = createWebHashHistory()

const routes = [
  {
    path: '/',
    component: DocLayout,
    children: pageRoutes,
  },
]
const router = createRouter({history, routes})

router.beforeEach(async (to, from, next) => {
  return next()
})

router.afterEach((to) => {
  document.title = formatSiteTitle(to?.meta?.title as string)
})

export default router
