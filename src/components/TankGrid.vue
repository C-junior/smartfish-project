<template>
  <div class="tank-grid-container">
    <!-- Grid Header with Search and Controls -->
    <div class="mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Title and Summary -->
        <div>
          <h2 class="text-2xl font-bold text-dark-teal mb-2">
            Visão Geral dos Tanques
          </h2>
          <p class="text-gray-600">
            {{ filteredTanks.length }} de {{ tanks.length }} tanque{{ tanks.length !== 1 ? 's' : '' }}
            <span v-if="criticalTanksCount > 0" class="ml-2 text-red-600 font-medium">
              • {{ criticalTanksCount }} crítico{{ criticalTanksCount !== 1 ? 's' : '' }}
            </span>
            <span v-if="warningTanksCount > 0" class="ml-2 text-yellow-600 font-medium">
              • {{ warningTanksCount }} em atenção
            </span>
          </p>
        </div>

        <!-- Add Tank Button -->
        <button
          @click="addNewTank"
          class="flex items-center space-x-2 px-4 py-2 bg-primary-teal text-white rounded-lg hover:bg-dark-teal transition-colors focus-ring text-sm font-medium"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Adicionar Tanque</span>
        </button>
      </div>

      <!-- Search and Filter Controls -->
      <div class="flex flex-col sm:flex-row gap-4 mt-6">
        <!-- Search Input -->
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar tanques por nome ou localização..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal focus:border-transparent"
          />
        </div>

        <!-- Status Filter -->
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal focus:border-transparent"
        >
          <option value="all">Todos os Status</option>
          <option value="healthy">Saudáveis</option>
          <option value="warning">Em Atenção</option>
          <option value="critical">Críticos</option>
        </select>

        <!-- Sort Options -->
        <select
          v-model="sortBy"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal focus:border-transparent"
        >
          <option value="name">Nome</option>
          <option value="status">Status</option>
          <option value="lastUpdate">Última Atualização</option>
          <option value="alertCount">Número de Alertas</option>
        </select>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-if="tanks.length === 0"
      class="text-center py-16"
    >
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <BeakerIcon class="w-12 h-12 text-gray-400" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        Nenhum tanque cadastrado
      </h3>
      <p class="text-gray-600 mb-6 max-w-md mx-auto">
        Comece adicionando seu primeiro tanque para monitorar as condições da água em tempo real.
      </p>
      <button
        @click="addNewTank"
        class="inline-flex items-center space-x-2 px-6 py-3 bg-primary-teal text-white rounded-lg hover:bg-dark-teal transition-colors focus-ring font-medium"
      >
        <PlusIcon class="w-5 h-5" />
        <span>Adicionar Primeiro Tanque</span>
      </button>
    </div>

    <!-- No Results State -->
    <div 
      v-else-if="filteredTanks.length === 0"
      class="text-center py-16"
    >
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FunnelIcon class="w-12 h-12 text-gray-400" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        Nenhum tanque encontrado
      </h3>
      <p class="text-gray-600 mb-6">
        Tente ajustar os filtros de busca ou adicionar um novo tanque.
      </p>
      <div class="flex justify-center space-x-3">
        <button
          @click="clearFilters"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus-ring"
        >
          Limpar Filtros
        </button>
        <button
          @click="addNewTank"
          class="flex items-center space-x-2 px-4 py-2 bg-primary-teal text-white rounded-lg hover:bg-dark-teal transition-colors focus-ring"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Adicionar Tanque</span>
        </button>
      </div>
    </div>

    <!-- Tank Display (Grid or List) -->
    <div v-else-if="filteredTanks.length > 0">
      <!-- Tank Cards Grid (Grid Mode) -->
    <div 
      v-if="viewMode === 'grid'"
      class="tank-grid"
      :class="gridClass"
    >
      <TankCard
        v-for="tank in paginatedTanks"
        :key="tank.id"
        :tank="tank"
        :show-quick-actions="true"
        @settings-clicked="handleSettingsClicked"
        @alerts-clicked="handleAlertsClicked"
        class="tank-card-item"
      />
    </div>

    <!-- Tank List Table (List Mode) -->
    <div 
      v-else-if="viewMode === 'list'"
      class="tank-list-container overflow-x-auto bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200"
    >
      <table 
        class="w-full min-w-full"
        role="table" 
        aria-label="Lista de tanques de monitoramento"
      >
        <TankListHeader
          :sort-by="sortBy"
          :sort-order="sortOrder"
          @sort-changed="handleSortChanged"
        />
        <tbody role="rowgroup">
          <TankListItem
            v-for="tank in paginatedTanks"
            :key="tank.id"
            :tank="tank"
            @settings-clicked="handleSettingsClicked"
            @alerts-clicked="handleAlertsClicked"
            @export-clicked="handleExportClicked"
          />
        </tbody>
      </table>
    </div>
    </div>

    <!-- Pagination -->
    <div 
      v-if="totalPages > 1 && filteredTanks.length > 0"
      class="flex items-center justify-center space-x-2 mt-8"
    >
      <button
        @click="currentPage = Math.max(1, currentPage - 1)"
        :disabled="currentPage === 1"
        class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
      >
        <ChevronLeftIcon class="w-4 h-4" />
      </button>

      <div class="flex space-x-1">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="currentPage = page"
          :class="[
            'px-3 py-2 rounded-lg text-sm font-medium focus-ring',
            page === currentPage
              ? 'bg-primary-teal text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          ]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="currentPage = Math.min(totalPages, currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
      >
        <ChevronRightIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Load More Button (Alternative to pagination) -->
    <div 
      v-if="!usePagination && hasMoreTanks && filteredTanks.length > 0"
      class="text-center mt-8"
    >
      <button
        @click="loadMoreTanks"
        :disabled="isLoadingMore"
        class="inline-flex items-center space-x-2 px-6 py-3 bg-white text-primary-teal border-2 border-primary-teal rounded-lg hover:bg-primary-teal hover:text-white transition-colors focus-ring font-medium disabled:opacity-50"
      >
        <component :is="isLoadingMore ? ArrowPathIcon : ChevronDownIcon" :class="{ 'animate-spin': isLoadingMore }" class="w-4 h-4" />
        <span>{{ isLoadingMore ? 'Carregando...' : 'Carregar Mais Tanques' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BeakerIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import TankCard from './TankCard.vue'
import TankListHeader from './TankListHeader.vue'
import TankListItem from './TankListItem.vue'

// Props
const props = defineProps({
  tanks: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  usePagination: {
    type: Boolean,
    default: true
  },
  tanksPerPage: {
    type: Number,
    default: 12
  },
  viewMode: {
    type: String,
    default: 'grid',
    validator: value => ['grid', 'list'].includes(value)
  }
})

// Emits
const emit = defineEmits([
  'add-tank',
  'settings-clicked',
  'alerts-clicked',
  'export-clicked',
  'load-more'
])

// Local state
const searchTerm = ref('')
const statusFilter = ref('all')
const sortBy = ref('name')
const sortOrder = ref('asc')
const currentPage = ref(1)
const displayedTanksCount = ref(props.tanksPerPage)
const isLoadingMore = ref(false)

// Computed properties
const filteredTanks = computed(() => {
  let filtered = props.tanks

  // Apply search filter
  if (searchTerm.value.trim()) {
    const search = searchTerm.value.toLowerCase().trim()
    filtered = filtered.filter(tank =>
      tank.name.toLowerCase().includes(search) ||
      tank.location.toLowerCase().includes(search) ||
      tank.stage.toLowerCase().includes(search)
    )
  }

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(tank => tank.status === statusFilter.value)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let result = 0
    
    switch (sortBy.value) {
      case 'name':
        result = a.name.localeCompare(b.name)
        break
      case 'status':
        const statusOrder = { critical: 0, warning: 1, healthy: 2 }
        result = statusOrder[a.status] - statusOrder[b.status]
        break
      case 'lastUpdate':
        result = new Date(b.lastUpdate) - new Date(a.lastUpdate)
        break
      case 'alertCount':
        result = b.alertCount - a.alertCount
        break
      case 'temperature':
        result = a.sensors.temperature - b.sensors.temperature
        break
      case 'ph':
        result = a.sensors.ph - b.sensors.ph
        break
      case 'oxygen':
        result = a.sensors.oxygen - b.sensors.oxygen
        break
      case 'salinity':
        result = a.sensors.salinity - b.sensors.salinity
        break
      default:
        return 0
    }
    
    // Apply sort order (only for list mode with explicit sort order)
    if (props.viewMode === 'list' && sortOrder.value === 'desc') {
      result = -result
    }
    
    return result
  })

  return filtered
})

