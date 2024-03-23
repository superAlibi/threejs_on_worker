import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { PiniaInstance } from './store'

const app=createApp(App).use(PiniaInstance)
app.config.errorHandler=(e,i)=>{
  console.error(e);
  
}
app.mount('#app')
