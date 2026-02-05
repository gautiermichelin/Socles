<template>
  <div class="legal-notice-view">
    <AppHeader />

    <div class="container">
      <div class="header">
        <button @click="goBack" class="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Retour
        </button>
        <h2>Mentions légales</h2>
      </div>

      <div class="content-container">
        <div v-if="loading" class="loading-spinner">
          Chargement des mentions légales...
        </div>
        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>
        <div v-else v-html="legalNotice" class="legal-content"></div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { settingsDB } from '../services/db'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

export default {
  name: 'LegalNoticeView',
  components: {
    AppHeader,
    AppFooter
  },
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const legalNotice = ref('')
    const error = ref('')

    const goBack = () => {
      router.back()
    }

    const fetchLegalNotice = async () => {
      loading.value = true
      error.value = ''

      try {
        const webServiceUrl = await settingsDB.get('webServiceUrl')

        if (!webServiceUrl) {
          throw new Error('URL du webservice non configurée')
        }

        const response = await fetch(`${webServiceUrl}?action=getLegalNotice`)

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        if (data.content) {
          legalNotice.value = data.content
        } else {
          throw new Error('Contenu des mentions légales introuvable')
        }
      } catch (err) {
        console.error('Error fetching legal notice:', err)
        error.value = `Impossible de charger les mentions légales: ${err.message}`
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchLegalNotice()
    })

    return {
      loading,
      legalNotice,
      error,
      goBack
    }
  }
}
</script>

<style scoped>
.legal-notice-view {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  width: 100%;
}

.header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
  background: #f3f4f6;
  transform: translateX(-2px);
}

.header h2 {
  font-size: 2rem;
  color: var(--color-text);
  margin: 0;
}

.content-container {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.loading-spinner {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.error-message {
  text-align: center;
  padding: var(--spacing-xl);
  color: #dc2626;
  font-weight: 600;
  font-size: 1.1rem;
}

.legal-content {
  line-height: 1.8;
  color: var(--color-text);
}

.legal-content h1,
.legal-content h2,
.legal-content h3 {
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.legal-content h1 {
  font-size: 2rem;
}

.legal-content h2 {
  font-size: 1.5rem;
}

.legal-content h3 {
  font-size: 1.25rem;
}

.legal-content p {
  margin-bottom: var(--spacing-md);
}

.legal-content ul,
.legal-content ol {
  margin-left: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
}

.legal-content li {
  margin-bottom: var(--spacing-sm);
}

.legal-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.legal-content a:hover {
  color: #2563eb;
}

@media (max-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .header h2 {
    font-size: 1.5rem;
  }

  .content-container {
    padding: var(--spacing-lg);
  }

  .legal-content h1 {
    font-size: 1.5rem;
  }

  .legal-content h2 {
    font-size: 1.25rem;
  }

  .legal-content h3 {
    font-size: 1.1rem;
  }
}
</style>
