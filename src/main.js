import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // เพิ่มบรรทัดนี้
import './style.css'


const app = createApp(App)
app.use(router) // เพิ่มบรรทัดนี้เพื่อใช้ router
app.mount('#app')
