<template>
  <div class="socles-list-view">
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

      <div class="filter-bar">
        <label for="exposition-filter">Exposition:</label>
        <select
          id="exposition-filter"
          v-model="selectedExposition"
          class="exposition-select"
        >
          <option value="">Toutes les expositions</option>
          <option
            v-for="expo in availableExpositions"
            :key="expo"
            :value="expo"
          >
            {{ expo }}
          </option>
        </select>
    <label for="typologie-filter">Typologie:</label>
    <select id="typologie-filter" v-model="selectedTypologie" class="typologie-select">
      <option value="">Toutes les typologies</option>
      <option
        v-for="type in availableTypologies"
        :key="type"
        :value="type"
      >
        {{ type }}
      </option>
    </select>
    
      <div class="view-toggle" style="display:flex;gap:8px;align-items:center;">
        <button @click="viewMode = 'tiles'" :class="{active: viewMode === 'tiles'}" class="export-button">Tuiles</button>
        <button @click="viewMode = 'table'" :class="{active: viewMode === 'table'}" class="export-button">Liste</button>
      </div>

      <button @click="exportToCSV" class="export-button">CSV</button>
      <button @click="exportToXLSX" class="export-button">XLSX</button>

		</div>

      <div v-if="loading" class="loading">
        Chargement...
      </div>
      
      <div v-else-if="filteredSocles.length === 0" class="empty-state">
        <p v-if="searchQuery">Aucun socle ne correspond à votre recherche.</p>
        <p v-else>Aucun socle enregistré. Créez votre premier socle !</p>
      </div>
      
      <div v-else>
        <div v-if="viewMode === 'tiles'" class="socles-grid">
          <div
            v-for="socle in filteredSocles"
            :key="socle.id"
            class="socle-card"
            @click="goToEdit(socle.id)"
          >
            <!-- Image container -->
            <div v-if="socle.photos && socle.photos.length > 0" class="card-image">
              <img :src="socle.photos[0].url" :alt="socle.inventoryNumber" />
            </div>
            <div v-else-if="socle.imageUrl" class="card-image">
              <img :src="socle.imageUrl" :alt="socle.inventoryNumber" />
            </div>
            <div v-else class="card-image-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

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

        <div v-else class="table-view">
          <table ref="tableRef" class="display" style="width:100%">
            <thead>
              <tr>
                <th>Numéro d'exposition</th>
                <th>N°INV objet</th>
                <th>Image socle</th>
                <th>Hauteur (cm)</th>
                <th>Longueur (cm)</th>
                <th>Largeur (cm)</th>
                <th>Typologie</th>
                <th>Fonction du socle</th>
                <th>Instruction de montage</th>
                <th>Matériaux/Couleur</th>
                <th>Localisation</th>
                <th>Caisse</th>
                <th>Expositions</th>
                <th>Réservé</th>
                <th>Anti-sismique</th>
                <th>Ne pas adapter</th>
                <th>En vitrine / hors vitrine</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="socle in filteredSocles" :key="socle.id">
                <td>{{ socle.expositionNumber || '' }}</td>
                <td>{{ socle.inventoryNumber || '' }}</td>
                <td>
                  <img
                    v-if="(socle.photos && socle.photos[0] && socle.photos[0].url) || socle.imageUrl"
                    :src="(socle.photos && socle.photos[0] && socle.photos[0].url) || socle.imageUrl"
                    alt="Image socle"
                    class="table-image"
                  />
                </td>
                <td>{{ socle.heightCm || '' }}</td>
                <td>{{ socle.lengthCm || '' }}</td>
                <td>{{ socle.widthCm || '' }}</td>
                <td>{{ socle.typography || '' }}</td>
                <td>{{ socle.function || '' }}</td>
                <td>{{ socle.instructions || '' }}</td>
                <td>{{ socle.materials || '' }}</td>
                <td>{{ socle.location || '' }}</td>
                <td>{{ socle.crate || '' }}</td>
                <td>{{ socle.exposition || '' }}</td>
                <td>{{ socle.reserved ? 'Oui' : 'Non' }}</td>
                <td>{{ socle.antiSeismic ? 'Oui' : 'Non' }}</td>
                <td>{{ socle.doNotAdapt ? 'Oui' : 'Non' }}</td>
                <td>{{ socle.showcase === true ? 'En vitrine' : socle.showcase === false ? 'Hors vitrine' : '-' }}</td>
                <td>
                  <button @click.stop="goToEdit(socle.id)">Éditer</button>
                  <button @click.stop="deleteSocle(socle.id)">Supprimer</button>
                </td>
              </tr>
            </tbody>
          </table>
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
// jQuery + DataTables are provided globally from `main.js` to avoid multiple instances under Vite dev/HMR
import { useRouter } from 'vue-router'
import { soclesDB, settingsDB } from '../services/db'
import QRScanner from '../components/QRScanner.vue'
import * as XLSX from 'xlsx'

