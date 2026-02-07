import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './style.css'

// Import translation files
import en from './locales/en.json'
import pl from './locales/pl.json'
import sv from './locales/sv.json'
import de from './locales/de.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import nl from './locales/nl.json'
import pt from './locales/pt.json'
import vi from './locales/vi.json'
import tr from './locales/tr.json'
import ru from './locales/ru.json'
import fa from './locales/fa.json'
import th from './locales/th.json'
import ja from './locales/ja.json'
import zh from './locales/zh.json'

const i18n = createI18n({
  legacy: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    pl,
    sv,
    de,
    es,
    fr,
    it,
    nl,
    pt,
    vi,
    tr,
    ru,
    fa,
    th,
    ja,
    zh
  }
})

const app = createApp(App)

// Make i18n instance available for router guard
app.config.globalProperties.$i18n = i18n.global
window.$i18n = i18n.global

app.use(router)
app.use(i18n)
app.mount('#app')