const paginatedTanks = computed(() => {
  if (props.usePagination) {
    const start = (currentPage.value - 1) * props.tanksPerPage
    const end = start + props.tanksPerPage
    return filteredTanks.value.slice(start, end)
  } else {
    return filteredTanks.value.slice(0, displayedTanksCount.value)
  }
})

const totalPages = computed(() => {
  return Math.ceil(filteredTanks.value.length / props.tanksPerPage)
})

const hasMoreTanks = computed(() => {
  return displayedTanksCount.value < filteredTanks.value.length
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    }
  }
  
  return pages.filter(page => page !== '...' || pages.indexOf(page) === pages.lastIndexOf(page))
})

const criticalTanksCount = computed(() => {
  return props.tanks.filter(tank => tank.status === 'critical').length
})

const warningTanksCount = computed(() => {
  return props.tanks.filter(tank => tank.status === 'warning').length
})

const gridClass = computed(() => {
  return 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
})

// Methods
const addNewTank = () => {
  emit('add-tank')
}

const handleSettingsClicked = (tankId) => {
  emit('settings-clicked', tankId)
}

const handleAlertsClicked = (tankId) => {
  emit('alerts-clicked', tankId)
}

const handleExportClicked = (tankId) => {
  emit('export-clicked', tankId)
}

