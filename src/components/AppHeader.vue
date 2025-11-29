<template>
  <header class="app-header">
    <!-- Logo du musée à gauche -->
    <div class="museum-logo-container">
      <img src="/images/logo-musee-quai-branly.png" alt="Musée du Quai Branly Jacques Chirac" class="museum-logo" />
    </div>

    <!-- Logo de l'application au centre -->
    <div class="logo" @click="goHome" style="cursor: pointer;">
      <img src="/images/logo.png" alt="Logo Socles" class="logo-image" />
      <h1>SOCLES</h1>
    </div>

    <!-- Actions à droite -->
    <div class="header-actions">
      <button @click="$emit('open-qr-scanner')" class="icon-button qr-button" title="Scanner QR code">
        <img src="/qrcode.png" alt="Scanner QR code" />
      </button>
      <button @click="handleLogout" class="icon-button logout-button" title="Déconnexion">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="16 17 21 12 16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<script>
import { useRouter } from 'vue-router'
import { settingsDB } from '../services/db'

export default {
  name: 'AppHeader',
  emits: ['open-qr-scanner'],
  setup() {
    const router = useRouter()

    const goHome = () => {
      router.push({ name: 'Home' })
    }

    const handleLogout = async () => {
      await settingsDB.set('isAuthenticated', false)
      router.push({ name: 'Login' })
    }

    return {
      goHome,
      handleLogout
    }
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.museum-logo-container {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.museum-logo {
  height: 40px;
  object-fit: contain;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: #000;
  flex: 1;
  justify-content: center;
}

.logo-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.05em;
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex: 0 0 auto;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  background: #f3f4f6;
  color: var(--color-text);
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
  width: 40px;
  height: 40px;
}

.icon-button:hover {
  background: #e5e7eb;
}

.qr-button img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.logout-button svg {
  width: 20px;
  height: 20px;
}

/* Responsive Header */
@media (max-width: 768px) {
  .logo h1 {
    display: none;
  }

  .museum-logo {
    max-width: 100px;
  }

  .header-actions {
    gap: var(--spacing-xs);
  }
}
</style>
