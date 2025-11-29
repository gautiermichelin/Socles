<template>
  <div class="socle-form-view">
    <AppHeader @open-qr-scanner="openQRScanner" />

    <QRScanner
      v-if="showQRScanner"
      @scan="handleQRScan"
      @close="closeQRScanner"
    />
    
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
              <select
                id="typography"
                v-model="form.typography"
                class="form-select"
              >
                <option value="">Sélectionner une typologie</option>
                <option value="Morpho piqué base">Morpho piqué base</option>
                <option value="Morpho piqué fond">Morpho piqué fond</option>
                <option value="Morpho sur platine">Morpho sur platine</option>
                <option value="Piqué base">Piqué base</option>
                <option value="Soclet">Soclet</option>
              </select>
            </div>
            
            <!-- Dimensions -->
            <div class="form-group">
              <label>Dimensions du socle</label>
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

            <!-- Dimensions with Object -->
            <div class="form-group">
              <label>Dimensions du socle avec l'objet</label>
              <div class="dimensions-grid">
                <div>
                  <label for="heightWithObjectCm">Hauteur (cm)</label>
                  <input
                    id="heightWithObjectCm"
                    v-model.number="form.heightWithObjectCm"
                    type="number"
                    step="0.1"
                  />
                </div>
                <div>
                  <label for="lengthWithObjectCm">Longueur (cm)</label>
                  <input
                    id="lengthWithObjectCm"
                    v-model.number="form.lengthWithObjectCm"
                    type="number"
                    step="0.1"
                  />
                </div>
                <div>
                  <label for="widthWithObjectCm">Largeur (cm)</label>
                  <input
                    id="widthWithObjectCm"
                    v-model.number="form.widthWithObjectCm"
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
              <div class="exposition-inline">
                <select
                  id="exposition"
                  v-model="form.exposition"
                  class="form-select"
                >
                  <option value="">Sélectionnez une exposition</option>
                  <option
                    v-for="expo in availableExpositions"
                    :key="expo.id"
                    :value="expo.shortTitle"
                  >
                    {{ expo.shortTitle }}
                  </option>
                </select>
                <button type="button" class="add-exposition-inline" @click="openExpositionModal" title="Ajouter une exposition">
                  Ajouter une exposition
                </button>
              </div>
            </div>

            <!-- Showcase -->
            <div class="form-group">
              <label for="showcase">En vitrine/hors vitrine</label>
              <select
                id="showcase"
                v-model="form.showcase"
                class="form-select"
              >
                <option :value="null">-</option>
                <option :value="true">En vitrine</option>
                <option :value="false">Hors vitrine</option>
              </select>
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
            <div class="photos-section">
              <div class="form-group">
                <label for="photoUpload">Ajouter des photos</label>
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/*"
                  multiple
                  @change="handlePhotoUpload"
                  class="photo-input"
                />
                <p class="help-text">Vous pouvez sélectionner plusieurs photos à la fois</p>
              </div>

              <div v-if="(form.photos && form.photos.length > 0) || form.imageUrl" class="photos-grid">
                <!-- Render uploaded photos first -->
                <div
                  v-for="(photo, index) in form.photos"
                  :key="`photo-${index}`"
                  class="photo-card"
                >
                  <img
                    :src="photo.url"
                    :alt="`Photo ${index + 1}`"
                    class="photo-preview"
                    @click="openFullscreen(photo.url)"
                    style="cursor: pointer;"
                  />
                  <div class="photo-overlay">
                    <button
                      type="button"
                      @click="removePhoto(index)"
                      class="remove-photo-btn"
                      title="Supprimer cette photo"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <div class="photo-info">
                    <input
                      v-model="photo.caption"
                      type="text"
                      placeholder="Légende de la photo"
                      class="photo-caption"
                    />
                  </div>
                </div>

                <!-- If there is a legacy single imageUrl, show it as a card too -->
                <div v-if="form.imageUrl" class="photo-card image-url-card">
                  <img
                    :src="form.imageUrl"
                    alt="Image principale"
                    class="photo-preview"
                    @click="openFullscreen(form.imageUrl)"
                    style="cursor: pointer;"
                  />
                  <div class="photo-overlay">
                    <button
                      type="button"
                      @click="removePhoto(null, true)"
                      class="remove-photo-btn"
                      title="Supprimer cette photo"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <div class="photo-info">
                    <div class="photo-caption-container">
                      <input
                        v-model="form.imageUrlCaption"
                        type="text"
                        placeholder="Légende de l'image principale"
                        class="photo-caption"
                      />
                      <button
                        type="button"
                        @click="removeMainImage"
                        class="delete-main-image-btn"
                        title="Supprimer l'image"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="empty-photos">
                <p>Aucune photo ajoutée pour ce socle</p>
              </div>
            </div>
          </div>
          
          <!-- Advanced Information Tab -->
          <div v-show="activeTab === 'advanced'" class="tab-content">
            <!-- Reserved -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  id="reserved"
                  v-model="form.reserved"
                  type="checkbox"
                />
                <span>Réservé</span>
              </label>
            </div>

            <!-- Anti-seismic -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  id="antiSeismic"
                  v-model="form.antiSeismic"
                  type="checkbox"
                />
                <span>Anti-sismique</span>
              </label>
            </div>

            <!-- Do not adapt -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  id="doNotAdapt"
                  v-model="form.doNotAdapt"
                  type="checkbox"
                />
                <span>Ne pas adapter</span>
              </label>
            </div>

            <!-- Number of Elements -->
            <div class="form-group">
              <label for="numberOfElements">Nb d'éléments composant le socle</label>
              <input
                id="numberOfElements"
                v-model="form.numberOfElements"
                type="text"
              />
            </div>

            <!-- Adjustable Height -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  id="adjustableHeight"
                  v-model="form.adjustableHeight"
                  type="checkbox"
                />
                <span>Hauteur du socle réglable</span>
              </label>
            </div>

            <!-- Comments -->
            <div class="form-group">
              <label for="comments-advanced">Commentaires</label>
              <textarea
                id="comments-advanced"
                v-model="form.comments"
                rows="4"
              ></textarea>
            </div>
          </div>
          
          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="goBack" class="cancel-button">
              Annuler
            </button>
            <button type="button" @click.prevent="generateQRCodePdf" :disabled="generateInProgress" class="generate-qr-button">
              <span v-if="!generateInProgress">
                <img src="/qrcode.png" alt="QR code" class="qr-icon" />
              </span>
              <span v-else class="qr-loading"><svg class="spinner" viewBox="0 0 50 50" width="16" height="16"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle></svg> Génération…</span>
            </button>
            <button type="submit" class="primary save-button">
              {{ isEditing ? 'Enregistrer' : 'Créer le socle' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Exposition iframe modal -->
    <div v-if="showExpoModal" class="iframe-modal" role="dialog" aria-modal="true">
      <div class="iframe-backdrop" @click.self="closeExpositionModal">
        <div class="iframe-container">
          <div class="iframe-header">
            <div class="iframe-title">Créer une exposition</div>
            <div class="iframe-actions">
              <button class="iframe-close" @click="closeExpositionModal" aria-label="Fermer">✕</button>
            </div>
          </div>
          <iframe :src="expoIframeSrc" frameborder="0" class="expo-iframe"></iframe>
        </div>
      </div>
    </div>

    <!-- Fullscreen Image Viewer -->
    <div v-if="showFullscreen" class="fullscreen-viewer" @click.self="closeFullscreen">
      <button class="fullscreen-close" @click="closeFullscreen" aria-label="Fermer">✕</button>
      <div class="fullscreen-content">
        <img
          ref="fullscreenImage"
          :src="fullscreenImageUrl"
          alt="Image en plein écran"
          :style="{ transform: `scale(${zoomLevel})` }"
        />
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { soclesDB, expositionsDB } from '../services/db'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import QRScanner from '../components/QRScanner.vue'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'

export default {
  name: 'SocleFormView',
  components: {
    AppHeader,
    AppFooter,
    QRScanner
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const isEditing = ref(false)
    const activeTab = ref('main')
    const availableExpositions = ref([])
    const showExpoModal = ref(false)
    const expoIframeSrc = '/expositions/new?embedded=1'
    const showQRScanner = ref(false)

    // Fullscreen image viewer
    const showFullscreen = ref(false)
    const fullscreenImageUrl = ref('')
    const fullscreenImage = ref(null)
    const zoomLevel = ref(1)
    const minZoom = 0.5
    const maxZoom = 5
    const zoomStep = 0.2

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
      heightWithObjectCm: null,
      lengthWithObjectCm: null,
      widthWithObjectCm: null,
      expositionNumber: '',
      function: '',
      instructions: '',
      materials: '',
      location: '',
      crate: '',
      exposition: '',
      reserved: false,
      antiSeismic: false,
      doNotAdapt: false,
      showcase: null,
      numberOfElements: '',
      adjustableHeight: false,
      comments: '',
      photos: [],
      // legacy single image field (demo data uses imageUrl) and optional caption
      imageUrl: '',
      imageUrlCaption: ''
    })

    // Load expositions and socle data
    const loadExpositions = async () => {
      try {
        availableExpositions.value = await expositionsDB.getAll()
      } catch (error) {
        console.error('Error loading expositions:', error)
      }
    }

    onMounted(async () => {
      await loadExpositions()
      // Load available expositions
      try {
        availableExpositions.value = await expositionsDB.getAll()
      } catch (error) {
        console.error('Error loading expositions:', error)
      }

      // Load socle data if editing
      const socleId = route.params.id
      if (socleId) {
        isEditing.value = true
        try {
          const socle = await soclesDB.getById(parseInt(socleId))
          if (socle) {
            // Ensure photos array exists and convert old values
            form.value = {
              ...socle,
              photos: socle.photos || [],
              reserved: !!socle.reserved,
              antiSeismic: !!socle.antiSeismic,
              doNotAdapt: !!socle.doNotAdapt,
              showcase: socle.showcase === true ? true : socle.showcase === false ? false : null,
              imageUrl: socle.imageUrl || '',
              imageUrlCaption: socle.imageUrlCaption || ''
            }
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

    // Open exposition modal with iframe
    const openExpositionModal = () => {
      showExpoModal.value = true
    }

    const closeExpositionModal = async () => {
      showExpoModal.value = false
      // Refresh expositions list after closing
      await loadExpositions()
    }

    // Listen for postMessage events from the iframe to auto-select created exposition
    const onMessage = async (ev) => {
      try {
        if (!ev || !ev.data) return
        const payload = ev.data
        if (payload && payload.type === 'exposition-created') {
          // payload.data expected to contain { shortTitle }
          if (payload.data && payload.data.shortTitle) {
            form.value.exposition = payload.data.shortTitle
          }
          await loadExpositions()
          showExpoModal.value = false
        }
      } catch (e) {
        console.warn('onMessage: error handling message', e)
      }
    }

    // Attach message listener
    window.addEventListener('message', onMessage)
    
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

    // Handle photo upload
    const handlePhotoUpload = (event) => {
      const files = event.target.files
      if (!files || files.length === 0) return

      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          form.value.photos.push({
            url: e.target.result,
            caption: '',
            uploadedAt: new Date().toISOString()
          })
        }
        reader.readAsDataURL(file)
      })

      // Reset input to allow re-uploading the same file
      event.target.value = ''
    }

    // Remove a photo (supports uploaded photos and legacy imageUrl)
    const removePhoto = (index, isImageUrl = false) => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return

      if (isImageUrl) {
        form.value.imageUrl = ''
        form.value.imageUrlCaption = ''
        return
      }

      if (typeof index === 'number' && form.value.photos && form.value.photos.length > index) {
        form.value.photos.splice(index, 1)
      }
    }

    // Remove main image (direct function for the X button)
    const removeMainImage = () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return
      form.value.imageUrl = ''
      form.value.imageUrlCaption = ''
    }

    // Fullscreen image viewer functions
    const openFullscreen = (imageUrl) => {
      fullscreenImageUrl.value = imageUrl
      showFullscreen.value = true
      zoomLevel.value = 1
      // Add event listeners for keyboard and touch events
      document.addEventListener('keydown', handleKeyboardZoom)
      document.addEventListener('wheel', handleWheelZoom, { passive: false })
      if (fullscreenImage.value) {
        fullscreenImage.value.addEventListener('touchstart', handleTouchStart, { passive: false })
        fullscreenImage.value.addEventListener('touchmove', handleTouchMove, { passive: false })
      }
    }

    const closeFullscreen = () => {
      showFullscreen.value = false
      fullscreenImageUrl.value = ''
      zoomLevel.value = 1
      // Remove event listeners
      document.removeEventListener('keydown', handleKeyboardZoom)
      document.removeEventListener('wheel', handleWheelZoom)
      if (fullscreenImage.value) {
        fullscreenImage.value.removeEventListener('touchstart', handleTouchStart)
        fullscreenImage.value.removeEventListener('touchmove', handleTouchMove)
      }
    }

    // Keyboard zoom: CTRL + / CTRL -
    const handleKeyboardZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault()
          zoomLevel.value = Math.min(maxZoom, zoomLevel.value + zoomStep)
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault()
          zoomLevel.value = Math.max(minZoom, zoomLevel.value - zoomStep)
        }
      } else if (e.key === 'Escape') {
        closeFullscreen()
      }
    }

    // Mouse wheel zoom
    const handleWheelZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (e.deltaY < 0) {
          zoomLevel.value = Math.min(maxZoom, zoomLevel.value + zoomStep)
        } else {
          zoomLevel.value = Math.max(minZoom, zoomLevel.value - zoomStep)
        }
      }
    }

    // Touch events for pinch zoom
    let touchDistance = 0
    let initialZoom = 1

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        touchDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        initialZoom = zoomLevel.value
      }
    }

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const newDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        const scale = newDistance / touchDistance
        zoomLevel.value = Math.min(maxZoom, Math.max(minZoom, initialZoom * scale))
      }
    }

    // QR Scanner functions
    const openQRScanner = () => {
      showQRScanner.value = true
    }

    const closeQRScanner = () => {
      showQRScanner.value = false
    }

    const handleQRScan = async (result) => {
      closeQRScanner()
      // Try to find socle by inventory number
      const socles = await soclesDB.getAll()
      const socle = socles.find(s => s.inventoryNumber === result)
      if (socle) {
        router.push({ name: 'SocleEdit', params: { id: socle.id } })
      } else {
        alert('Aucun socle trouvé avec ce numéro d\'inventaire')
      }
    }

    // Clean up message listener when component unmounts
    onUnmounted(() => {
      try { window.removeEventListener('message', onMessage) } catch (e) { /* ignore */ }
    })

    // Generate QR code locally and produce a PDF containing the QR (link to public URL)
    const generateInProgress = ref(false)

    const generateQRCodePdf = async () => {
      if (generateInProgress.value) return
      generateInProgress.value = true
      try {
        const inv = (form.value.inventoryNumber || '').trim()
        if (!inv) {
          alert('Veuillez renseigner le numéro d\'inventaire avant de générer le QR code')
          return
        }

        const targetUrl = `https://socles.ideesculture.fr/socles/${encodeURIComponent(inv)}`

        // Generate dataURL for QR locally
        const dataUrl = await QRCode.toDataURL(targetUrl, { width: 400, margin: 1 })

        // Create PDF: A4 portrait, place title and centered QR
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
        const pageW = pdf.internal.pageSize.getWidth()

        // Title
        pdf.setFontSize(16)
        pdf.text(`Socle ${inv}`, pageW / 2, 30, { align: 'center' })

        // Image sizing: target width 80mm
        const imgTargetWidth = 80
        let imgTargetHeight = imgTargetWidth
        try {
          const imgProps = pdf.getImageProperties(dataUrl)
          if (imgProps && imgProps.width && imgProps.height) {
            const ratio = imgProps.width / imgProps.height
            imgTargetHeight = imgTargetWidth / ratio
          }
        } catch (e) {
          // ignore
        }

        const x = (pageW - imgTargetWidth) / 2
        const y = 40
        pdf.addImage(dataUrl, 'PNG', x, y, imgTargetWidth, imgTargetHeight)

        // Add the target URL below the QR
        pdf.setFontSize(10)
        pdf.text(targetUrl, pageW / 2, y + imgTargetHeight + 12, { align: 'center' })

        pdf.save(`socle_qr_${inv}.pdf`)
      } catch (err) {
        console.error('generateQRCodePdf error', err)
        alert('Erreur lors de la génération du PDF QR code')
      } finally {
        generateInProgress.value = false
      }

    }

    return {
      isEditing,
      activeTab,
      tabs,
      form,
      availableExpositions,
      showQRScanner,
      showExpoModal,
      expoIframeSrc,
      openExpositionModal,
      closeExpositionModal,
      generateQRCodePdf,
      generateInProgress,
      handleSubmit,
      goBack,
      handlePhotoUpload,
      removePhoto,
      removeMainImage,
      openQRScanner,
      closeQRScanner,
      handleQRScan,
      // Fullscreen viewer
      showFullscreen,
      fullscreenImageUrl,
      fullscreenImage,
      zoomLevel,
      openFullscreen,
      closeFullscreen
    }
  }
}
</script>

