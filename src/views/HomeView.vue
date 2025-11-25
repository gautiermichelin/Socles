<template>
  <div class="home-view">
    <header class="app-header">
      <div class="logo" @click="goHome" style="cursor: pointer;">
        <img src="/images/logo.png" alt="Logo Socles" class="logo-image" />
        <h1>SOCLES</h1>
      </div>
      <div class="museum-name">
        <img src="/images/logo-musee-quai-branly.png" alt="Musée du Quai Branly Jacques Chirac" class="museum-logo" />
      </div>
      <div class="header-actions">
        <button @click="openQRScanner" class="qr-button">
          <img src="/qrcode.png" alt="QR code" />
          QR code
        </button>
        <button @click="handleLogout" class="logout-button">
          Déconnexion
        </button>
      </div>
    </header>

    <QRScanner
      v-if="showQRScanner"
      @scan="handleQRScan"
      @close="closeQRScanner"
    />

    <main class="home-content">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-overlay">
          <img src="/images/etoile.png" alt="Étoile" class="hero-star" />
        </div>
      </section>

      <!-- Search Bar -->
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Je cherche un socle, une expo, une caisse..."
          class="search-input"
        />
        <button @click="handleSearch" class="search-button">
          Chercher
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="addSocle" class="action-btn primary">
          Ajouter un socle
        </button>
        <button @click="addExposition" class="action-btn primary">
          Ajouter une exposition
        </button>
      </div>

      <!-- Recent Socles Section -->
      <section class="section">
        <h2 class="section-title">Derniers socles ajoutés</h2>

        <div class="carousel">
          <button @click="previousSocle" class="carousel-btn" :disabled="socleIndex === 0">
            ←
          </button>
          <div class="carousel-content">
            <div
              v-for="socle in visibleSocles"
              :key="socle.id"
              class="socle-card"
              @click="viewSocle(socle)"
            >
              <img :src="socle.imageUrl" :alt="socle.inventoryNumber" />
            </div>
          </div>
          <button @click="nextSocle" class="carousel-btn" :disabled="socleIndex >= recentSocles.length - 3">
            →
          </button>
        </div>

        <div class="section-actions">
          <button @click="viewAllSocles" class="section-action-btn">
            Voir tout
          </button>
          <button @click="addSocle" class="section-action-btn">
            Ajouter un socle
          </button>
        </div>
      </section>

      <!-- Add Caisse Section -->
      <section class="section caisse-section">
        <button @click="addCaisse" class="section-action-btn">
          Ajouter une caisse
        </button>
      </section>

      <!-- Exhibitions Section -->
      <section class="section">
        <h2 class="section-title">Parcourir les expositions</h2>
        <div class="expo-grid">
          <div
            v-for="expo in exhibitions"
            :key="expo.id"
            class="expo-card"
            @click="viewExpo(expo)"
          >
            <div class="expo-image-container">
              <img :src="expo.imageUrl" :alt="expo.shortTitle" class="expo-image" />
              <div class="expo-footer" :style="{ backgroundColor: getColorWithOpacity(expo.color) }">
                <span class="expo-title" :style="{ color: expo.color === '#ffffff' ? '#000000' : '#ffffff' }">{{ expo.shortTitle }}</span>
                <button class="expo-arrow" :style="{ color: expo.color === '#ffffff' ? '#000000' : '#ffffff' }">→</button>
              </div>
            </div>
          </div>
        </div>

        <div class="section-actions">
          <button @click="viewAllExpositions" class="section-action-btn secondary">
            Voir tout
          </button>
          <button @click="addExposition" class="section-action-btn">
            Ajouter une exposition
          </button>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <img src="/images/logo-musee-quai-branly.png" alt="Musée du Quai Branly Jacques Chirac" class="footer-logo" />
      <div class="footer-credit">
        Développé par <a href="https://www.ideesculture.com" target="_blank" rel="noopener noreferrer">IdéesCulture</a>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { expositionsDB, soclesDB, settingsDB } from '../services/db'
import QRScanner from '../components/QRScanner.vue'

