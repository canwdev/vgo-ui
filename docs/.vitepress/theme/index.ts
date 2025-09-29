import DefaultTheme from 'vitepress/theme'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '../../../src/styles/base.scss'
import MyLayout from './MyLayout.vue'

export default {
  ...DefaultTheme,
  Layout: MyLayout,
  enhanceApp({app}) {
    app.use(ElementPlus)
  },
}
