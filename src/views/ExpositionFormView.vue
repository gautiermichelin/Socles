<template>
  <div class="exposition-form-view">
    <AppHeader v-if="!isEmbedded" @open-qr-scanner="openQRScanner" />

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

    // Handle form submission
    const handleSubmit = async () => {
      try {
        if (isEditing.value) {
          await expositionsDB.update({
            ...form.value,
            id: Number(props.id)
          })
          // notify parent (iframe) that an exposition was updated
          try {
            window.parent.postMessage({ type: 'exposition-created', data: { shortTitle: form.value.shortTitle } }, window.location.origin)
          } catch (e) { /* ignore */ }
        } else {
          await expositionsDB.create(form.value)
          // notify parent (iframe) that an exposition was created
          try {
            window.parent.postMessage({ type: 'exposition-created', data: { shortTitle: form.value.shortTitle } }, window.location.origin)
          } catch (e) { /* ignore */ }
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

    return {
      form,
      isEditing,
      isEmbedded,
      handleSubmit,
      handleImageUpload,
      removeImage,
      goBack,
      openQRScanner
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
</style>
