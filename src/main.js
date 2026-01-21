import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './style.css'

// Import translation files
import en from './locales/en.json'

const i18n = createI18n({
  legacy: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en
  }
})

const app = createApp(App)

// Make i18n instance available for router guard
app.config.globalProperties.$i18n = i18n.global
window.$i18n = i18n.global

app.use(router)
app.use(i18n)
app.mount('#app')

