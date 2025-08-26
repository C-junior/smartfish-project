<template>
  <div 
    class="sensor-card"
    :class="[
      'transition-all duration-300',
      statusClasses,
      { 'animate-pulse': isUpdating }
    ]"
  >
    <!-- Sensor Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <div 
          class="p-2 rounded-lg"
          :class="iconBackgroundClass"
        >
          <component 
            :is="sensorIcon" 
            class="w-5 h-5"
            :class="iconColorClass"
          />
        </div>
        <div>
          <h3 class="sensor-label">{{ sensorDisplayName }}</h3>
          <div class="flex items-center space-x-2">
            <span 
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              :class="statusBadgeClass"
            >
              {{ statusText }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Trend Indicator -->
      <div v-if="showTrend" class="flex items-center">
        <component 
          :is="trendIcon" 
          class="w-4 h-4"
          :class="trendColorClass"
        />
      </div>
    </div>

    <!-- Sensor Value Display -->
    <div class="mb-4">
      <div class="flex items-baseline space-x-2">
        <span class="sensor-value">{{ formattedValue }}</span>
        <span class="text-lg font-medium text-gray-500">{{ unit }}</span>
      </div>
      
      <!-- Threshold Range -->
      <div class="mt-2">
        <div class="text-xs text-gray-500 mb-1">
          Faixa ideal: {{ threshold.min }} - {{ threshold.max }} {{ unit }}
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all duration-300"
            :class="thresholdBarClass"
            :style="{ width: thresholdPercentage + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Last Update -->
    <div class="flex items-center justify-between text-xs text-gray-500">
      <span>Última atualização</span>
      <span>{{ formattedLastUpdate }}</span>
    </div>

    <!-- Critical Alert Indicator -->
    <div 
      v-if="status === 'critical'"
      class="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"
      aria-label="Alerta crítico"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  BeakerIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/vue/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Props
const props = defineProps({
  sensorType: {
    type: String,
    required: true,
    validator: value => ['temperature', 'ph', 'oxygen', 'salinity'].includes(value)
  },
  currentValue: {
    type: Number,
    required: true
  },
  threshold: {
    type: Object,
    required: true,
    validator: value => value && typeof value.min === 'number' && typeof value.max === 'number'
  },
  unit: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'normal',
    validator: value => ['normal', 'warning', 'critical'].includes(value)
  },
  lastUpdate: {
    type: [String, Date],
    default: () => new Date()
  },
  previousValue: {
    type: Number,
    default: null
  },
  isUpdating: {
    type: Boolean,
    default: false
  }
})

// Computed properties
const sensorDisplayName = computed(() => {
  const names = {
    temperature: 'Temperatura',
    ph: 'pH',
    oxygen: 'Oxigênio Dissolvido',
    salinity: 'Salinidade'
  }
  return names[props.sensorType] || props.sensorType
})

const sensorIcon = computed(() => {
  // Using BeakerIcon as fallback for all sensors as specified in requirements
  return BeakerIcon
})

const formattedValue = computed(() => {
  return props.currentValue.toFixed(props.sensorType === 'ph' ? 1 : 0)
})

const statusClasses = computed(() => {
  const baseClasses = 'relative'
  switch (props.status) {
    case 'critical':
      return `${baseClasses} ring-2 ring-red-300 shadow-red-100`
    case 'warning':
      return `${baseClasses} ring-2 ring-yellow-300 shadow-yellow-100`
    default:
      return `${baseClasses} hover:shadow-lg`
  }
})

const iconBackgroundClass = computed(() => {
  switch (props.status) {
    case 'critical':
      return 'bg-red-100'
    case 'warning':
      return 'bg-yellow-100'
    default:
      return 'bg-primary-teal/10'
  }
})

const iconColorClass = computed(() => {
  switch (props.status) {
    case 'critical':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    default:
      return 'text-primary-teal'
  }
})

const statusBadgeClass = computed(() => {
  switch (props.status) {
    case 'critical':
      return 'bg-red-100 text-red-800'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-green-100 text-green-800'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'critical':
      return 'Crítico'
    case 'warning':
      return 'Atenção'
    default:
      return 'Normal'
  }
})

const thresholdBarClass = computed(() => {
  switch (props.status) {
    case 'critical':
      return 'bg-red-500'
    case 'warning':
      return 'bg-yellow-500'
    default:
      return 'bg-green-500'
  }
})

const thresholdPercentage = computed(() => {
  const { min, max } = props.threshold
  const range = max - min
  const valueInRange = Math.max(min, Math.min(max, props.currentValue))
  return ((valueInRange - min) / range) * 100
})

const showTrend = computed(() => {
  return props.previousValue !== null && props.previousValue !== props.currentValue
})

const trendIcon = computed(() => {
  if (!showTrend.value) return MinusIcon
  
  if (props.currentValue > props.previousValue) {
    return ArrowTrendingUpIcon
  } else if (props.currentValue < props.previousValue) {
    return ArrowTrendingDownIcon
  } else {
    return MinusIcon
  }
})

const trendColorClass = computed(() => {
  if (!showTrend.value) return 'text-gray-400'
  
  if (props.currentValue > props.previousValue) {
    return 'text-green-500'
  } else if (props.currentValue < props.previousValue) {
    return 'text-red-500'
  } else {
    return 'text-gray-400'
  }
})

const formattedLastUpdate = computed(() => {
  try {
    const date = new Date(props.lastUpdate)
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    })
  } catch (error) {
    return 'Desconhecido'
  }
})
</script>

<style scoped>
/* Additional animations for critical status */
@keyframes pulse-red {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
}

.status-critical {
  animation: pulse-red 2s infinite;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse,
  .status-critical {
    animation: none;
  }
}
</style>