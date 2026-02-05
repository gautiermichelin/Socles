<template>
  <footer class="app-footer">
    <img src="/images/logo-musee-quai-branly.png" alt="Musée du Quai Branly Jacques Chirac" class="footer-logo" />
    <div class="footer-credit">
      Développé par <a href="https://www.ideesculture.com" target="_blank" rel="noopener noreferrer">IdéesCulture</a>
      <span class="footer-separator">•</span>
      <a href="#" @click.prevent="openReportModal" class="report-link">Signaler un problème</a>
      <span class="footer-separator">•</span>
      <a href="#" @click.prevent="openLegalModal" class="legal-link">Mentions légales</a>
    </div>

    <!-- Report Problem Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Signaler un problème</h3>
          <button @click="closeModal" class="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="report-form">
          <div class="form-group">
            <label for="subject">Sujet</label>
            <input
              id="subject"
              v-model="form.subject"
              type="text"
              required
              placeholder="Décrivez brièvement le problème"
            />
          </div>

          <div class="form-group">
            <label for="comment">Commentaire</label>
            <textarea
              id="comment"
              v-model="form.comment"
              required
              rows="5"
              placeholder="Décrivez le problème en détail"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="url">URL</label>
            <input
              id="url"
              v-model="form.url"
              type="text"
              readonly
              class="readonly-input"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="secondary-button">
              Annuler
            </button>
            <button type="submit" class="primary-button">
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Legal Notice Modal -->
    <div v-if="showLegalModal" class="modal-overlay" @click="closeLegalModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Mentions légales</h3>
          <button @click="closeLegalModal" class="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="legal-content">
          <div v-if="loadingLegal" class="loading-spinner">
            Chargement des mentions légales...
          </div>
          <div v-else-if="legalError" class="error-message">
            {{ legalError }}
          </div>
          <div v-else v-html="legalNotice" class="legal-text"></div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AppFooter',
  setup() {
    const showModal = ref(false)
    const showLegalModal = ref(false)
    const loadingLegal = ref(false)
    const legalNotice = ref('')
    const legalError = ref('')

    const form = ref({
      subject: '',
      comment: '',
      url: ''
    })

    const openReportModal = () => {
      form.value.url = window.location.href
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      form.value.subject = ''
      form.value.comment = ''
      form.value.url = ''
    }

    const handleSubmit = () => {
      const emailBody = `Sujet: ${form.value.subject}

Commentaire:
${form.value.comment}

URL: ${form.value.url}`

      const emailSubject = `APP SOCLES : ${form.value.subject}`
      const mailtoLink = `mailto:contact@ideesculture.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

      window.location.href = mailtoLink
      closeModal()
    }

    const openLegalModal = () => {
      // Navigate to legal notice page
      window.location.href = '/legal-notice'
    }

    const closeLegalModal = () => {
      showLegalModal.value = false
      legalNotice.value = ''
      legalError.value = ''
    }

    return {
      showModal,
      showLegalModal,
      loadingLegal,
      legalNotice,
      legalError,
      form,
      openReportModal,
      closeModal,
      handleSubmit,
      openLegalModal,
      closeLegalModal
    }
  }
}
</script>

<style scoped>
.app-footer {
  background: white;
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e5e7eb;
}

.footer-logo {
  height: 40px;
  object-fit: contain;
}

.footer-credit {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-separator {
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

.report-link {
  color: #f59e0b;
}

.legal-link {
  color: #3b82f6;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-content {
  background: white;
  border-radius: var(--radius-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text);
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  color: var(--color-text-secondary);
  transition: color 0.2s;
}

.close-button:hover {
  color: var(--color-text);
}

.report-form {
  padding: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group textarea {
  resize: vertical;
}

.readonly-input {
  background: #f3f4f6;
  cursor: not-allowed;
  color: var(--color-text-secondary);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
}

.secondary-button,
.primary-button {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
}

.secondary-button {
  background: #f3f4f6;
  color: var(--color-text);
}

.secondary-button:hover {
  background: #e5e7eb;
}

.primary-button {
  background: #3b82f6;
  color: white;
}

.primary-button:hover {
  background: #2563eb;
}

/* Legal Notice Styles */
.legal-content {
  padding: var(--spacing-lg);
  max-height: 60vh;
  overflow-y: auto;
}

.loading-spinner {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.error-message {
  text-align: center;
  padding: var(--spacing-xl);
  color: #ef4444;
  font-weight: 600;
}

.legal-text {
  line-height: 1.6;
  color: var(--color-text);
}

.legal-text h1,
.legal-text h2,
.legal-text h3 {
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.legal-text h1 {
  font-size: 1.5rem;
}

.legal-text h2 {
  font-size: 1.25rem;
}

.legal-text h3 {
  font-size: 1.1rem;
}

.legal-text p {
  margin-bottom: var(--spacing-md);
}

.legal-text ul,
.legal-text ol {
  margin-left: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.legal-text a {
  color: #3b82f6;
  text-decoration: underline;
}

.legal-text a:hover {
  color: #2563eb;
}

@media (max-width: 768px) {
  .footer-logo {
    max-width: 120px;
  }

  .footer-credit {
    font-size: 10px;
    flex-wrap: wrap;
  }

  .modal-overlay {
    padding: var(--spacing-md);
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-header h3 {
    font-size: 1.25rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .secondary-button,
  .primary-button {
    width: 100%;
  }
}
</style>
