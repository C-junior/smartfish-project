import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import AboutView from '../views/AboutView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: 'Smartfish - Visão Geral dos Tanques',
      description: 'Monitore todos os seus tanques de aquicultura em tempo real'
    }
  },
  {
    path: '/tank/:tankId',
    name: 'TankDashboard',
    component: DashboardView,
    props: true,
    meta: {
      title: 'Dashboard do Tanque - Smartfish',
      description: 'Monitoramento detalhado de tanque individual'
    }
  },
  {
    path: '/dashboard',
    redirect: (to) => {
      // Redirect old dashboard route to tank-specific route
      // Default to central-tank for backward compatibility
      return '/tank/central-tank'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
    meta: {
      title: 'Sobre o Smartfish - Monitoramento de Aquicultura',
      description: 'Conheça os recursos e tecnologias do sistema Smartfish'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: {
      title: 'Configurações - Smartfish',
      description: 'Configure limites dos sensores e preferências do sistema'
    }
  },
  {
    // Catch-all route for 404 pages
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guard for setting page titles and handling tank routes
router.beforeEach((to, from, next) => {
  // Handle tank-specific routes
  if (to.name === 'TankDashboard' && to.params.tankId) {
    // Dynamically set title based on tank ID
    const tankId = to.params.tankId
    const formattedTankName = tankId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    document.title = `${formattedTankName} - Dashboard - Smartfish`
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', `Monitoramento em tempo real do ${formattedTankName}`)
    }
  } else if (to.meta?.title) {
    // Set document title for other routes
    document.title = to.meta.title
    
    // Set meta description
    if (to.meta?.description) {
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', to.meta.description)
      }
    }
  }
  
  next()
})

export default router