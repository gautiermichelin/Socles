import { createRouter, createWebHistory } from 'vue-router'
import { settingsDB } from '../services/db'

// Views
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import SoclesListView from '../views/SoclesListView.vue'
import SocleFormView from '../views/SocleFormView.vue'
import ExpositionsListView from '../views/ExpositionsListView.vue'
import ExpositionFormView from '../views/ExpositionFormView.vue'
import LegalNoticeView from '../views/LegalNoticeView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/socles',
    redirect: '/'
  },
  {
    path: '/socles/list',
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
  },
  {
    path: '/expositions',
    name: 'ExpositionsList',
    component: ExpositionsListView,
    meta: { requiresAuth: true }
  },
  {
    path: '/expositions/new',
    name: 'ExpositionCreate',
    component: ExpositionFormView,
    meta: { requiresAuth: true }
  },
  {
    path: '/expositions/:id',
    name: 'ExpositionEdit',
    component: ExpositionFormView,
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
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
