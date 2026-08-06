import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './style.css'
import '@mdi/font/css/materialdesignicons.min.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '../../src/styles/core.scss'
import '../../src/styles/themes/default/index.scss'

createApp(App).use(router).mount('#app')
