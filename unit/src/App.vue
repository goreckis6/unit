<template>
  <div id="app">
    <router-view :key="$route.fullPath" />
    <Footer />
  </div>
</template>

<script>
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Footer
  },
  watch: {
    '$route'(to, from) {
      // Force locale update when route changes
      if (to.meta && to.meta.locale && window.$i18n) {
        window.$i18n.locale = to.meta.locale
        document.documentElement.lang = to.meta.locale
      }
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

