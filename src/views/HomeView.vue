<template>
  <div class="min-h-screen bg-gradient-to-br from-water-50 via-water-100 to-teal-50">
    <!-- Header Section -->
    <div class="bg-white/80 backdrop-blur-md border-b border-water-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <!-- Title and Summary -->
          <div>
            <h1 class="text-3xl font-bold text-dark-teal mb-2">
              Visão Geral dos Tanques
            </h1>
            <p class="text-gray-600">
              Monitore todos os seus tanques de aquicultura em tempo real
            </p>
          </div>
          
          <!-- Quick Actions -->
          <div class="flex items-center space-x-3 mt-4 sm:mt-0">
            <!-- Refresh Button -->
            <button
              @click="refreshAllTanks"
              :disabled="isLoading"
              class="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus-ring disabled:opacity-50"
              :class="{ 'animate-spin': isLoading }"
            >
              <ArrowPathIcon class="w-5 h-5" />
            </button>
            
            <!-- View Mode Toggle -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors focus-ring',
                  viewMode === 'grid' ? 'bg-white text-primary-teal shadow-sm' : 'text-gray-600 hover:text-gray-800'
                ]"
              >
                <Squares2X2Icon class="w-4 h-4" />
                <span>Grade</span>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors focus-ring',
                  viewMode === 'list' ? 'bg-white text-primary-teal shadow-sm' : 'text-gray-600 hover:text-gray-800'
                ]"
              >
                <ListBulletIcon class="w-4 h-4" />
                <span>Lista</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- System Status Banner -->
      <div 
        v-if="systemAlerts.length > 0"
        class="mb-8 p-4 rounded-lg border"
        :class="systemAlertClass"
      >
        <div class="flex items-start space-x-3">
          <component :is="systemAlertIcon" class="w-6 h-6 flex-shrink-0 mt-0.5" :class="systemAlertIconClass" />
          <div class="flex-1">
            <h3 class="font-semibold" :class="systemAlertTextClass">
              {{ systemAlertTitle }}
            </h3>
            <p class="text-sm mt-1" :class="systemAlertTextClass">
              {{ systemAlertMessage }}
            </p>
            <div v-if="criticalTanks.length > 0" class="mt-2">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tank in criticalTanks.slice(0, 3)"
                  :key="tank.id"
                  @click="navigateToTank(tank.id)"
                  class="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  {{ tank.name }}
                </button>
                <span v-if="criticalTanks.length > 3" class="text-xs text-gray-500">
                  +{{ criticalTanks.length - 3 }} mais
                </span>
              </div>
            </div>
          </div>
          <button
            @click="dismissSystemAlert"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Tank Discovery Status -->
      <div v-if="isDiscovering && !isInitialLoading" class="text-center py-8 mb-8">
        <div class="animate-spin w-8 h-8 border-4 border-primary-teal border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-600 mt-4">Descobrindo tanques disponíveis...</p>
      </div>

      <!-- No Tanks Found State -->
      <div v-else-if="!isDiscovering && !isInitialLoading && tankSummaries.length === 0" class="text-center py-12">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto">
          <InformationCircleIcon class="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-blue-800 mb-2">
            Nenhum Tanque Encontrado
          </h3>
          <p class="text-blue-600 mb-4">
            Use a interface de coleta de dados para adicionar leituras de sensores, ou verifique se os dados estão sendo salvos corretamente no Firestore.
          </p>
          <button
            @click="retryDiscovery"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus-ring"
          >
            Tentar Novamente
          </button>
        </div>
      </div>

      <!-- Tank Grid Component -->
      <TankGrid
        v-else-if="!isDiscovering && tankSummaries.length > 0"
        :tanks="tankSummaries"
        :loading="isLoading"
        :use-pagination="true"
        :tanks-per-page="12"
        @add-tank="handleAddTank"
        @settings-clicked="handleTankSettings"
        @alerts-clicked="handleTankAlerts"
        @load-more="handleLoadMore"
      />
    </div>

    <!-- Add Tank Modal -->
    <div
      v-if="showAddTankModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="closeAddTankModal"
    >
      <div 
        class="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-dark-teal">Adicionar Novo Tanque</h3>
          <button
            @click="closeAddTankModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <form @submit.prevent="submitNewTank" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nome do Tanque
            </label>
            <input
              v-model="newTank.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal focus:border-transparent"
              placeholder="Ex: Tanque de Reprodução A"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Localização
            </label>
            <input
              v-model="newTank.location"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal focus:border-transparent"
              placeholder="Ex: Setor Norte, Galpão 2"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Estágio de Crescimento
            </label>
            <select
              v-model="newTank.stage"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal focus:border-transparent"
            >
              <option value="">Selecione o estágio</option>
              <option value="Reprodução">Reprodução</option>
              <option value="Alevinos">Alevinos</option>
              <option value="Crescimento">Crescimento</option>
              <option value="Engorda">Engorda</option>
            </select>
          </div>
          
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="closeAddTankModal"
              class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus-ring"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isCreatingTank"
              class="flex-1 px-4 py-2 bg-primary-teal text-white rounded-lg hover:bg-dark-teal transition-colors focus-ring disabled:opacity-50"
            >
              {{ isCreatingTank ? 'Criando...' : 'Criar Tanque' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div 
      v-if="isInitialLoading"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-teal mx-auto mb-4"></div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Carregando Tanques</h3>
        <p class="text-gray-600">Conectando ao sistema de monitoramento...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowPathIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import TankGrid from '../components/TankGrid.vue'
import { useTankStore } from '../stores/tankStore'

// Router
const router = useRouter()

// Store
const tankStore = useTankStore()

// Local state
const viewMode = ref('grid')
const showAddTankModal = ref(false)
const isInitialLoading = ref(true)
const isCreatingTank = ref(false)
const showSystemAlert = ref(true)
const isDiscovering = ref(true)

// New tank form
const newTank = ref({
  name: '',
  location: '',
  stage: ''
})

// Computed properties from store
const tankSummaries = computed(() => tankStore.tankSummaries)
const isLoading = computed(() => tankStore.isLoading)
const connectionStatus = computed(() => tankStore.connectionStatus)

// System status computations
const criticalTanks = computed(() => {
  return tankSummaries.value.filter(tank => tank.status === 'critical')
})

const warningTanks = computed(() => {
  return tankSummaries.value.filter(tank => tank.status === 'warning')
})

const systemAlerts = computed(() => {
  const alerts = []
  
  if (criticalTanks.value.length > 0) {
    alerts.push({
      type: 'critical',
      count: criticalTanks.value.length,
      tanks: criticalTanks.value
    })
  }
  
  if (warningTanks.value.length > 0) {
    alerts.push({
      type: 'warning',
      count: warningTanks.value.length,
      tanks: warningTanks.value
    })
  }
  
  return showSystemAlert.value ? alerts : []
})

const systemAlertClass = computed(() => {
  if (criticalTanks.value.length > 0) {
    return 'bg-red-50 border-red-200'
  } else if (warningTanks.value.length > 0) {
    return 'bg-yellow-50 border-yellow-200'
  }
  return 'bg-blue-50 border-blue-200'
})

const systemAlertIcon = computed(() => {
  if (criticalTanks.value.length > 0) {
    return ExclamationTriangleIcon
  } else if (warningTanks.value.length > 0) {
    return InformationCircleIcon
  }
  return CheckCircleIcon
})

const systemAlertIconClass = computed(() => {
  if (criticalTanks.value.length > 0) {
    return 'text-red-600'
  } else if (warningTanks.value.length > 0) {
    return 'text-yellow-600'
  }
  return 'text-blue-600'
})

const systemAlertTextClass = computed(() => {
  if (criticalTanks.value.length > 0) {
    return 'text-red-800'
  } else if (warningTanks.value.length > 0) {
    return 'text-yellow-800'
  }
  return 'text-blue-800'
})

const systemAlertTitle = computed(() => {
  const critical = criticalTanks.value.length
  const warning = warningTanks.value.length
  
  if (critical > 0) {
    return `${critical} tanque${critical !== 1 ? 's' : ''} em estado crítico`
  } else if (warning > 0) {
    return `${warning} tanque${warning !== 1 ? 's' : ''} necessita${warning === 1 ? '' : 'm'} atenção`
  }
  return 'Todos os tanques operando normalmente'
})

const systemAlertMessage = computed(() => {
  const critical = criticalTanks.value.length
  const warning = warningTanks.value.length
  
  if (critical > 0) {
    return 'Ação imediata necessária para evitar perdas. Verifique os sensores e condições da água.'
  } else if (warning > 0) {
    return 'Parâmetros fora do ideal detectados. Recomenda-se verificação dos sistemas.'
  }
  return 'Todos os parâmetros dentro dos limites seguros.'
})

// Methods
const refreshAllTanks = async () => {
  isDiscovering.value = true
  try {
    await tankStore.discoverTanks()
  } finally {
    isDiscovering.value = false
  }
}

const retryDiscovery = async () => {
  await refreshAllTanks()
}

const navigateToTank = (tankId) => {
  router.push(`/tank/${tankId}`)
}

const handleAddTank = () => {
  showAddTankModal.value = true
}

const closeAddTankModal = () => {
  showAddTankModal.value = false
  newTank.value = { name: '', location: '', stage: '' }
}

const submitNewTank = async () => {
  isCreatingTank.value = true
  try {
    // Generate a unique ID for the new tank
    const tankId = `tank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Add the new tank to the collection
    const tankData = {
      id: tankId,
      name: newTank.value.name,
      location: newTank.value.location,
      stage: newTank.value.stage,
      sensors: {
        temperature: 24,
        ph: 7.2,
        oxygen: 8.5,
        salinity: 30
      },
      lastUpdate: new Date().toISOString()
    }
    
    tankStore.tankCollection.set(tankId, tankData)
    
    closeAddTankModal()
    
    // Navigate to the new tank
    setTimeout(() => {
      navigateToTank(tankId)
    }, 500)
  } catch (error) {
    console.error('Error creating tank:', error)
  } finally {
    isCreatingTank.value = false
  }
}

const handleTankSettings = (tankId) => {
  router.push(`/tank/${tankId}?tab=settings`)
}

const handleTankAlerts = (tankId) => {
  router.push(`/tank/${tankId}?tab=alerts`)
}

const handleLoadMore = () => {
  // Implementation for loading more tanks if needed
  console.log('Loading more tanks...')
}

const dismissSystemAlert = () => {
  showSystemAlert.value = false
}

// Lifecycle hooks
onMounted(async () => {
  try {
    isInitialLoading.value = true
    isDiscovering.value = true
    
    console.log('HomeView: Starting tank discovery...')
    
    // Switch to overview mode
    tankStore.switchToOverview()
    
    // Discover available tanks from Firestore
    const discoveredTanks = await tankStore.discoverTanks()
    console.log('HomeView: Discovered tanks:', discoveredTanks)
    
    // Setup real-time collection monitoring
    tankStore.setupTankCollectionListener()
    
    // Check for auto-navigation preference
    const shouldAutoNavigate = localStorage.getItem('autoNavigateToTank') === 'true'
    if (shouldAutoNavigate && discoveredTanks.length > 0) {
      const defaultTank = tankStore.getDefaultTankForDashboard()
      if (defaultTank) {
        console.log('HomeView: Auto-navigating to tank:', defaultTank)
        router.push(`/tank/${defaultTank}`)
        return
      }
    }
    
  } catch (error) {
    console.error('Error initializing home view:', error)
  } finally {
    isInitialLoading.value = false
    isDiscovering.value = false
  }
})

onUnmounted(() => {
  // Clean up tank collection listener
  tankStore.cleanupAllListeners()
})
</script>

<style scoped>
/* Tank overview specific animations */
.tank-overview-enter-active,
.tank-overview-leave-active {
  transition: all 0.3s ease;
}

.tank-overview-enter-from,
.tank-overview-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Loading animations */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Staggered animation for system alerts */
.system-alert {
  animation: slideInDown 0.5s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

/* Focus styles for accessibility */
.focus-ring:focus {
  outline: 2px solid var(--primary-teal);
  outline-offset: 2px;
}

.focus-ring:focus-visible {
  outline: 2px solid var(--primary-teal);
  outline-offset: 2px;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .animate-spin,
  .tank-overview-enter-active,
  .tank-overview-leave-active,
  .modal-enter-active,
  .modal-leave-active,
  .modal-content-enter-active,
  .modal-content-leave-active,
  .system-alert {
    animation: none;
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .glass-card {
    background: white;
    border: 2px solid black;
  }
  
  .bg-white\/80 {
    background: white;
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .fixed.inset-0 {
    padding: 1rem;
  }
  
  .max-w-md {
    max-width: 100%;
  }
}

/* Loading overlay styling */
.loading-overlay {
  backdrop-filter: blur(4px);
}

/* System alert animation timing */
.system-alert-enter-active {
  transition: all 0.4s ease-out;
}

.system-alert-leave-active {
  transition: all 0.3s ease-in;
}

.system-alert-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.system-alert-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>