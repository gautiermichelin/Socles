<template>
  <div>
    <SplashScreen v-if="showSplash" />
    <router-view v-else />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import SplashScreen from './components/SplashScreen.vue'

export default {
  name: 'App',
  components: {
    SplashScreen
  },
  setup() {
    const route = useRoute()

    const isEmbedded = computed(() => {
      try {
        return route && route.query && route.query.embedded === '1'
      } catch (e) {
        // fallback: detect if running inside an iframe
        return typeof window !== 'undefined' && window.self !== window.top
      }
    })

    // Local flag that will auto-hide after timeout when not embedded
    const localSplashVisible = ref(true)

    onMounted(() => {
      // If embedded (iframe/modal) immediately hide splash
      if (isEmbedded.value) {
        localSplashVisible.value = false
        return
      }

      // Otherwise auto-hide after 2.5s
      setTimeout(() => {
        localSplashVisible.value = false
      }, 2500)
    })

    // Show splash only when NOT embedded and local timer hasn't expired
    const showSplash = computed(() => !isEmbedded.value && localSplashVisible.value)

    return {
      showSplash
    }
  }
}
</script>

<style>
/* Global styles are in style.css */
</style>