export default {
  name: 'HomeView',
  components: {
    QRScanner
  },
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const showQRScanner = ref(false)
    const socleIndex = ref(0)

    // Recent socles from database
    const recentSocles = ref([])

    // Exhibitions from database
    const exhibitions = ref([])

    // Visible socles in carousel (show 3 at a time)
    const visibleSocles = computed(() => {
      return recentSocles.value.slice(socleIndex.value, socleIndex.value + 3)
    })

    // Carousel navigation
    const previousSocle = () => {
      if (socleIndex.value > 0) {
        socleIndex.value--
      }
    }

    const nextSocle = () => {
      if (socleIndex.value < recentSocles.value.length - 3) {
        socleIndex.value++
      }
    }

    // QR Scanner functions
    const openQRScanner = () => {
      showQRScanner.value = true
    }

    const closeQRScanner = () => {
      showQRScanner.value = false
    }

    const handleQRScan = async (scannedData) => {
      // Handle QR scan - search for socle
      searchQuery.value = scannedData
      handleSearch()
    }

    // Navigation functions
    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({ name: 'SoclesList', query: { search: searchQuery.value } })
      }
    }

    const addSocle = () => {
      router.push({ name: 'SocleCreate' })
    }

    const viewAllSocles = () => {
      router.push({ name: 'SoclesList' })
    }

    const addExposition = () => {
      router.push({ name: 'ExpositionCreate' })
    }

    const viewAllExpositions = () => {
      router.push({ name: 'ExpositionsList' })
    }

    const addCaisse = () => {
      // TODO: Navigate to caisse creation
      console.log('Add caisse')
    }

    const viewSocle = (socle) => {
      router.push({ name: 'SocleEdit', params: { id: socle.id } })
    }

    const viewExpo = (expo) => {
      router.push({ name: 'ExpositionEdit', params: { id: expo.id } })
    }

    const goHome = () => {
      router.push({ name: 'Home' })
    }

    const handleLogout = async () => {
      await settingsDB.set('isAuthenticated', false)
      router.push({ name: 'Login' })
    }

    // Convert hex color to rgba with opacity
    const getColorWithOpacity = (hexColor) => {
      if (!hexColor) return 'rgba(0, 0, 0, 0.6)'

      // Remove # if present
      const hex = hexColor.replace('#', '')

      // Parse hex to RGB
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)

      return `rgba(${r}, ${g}, ${b}, 0.6)`
    }

    // Load data from database on mount
    onMounted(async () => {
      const allExpositions = await expositionsDB.getAll()
      // Sort by most recent and take first 6
      exhibitions.value = allExpositions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6)

      const allSocles = await soclesDB.getAll()
      // Sort by most recent and take first 5
      recentSocles.value = allSocles
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    })

    return {
      searchQuery,
      showQRScanner,
      socleIndex,
      recentSocles,
      exhibitions,
      visibleSocles,
      previousSocle,
      nextSocle,
      openQRScanner,
      closeQRScanner,
      handleQRScan,
      handleSearch,
      addSocle,
      viewAllSocles,
      addExposition,
      viewAllExpositions,
      addCaisse,
      viewSocle,
      viewExpo,
      goHome,
      handleLogout,
      getColorWithOpacity
    }
  }
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Header Styles - Same as SoclesListView */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: #000;
  flex: 0 0 auto;
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

.museum-name {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.museum-logo {
  height: 40px;
  object-fit: contain;
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex: 0 0 auto;
}

.qr-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: #f3f4f6;
  color: var(--color-text);
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
}

.qr-button:hover {
  background: #e5e7eb;
}

.qr-button img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.logout-button {
  background: #f3f4f6;
  color: var(--color-text);
  border: 1px solid #e5e7eb;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
}

.logout-button:hover {
  background: #e5e7eb;
}

/* Responsive Header */
@media (max-width: 768px) {
  .logo h1 {
    display: none;
  }

  .museum-logo {
    max-width: 140px;
  }

  .header-actions {
    gap: var(--spacing-xs);
  }

  /* Hero Section Mobile */
  .hero-star {
    width: 50%;
  }

  /* Action Buttons Mobile */
  .action-buttons {
    flex-direction: row;
    gap: var(--spacing-sm);
  }

  .action-btn {
    flex: 1;
    font-size: 0.9rem;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  /* Carousel Mobile */
  .carousel-content {
    gap: var(--spacing-sm);
    overflow-x: auto;
  }

  .socle-card {
    width: calc(50% - var(--spacing-sm) / 2);
    min-width: 140px;
    flex-shrink: 0;
  }

  .socle-card img {
    height: 150px;
  }
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 400px;
  background-image: url('/images/fond-hero-box.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  z-index: 0;
}

.hero-overlay {
  text-align: center;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  position: relative;
}

.hero-star {
  width: 100%;
  height: auto;
}

.hero-title {
  max-width: 400px;
  height: auto;
}

/* Search Container */
.search-container {
  max-width: 800px;
  margin: -30px auto 0;
  padding: 0 var(--spacing-xl);
  position: relative;
  z-index: 2;
  display: flex;
  gap: var(--spacing-md);
}

.search-input {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 1rem;
  border: none;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-button {
  padding: var(--spacing-md) var(--spacing-xl);
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.search-button:hover {
  background: #2563eb;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  flex-wrap: nowrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Main Content */
.home-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* Section Styles */
.section {
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--spacing-sm);
  color: #1f2937;
}

.section-subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: var(--spacing-xl);
}

/* Carousel */
.carousel {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.carousel-content {
  display: flex;
  gap: var(--spacing-lg);
  flex: 1;
  justify-content: center;
}

.carousel-btn {
  background: white;
  border: 2px solid #e5e7eb;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.carousel-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #3b82f6;
}

.carousel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.socle-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 200px;
}

.socle-card:hover {
  transform: translateY(-4px);
}

.socle-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

/* Caisse Section */
.caisse-section {
  background: #e5e7eb;
  border-radius: var(--radius-xl);
  text-align: center;
  padding: var(--spacing-xl);
}

/* Exhibitions Grid */
.expo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.expo-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.expo-card:hover {
  transform: translateY(-4px);
}

.expo-image-container {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.expo-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}

.expo-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  backdrop-filter: blur(4px);
}

.expo-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.expo-arrow {
  background: transparent;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.expo-arrow:hover {
  opacity: 0.8;
}

/* Section Actions */
.section-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

/* Section Action Button */
.section-action-btn {
  padding: var(--spacing-md) var(--spacing-xl);
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.section-action-btn:hover {
  background: #2563eb;
}

.section-action-btn.secondary {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.section-action-btn.secondary:hover {
  background: #eff6ff;
}

/* Footer */
.app-footer {
  background: white;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  border-top: 1px solid #e5e7eb;
}

.footer-logo {
  height: 40px;
  object-fit: contain;
}

.footer-credit {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.footer-credit a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.footer-credit a:hover {
  text-decoration: underline;
}
</style>
