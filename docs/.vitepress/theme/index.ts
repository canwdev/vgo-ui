import ElementPlus from 'element-plus'
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '../../../src/styles/base.scss'
// 引入lodash，防止vitepress出现样式问题
import 'lodash'

export default {
  ...DefaultTheme,
  Layout: MyLayout,
  enhanceApp({ app }) {
    app.use(ElementPlus)
  },
}
