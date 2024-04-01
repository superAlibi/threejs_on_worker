import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { PiniaInstance } from './store'

const app = createApp(App).use(PiniaInstance)
app.config.errorHandler = (e, _, info) => {
  console.error(e);
  console.error(info);
}
app.mount('#app')
