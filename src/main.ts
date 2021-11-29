import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// creating the Vue instance
const app = createApp(App)

// adding the ElementPlus plugin
app.use(ElementPlus)

// loading the app into the div#app
app.mount('#app')
