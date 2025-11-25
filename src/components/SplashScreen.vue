<template>
  <div class="splash-screen">
    <div class="splash-content">
      <div class="logo-container">
        <div class="logo-circle"></div>
        <img src="/images/logo.png" alt="Logo de l'application" class="splash-logo" />
      </div>
    </div>
    <footer class="splash-footer">
      <img src="/images/musee-du-quai-branly.svg" alt="Musée du Quai Branly Jacques Chirac" class="museum-logo" />
    </footer>
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
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, #4fc3f7 0%, #1976d2 100%);
  z-index: 9999;
}

.splash-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-circle {
  position: absolute;
  width: 250px;
  height: 250px;
  background: white;
  border-radius: 50%;
  animation: fadeIn 0.5s ease-in;
}

.splash-logo {
  position: relative;
  width: 200px;
  height: 200px;
  object-fit: contain;
  z-index: 1;
  animation: fadeIn 0.5s ease-in;
}

.splash-footer {
  display: flex;
  justify-content: center;
  align-items: center;
}

.museum-logo {
  width: 100%;
  height: auto;
  object-fit: contain;
  animation: fadeIn 0.5s ease-in 0.2s both;
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
