import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './index.css'

// Initialize Firebase (imported for side effects)
import './firebaseConfig.js'

// Create Vue application
const app = createApp(App)

// Install Pinia for state management
app.use(createPinia())

// Install Vue Router
app.use(router)

// Mount the application
app.mount('#app')