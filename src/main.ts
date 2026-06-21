import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import router from '@/router'
import App from './App.vue'
import './style.css'

registerSW({ immediate: true })

createApp(App).use(router).mount('#app')
