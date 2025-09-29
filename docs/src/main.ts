import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './style.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '../../src/styles/base.scss'

createApp(App).use(router).mount('#app')