const handleSortChanged = ({ sortBy: newSortBy, sortOrder: newSortOrder }) => {
  sortBy.value = newSortBy
  sortOrder.value = newSortOrder
  currentPage.value = 1 // Reset to first page when sorting changes
}

const clearFilters = () => {
  searchTerm.value = ''
  statusFilter.value = 'all'
  sortBy.value = 'name'
}

const loadMoreTanks = async () => {
  isLoadingMore.value = true
  displayedTanksCount.value += props.tanksPerPage
  
  // Emit event for parent component to load more data if needed
  emit('load-more')
  
  // Simulate loading delay
  setTimeout(() => {
    isLoadingMore.value = false
  }, 500)
}

// Watchers
watch([searchTerm, statusFilter, sortBy, sortOrder], () => {
  currentPage.value = 1
  if (!props.usePagination) {
    displayedTanksCount.value = props.tanksPerPage
  }
})
</script>

<style scoped>
.tank-grid-container {
  width: 100%;
}

.tank-grid {
  animation: fadeInUp 0.6s ease-out;
}

.tank-list-container {
  animation: fadeInUp 0.6s ease-out;
  min-width: 800px; /* Ensure horizontal scroll on very small screens */
}

.tank-list-container table {
  border-collapse: separate;
  border-spacing: 0;
}

.tank-card-item {
  animation: slideInUp 0.4s ease-out;
}

.tank-card-item:nth-child(1) { animation-delay: 0.1s; }
.tank-card-item:nth-child(2) { animation-delay: 0.15s; }
.tank-card-item:nth-child(3) { animation-delay: 0.2s; }
.tank-card-item:nth-child(4) { animation-delay: 0.25s; }
.tank-card-item:nth-child(5) { animation-delay: 0.3s; }
.tank-card-item:nth-child(6) { animation-delay: 0.35s; }
.tank-card-item:nth-child(7) { animation-delay: 0.4s; }
.tank-card-item:nth-child(8) { animation-delay: 0.45s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .tank-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .flex.flex-col.sm\\:flex-row {
    gap: 0.75rem;
  }
  
  .flex.flex-col.lg\\:flex-row {
    gap: 1rem;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .tank-grid,
  .tank-card-item,
  .animate-spin {
    animation: none;
  }
}

/* Focus improvements */
.focus-ring:focus {
  outline: 2px solid var(--primary-teal);
  outline-offset: 2px;
}

/* Custom scrollbar for containers */
.tank-grid-container::-webkit-scrollbar {
  width: 6px;
}

.tank-grid-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.tank-grid-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.tank-grid-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>