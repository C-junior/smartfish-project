<template>
  <div 
    @click="navigateToTank"
    class="tank-card glass-card cursor-pointer group relative overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
    :class="statusCardClass"
  >
    <!-- Status Badge -->
    <div class="absolute top-4 right-4 z-10">
      <div 
        class="px-3 py-1 rounded-full text-xs font-semibold"
        :class="statusBadgeClass"
      >
        {{ statusText }}
      </div>
    </div>

    <!-- Alert Indicator -->
    <div 
      v-if="tank.alertCount > 0"
      class="absolute top-4 left-4 z-10 flex items-center space-x-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium"
    >
      <ExclamationTriangleIcon class="w-3 h-3" />
      <span>{{ tank.alertCount }}</span>
    </div>

    <!-- Card Content -->
    <div class="p-6">
      <!-- Tank Header -->
      <div class="mb-4">
        <h3 class="text-xl font-bold text-dark-teal group-hover:text-primary-teal transition-colors">
          {{ tank.name }}
        </h3>
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <MapPinIcon class="w-4 h-4" />
          <span>{{ tank.location }}</span>
          <span class="text-gray-400">•</span>
          <span>{{ tank.stage }}</span>
        </div>
      </div>

      <!-- Sensor Metrics Grid -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="text-center p-3 bg-white/50 rounded-lg">
          <div class="flex items-center justify-center space-x-1 mb-1">
            <div 
              class="w-2 h-2 rounded-full"
              :class="getSensorStatusColor('temperature')"
            ></div>
            <span class="text-xs font-medium text-gray-600">Temp</span>
          </div>
          <div class="text-lg font-bold text-gray-900">
            {{ tank.sensors.temperature }}°C
          </div>
        </div>

        <div class="text-center p-3 bg-white/50 rounded-lg">
          <div class="flex items-center justify-center space-x-1 mb-1">
            <div 
              class="w-2 h-2 rounded-full"
              :class="getSensorStatusColor('ph')"
            ></div>
            <span class="text-xs font-medium text-gray-600">pH</span>
          </div>
          <div class="text-lg font-bold text-gray-900">
            {{ tank.sensors.ph }}
          </div>
        </div>

        <div class="text-center p-3 bg-white/50 rounded-lg">
          <div class="flex items-center justify-center space-x-1 mb-1">
            <div 
              class="w-2 h-2 rounded-full"
              :class="getSensorStatusColor('oxygen')"
            ></div>
            <span class="text-xs font-medium text-gray-600">O₂</span>
          </div>
          <div class="text-lg font-bold text-gray-900">
            {{ tank.sensors.oxygen }} mg/L
          </div>
        </div>

        <div class="text-center p-3 bg-white/50 rounded-lg">
          <div class="flex items-center justify-center space-x-1 mb-1">
            <div 
              class="w-2 h-2 rounded-full"
              :class="getSensorStatusColor('salinity')"
            ></div>
            <span class="text-xs font-medium text-gray-600">Sal</span>
          </div>
          <div class="text-lg font-bold text-gray-900">
            {{ tank.sensors.salinity }} ppt
          </div>
        </div>
      </div>

      <!-- Last Update -->
      <div class="flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center space-x-1">
          <ClockIcon class="w-3 h-3" />
          <span>{{ formattedLastUpdate }}</span>
        </div>
        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRightIcon class="w-4 h-4" />
        </div>
      </div>
    </div>

    <!-- Quick Actions (Shown on Hover) -->
    <div 
      v-if="showQuickActions"
      class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/90 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
    >
      <div class="flex space-x-2">
        <button
          @click.stop="openSettings"
          class="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-teal text-white rounded-lg text-xs font-medium hover:bg-dark-teal transition-colors"
        >
          <CogIcon class="w-3 h-3" />
          <span>Config</span>
        </button>
        <button
          @click.stop="viewAlerts"
          :disabled="tank.alertCount === 0"
          class="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BellIcon class="w-3 h-3" />
          <span>Alertas</span>
        </button>
      </div>
    </div>

    <!-- Ripple Effect -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute inset-0 bg-primary-teal/5 rounded-xl transform scale-0 group-active:scale-100 transition-transform duration-150 origin-center"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CogIcon,
  BellIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  tank: {
    type: Object,
    required: true,
    validator(value) {
      return (
        value &&
        typeof value.id === 'string' &&
        typeof value.name === 'string' &&
        typeof value.location === 'string' &&
        typeof value.stage === 'string' &&
        typeof value.status === 'string' &&
        typeof value.lastUpdate === 'string' &&
        value.sensors &&
        typeof value.sensors.temperature === 'number' &&
        typeof value.sensors.ph === 'number' &&
        typeof value.sensors.oxygen === 'number' &&
        typeof value.sensors.salinity === 'number' &&
        typeof value.alertCount === 'number'
      )
    }
  },
  showQuickActions: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['settings-clicked', 'alerts-clicked'])

// Router
const router = useRouter()

// Computed properties
const statusCardClass = computed(() => {
  switch (props.tank.status) {
    case 'critical':
      return 'border-l-4 border-red-500'
    case 'warning':
      return 'border-l-4 border-yellow-500'
    case 'healthy':
      return 'border-l-4 border-green-500'
    default:
      return 'border-l-4 border-gray-400'
  }
})

const statusBadgeClass = computed(() => {
  switch (props.tank.status) {
    case 'critical':
      return 'bg-red-100 text-red-700'
    case 'warning':
      return 'bg-yellow-100 text-yellow-700'
    case 'healthy':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
})

const statusText = computed(() => {
  switch (props.tank.status) {
    case 'critical':
      return 'Crítico'
    case 'warning':
      return 'Atenção'
    case 'healthy':
      return 'Saudável'
    default:
      return 'Desconhecido'
  }
})

const formattedLastUpdate = computed(() => {
  try {
    const date = new Date(props.tank.lastUpdate)
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    })
  } catch (error) {
    return 'Desconhecido'
  }
})

// Methods
const getSensorStatusColor = (sensorType) => {
  // This would be enhanced to receive sensor statuses from the tank store
  // For now, we'll use a simple approach based on tank status
  switch (props.tank.status) {
    case 'critical':
      return 'bg-red-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'healthy':
      return 'bg-green-500'
    default:
      return 'bg-gray-400'
  }
}

const navigateToTank = () => {
  router.push(`/tank/${props.tank.id}`)
}

const openSettings = () => {
  emit('settings-clicked', props.tank.id)
}

const viewAlerts = () => {
  if (props.tank.alertCount > 0) {
    emit('alerts-clicked', props.tank.id)
  }
}
</script>

<style scoped>
.tank-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 280px;
  position: relative;
}

.tank-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(13, 148, 136, 0.1) 100%);
  border-radius: inherit;
  z-index: -1;
}

.tank-card:hover::before {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(13, 148, 136, 0.15) 100%);
}

/* Touch-friendly design for mobile */
@media (max-width: 768px) {
  .tank-card {
    min-height: 240px;
  }
  
  .tank-card .absolute.inset-x-0.bottom-0 {
    transform: translateY(0);
    opacity: 1;
    background: rgba(255, 255, 255, 0.95);
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .tank-card,
  .transform,
  .transition-all,
  .transition-transform,
  .transition-colors,
  .transition-opacity {
    transition: none;
    transform: none;
    animation: none;
  }
}

/* Focus styles for accessibility */
.tank-card:focus {
  outline: 2px solid var(--primary-teal);
  outline-offset: 2px;
}

.tank-card:focus-visible {
  outline: 2px solid var(--primary-teal);
  outline-offset: 2px;
}
</style>