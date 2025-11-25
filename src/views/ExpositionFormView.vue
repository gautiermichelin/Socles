<template>
  <div class="exposition-form-view">
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
      <div class="form-header">
        <button @click="goBack" class="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Retour
        </button>
        <h2>{{ isEditing ? 'Modifier l\'exposition' : 'Nouvelle exposition' }}</h2>
      </div>

      <div class="form-card">
        <form @submit.prevent="handleSubmit">
          <!-- Short Title -->
          <div class="form-group">
            <label for="shortTitle">Titre court *</label>
            <input
              id="shortTitle"
              v-model="form.shortTitle"
              type="text"
              required
              placeholder="Ex: Mexica"
            />
          </div>

          <!-- Long Title -->
          <div class="form-group">
            <label for="longTitle">Titre long</label>
            <input
              id="longTitle"
              v-model="form.longTitle"
              type="text"
              placeholder="Ex: Des dons et des dieux au Templo Mayor"
            />
          </div>

          <!-- Start Date -->
          <div class="form-group">
            <label for="startDate">Date de début</label>
            <input
              id="startDate"
              v-model="form.startDate"
              type="date"
            />
          </div>

          <!-- End Date -->
          <div class="form-group">
            <label for="endDate">Date de fin</label>
            <input
              id="endDate"
              v-model="form.endDate"
              type="date"
            />
          </div>

          <!-- Location -->
          <div class="form-group">
            <label for="location">Lieu</label>
            <input
              id="location"
              v-model="form.location"
              type="text"
              placeholder="Ex: Musée du Quai Branly"
            />
          </div>

          <!-- Color -->
          <div class="form-group">
            <label for="color">Couleur associée</label>
            <input
              id="color"
              v-model="form.color"
              type="color"
            />
          </div>

          <!-- Image Upload -->
          <div class="form-group">
            <label for="image">Image</label>
            <div v-if="form.imageUrl" class="image-preview">
              <img :src="form.imageUrl" alt="Preview" />
            </div>
            <input
              id="image"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
            />
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="goBack" class="secondary">
              Annuler
            </button>
            <button type="submit" class="primary">
              {{ isEditing ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </form>
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { expositionsDB, settingsDB } from '../services/db'

export default {
  name: 'ExpositionFormView',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const isEditing = ref(!!props.id)

    const form = ref({
      shortTitle: '',
      longTitle: '',
      startDate: '',
      endDate: '',
      location: '',
      color: '#3b82f6',
      imageUrl: ''
    })

    // Load exposition data if editing
    onMounted(async () => {
      if (props.id) {
        const exposition = await expositionsDB.getById(Number(props.id))
        if (exposition) {
          form.value = { ...exposition }
        }
      }
    })

    // Handle image upload
    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          form.value.imageUrl = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    // Handle form submission
    const handleSubmit = async () => {
      try {
        if (isEditing.value) {
          await expositionsDB.update({
            ...form.value,
            id: Number(props.id)
          })
        } else {
          await expositionsDB.create(form.value)
        }

        router.push({ name: 'ExpositionsList' })
      } catch (error) {
        console.error('Error saving exposition:', error)
        alert('Une erreur est survenue lors de l\'enregistrement')
      }
    }

    // Navigation
    const goBack = () => {
      router.push({ name: 'ExpositionsList' })
    }

    const openQRScanner = () => {
      // TODO: Implement QR scanner
      console.log('Open QR scanner')
    }

    const handleLogout = async () => {
      await settingsDB.set('isAuthenticated', false)
      router.push({ name: 'Login' })
    }

    const goHome = () => {
      router.push({ name: 'Home' })
    }

    return {
      form,
      isEditing,
      handleSubmit,
      handleImageUpload,
      goBack,
      openQRScanner,
      handleLogout,
      goHome
    }
  }
}
</script>

<style scoped>
.exposition-form-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #a5b4fc 0%, #3b5bdb 100%);
}

/* Header - Same as SoclesListView */
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
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.form-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.form-header h2 {
  color: white;
  font-size: 1.8rem;
  margin: 0;
}

.form-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--color-text);
}

.form-group input[type="text"],
.form-group input[type="color"] {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
}

.form-group input[type="color"] {
  height: 50px;
  cursor: pointer;
}

.form-group input[type="file"] {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.image-preview {
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius-lg);
  overflow: hidden;
  max-width: 400px;
  border: 2px solid var(--color-border);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.form-actions button {
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.form-actions button.primary {
  background: #3b82f6;
  color: white;
}

.form-actions button.primary:hover {
  background: #2563eb;
}

.form-actions button.secondary {
  background: white;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.form-actions button.secondary:hover {
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