<style scoped>
.socle-form-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #a5b4fc 0%, #3b5bdb 100%);
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

/* Checkbox styles */
.checkbox-group {
  margin-bottom: var(--spacing-md);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.checkbox-label span {
  user-select: none;
}

/* Select styles */
.form-select {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select:hover {
  border-color: var(--color-primary);
}

.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

/* Photos Section */
.photos-section {
  width: 100%;
}

.photo-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--color-surface-variant);
}

.photo-input:hover {
  border-color: var(--color-primary);
  background: #f8fafc;
}

.help-text {
  margin-top: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.photo-card {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.photo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.photo-preview {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.photo-overlay {
  position: absolute;
  top: 0;
  right: 0;
  padding: var(--spacing-sm);
  opacity: 0;
  transition: opacity 0.2s;
}

.remove-photo-btn {
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-photo-btn:hover {
  background: rgba(185, 28, 28, 1);
}

.photo-info {
  padding: var(--spacing-md);
}

.photo-caption {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.photo-caption:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* Exposition inline add button */
.exposition-inline {
  display: flex;
  gap: 12px;
  align-items: center;
}

.add-exposition-inline {
  background: #2563eb; /* blue */
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.add-exposition-inline:hover {
  background: #1e40af;
}

/* Iframe modal styles */
.iframe-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
}
.iframe-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.iframe-container {
  width: 95%;
  height: 90%;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}
.iframe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  background: #f8fafc;
}
.iframe-title {
  font-weight: 700;
}
.iframe-actions { }
.iframe-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
.expo-iframe {
  flex: 1 1 auto;
  width: 100%;
  border: none;
}

.empty-photos {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  background: var(--color-surface-variant);
  border-radius: var(--radius-lg);
  margin-top: var(--spacing-lg);
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

.generate-qr-button {
  padding: var(--spacing-md) var(--spacing-lg);
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.generate-qr-button:hover { background: #1e40af }
.generate-qr-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.qr-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.qr-loading {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
.spinner {
  animation: spin 1s linear infinite;
}
.spinner .path {
  stroke: white;
  stroke-linecap: round;
}

.dimensions-grid {
	border-left: 2px solid lightgray;
    padding-left: 10px;
	gap: 0.4em;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
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

  .container {
	padding: var(--spacing-sm) 0;
  }
  .form-group,
  .draft-toggle {
	margin-bottom: var(--spacing-sm);
  }
  label {
	font-size: 0.8rem;
	margin-bottom: 2px;
  }

  .form-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .cancel-button,
  .generate-qr-button,
  .save-button {
    flex: 1;
    min-width: 80px;
  }

  input, select, select.form-select {
	padding: 6px 8px;
  }

}

/* Photo caption container with delete button */
.photo-caption-container {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.photo-caption-container .photo-caption {
  flex: 1;
}

.delete-main-image-btn {
  background: #dc2626;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.delete-main-image-btn:hover {
  background: #b91c1c;
}

/* Fullscreen image viewer */
.fullscreen-viewer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.fullscreen-content {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  overflow: auto;
  padding: 40px;
}

.fullscreen-content img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-x pan-y pinch-zoom;
}

.fullscreen-close {
  position: fixed;
  top: 20px;
  right: 20px;
  background: transparent;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 40px;
  font-weight: normal;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 2001;
  padding: 10px;
}

.fullscreen-close:hover {
  transform: scale(1.2);
  opacity: 0.8;
}

@media (max-width: 768px) {
  .fullscreen-content {
    padding: 20px;
  }

  .fullscreen-close {
    top: 10px;
    right: 10px;
    font-size: 32px;
    padding: 8px;
  }
}
</style>
