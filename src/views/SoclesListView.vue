<template>
  <div class="socles-list-view">
    <header class="app-header">
      <div class="logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
          <rect x="8" y="4" width="8" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h1>SOCLES</h1>
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
    
    <div class="container">
      <div class="list-header">
        <h2>Gestion des socles</h2>
        <button @click="goToCreate" class="secondary add-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Nouveau socle
        </button>
      </div>
      
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par numéro d'inventaire, exposition..."
        />
      </div>
      
      <div v-if="loading" class="loading">
        Chargement...
      </div>
      
      <div v-else-if="filteredSocles.length === 0" class="empty-state">
        <p v-if="searchQuery">Aucun socle ne correspond à votre recherche.</p>
        <p v-else>Aucun socle enregistré. Créez votre premier socle !</p>
      </div>
      
      <div v-else class="socles-grid">
        <div
          v-for="socle in filteredSocles"
          :key="socle.id"
          class="socle-card"
          @click="goToEdit(socle.id)"
        >
          <div class="card-header">
            <h3>{{ socle.inventoryNumber || 'Sans numéro' }}</h3>
            <span v-if="socle.isDraft" class="draft-badge">Brouillon</span>
          </div>
          
          <div class="card-body">
            <div class="card-field" v-if="socle.typography">
              <strong>Typologie:</strong> {{ socle.typography }}
            </div>
            <div class="card-field" v-if="socle.heightCm || socle.lengthCm || socle.widthCm">
              <strong>Dimensions:</strong> 
              {{ socle.heightCm }}h × {{ socle.lengthCm }}L × {{ socle.widthCm }}l cm
            </div>
            <div class="card-field" v-if="socle.exposition">
              <strong>Exposition:</strong> {{ socle.exposition }}
            </div>
            <div class="card-field" v-if="socle.location">
              <strong>Localisation:</strong> {{ socle.location }}
            </div>
          </div>
          
          <div class="card-footer">
            <span class="date">{{ formatDate(socle.updatedAt) }}</span>
            <button @click.stop="deleteSocle(socle.id)" class="delete-button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { soclesDB, settingsDB } from '../services/db'
import QRScanner from '../components/QRScanner.vue'

export default {
  name: 'SoclesListView',
  components: {
    QRScanner
  },
  setup() {
    const router = useRouter()
    const socles = ref([])
    const searchQuery = ref('')
    const loading = ref(true)
    const showQRScanner = ref(false)
    
    // Load socles from database
    const loadSocles = async () => {
      loading.value = true
      try {
        socles.value = await soclesDB.getAll()
        socles.value.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        )
      } catch (error) {
        console.error('Error loading socles:', error)
      } finally {
        loading.value = false
      }
    }
    
    // Filter socles based on search query
    const filteredSocles = computed(() => {
      if (!searchQuery.value) {
        return socles.value
      }
      
      const query = searchQuery.value.toLowerCase()
      return socles.value.filter(socle => 
        (socle.inventoryNumber && socle.inventoryNumber.toLowerCase().includes(query)) ||
        (socle.exposition && socle.exposition.toLowerCase().includes(query)) ||
        (socle.typography && socle.typography.toLowerCase().includes(query)) ||
        (socle.location && socle.location.toLowerCase().includes(query))
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
    
    // Navigate to create form
    const goToCreate = () => {
      router.push({ name: 'SocleCreate' })
    }
    
    // Navigate to edit form
    const goToEdit = (id) => {
      router.push({ name: 'SocleEdit', params: { id } })
    }
    
    // Delete socle
    const deleteSocle = async (id) => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce socle ?')) {
        return
      }
      
      try {
        await soclesDB.delete(id)
        await loadSocles()
      } catch (error) {
        console.error('Error deleting socle:', error)
        alert('Une erreur est survenue lors de la suppression')
      }
    }
    
    // Logout
    const handleLogout = async () => {
      await settingsDB.set('isAuthenticated', false)
      router.push({ name: 'Login' })
    }

    // QR Scanner functions
    const openQRScanner = () => {
      showQRScanner.value = true
    }

    const closeQRScanner = () => {
      showQRScanner.value = false
    }

    const handleQRScan = async (scannedData) => {
      try {
        // Search for socle by inventory number
        const foundSocle = socles.value.find(
          socle => socle.inventoryNumber && socle.inventoryNumber.toLowerCase() === scannedData.toLowerCase()
        )

        if (foundSocle) {
          // Redirect to the socle edit page
          router.push({ name: 'SocleEdit', params: { id: foundSocle.id } })
        } else {
          alert(`Aucun socle trouvé avec le numéro: ${scannedData}`)
        }
      } catch (error) {
        console.error('QR scan error:', error)
        alert('Une erreur est survenue lors de la recherche')
      }
    }

    onMounted(() => {
      loadSocles()
    })

    return {
      socles,
      searchQuery,
      loading,
      filteredSocles,
      showQRScanner,
      formatDate,
      goToCreate,
      goToEdit,
      deleteSocle,
      handleLogout,
      openQRScanner,
      closeQRScanner,
      handleQRScan
    }
  }
}
</script>

<style scoped>
.socles-list-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #a5b4fc 0%, #3b5bdb 100%);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: white;
}

.logo svg {
  width: 32px;
  height: 32px;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.qr-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: white;
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
}

.qr-button:hover {
  background: rgba(255, 255, 255, 0.9);
}

.qr-button img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.logout-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.3);
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

.socles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.socle-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.socle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text);
}

.draft-badge {
  background: #fbbf24;
  color: #78350f;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
}

.card-body {
  margin-bottom: var(--spacing-md);
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
  padding-top: var(--spacing-md);
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
</style>