export default {
  name: 'SoclesListView',
  components: {
    QRScanner
  },
  setup() {
    const router = useRouter()
    const socles = ref([])
    const searchQuery = ref('')
    const selectedExposition = ref('')
    const selectedTypologie = ref('')
    const viewMode = ref('tiles') // 'tiles' or 'table'
    const tableRef = ref(null)
    let dataTableInstance = null
    let aggressiveInterval = null
    let aggressiveInitInProgress = false
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

    // Get unique expositions from socles
    const availableExpositions = computed(() => {
      const expositions = new Set()
      socles.value.forEach(socle => {
        if (socle.exposition) {
          expositions.add(socle.exposition)
        }
      })
      return Array.from(expositions).sort()
    })

    // Get unique typologies from socles
    const availableTypologies = computed(() => {
      const types = new Set()
      socles.value.forEach(socle => {
        if (socle.typography) {
          types.add(socle.typography)
        }
      })
      return Array.from(types).sort()
    })

    // Filter socles based on search query and selected exposition
    const filteredSocles = computed(() => {
      let filtered = socles.value

      // Filter by exposition
      if (selectedExposition.value) {
        filtered = filtered.filter(socle =>
          socle.exposition === selectedExposition.value
        )
      }

      // Filter by typologie
      if (selectedTypologie.value) {
        filtered = filtered.filter(socle =>
          socle.typography === selectedTypologie.value
        )
      }

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(socle =>
          (socle.inventoryNumber && socle.inventoryNumber.toLowerCase().includes(query)) ||
          (socle.exposition && socle.exposition.toLowerCase().includes(query)) ||
          (socle.typography && socle.typography.toLowerCase().includes(query)) ||
          (socle.location && socle.location.toLowerCase().includes(query))
        )
      }

      return filtered
    })

    // Dynamically load DataTables when needed. Prefer local package, fall back to CDN.
    const loadDataTables = async () => {
      console.debug('loadDataTables: start')
      if (window.jQuery && window.jQuery.fn && window.jQuery.fn.dataTable) {
        console.debug('loadDataTables: already loaded')
        return Promise.resolve()
      }

      // If DataTables already attached to jQuery (main.js should have provided it), we're done.
      if (window.jQuery && window.jQuery.fn && window.jQuery.fn.dataTable) {
        console.debug('loadDataTables: datatables already available on window.jQuery')
        return Promise.resolve()
      }

      // Fallback: load from CDN
      return new Promise((resolve, reject) => {
        const cssHref = 'https://cdnjs.cloudflare.com/ajax/libs/datatables/1.13.6/css/jquery.dataTables.min.css'
        if (!document.querySelector(`link[href="${cssHref}"]`)) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = cssHref
          document.head.appendChild(link)
        }

        const loadScript = (src) => new Promise((res, rej) => {
          if (document.querySelector(`script[src="${src}"]`)) return res()
          const s = document.createElement('script')
          s.src = src
          s.async = true
          s.onload = res
          s.onerror = rej
          document.head.appendChild(s)
        })

        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.4/jquery.min.js')
          .then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/datatables/1.13.6/js/jquery.dataTables.min.js'))
          .then(() => {
            console.debug('loadDataTables: loaded from CDN')
            resolve()
          })
          .catch(reject)
      })
    }

    const initDataTable = async () => {
      if (!tableRef.value) return
      console.debug('initDataTable: tableRef=', tableRef.value)

      // Polling loop: try to initialize DataTable until jQuery+DataTable and table are ready
      const maxAttempts = 20
      const delayMs = 150
      let attempt = 0
      let initialized = false

      while (attempt < maxAttempts && !initialized) {
        try {
          await loadDataTables()
        } catch (err) {
          console.warn('initDataTable: loadDataTables failed on attempt', attempt, err)
        }

        await nextTick()

        const $ = window.jQuery
        const tableEl = tableRef.value && (tableRef.value instanceof HTMLElement ? tableRef.value : tableRef.value.$el || tableRef.value)

        if ($ && $.fn && $.fn.dataTable && tableEl) {
          try {
            // destroy existing instance if any
            if (dataTableInstance) {
              try { dataTableInstance.destroy(true) } catch (e) { console.warn(e) }
              dataTableInstance = null
            }

            // small pause to let layout settle
            await new Promise(res => setTimeout(res, 20))

            console.debug('initDataTable: initializing DataTable on attempt', attempt)
            dataTableInstance = $(tableEl).DataTable({
              paging: true,
              searching: false,
              info: true,
              autoWidth: false,
              lengthChange: true,
              pageLength: 10,
              responsive: true,
              columnDefs: [
                { orderable: false, targets: 2 }, // image column
                { orderable: false, targets: -1 } // actions column
              ]
            })

            try { dataTableInstance.columns.adjust(); dataTableInstance.draw() } catch (e) { console.warn(e) }
            initialized = true
            console.debug('initDataTable: initialized successfully')
            break
          } catch (err) {
            console.warn('initDataTable: DataTable init failed on attempt', attempt, err)
          }
        } else {
          console.debug('initDataTable: waiting for jQuery/DataTable/table (attempt', attempt, ')')
        }

        attempt++
        await new Promise(res => setTimeout(res, delayMs))
      }

      if (!initialized) {
        console.error('initDataTable: failed to initialize DataTable after', maxAttempts, 'attempts')
      }
    }

    // Aggressive initializer: repeatedly attempt to init DataTables via setInterval
    const startAggressiveInit = () => {
      if (aggressiveInterval) return
      console.debug('startAggressiveInit: starting aggressive interval')
      let attempts = 0
      const maxAttempts = 50
      aggressiveInterval = setInterval(async () => {
        attempts++
        if (viewMode.value !== 'table') return
        if (aggressiveInitInProgress) return
        aggressiveInitInProgress = true
        try {
          await initDataTable()
          if (dataTableInstance) {
            console.debug('startAggressiveInit: DataTable initialized, clearing interval')
            clearInterval(aggressiveInterval)
            aggressiveInterval = null
          }
        } catch (err) {
          console.warn('startAggressiveInit: initDataTable threw', err)
        } finally {
          aggressiveInitInProgress = false
        }

        if (attempts >= maxAttempts && aggressiveInterval) {
          console.error('startAggressiveInit: failed after', attempts, 'attempts')
          clearInterval(aggressiveInterval)
          aggressiveInterval = null
        }
      }, 200)
    }

    // Re-init DataTable when switching to table view or when filtered data changes
    watch(() => viewMode.value, (nv) => {
      if (nv === 'table') initDataTable()
      else if (dataTableInstance) {
        try { dataTableInstance.destroy(true) } catch (e) {}
        dataTableInstance = null
      }
    })

    watch(filteredSocles, (nv) => {
      // if table view is active, reinit to reflect rows
      if (viewMode.value === 'table') {
        // re-init after DOM update
        initDataTable()
      }
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

    // Navigate to home
    const goHome = () => {
      router.push({ name: 'Home' })
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

    // Export to XLSX
    const exportToXLSX = () => {
      try {
        // Prepare data for export
        // Use exact headers and order from the example Excel
        const exportData = filteredSocles.value.map(socle => ({
          "Numéro d'exposition": socle.expositionNumber || '',
          'N°INV objet': socle.inventoryNumber || '',
          'Image socle\r\n(sur la case)': (socle.photos && socle.photos.length > 0 && socle.photos[0].url) || socle.imageUrl || '',
          'Hauteur \r\n(en cm)': socle.heightCm || '',
          'Longueur \r\n(en cm)': socle.lengthCm || '',
          'Largeur \r\n(en cm)': socle.widthCm || '',
          'Typologie': socle.typography || '',
          'Fonction du socle': socle.function || '',
          'Instruction de montage': socle.instructions || '',
          'Matériaux/Couleur': socle.materials || '',
          'Localisation': socle.location || '',
          'Caisse': socle.crate || '',
          'Expositions': socle.exposition || '',
          'Réservé': socle.reserved ? 'Oui' : 'Non',
          'Anti-sismique': socle.antiSeismic ? 'Oui' : 'Non',
          'Ne pas adapter': socle.doNotAdapt ? 'Oui' : 'Non',
          'En vitrine / hors vitrine': socle.showcase === true ? 'En vitrine' : socle.showcase === false ? 'Hors vitrine' : '-',
          'Commentaires': socle.comments || ''
        }))

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Socles')

        // Set column widths
        const colWidths = [
          { wch: 18 }, // Numéro d'exposition
          { wch: 18 }, // N°INV objet
          { wch: 40 }, // Image socle (url)
          { wch: 12 }, // Hauteur
          { wch: 12 }, // Longueur
          { wch: 12 }, // Largeur
          { wch: 20 }, // Typologie
          { wch: 20 }, // Fonction du socle
          { wch: 40 }, // Instruction de montage
          { wch: 25 }, // Matériaux/Couleur
          { wch: 25 }, // Localisation
          { wch: 12 }, // Caisse
          { wch: 25 }, // Expositions
          { wch: 10 }, // Réservé
          { wch: 15 }, // Anti-sismique
          { wch: 15 }, // Ne pas adapter
          { wch: 18 }, // En vitrine / hors vitrine
          { wch: 50 }  // Commentaires
        ]
        ws['!cols'] = colWidths

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0]
        const filename = `socles_export_${timestamp}.xlsx`

        // Write file
        XLSX.writeFile(wb, filename)
      } catch (error) {
        console.error('Error exporting to XLSX:', error)
        alert('Une erreur est survenue lors de l\'export XLSX')
      }
    }

    // Export to CSV
    const exportToCSV = () => {
      try {
        // Prepare data for export using exact headers/order from example
        const exportData = filteredSocles.value.map(socle => ({
          "Numéro d'exposition": socle.expositionNumber || '',
          'N°INV objet': socle.inventoryNumber || '',
          'Image socle\r\n(sur la case)': (socle.photos && socle.photos.length > 0 && socle.photos[0].url) || socle.imageUrl || '',
          'Hauteur \r\n(en cm)': socle.heightCm || '',
          'Longueur \r\n(en cm)': socle.lengthCm || '',
          'Largeur \r\n(en cm)': socle.widthCm || '',
          'Typologie': socle.typography || '',
          'Fonction du socle': socle.function || '',
          'Instruction de montage': socle.instructions || '',
          'Matériaux/Couleur': socle.materials || '',
          'Localisation': socle.location || '',
          'Caisse': socle.crate || '',
          'Expositions': socle.exposition || '',
          'Réservé': socle.reserved ? 'Oui' : 'Non',
          'Anti-sismique': socle.antiSeismic ? 'Oui' : 'Non',
          'Ne pas adapter': socle.doNotAdapt ? 'Oui' : 'Non',
          'En vitrine / hors vitrine': socle.showcase === true ? 'En vitrine' : socle.showcase === false ? 'Hors vitrine' : '-',
          'Commentaires': socle.comments || ''
        }))

        // Use explicit headers to guarantee exact order (even if exportData is empty)
        const headers = [
          "Numéro d'exposition",
          'N°INV objet',
          'Image socle\r\n(sur la case)',
          'Hauteur \r\n(en cm)',
          'Longueur \r\n(en cm)',
          'Largeur \r\n(en cm)',
          'Typologie',
          'Fonction du socle',
          'Instruction de montage',
          'Matériaux/Couleur',
          'Localisation',
          'Caisse',
          'Expositions',
          'Réservé',
          'Anti-sismique',
          'Ne pas adapter',
          'En vitrine / hors vitrine',
          'Commentaires'
        ]

        const csvRows = [
          headers.join(','),
          ...exportData.map(row =>
            headers.map(header => {
              const value = row[header] != null ? row[header] : ''
              // Escape quotes and wrap in quotes if contains comma or quote or newline
              const escaped = String(value).replace(/"/g, '""')
              return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped
            }).join(',')
          )
        ]
        const csvContent = csvRows.join('\n')

        // Create blob and download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        const timestamp = new Date().toISOString().split('T')[0]
        link.setAttribute('href', url)
        link.setAttribute('download', `socles_export_${timestamp}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error exporting to CSV:', error)
        alert('Une erreur est survenue lors de l\'export CSV')
      }
    }

    onMounted(() => {
      loadSocles()
      // start aggressive initialization in case DataTables loads late under Vite HMR
      startAggressiveInit()
    })

    onUnmounted(() => {
      // Clear aggressive interval if running
      try {
        if (aggressiveInterval) {
          clearInterval(aggressiveInterval)
          aggressiveInterval = null
        }
      } catch (e) {
        console.warn('onUnmounted: error clearing aggressiveInterval', e)
      }

      // Destroy DataTable instance if exists
      try {
        if (dataTableInstance) {
          try { dataTableInstance.destroy(true) } catch (e) { console.warn(e) }
          dataTableInstance = null
        }
      } catch (e) {
        console.warn('onUnmounted: error destroying dataTableInstance', e)
      }
    })

    return {
      socles,
      searchQuery,
      selectedExposition,
      selectedTypologie,
      availableTypologies,
      viewMode,
      tableRef,
      availableExpositions,
      loading,
      filteredSocles,
      showQRScanner,
      formatDate,
      goToCreate,
      goToEdit,
      deleteSocle,
      handleLogout,
      goHome,
      openQRScanner,
      closeQRScanner,
      handleQRScan,
      exportToXLSX,
      exportToCSV
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
  margin-bottom: var(--spacing-md);
}

.search-bar input {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 1rem;
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.filter-bar {
  margin-bottom: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.filter-bar label {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.exposition-select {
  flex: 1;
  padding: var(--spacing-md);
  font-size: 1rem;
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.exposition-select:hover {
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.exposition-select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.export-button {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: white;
  color: var(--color-text);
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 0.95rem;
}

.export-button:hover {
  background: #f3f4f6;
  border-color: var(--color-primary);
  color: var(--color-primary);
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
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.socle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f3f4f6;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
}

.card-header {
  padding: var(--spacing-lg) var(--spacing-lg) 0;
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
  padding: 0 var(--spacing-lg);
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

.exposition-select, .typologie-select {
  min-width: 200px;
}

.view-toggle button.active {
  background: #eef6ff;
  border-color: rgba(59,130,246,0.2);
  color: var(--color-primary);
}

.view-toggle button {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.table-view thead th {
  font-size: 9px;
}

.table-image {
  max-width: 80px;
  max-height: 60px;
  object-fit: cover;
  display: block;
}


</style>
