import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { PiniaInstance } from './store'

createApp(App).use(PiniaInstance).mount('#app')
