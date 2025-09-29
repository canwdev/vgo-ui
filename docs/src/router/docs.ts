import type { RouteRecordRaw } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import docsForm from '../views/docs/form.md?raw'
import docsHtml from '../views/docs/html.md?raw'
import docsInstall from '../views/docs/install.md?raw'
import docsOptionUI from '../views/docs/option-ui.md?raw'
import docsQuickOptions from '../views/docs/quick-options.md?raw'
import docsTable from '../views/docs/table.md?raw'
import docsWindow from '../views/docs/window.md?raw'

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
    path: 'html',
    meta: {
      title: '原生 HTML 元素',
      content: docsHtml,
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
      component: defineAsyncComponent(() => import('../../../src/components/QuickOptions/DemoQuickOptions.vue')),
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
