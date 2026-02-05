<template>
  <div class="exposition-form-view">
    <AppHeader v-if="!isEmbedded" @open-qr-scanner="openQRScanner" />

    <!-- Upload notification -->
    <div v-if="uploadStatus" :class="['upload-notification', uploadStatus]">
      <span v-if="uploadStatus === 'uploading'">
        Enregistrement sur le serveur<span class="dots">{{ uploadDots }}</span>
      </span>
      <span v-else-if="uploadStatus === 'success'">
        ✓ Enregistré sur le serveur
      </span>
      <span v-else-if="uploadStatus === 'error'">
        ✗ Erreur lors de l'enregistrement sur le serveur
      </span>
    </div>

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
        <!-- Tabs -->
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Display Tab -->
          <div v-show="activeTab === 'display'" class="tab-content display-tab">
            <!-- Image Section -->
            <div v-if="form.imageUrl" class="display-image">
              <img :src="form.imageUrl" :alt="form.shortTitle" class="display-main-image" />
            </div>
            <div v-else class="display-no-image">
              <p>Aucune image</p>
              <button type="button" @click="activeTab = 'edit'" class="display-add-image-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Ajouter une image
              </button>
            </div>

            <!-- Main Information -->
            <div class="display-section">
              <h3 class="display-section-title">Informations principales</h3>
              <div class="display-fields">
                <div v-if="form.shortTitle" class="display-field">
                  <span class="display-field-label">Titre court</span>
                  <span class="display-field-value">{{ form.shortTitle }}</span>
                </div>
                <div v-if="form.longTitle" class="display-field">
                  <span class="display-field-label">Titre long</span>
                  <span class="display-field-value">{{ form.longTitle }}</span>
                </div>
                <div v-if="form.startDate || form.endDate" class="display-field">
                  <span class="display-field-label">Période</span>
                  <span class="display-field-value">
                    <span v-if="form.startDate">{{ formatDate(form.startDate) }}</span>
                    <span v-if="form.startDate && form.endDate"> - </span>
                    <span v-if="form.endDate">{{ formatDate(form.endDate) }}</span>
                  </span>
                </div>
                <div v-if="form.location" class="display-field">
                  <span class="display-field-label">Lieu</span>
                  <span class="display-field-value">{{ form.location }}</span>
                </div>
                <div v-if="form.exhibitionContact" class="display-field">
                  <span class="display-field-label">Contact/chargé d'exposition</span>
                  <span class="display-field-value">{{ form.exhibitionContact }}</span>
                </div>
                <div v-if="form.color" class="display-field">
                  <span class="display-field-label">Couleur associée</span>
                  <div class="display-color-preview">
                    <div class="color-swatch" :style="{ backgroundColor: form.color }"></div>
                    <span class="color-code">{{ form.color }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comments -->
            <div v-if="form.comments" class="display-section">
              <h3 class="display-section-title">Commentaires</h3>
              <p class="display-text">{{ form.comments }}</p>
            </div>
          </div>

          <!-- Edit Tab -->
          <div v-show="activeTab === 'edit'" class="tab-content">
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

          <!-- Comments -->
          <div class="form-group">
            <label for="comments">Commentaires</label>
            <textarea
              id="comments"
              v-model="form.comments"
              rows="4"
              placeholder="Commentaires sur l'exposition..."
            ></textarea>
          </div>

          <!-- Contact/Exhibition Manager -->
          <div class="form-group">
            <label for="exhibitionContact">Contact/chargé d'exposition</label>
            <input
              id="exhibitionContact"
              v-model="form.exhibitionContact"
              type="text"
              placeholder="Nom du contact"
            />
          </div>

          <!-- Image Upload -->
          <div class="form-group">
            <div class="label-with-delete">
              <label for="image">Image</label>
              <button
                v-if="form.imageUrl"
                type="button"
                @click="removeImage"
                class="delete-image-btn"
                title="Supprimer l'image"
              >
                ✕
              </button>
            </div>
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

    <AppFooter v-if="!isEmbedded" />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { expositionsDB } from '../services/db'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

export default {
  name: 'ExpositionFormView',
  components: {
    AppHeader,
    AppFooter
  },
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
    const activeTab = ref('display')

    // Upload status and dots animation
    const uploadStatus = ref(null) // null, 'uploading', 'success', 'error'
    const uploadDots = ref('')
    let dotsInterval = null

    const tabs = [
      { id: 'display', label: 'Affichage' },
      { id: 'edit', label: 'Modifier' }
    ]

    const isEmbedded = computed(() => {
      try {
        return route && route.query && route.query.embedded === '1'
      } catch (e) {
        // fallback: also consider being in an iframe
        return window && window.self !== window.top
      }
    })

    const form = ref({
      shortTitle: '',
      longTitle: '',
      startDate: '',
      endDate: '',
      location: '',
      color: '#3b82f6',
      comments: '',
      exhibitionContact: '',
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

    // Remove image
    const removeImage = () => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
        form.value.imageUrl = ''
      }
    }

    // Start dots animation
    const startDotsAnimation = () => {
      uploadDots.value = ''
      let dotCount = 0
      dotsInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4
        uploadDots.value = '.'.repeat(dotCount)
      }, 500)
    }

    // Stop dots animation
    const stopDotsAnimation = () => {
      uploadDots.value = ''
      if (dotsInterval) {
        clearInterval(dotsInterval)
        dotsInterval = null
      }
    }

    // Upload exposition to webservice
    const uploadExpoToWebService = async (expoData) => {
      const API_BASE_URL = 'https://socles.ideesculture.fr/gestion/soclesIo/index.php'

      try {
        const formData = new FormData()
        formData.append('action', 'uploadExpo')
        formData.append('data', JSON.stringify(expoData))

        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const result = await response.json()

        if (result.result === true) {
          console.log('Exposition uploaded successfully:', result.file, result.timestamp)
          return true
        } else {
          console.error('Webservice upload error:', result.message)
          return false
        }
      } catch (error) {
        console.error('Failed to upload exposition to webservice:', error)
        return false
      }
    }

    // Handle form submission
    const handleSubmit = async () => {
      try {
        // Convert Vue proxy to plain object by serializing and deserializing
        const plainFormData = JSON.parse(JSON.stringify(form.value))

        let savedExpo
        if (isEditing.value) {
          const expoToUpdate = {
            ...plainFormData,
            id: Number(props.id)
          }
          savedExpo = await expositionsDB.update(expoToUpdate)
          // notify parent (iframe) that an exposition was updated
          try {
            window.parent.postMessage({ type: 'exposition-created', data: { shortTitle: plainFormData.shortTitle } }, window.location.origin)
          } catch (e) { /* ignore */ }
        } else {
          savedExpo = await expositionsDB.create(plainFormData)
          // notify parent (iframe) that an exposition was created
          try {
            window.parent.postMessage({ type: 'exposition-created', data: { shortTitle: plainFormData.shortTitle } }, window.location.origin)
          } catch (e) { /* ignore */ }
        }

        // Show uploading status with animation
        uploadStatus.value = 'uploading'
        startDotsAnimation()

        // Upload to webservice
        try {
          const uploadSuccess = await uploadExpoToWebService(savedExpo)
          stopDotsAnimation()

          if (uploadSuccess) {
            uploadStatus.value = 'success'
            // Hide notification after 3 seconds
            setTimeout(() => {
              uploadStatus.value = null
            }, 3000)
          } else {
            uploadStatus.value = 'error'
            // Hide notification after 5 seconds
            setTimeout(() => {
              uploadStatus.value = null
            }, 5000)
          }
        } catch (error) {
          stopDotsAnimation()
          uploadStatus.value = null
          console.warn('Webservice upload failed but local save succeeded:', error)
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

    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    return {
      form,
      isEditing,
      isEmbedded,
      activeTab,
      tabs,
      handleSubmit,
      handleImageUpload,
      removeImage,
      goBack,
      openQRScanner,
      formatDate,
      uploadStatus,
      uploadDots
    }
  }
}
</script>

<style scoped>
.exposition-form-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #a5b4fc 0%, #3b5bdb 100%);
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
.form-group input[type="color"],
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
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

.label-with-delete {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.label-with-delete label {
  margin-bottom: 0;
}

.delete-image-btn {
  background: #6b7280;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  padding: 0;
}

.delete-image-btn:hover {
  background: #4b5563;
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-lg);
}

.tab {
  padding: var(--spacing-md) var(--spacing-lg);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  font-weight: 500;
}

.tab:hover {
  color: var(--color-text);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-content {
  padding-top: var(--spacing-md);
}

/* Display Tab Styles */
.display-tab {
  background: #f8fafc;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin: -var(--spacing-lg);
  margin-top: 0;
}

.display-image {
  margin-bottom: var(--spacing-xl);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-width: 30%;
}

.display-main-image {
  width: 100%;
  height: auto;
  display: block;
}

.display-no-image {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  background: white;
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
}

.display-add-image-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  margin-top: var(--spacing-md);
}

.display-add-image-btn:hover {
  background: #2563eb;
}

.display-section {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.display-section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-border);
}

.display-fields {
  display: grid;
  gap: var(--spacing-md);
}

.display-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.display-field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.display-field-value {
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 500;
}

.display-text {
  margin: 0;
  line-height: 1.6;
  color: var(--color-text);
  white-space: pre-wrap;
}

.display-color-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.color-swatch {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-code {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-weight: 600;
}

/* Upload notification */
.upload-notification {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  text-align: center;
  font-weight: 600;
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.upload-notification.uploading {
  background: #3b82f6;
  color: white;
}

.upload-notification.success {
  background: #10b981;
  color: white;
}

.upload-notification.error {
  background: #ef4444;
  color: white;
}

.upload-notification .dots {
  display: inline-block;
  min-width: 20px;
  text-align: left;
}

@media (max-width: 768px) {
  .tabs {
    overflow-x: auto;
  }

  .display-tab {
    margin: -var(--spacing-md);
    margin-top: 0;
    padding: var(--spacing-md);
  }

  .display-image {
    max-width: 100%;
  }
}
</style>
