import type { RouteRecordRaw } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import docsForm from '../views/docs/form.md?raw'
import docsInstall from '../views/docs/install.md?raw'
import docsOptionUI from '../views/docs/option-ui.md?raw'
import docsQuickOptions from '../views/docs/quick-options.md?raw'
import docsStyles from '../views/docs/styles.md?raw'
import docsTable from '../views/docs/table.md?raw'
import docsWindow from '../views/docs/window.md?raw'
import { injectScssBlocks } from './scss-blocks'

export const docsRoutes: RouteRecordRaw[] = [
  {
    path: 'install',
    component: () => import('../views/DocsDetail.vue'),
    meta: {
      title: '安装',
      content: docsInstall,
    },
  },
  {
    path: 'styles',
    meta: {
      title: '样式总览',
      content: injectScssBlocks(docsStyles),
    },
  },
  {
    path: 'form',
    meta: {
      title: 'AutoFormElPlus',
      content: docsForm,
      component: defineAsyncComponent(() => import('../../../src/components/AutoFormElPlus/DemoAutoFormElPlus.vue')),
    },
  },
  {
    path: 'table',
    meta: {
      title: 'AutoTableElPlus',
      content: docsTable,
      component: defineAsyncComponent(() => import('../../../src/components/AutoTableElPlus/DemoAutoTableElPlus.vue')),
    },
  },
  {
    path: 'option-ui',
    meta: {
      title: 'OptionUI',
      content: docsOptionUI,
      component: defineAsyncComponent(() => import('../../../src/components/OptionUI/DemoOptionUI.vue')),
    },
  },
  {
    path: 'quick-options',
    meta: {
      title: 'QuickOptions',
      content: docsQuickOptions,
    },
  },
  {
    path: 'window',
    meta: {
      title: 'ViewPortWindow',
      content: docsWindow,
      component: defineAsyncComponent(() => import('../../../src/components/ViewPortWindow/DemoViewPortWindow.vue')),
    },
  },
].map((i) => {
  return {
    component: () => import('../views/DocsDetail.vue'),
    ...i,
  }
})
