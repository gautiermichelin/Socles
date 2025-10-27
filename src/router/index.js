import { createRouter, createWebHistory } from 'vue-router'
import { settingsDB } from '../services/db'

// Views
import LoginView from '../views/LoginView.vue'
import SoclesListView from '../views/SoclesListView.vue'
import SocleFormView from '../views/SocleFormView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/socles',
    name: 'SoclesList',
    component: SoclesListView,
    meta: { requiresAuth: true }
  },
  {
    path: '/socles/new',
    name: 'SocleCreate',
    component: SocleFormView,
    meta: { requiresAuth: true }
  },
  {
    path: '/socles/:id',
    name: 'SocleEdit',
    component: SocleFormView,
    meta: { requiresAuth: true },
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * Navigation guard to check authentication
 */
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = await settingsDB.get('isAuthenticated')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'SoclesList' })
  } else {
    next()
  }
})

export default router
