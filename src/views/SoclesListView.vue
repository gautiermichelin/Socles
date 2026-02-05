<template>
  <div class="socles-list-view">
    <AppHeader @open-qr-scanner="openQRScanner" />

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

      <button @click="toggleFilters" class="toggle-filters-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4h18M3 12h12M3 20h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Filtrer
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div v-show="showFilters" class="filter-bar">
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
			<span :class="type">
            	{{ type }}
			</span>
          </option>
        </select>
        
        <div class="view-toggle" style="display:flex;gap:8px;align-items:center;">
          <button @click="viewMode = 'tiles'" :class="{active: viewMode === 'tiles'}" class="export-button">Tuiles</button>
          <button @click="viewMode = 'table'" :class="{active: viewMode === 'table'}" class="export-button">Liste</button>
        </div>

        <button @click="exportToXLSX" class="export-button">XLSX</button>
      </div>

      <!-- SearchPanes filters -->
      <div v-show="showFilters" class="search-panes-section">
        <button @click="showSearchPanes = !showSearchPanes" class="search-panes-toggle">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Filtres avancés
          <span v-if="hasActivePaneFilters" class="pane-filter-badge">{{ filterCrate.length + filterReserved.length + filterAntiSeismic.length + filterDoNotAdapt.length + filterShowcase.length }}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="{ transform: showSearchPanes ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div v-show="showSearchPanes" class="search-panes-container">
          <div class="search-panes-grid">
            <!-- Caisse -->
            <div class="search-pane">
              <div class="search-pane-header">Caisse</div>
              <div class="search-pane-items">
                <div
                  v-for="[value, count] in paneValues.crate"
                  :key="'crate-' + value"
                  class="search-pane-item"
                  :class="{ selected: filterCrate.includes(value) }"
                  @click="togglePaneFilter('crate', value)"
                >
                  <span class="pane-item-label">{{ value }}</span>
                  <span class="pane-item-count">{{ count }}</span>
                </div>
              </div>
            </div>

            <!-- Réservé -->
            <div class="search-pane">
              <div class="search-pane-header">Réservé</div>
              <div class="search-pane-items">
                <div
                  v-for="[value, count] in paneValues.reserved"
                  :key="'reserved-' + value"
                  class="search-pane-item"
                  :class="{ selected: filterReserved.includes(value) }"
                  @click="togglePaneFilter('reserved', value)"
                >
                  <span class="pane-item-label">{{ value }}</span>
                  <span class="pane-item-count">{{ count }}</span>
                </div>
              </div>
            </div>

            <!-- Anti-sismique -->
            <div class="search-pane">
              <div class="search-pane-header">Anti-sismique</div>
              <div class="search-pane-items">
                <div
                  v-for="[value, count] in paneValues.antiSeismic"
                  :key="'anti-' + value"
                  class="search-pane-item"
                  :class="{ selected: filterAntiSeismic.includes(value) }"
                  @click="togglePaneFilter('antiSeismic', value)"
                >
                  <span class="pane-item-label">{{ value }}</span>
                  <span class="pane-item-count">{{ count }}</span>
                </div>
              </div>
            </div>

            <!-- Ne pas adapter -->
            <div class="search-pane">
              <div class="search-pane-header">Ne pas adapter</div>
              <div class="search-pane-items">
                <div
                  v-for="[value, count] in paneValues.doNotAdapt"
                  :key="'adapt-' + value"
                  class="search-pane-item"
                  :class="{ selected: filterDoNotAdapt.includes(value) }"
                  @click="togglePaneFilter('doNotAdapt', value)"
                >
                  <span class="pane-item-label">{{ value }}</span>
                  <span class="pane-item-count">{{ count }}</span>
                </div>
              </div>
            </div>

            <!-- En vitrine / hors vitrine -->
            <div class="search-pane">
              <div class="search-pane-header">Vitrine</div>
              <div class="search-pane-items">
                <div
                  v-for="[value, count] in paneValues.showcase"
                  :key="'showcase-' + value"
                  class="search-pane-item"
                  :class="{ selected: filterShowcase.includes(value) }"
                  @click="togglePaneFilter('showcase', value)"
                >
                  <span class="pane-item-label">{{ value }}</span>
                  <span class="pane-item-count">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>

          <button v-if="hasActivePaneFilters" @click="clearAllPaneFilters" class="clear-pane-filters-btn">
            Effacer tous les filtres
          </button>
        </div>
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
              <h3>
                <span
                  class="inventory-badge"
                  :class="getTypologyColor(socle.typography)"
                ></span>
                {{ socle.inventoryNumber || 'Sans numéro' }}
              </h3>
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

    <!-- Table view: render full width outside the centered .container -->
    <div v-if="!loading && filteredSocles.length > 0 && viewMode === 'table'" class="table-full-width">
      <div class="table-view" style="width:100%;">
        <div class="dt-container">
          <table ref="tableRef" class="display" style="width:100%">
          <thead>
            <tr>
              <th>
                <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" />
              </th>
              <th>N° expo</th>
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
              <td>
                <input type="checkbox" :checked="selectedSocles.has(socle.id)" @change="toggleSelectSocle(socle.id)" />
              </td>
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
                <div class="actions">
                  <button @click.stop="goToEdit(socle.id)" class="icon-button" title="Éditer" aria-label="Éditer">
                    <!-- Page (edit) icon -->
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14 2v6h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9.5 13.5l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M13.5 9.5l1.5 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button @click.stop="deleteSocle(socle.id)" class="icon-button delete" title="Supprimer" aria-label="Supprimer">
                    <!-- Trash icon -->
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M3 6h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Re-open centered container for subsequent content -->
    <div class="container">
      <div class="cache-management">
        <button @click="purgeCacheLocal" class="cache-button danger-button">
          <span class="warning-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9v4m0 4h.01M4.93 19h14.14c1.45 0 2.37-1.57 1.64-2.81L13.64 4.19a1.86 1.86 0 0 0-3.28 0L3.29 16.19C2.56 17.43 3.48 19 4.93 19z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          Purger le cache local
        </button>
        <button @click="downloadFromServer" class="cache-button primary-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Charger depuis le serveur
        </button>
        <a href="https://ideesculture.notion.site/Mus-e-du-Quai-Branly-application-socle-2ea310f7cc24803390ddc3f4be6e55ed" target="_blank" rel="noopener noreferrer" class="cache-button primary-button" style="text-decoration:none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Documentation
        </a>
        <a href="https://socles.ideesculture.fr/gestion" target="_blank" rel="noopener noreferrer" class="cache-button primary-button" style="text-decoration:none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Administration
        </a>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
