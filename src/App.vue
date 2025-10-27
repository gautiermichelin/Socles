<template>
  <div>
    <SplashScreen v-if="showSplash" />
    <router-view v-else />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import SplashScreen from './components/SplashScreen.vue'

export default {
  name: 'App',
  components: {
    SplashScreen
  },
  setup() {
    const showSplash = ref(true)

    onMounted(() => {
      // Hide splash screen after 2.5 seconds
      setTimeout(() => {
        showSplash.value = false
      }, 2500)
    })

    return {
      showSplash
    }
  }
}
</script>

<style>
/* Global styles are in style.css */
</style>
