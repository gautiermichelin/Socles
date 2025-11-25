<template>
  <div class="expositions-list-view">
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

    <div class="container">
      <div class="list-header">
        <h2>Gestion des expositions</h2>
        <button @click="goToCreate" class="secondary add-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Nouvelle exposition
        </button>
      </div>

      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par titre, lieu..."
        />
      </div>

      <div v-if="loading" class="loading">
        Chargement...
      </div>

      <div v-else-if="filteredExpositions.length === 0" class="empty-state">
        <p v-if="searchQuery">Aucune exposition ne correspond à votre recherche.</p>
        <p v-else>Aucune exposition enregistrée. Créez votre première exposition !</p>
      </div>

      <div v-else class="expositions-grid">
        <div
          v-for="expo in filteredExpositions"
          :key="expo.id"
          class="expo-card"
          @click="goToEdit(expo.id)"
        >
          <div class="expo-image-container">
            <img v-if="expo.imageUrl" :src="expo.imageUrl" :alt="expo.shortTitle" class="expo-image" />
            <div v-else class="expo-placeholder" :style="{ backgroundColor: expo.color || '#3b82f6' }">
              {{ expo.shortTitle.charAt(0).toUpperCase() }}
            </div>
            <div class="expo-overlay">
              <h3>{{ expo.shortTitle }}</h3>
              <p v-if="expo.longTitle" class="expo-subtitle">{{ expo.longTitle }}</p>
            </div>
          </div>

          <div class="card-body">
            <div class="card-field" v-if="expo.startDate || expo.endDate">
              <strong>Date:</strong> {{ formatDateRange(expo.startDate, expo.endDate) }}
            </div>
            <div class="card-field" v-if="expo.location">
              <strong>Lieu:</strong> {{ expo.location }}
            </div>
          </div>

          <div class="card-footer">
            <span class="date">{{ formatDate(expo.updatedAt) }}</span>
            <button @click.stop="deleteExposition(expo.id)" class="delete-button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

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
import { expositionsDB, settingsDB } from '../services/db'

export default {
  name: 'ExpositionsListView',
  setup() {
    const router = useRouter()
    const expositions = ref([])
    const searchQuery = ref('')
    const loading = ref(true)

    // Load expositions from database
    const loadExpositions = async () => {
      loading.value = true
      try {
        expositions.value = await expositionsDB.getAll()
        expositions.value.sort((a, b) =>
          new Date(b.updatedAt) - new Date(a.updatedAt)
        )
      } catch (error) {
        console.error('Error loading expositions:', error)
      } finally {
        loading.value = false
      }
    }

    // Filter expositions based on search query
    const filteredExpositions = computed(() => {
      if (!searchQuery.value) {
        return expositions.value
      }

      const query = searchQuery.value.toLowerCase()
      return expositions.value.filter(expo =>
        (expo.shortTitle && expo.shortTitle.toLowerCase().includes(query)) ||
        (expo.longTitle && expo.longTitle.toLowerCase().includes(query)) ||
        (expo.location && expo.location.toLowerCase().includes(query)) ||
        (expo.startDate && expo.startDate.toLowerCase().includes(query)) ||
        (expo.endDate && expo.endDate.toLowerCase().includes(query))
      )
    })

    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    // Format date range for display
    const formatDateRange = (startDate, endDate) => {
      if (!startDate && !endDate) return ''
      if (startDate && !endDate) return formatDate(startDate)
      if (!startDate && endDate) return 'Jusqu\'au ' + formatDate(endDate)
      return formatDate(startDate) + ' - ' + formatDate(endDate)
    }

    // Navigate to create form
    const goToCreate = () => {
      router.push({ name: 'ExpositionCreate' })
    }

    // Navigate to edit form
    const goToEdit = (id) => {
      router.push({ name: 'ExpositionEdit', params: { id } })
    }

    // Delete exposition
    const deleteExposition = async (id) => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette exposition ?')) {
        return
      }

      try {
        await expositionsDB.delete(id)
        await loadExpositions()
      } catch (error) {
        console.error('Error deleting exposition:', error)
        alert('Une erreur est survenue lors de la suppression')
      }
    }

    // Logout
    const handleLogout = async () => {
      await settingsDB.set('isAuthenticated', false)
      router.push({ name: 'Login' })
    }

    // Navigate to home
    const goHome = () => {
      router.push({ name: 'Home' })
    }

    // QR Scanner
    const openQRScanner = () => {
      // TODO: Implement QR scanner
      console.log('Open QR scanner')
    }

    onMounted(() => {
      loadExpositions()
    })

    return {
      expositions,
      searchQuery,
      loading,
      filteredExpositions,
      formatDate,
      formatDateRange,
      goToCreate,
      goToEdit,
      deleteExposition,
      handleLogout,
      goHome,
      openQRScanner
    }
  }
}
</script>

<style scoped>
.expositions-list-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #a5b4fc 0%, #3b5bdb 100%);
}

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
}

.container {
  padding: var(--spacing-xl);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.list-header h2 {
  color: white;
  font-size: 2rem;
  margin: 0;
}

.add-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
}

.search-bar {
  margin-bottom: var(--spacing-xl);
}

.search-bar input {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 1rem;
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading, .empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: white;
  font-size: 1.1rem;
}

.expositions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.expo-card {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.expo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.expo-image-container {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.expo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.expo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  font-weight: 700;
  color: white;
}

.expo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
}

.expo-overlay h3 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1.25rem;
}

.expo-subtitle {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.card-body {
  padding: var(--spacing-md) var(--spacing-lg);
}

.card-field {
  margin-bottom: var(--spacing-sm);
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}

.card-field strong {
  color: var(--color-text);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.date {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.delete-button {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.delete-button:hover {
  background: #fee;
}

.secondary {
  background: white;
  color: var(--color-text);
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.secondary:hover {
  background: #f3f4f6;
}

.app-footer {
  background: white;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
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
