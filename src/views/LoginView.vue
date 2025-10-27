<template>
  <div class="login-container">
    <div class="login-header">
      <div class="logo">
        <img src="/logo_noir.svg" alt="Logo SOCLES" />
        <h1>SOCLES</h1>
      </div>
    </div>

    <div class="login-card">
      <div class="app-icon">
        <img src="/logo_application.png" alt="Logo de l'application" />
      </div>

      <h2>Connexion</h2>
      <p class="subtitle">
        Veuillez saisir votre adresse email<br>
        et votre mot de passe pour vous connecter
      </p>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder=""
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder=""
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
        
        <button type="submit" class="primary login-button">
          Connexion
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usersDB, settingsDB, initDemoData } from '../services/db'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const rememberEmail = ref(false)
    const errorMessage = ref('')
    
    // Load saved email on mount
    onMounted(async () => {
      // Initialize demo data
      await initDemoData()
      
      const savedEmail = await settingsDB.get('savedEmail')
      if (savedEmail) {
        email.value = savedEmail
        rememberEmail.value = true
      }
    })
    
    const handleLogin = async () => {
      errorMessage.value = ''

      try {
        const isValid = await usersDB.authenticate(email.value, password.value)

        if (isValid) {
          // Save authentication state
          await settingsDB.set('isAuthenticated', true)
          await settingsDB.set('currentUser', email.value)

          // Save email if checkbox is checked
          if (rememberEmail.value) {
            await settingsDB.set('savedEmail', email.value)
          } else {
            await settingsDB.set('savedEmail', null)
          }

          // Redirect to socles list
          router.push({ name: 'SoclesList' })
        } else {
          errorMessage.value = 'Email ou mot de passe incorrect'
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
  padding: var(--spacing-lg);
}

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
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

.error-message {
  background-color: #fee;
  color: #c33;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  font-size: 0.9rem;
}

.login-button {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
