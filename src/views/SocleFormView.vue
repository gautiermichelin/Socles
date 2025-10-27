<template>
  <div class="socle-form-view">
    <header class="app-header">
      <div class="logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
          <rect x="8" y="4" width="8" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h1>SOCLES</h1>
      </div>
      <button class="qr-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" stroke-width="2"/>
        </svg>
        QR code
      </button>
    </header>
    
    <div class="container">
      <div class="form-header">
        <button @click="goBack" class="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Retour
        </button>
        <h2>{{ isEditing ? 'Modifier le socle' : 'Nouveau socle' }}</h2>
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
          <!-- Main Fields Tab -->
          <div v-show="activeTab === 'main'" class="tab-content">
            <!-- Draft mode toggle -->
            <div class="draft-toggle">
              <label class="toggle-label">
                <span>Fiche en mode brouillon</span>
                <div class="toggle-switch">
                  <input v-model="form.isDraft" type="checkbox" />
                  <span class="slider"></span>
                </div>
              </label>
            </div>
            
            <!-- Inventory Number -->
            <div class="form-group">
              <label for="inventoryNumber">Numéro inventaire objet</label>
              <input
                id="inventoryNumber"
                v-model="form.inventoryNumber"
                type="text"
              />
            </div>
            
            <!-- Typography -->
            <div class="form-group">
              <label for="typography">Typologie</label>
              <input
                id="typography"
                v-model="form.typography"
                type="text"
              />
            </div>
            
            <!-- Dimensions -->
            <div class="form-group">
              <label>Dimensions</label>
              <div class="dimensions-grid">
                <div>
                  <label for="heightCm">Hauteur (cm)</label>
                  <input
                    id="heightCm"
                    v-model.number="form.heightCm"
                    type="number"
                    step="0.1"
                  />
                </div>
                <div>
                  <label for="lengthCm">Longueur (cm)</label>
                  <input
                    id="lengthCm"
                    v-model.number="form.lengthCm"
                    type="number"
                    step="0.1"
                  />
                </div>
                <div>
                  <label for="widthCm">Largeur (cm)</label>
                  <input
                    id="widthCm"
                    v-model.number="form.widthCm"
                    type="number"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
            
            <!-- Exposition Number -->
            <div class="form-group">
              <label for="expositionNumber">Numéro exposition</label>
              <input
                id="expositionNumber"
                v-model="form.expositionNumber"
                type="text"
              />
            </div>
            
            <!-- Function -->
            <div class="form-group">
              <label for="function">Fonction du socle</label>
              <input
                id="function"
                v-model="form.function"
                type="text"
              />
            </div>
            
            <!-- Assembly Instructions -->
            <div class="form-group">
              <label for="instructions">Instructions de montage</label>
              <textarea
                id="instructions"
                v-model="form.instructions"
                rows="3"
              ></textarea>
            </div>
            
            <!-- Materials/Colors -->
            <div class="form-group">
              <label for="materials">Matériaux/couleurs</label>
              <input
                id="materials"
                v-model="form.materials"
                type="text"
              />
            </div>
            
            <!-- Location -->
            <div class="form-group">
              <label for="location">Localisation</label>
              <input
                id="location"
                v-model="form.location"
                type="text"
              />
            </div>
            
            <!-- Crate -->
            <div class="form-group">
              <label for="crate">Caisse</label>
              <input
                id="crate"
                v-model="form.crate"
                type="text"
              />
            </div>
            
            <!-- Exposition -->
            <div class="form-group">
              <label for="exposition">Exposition</label>
              <div class="input-with-button">
                <input
                  id="exposition"
                  v-model="form.exposition"
                  type="text"
                />
                <button type="button" class="add-exposition-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Ajouter une exposition
                </button>
              </div>
            </div>
            
            <!-- Reserved -->
            <div class="form-group">
              <label for="reserved">Réservé</label>
              <input
                id="reserved"
                v-model="form.reserved"
                type="text"
              />
            </div>
            
            <!-- Anti-seismic -->
            <div class="form-group">
              <label for="antiSeismic">Anti-sismique</label>
              <input
                id="antiSeismic"
                v-model="form.antiSeismic"
                type="text"
              />
            </div>
            
            <!-- Do not adapt -->
            <div class="form-group">
              <label for="doNotAdapt">Ne pas adapter</label>
              <input
                id="doNotAdapt"
                v-model="form.doNotAdapt"
                type="text"
              />
            </div>
            
            <!-- Showcase -->
            <div class="form-group">
              <label for="showcase">En vitrine/hors vitrine</label>
              <input
                id="showcase"
                v-model="form.showcase"
                type="text"
              />
            </div>
            
            <!-- Comments -->
            <div class="form-group">
              <label for="comments">Commentaires</label>
              <textarea
                id="comments"
                v-model="form.comments"
                rows="4"
              ></textarea>
            </div>
          </div>
          
          <!-- Photos Tab -->
          <div v-show="activeTab === 'photos'" class="tab-content">
            <div class="empty-tab">
              <p>Fonctionnalité de gestion des photos à venir</p>
            </div>
          </div>
          
          <!-- Advanced Information Tab -->
          <div v-show="activeTab === 'advanced'" class="tab-content">
            <div class="empty-tab">
              <p>Informations avancées à venir</p>
            </div>
          </div>
          
          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="goBack" class="cancel-button">
              Annuler
            </button>
            <button type="submit" class="primary save-button">
              {{ isEditing ? 'Enregistrer les modifications' : 'Créer le socle' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { soclesDB } from '../services/db'

export default {
  name: 'SocleFormView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const isEditing = ref(false)
    const activeTab = ref('main')
    
    const tabs = [
      { id: 'main', label: 'Champs principaux' },
      { id: 'photos', label: 'Photos' },
      { id: 'advanced', label: 'Informations avancées' }
    ]
    
    const form = ref({
      isDraft: false,
      inventoryNumber: '',
      typography: '',
      heightCm: null,
      lengthCm: null,
      widthCm: null,
      expositionNumber: '',
      function: '',
      instructions: '',
      materials: '',
      location: '',
      crate: '',
      exposition: '',
      reserved: '',
      antiSeismic: '',
      doNotAdapt: '',
      showcase: '',
      comments: ''
    })
    
    // Load socle data if editing
    onMounted(async () => {
      const socleId = route.params.id
      if (socleId) {
        isEditing.value = true
        try {
          const socle = await soclesDB.getById(parseInt(socleId))
          if (socle) {
            form.value = { ...socle }
          } else {
            alert('Socle non trouvé')
            goBack()
          }
        } catch (error) {
          console.error('Error loading socle:', error)
          alert('Erreur lors du chargement du socle')
          goBack()
        }
      }
    })
    
    const handleSubmit = async () => {
      try {
        if (isEditing.value) {
          await soclesDB.update(form.value)
        } else {
          await soclesDB.create(form.value)
        }
        router.push({ name: 'SoclesList' })
      } catch (error) {
        console.error('Error saving socle:', error)
        alert('Une erreur est survenue lors de l\'enregistrement')
      }
    }
    
    const goBack = () => {
      router.push({ name: 'SoclesList' })
    }
    
    return {
      isEditing,
      activeTab,
      tabs,
      form,
      handleSubmit,
      goBack
    }
  }
}
</script>

<style scoped>
.socle-form-view {
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

.qr-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: var(--radius-md);
}

.container {
  padding: var(--spacing-xl);
  max-width: 900px;
  margin: 0 auto;
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
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.form-header h2 {
  color: white;
  font-size: 1.75rem;
  margin: 0;
}

.form-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-xl);
  padding: 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  padding: 0 var(--spacing-lg);
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
  padding: var(--spacing-xl);
}

.draft-toggle {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-lg);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-border);
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.input-with-button {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-end;
}

.input-with-button input {
  flex: 1;
}

.add-exposition-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  white-space: nowrap;
  font-size: 0.9rem;
}

.empty-tab {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.cancel-button {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--color-surface-variant);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
}

.save-button {
  padding: var(--spacing-md) var(--spacing-xl);
  font-weight: 600;
}

@media (max-width: 768px) {
  .dimensions-grid {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    overflow-x: auto;
  }
  
  .input-with-button {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
