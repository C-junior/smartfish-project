<template>
  <div class="space-y-6">
    <!-- Tank Information Header -->
    <div class="glass-card">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <!-- Tank Status Indicator -->
          <div class="relative">
            <div 
              class="w-16 h-16 rounded-full flex items-center justify-center"
              :class="tankStatusClass"
            >
              <component 
                :is="tankStatusIcon" 
                class="w-8 h-8 text-white"
              />
            </div>
            <div 
              v-if="overallStatus === 'critical'"
              class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"
            ></div>
          </div>
          
          <!-- Tank Details -->
          <div>
            <h2 class="text-2xl font-bold text-dark-teal">{{ tankData.name }}</h2>
            <p class="text-gray-600">{{ tankData.location }}</p>
            <div class="flex items-center space-x-4 mt-2">
              <span 
                class="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium"
                :class="overallStatusBadgeClass"
              >
                {{ overallStatusText }}
              </span>
              <span class="text-sm text-gray-500">
                Estágio: {{ tankData.stage }}
              </span>
            </div>
          </div>
        </div>

        <!-- Connection Status -->
        <div class="text-right">
          <div class="flex items-center space-x-2 mb-2">
            <div 
              class="w-3 h-3 rounded-full"
              :class="connectionStatusClass"
            ></div>
            <span class="text-sm text-gray-600">{{ connectionStatusText }}</span>
          </div>
          <p class="text-xs text-gray-500">
            Última atualização: {{ formattedLastUpdate }}
          </p>
        </div>
      </div>

      <!-- Tank Summary Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-3 bg-white/50 rounded-lg">
          <div class="text-lg font-semibold text-dark-teal">{{ activeSensors }}</div>
          <div class="text-xs text-gray-600">Sensores Ativos</div>
        </div>
        <div class="text-center p-3 bg-white/50 rounded-lg">
          <div class="text-lg font-semibold text-green-600">{{ normalSensors }}</div>
          <div class="text-xs text-gray-600">Normais</div>
        </div>
        <div class="text-center p-3 bg-white/50 rounded-lg">
          <div class="text-lg font-semibold text-yellow-600">{{ warningSensors }}</div>
          <div class="text-xs text-gray-600">Atenção</div>
        </div>
        <div class="text-center p-3 bg-white/50 rounded-lg">
          <div class="text-lg font-semibold text-red-600">{{ criticalSensors }}</div>
          <div class="text-xs text-gray-600">Críticos</div>
        </div>
      </div>
    </div>

    <!-- Sensor Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SensorCard
        v-for="(sensorData, sensorType) in sensorsWithMetadata"
        :key="sensorType"
        :sensor-type="sensorType"
        :current-value="sensorData.value"
        :threshold="sensorData.threshold"
        :unit="sensorData.unit"
        :status="sensorData.status"
        :last-update="tankData.lastUpdate"
        :previous-value="sensorData.previousValue"
        :is-updating="isLoading"
        class="animate-float"
      />
    </div>

    <!-- Loading Overlay -->
    <div 
      v-if="isLoading && !tankData.name"
      class="glass-card text-center py-12"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-teal mx-auto mb-4"></div>
      <p class="text-gray-600">Carregando dados do tanque...</p>
    </div>

    <!-- Error State -->
    <div 
      v-if="error && !isLoading"
      class="glass-card border-red-200 bg-red-50/50 text-center py-8"
    >
      <ExclamationTriangleIcon class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-red-800 mb-2">Erro de Conexão</h3>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button 
        @click="retryConnection"
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus-ring"
      >
        Tentar Novamente
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  BeakerIcon
} from '@heroicons/vue/24/solid'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import SensorCard from './SensorCard.vue'
import { useTankStore } from '../stores/tankStore'

// Store
const tankStore = useTankStore()

// Computed properties from store
const tankData = computed(() => tankStore.tankData)
const sensorStatuses = computed(() => tankStore.sensorStatuses)
const overallStatus = computed(() => tankStore.overallTankStatus)
const connectionStatus = computed(() => tankStore.connectionStatus)
const isLoading = computed(() => tankStore.isLoading)
const error = computed(() => tankStore.error)
const thresholds = computed(() => tankStore.thresholds)

// Sensor metadata configuration
const sensorUnits = {
  temperature: '°C',
  ph: '',
  oxygen: 'mg/L',
  salinity: 'ppt'
}

// Computed properties for tank status display
const tankStatusClass = computed(() => {
  switch (overallStatus.value) {
    case 'critical':
      return 'bg-red-500 shadow-red-200'
    case 'warning':
      return 'bg-yellow-500 shadow-yellow-200'
    default:
      return 'bg-green-500 shadow-green-200'
  }
})

const tankStatusIcon = computed(() => {
  switch (overallStatus.value) {
    case 'critical':
      return XCircleIcon
    case 'warning':
      return ExclamationTriangleIcon
    default:
      return CheckCircleIcon
  }
})

const overallStatusBadgeClass = computed(() => {
  switch (overallStatus.value) {
    case 'critical':
      return 'bg-red-100 text-red-800'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-green-100 text-green-800'
  }
})

const overallStatusText = computed(() => {
  switch (overallStatus.value) {
    case 'critical':
      return 'Estado Crítico'
    case 'warning':
      return 'Requer Atenção'
    default:
      return 'Funcionando Bem'
  }
})

const connectionStatusClass = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'bg-green-500 animate-pulse'
    case 'connecting':
      return 'bg-yellow-500 animate-pulse'
    case 'error':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
})

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'Conectado'
    case 'connecting':
      return 'Conectando...'
    case 'error':
      return 'Erro de Conexão'
    default:
      return 'Desconectado'
  }
})

const formattedLastUpdate = computed(() => {
  try {
    const date = new Date(tankData.value.lastUpdate)
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    })
  } catch (error) {
    return 'Desconhecido'
  }
})

// Sensor statistics
const activeSensors = computed(() => {
  return Object.keys(tankData.value.sensors).length
})

const normalSensors = computed(() => {
  return Object.values(sensorStatuses.value).filter(status => status === 'normal').length
})

const warningSensors = computed(() => {
  return Object.values(sensorStatuses.value).filter(status => status === 'warning').length
})

const criticalSensors = computed(() => {
  return Object.values(sensorStatuses.value).filter(status => status === 'critical').length
})

// Enhanced sensor data with metadata
const sensorsWithMetadata = computed(() => {
  const sensors = {}
  
  Object.keys(tankData.value.sensors).forEach(sensorType => {
    sensors[sensorType] = {
      value: tankData.value.sensors[sensorType],
      status: sensorStatuses.value[sensorType] || 'normal',
      threshold: thresholds.value[sensorType] || { min: 0, max: 100 },
      unit: sensorUnits[sensorType] || '',
      previousValue: null // This could be enhanced with historical data
    }
  })
  
  return sensors
})

// Methods
const retryConnection = () => {
  tankStore.setupRealtimeListener()
}
</script>

<style scoped>
/* Enhanced animations for tank overview */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float:nth-child(even) {
  animation-delay: 0.5s;
}

.animate-float:nth-child(3n) {
  animation-delay: 1s;
}

.animate-float:nth-child(4n) {
  animation-delay: 1.5s;
}

/* Critical alert pulse animation */
@keyframes critical-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.status-critical {
  animation: critical-pulse 2s infinite;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-ping,
  .animate-pulse,
  .status-critical {
    animation: none;
  }
}
</style>