// jQuery + DataTables are provided globally from `main.js` to avoid multiple instances under Vite dev/HMR
import { useRouter } from 'vue-router'
import { soclesDB } from '../services/db'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import QRScanner from '../components/QRScanner.vue'
import * as XLSX from 'xlsx'

const API_BASE_URL = 'https://socles.ideesculture.fr/gestion/soclesIo/index.php'

export default {
  name: 'SoclesListView',
  components: {
    AppHeader,
    AppFooter,
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
    const showFilters = ref(true) // Show filters by default on desktop, will be hidden on mobile
    const showSearchPanes = ref(false)
    const selectedSocles = ref(new Set())

    // SearchPanes filter selections (arrays for Vue reactivity)
    const filterCrate = ref([])
    const filterReserved = ref([])
    const filterAntiSeismic = ref([])
    const filterDoNotAdapt = ref([])
    const filterShowcase = ref([])


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

    // SearchPanes: compute distinct values with counts for each filter column
    const paneValues = computed(() => {
      // Base set: apply search, exposition & typologie filters but NOT searchpane filters
      let base = socles.value

      if (selectedExposition.value) {
        base = base.filter(s => s.exposition === selectedExposition.value)
      }
      if (selectedTypologie.value) {
        base = base.filter(s => s.typography === selectedTypologie.value)
      }
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        base = base.filter(s =>
          (s.inventoryNumber && s.inventoryNumber.toLowerCase().includes(q)) ||
          (s.exposition && s.exposition.toLowerCase().includes(q)) ||
          (s.typography && s.typography.toLowerCase().includes(q)) ||
          (s.location && s.location.toLowerCase().includes(q))
        )
      }

      const count = (arr, fn) => {
        const map = new Map()
        arr.forEach(s => {
          const val = fn(s)
          map.set(val, (map.get(val) || 0) + 1)
        })
        return Array.from(map.entries()).sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      }

      return {
        crate: count(base, s => s.crate || '(vide)'),
        reserved: count(base, s => s.reserved ? 'Oui' : 'Non'),
        antiSeismic: count(base, s => s.antiSeismic ? 'Oui' : 'Non'),
        doNotAdapt: count(base, s => s.doNotAdapt ? 'Oui' : 'Non'),
        showcase: count(base, s => s.showcase === true ? 'En vitrine' : s.showcase === false ? 'Hors vitrine' : '-')
      }
    })

    // Toggle a value in a SearchPane filter set
    const paneFilterRefs = {
      crate: filterCrate,
      reserved: filterReserved,
      antiSeismic: filterAntiSeismic,
      doNotAdapt: filterDoNotAdapt,
      showcase: filterShowcase
    }

    const togglePaneFilter = (filterName, value) => {
      console.log('togglePaneFilter called:', filterName, value)
      const filterRef = paneFilterRefs[filterName]
      if (!filterRef) {
        console.error('No filterRef for', filterName)
        return
      }
      console.log('Before:', JSON.stringify(filterRef.value))
      const idx = filterRef.value.indexOf(value)
      if (idx >= 0) {
        filterRef.value = filterRef.value.filter((_, i) => i !== idx)
      } else {
        filterRef.value = [...filterRef.value, value]
      }
      console.log('After:', JSON.stringify(filterRef.value))
    }

    const clearAllPaneFilters = () => {
      filterCrate.value = []
      filterReserved.value = []
      filterAntiSeismic.value = []
      filterDoNotAdapt.value = []
      filterShowcase.value = []
    }

    const hasActivePaneFilters = computed(() => {
      return filterCrate.value.length > 0 ||
        filterReserved.value.length > 0 ||
        filterAntiSeismic.value.length > 0 ||
        filterDoNotAdapt.value.length > 0 ||
        filterShowcase.value.length > 0
    })

    // Filter socles based on search query, selected exposition and searchpane filters
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

      // SearchPane filters
      if (filterCrate.value.length > 0) {
        filtered = filtered.filter(s => filterCrate.value.includes(s.crate || '(vide)'))
      }
      if (filterReserved.value.length > 0) {
        filtered = filtered.filter(s => filterReserved.value.includes(s.reserved ? 'Oui' : 'Non'))
      }
      if (filterAntiSeismic.value.length > 0) {
        filtered = filtered.filter(s => filterAntiSeismic.value.includes(s.antiSeismic ? 'Oui' : 'Non'))
      }
      if (filterDoNotAdapt.value.length > 0) {
        filtered = filtered.filter(s => filterDoNotAdapt.value.includes(s.doNotAdapt ? 'Oui' : 'Non'))
      }
      if (filterShowcase.value.length > 0) {
        filtered = filtered.filter(s => filterShowcase.value.includes(
          s.showcase === true ? 'En vitrine' : s.showcase === false ? 'Hors vitrine' : '-'
        ))
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
            // destroy existing instance if any (keep DOM so Vue can manage it)
            if (dataTableInstance) {
              try { dataTableInstance.destroy(false) } catch (e) { console.warn(e) }
              dataTableInstance = null
            }

            // wait for Vue to re-render rows after destroy, then let layout settle
            await nextTick()
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

    watch(filteredSocles, async () => {
      // if table view is active, reinit after Vue has re-rendered the rows
      if (viewMode.value === 'table') {
        await nextTick()
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
    
    // Delete socle from server
    const deleteSocleFromServer = async (inventoryNumber) => {
      try {
        const formData = new FormData()
        formData.append('action', 'deleteSocle')
        formData.append('inventoryNumber', inventoryNumber)

        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const result = await response.json()

        if (result.result === true) {
          console.log('Socle deleted from server successfully:', inventoryNumber)
          return true
        } else {
          console.error('Webservice delete error:', result.message)
          return false
        }
      } catch (error) {
        console.error('Failed to delete socle from server:', error)
        return false
      }
    }

    // Delete socle
    const deleteSocle = async (id) => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce socle ?')) {
        return
      }

      try {
        // Get socle data before deleting (to get inventory number for server deletion)
        const socleData = await soclesDB.getById(id)
        const inventoryNumber = socleData?.inventoryNumber

        // Delete from local database
        await soclesDB.delete(id)
        await loadSocles()

        // Ask if user wants to delete from server too (only if we have an inventory number)
        if (inventoryNumber && confirm('Voulez-vous également supprimer ce socle du serveur ?')) {
          const deleteSuccess = await deleteSocleFromServer(inventoryNumber)
          if (deleteSuccess) {
            alert('Socle supprimé du serveur avec succès')
          } else {
            alert('Le socle a été supprimé localement, mais la suppression sur le serveur a échoué')
          }
        } else if (!inventoryNumber && confirm('Voulez-vous également supprimer ce socle du serveur ?')) {
          alert('Impossible de supprimer du serveur : numéro d\'inventaire manquant')
        }
      } catch (error) {
        console.error('Error deleting socle:', error)
        alert('Une erreur est survenue lors de la suppression')
      }
    }

    // Selection functions
    const toggleSelectSocle = (socleId) => {
      if (selectedSocles.value.has(socleId)) {
        selectedSocles.value.delete(socleId)
      } else {
        selectedSocles.value.add(socleId)
      }
      // Trigger reactivity
      selectedSocles.value = new Set(selectedSocles.value)
    }

    const toggleSelectAll = (event) => {
      if (event.target.checked) {
        selectedSocles.value = new Set(filteredSocles.value.map(socle => socle.id))
      } else {
        selectedSocles.value = new Set()
      }
    }

    const isAllSelected = computed(() => {
      return filteredSocles.value.length > 0 &&
             filteredSocles.value.every(socle => selectedSocles.value.has(socle.id))
    })

    // Get typology color for badge
    const getTypologyColor = (typography) => {
      if (!typography) return ''

      const normalizedType = typography.toLowerCase().trim()

      // Blue for "Morpho piqué fond"
      if (normalizedType === 'morpho piqué fond') {
        return 'badge-blue'
      }

      // Green for other typologies
      const greenTypes = [
        'morpho piqué base',
        'morpho sur platine',
        'piqué base',
        'soclet'
      ]

      if (greenTypes.some(type => normalizedType === type.toLowerCase())) {
        return 'badge-green'
      }

      return ''
    }

    // Toggle filters visibility
    const toggleFilters = () => {
      showFilters.value = !showFilters.value
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

    // Purge local cache (delete all socles)
    const purgeCacheLocal = async () => {
      if (!confirm('Êtes-vous sûr de vouloir purger tous les socles du cache local ?')) {
        return
      }

      try {
        loading.value = true
        await soclesDB.deleteAll()
        await loadSocles()
        alert('Cache local purgé avec succès')
      } catch (error) {
        console.error('Error purging cache:', error)
        alert('Une erreur est survenue lors de la purge du cache')
      } finally {
        loading.value = false
      }
    }

    // Download from server (replace all socles with server data)
    const downloadFromServer = async () => {
      if (!confirm('Êtes-vous sûr de vouloir remplacer toutes les données locales par les données du serveur ?')) {
        return
      }

      try {
        loading.value = true

        // Call webservice to get all socles
        const formData = new FormData()
        formData.append('action', 'getAllSocles')

        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.json()

        if (data.result === true && data.socles && Array.isArray(data.socles)) {
          console.log('Received socles from server:', data.socles.length)
          console.log('First socle sample:', data.socles[0])

          // Delete all local socles
          await soclesDB.deleteAll()

          // Insert server socles into local database
          // Use put() to insert with existing server IDs
          for (const socleWrapper of data.socles) {
            // Extract socle data from wrapper object
            const socle = socleWrapper.data || socleWrapper

            // Ensure the socle has required fields
            const socleToInsert = {
              ...socle,
              createdAt: socle.createdAt || new Date().toISOString(),
              updatedAt: socle.updatedAt || new Date().toISOString(),
              photos: socle.photos || [],
              comments: socle.comments || '',
              isDraft: socle.isDraft !== undefined ? socle.isDraft : false
            }

            console.log('Inserting socle with ID:', socleToInsert.id, 'inventoryNumber:', socleToInsert.inventoryNumber)

            // Use put() which inserts/updates with the existing ID from server
            await soclesDB.put(socleToInsert)
          }

          // Reload socles
          await loadSocles()

          console.log('Socles after reload:', socles.value.length)
          if (socles.value.length > 0) {
            console.log('First loaded socle:', socles.value[0])
          }

          alert(`${data.socles.length} socle(s) téléchargé(s) depuis le serveur`)
        } else {
          throw new Error(data.message || 'Failed to fetch socles from server')
        }
      } catch (error) {
        console.error('Error downloading from server:', error)
        alert('Une erreur est survenue lors du téléchargement depuis le serveur')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadSocles()
      // start aggressive initialization in case DataTables loads late under Vite HMR
      startAggressiveInit()

      // Hide filters by default on mobile
      if (window.innerWidth <= 768) {
        showFilters.value = false
      }
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
      showFilters,
      toggleFilters,
      formatDate,
      goToCreate,
      goToEdit,
      deleteSocle,
      getTypologyColor,
      openQRScanner,
      closeQRScanner,
      handleQRScan,
      exportToXLSX,
      exportToCSV,
      purgeCacheLocal,
      downloadFromServer,
      selectedSocles,
      toggleSelectSocle,
      toggleSelectAll,
      isAllSelected,
      showSearchPanes,
      filterCrate,
      filterReserved,
      filterAntiSeismic,
      filterDoNotAdapt,
      filterShowcase,
      paneValues,
      togglePaneFilter,
      clearAllPaneFilters,
      hasActivePaneFilters
    }
  }
}
</script>

<style scoped>
.socles-list-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #a5b4fc 0%, #3b5bdb 100%);
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

.toggle-filters-btn {
  display: none;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: white;
  color: var(--color-text);
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: var(--spacing-md);
  width: 100%;
  justify-content: center;
  transition: all 0.2s;
}

.toggle-filters-btn:hover {
  background: #f3f4f6;
  border-color: var(--color-primary);
  color: var(--color-primary);
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
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.inventory-badge {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.inventory-badge.badge-blue {
  background-color: #3b82f6;
}

.inventory-badge.badge-green {
  background-color: #10b981;
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

/* DataTables container: small padding and white background applied to full-width wrapper */
.table-full-width {
  padding: 12px 20px;
  background: #ffffff;
  max-width: 100vw;
  overflow-x: auto;
}

.dt-container {
  max-width: 100%;
  overflow-x: auto;
}

/* Icon buttons in table actions */
.icon-button {
  background: none;
  border: none;
  padding: 6px;
  margin: 0 4px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon-button:hover {
  background: rgba(0,0,0,0.04);
}
.icon-button.delete {
  color: #dc2626;
}

/* Actions container for table row buttons */
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
}

/* Responsive for mobile */
@media (max-width: 768px) {
  .toggle-filters-btn {
    display: flex;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .filter-bar label {
    margin-bottom: 4px;
  }

  .exposition-select,
  .typologie-select {
    width: 100%;
    min-width: auto;
  }

  .view-toggle {
    width: 100%;
    justify-content: center !important;
  }

  .export-button {
    width: 100%;
  }
}

.card-body .card-field {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

/* Cache management buttons */
.cache-management {
  display: flex;
  gap: var(--spacing-md);
  margin: var(--spacing-xl) 0;
  justify-content: center;
  flex-wrap: wrap;
}

.cache-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cache-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.cache-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.danger-button {
  background: #1f2937;
  color: white;
}

.danger-button:hover {
  background: #111827;
}

.warning-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f97316;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 6px;
}

.warning-icon svg {
  width: 20px;
  height: 20px;
}

.primary-button {
  background: var(--color-primary);
  color: white;
}

.primary-button:hover {
  background: #2563eb;
}

/* SearchPanes */
.search-panes-section {
  margin-bottom: var(--spacing-lg);
}

.search-panes-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.search-panes-toggle:hover {
  background: rgba(255, 255, 255, 0.25);
}

.pane-filter-badge {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  min-width: 20px;
  text-align: center;
}

.search-panes-container {
  margin-top: var(--spacing-md);
}

.search-panes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-md);
}

.search-pane {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.search-pane-header {
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--color-text);
  background: #f3f4f6;
  border-bottom: 1px solid var(--color-border);
}

.search-pane-items {
  max-height: 180px;
  overflow-y: auto;
}

.search-pane-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px var(--spacing-md);
  cursor: pointer;
  transition: background 0.15s;
  font-size: 0.9rem;
  color: var(--color-text);
}

.search-pane-item:hover {
  background: #f0f4ff;
}

.search-pane-item.selected {
  background: #dbeafe;
  font-weight: 600;
  color: var(--color-primary);
}

.pane-item-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: var(--spacing-sm);
}

.pane-item-count {
  background: #e5e7eb;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 999px;
  flex-shrink: 0;
}

.search-pane-item.selected .pane-item-count {
  background: var(--color-primary);
  color: white;
}

.clear-pane-filters-btn {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.clear-pane-filters-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .search-panes-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .search-panes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .cache-management {
    flex-direction: column;
  }

  .cache-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
