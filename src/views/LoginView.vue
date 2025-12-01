<template>
  <div class="login-container">
    <div class="login-header">
      <div class="logo">
        <img src="/logo_noir.svg" alt="Logo SOCLES" />
        <h1>SOCLES</h1>
      </div>
    </div>

    <div class="login-card">

      <h2>Connexion</h2>
      <p class="subtitle">
        Veuillez saisir votre adresse email<br>
        et votre mot de passe pour vous connecter
      </p>

      <div v-if="serviceUnavailable" class="service-error">
        <strong>Erreur : service web indisponible</strong><br>
        Merci de contacter <a href="mailto:contact@ideesculture.com">contact@ideesculture.com</a>
      </div>

      <form @submit.prevent="handleLogin" :class="{ disabled: serviceUnavailable }">
        <div class="form-group">
          <label for="email">Adresse email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder=""
            :disabled="serviceUnavailable"
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder=""
            :disabled="serviceUnavailable"
          />
        </div>
        
        <div class="form-footer">
          <label class="checkbox-label">
            <input v-model="rememberEmail" type="checkbox" />
            <span>Conserver l'adresse email</span>
          </label>
          <a href="#" class="forgot-password">J'ai oublié mon mot de passe</a>
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="primary login-button" :disabled="serviceUnavailable">
          Connexion
        </button>
      </form>
    </div>

    <!-- Footer -->
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
import { useRouter } from 'vue-router'
import { settingsDB, initDemoData } from '../services/db'

const API_BASE_URL = 'https://socles.ideesculture.fr/gestion/soclesIo/index.php'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const rememberEmail = ref(false)
    const errorMessage = ref('')
    const serviceUnavailable = ref(false)

    // Test webservice availability
    const checkWebServiceAvailability = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const formData = new FormData()
        formData.append('action', 'get_server_time')

        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error('Service unavailable')
        }

        const data = await response.json()

        if (data.result !== true) {
          throw new Error('Service check failed')
        }

        serviceUnavailable.value = false
        return true
      } catch (error) {
        console.error('Webservice availability check failed:', error)
        serviceUnavailable.value = true
        return false
      }
    }

    // Load saved email on mount
    onMounted(async () => {
      // Initialize demo data
      await initDemoData()

      // Check webservice availability
      await checkWebServiceAvailability()

      const savedEmail = await settingsDB.get('savedEmail')
      if (savedEmail) {
        email.value = savedEmail
        rememberEmail.value = true
      }
    })

    const handleLogin = async () => {
      errorMessage.value = ''

      if (serviceUnavailable.value) {
        return
      }

      try {
        // Send POST request to webservice
        const formData = new FormData()
        formData.append('action', 'auth')
        formData.append('username', email.value)
        formData.append('password', password.value)

        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.json()

        if (data.result === true) {
          // Save authentication state
          await settingsDB.set('isAuthenticated', true)
          await settingsDB.set('currentUser', email.value)

          // Save email if checkbox is checked
          if (rememberEmail.value) {
            await settingsDB.set('savedEmail', email.value)
          } else {
            await settingsDB.set('savedEmail', null)
          }

          // Redirect to home page
          router.push({ name: 'Home' })
        } else {
          errorMessage.value = data.message || 'Email ou mot de passe incorrect'
        }
      } catch (error) {
        console.error('Login error:', error)
        errorMessage.value = 'Une erreur est survenue lors de la connexion'
      }
    }

    return {
      email,
      password,
      rememberEmail,
      errorMessage,
      serviceUnavailable,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #a5b4fc 0%, #3b5bdb 100%);
  padding: 0;
}

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);

}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: #1e293b;
}

.logo img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.logo h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.login-card {
  max-width: 480px;
  width: 100%;
  margin: auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  text-align: center;
}

.app-icon {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.app-icon img {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

h2 {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
}

.subtitle {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

form {
  text-align: left;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  font-size: 0.9rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.forgot-password {
  color: var(--color-primary);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.service-error {
  background-color: #fee2e2;
  color: #991b1b;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  font-size: 0.95rem;
  text-align: left;
  border: 1px solid #fecaca;
}

.service-error a {
  color: #991b1b;
  text-decoration: underline;
  font-weight: 600;
}

.service-error a:hover {
  color: #7f1d1d;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  font-size: 0.9rem;
}

form.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.login-button {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 1.1rem;
  font-weight: 600;
}

.login-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Footer */
.app-footer {
  background: white;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
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
