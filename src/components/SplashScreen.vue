<template>
  <div class="splash-screen">
    <img src="/logo_application.png" alt="Logo de l'application" class="splash-logo" />
  </div>
</template>

<script>
export default {
  name: 'SplashScreen'
}
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #4fc3f7 0%, #1976d2 100%);
  z-index: 9999;
}

.splash-logo {
  width: 500px;
  height: 500px;
  object-fit: contain;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
