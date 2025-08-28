<template>
  <tr
    @click="handleRowClick"
    class="tank-list-item hover:bg-gray-50/50 cursor-pointer transition-colors group border-b border-gray-100"
    :class="rowStatusClass"
    role="row"
    :aria-label="`Tanque ${tank.name}, status ${statusText}, ${tank.alertCount} alerta${tank.alertCount !== 1 ? 's' : ''}`"
    tabindex="0"
    @keydown.enter="handleRowClick"
    @keydown.space.prevent="handleRowClick"
  >
    <!-- Tank Name & Location -->
    <td class="px-4 py-4" role="gridcell">
      <div class="flex flex-col">
        <span class="font-medium text-gray-900 group-hover:text-primary-teal transition-colors">
          {{ tank.name }}
        </span>
        <div class="flex items-center space-x-2 text-sm text-gray-500">
          <MapPinIcon class="w-3 h-3" />
          <span>{{ tank.location }}</span>
          <span class="text-gray-300">•</span>
          <span>{{ tank.stage }}</span>
        </div>
      </div>
    </td>

    <!-- Status -->
    <td class="px-4 py-4" role="gridcell">
      <div class="flex items-center space-x-2">
        <div 
          class="w-3 h-3 rounded-full flex-shrink-0"
          :class="statusIndicatorClass"
          :aria-label="`Status: ${statusText}`"
        ></div>
        <span 
          class="text-sm font-medium"
          :class="statusTextClass"
        >
          {{ statusText }}
        </span>
      </div>
    </td>

    <!-- Temperature -->
    <td class="px-4 py-4 text-center" role="gridcell">
      <div class="flex items-center justify-center space-x-1">
        <div 
          class="w-2 h-2 rounded-full"
          :class="getSensorStatusColor('temperature')"
        ></div>
        <span class="text-sm font-medium text-gray-900">
          {{ tank.sensors.temperature }}°C
        </span>
      </div>
    </td>

    <!-- pH Level -->
    <td class="px-4 py-4 text-center" role="gridcell">
      <div class="flex items-center justify-center space-x-1">
        <div 
          class="w-2 h-2 rounded-full"
          :class="getSensorStatusColor('ph')"
        ></div>
        <span class="text-sm font-medium text-gray-900">
          {{ tank.sensors.ph }}
        </span>
      </div>
    </td>

    <!-- Oxygen -->
    <td class="px-4 py-4 text-center hidden lg:table-cell" role="gridcell">
      <div class="flex items-center justify-center space-x-1">
        <div 
          class="w-2 h-2 rounded-full"
          :class="getSensorStatusColor('oxygen')"
        ></div>
        <span class="text-sm font-medium text-gray-900">
          {{ tank.sensors.oxygen }} mg/L
        </span>
      </div>
    </td>

    <!-- Salinity -->
    <td class="px-4 py-4 text-center hidden xl:table-cell" role="gridcell">
      <div class="flex items-center justify-center space-x-1">
        <div 
          class="w-2 h-2 rounded-full"
          :class="getSensorStatusColor('salinity')"
        ></div>
        <span class="text-sm font-medium text-gray-900">
          {{ tank.sensors.salinity }} ppt
        </span>
      </div>
    </td>

    <!-- Last Update -->
    <td class="px-4 py-4 text-center text-sm text-gray-500 hidden md:table-cell" role="gridcell">
      <div class="flex items-center justify-center space-x-1">
        <ClockIcon class="w-3 h-3" />
        <span>{{ formattedLastUpdate }}</span>
      </div>
    </td>

    <!-- Alert Count -->
    <td class="px-4 py-4 text-center" role="gridcell">
      <span
        v-if="tank.alertCount > 0"
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
        :aria-label="`${tank.alertCount} alerta${tank.alertCount !== 1 ? 's' : ''} ativo${tank.alertCount !== 1 ? 's' : ''}`"
      >
        {{ tank.alertCount }}
      </span>
      <span v-else class="text-gray-400" aria-label="Nenhum alerta">—</span>
    </td>

    <!-- Actions -->
    <td class="px-4 py-4" role="gridcell">
      <div class="flex items-center justify-center space-x-2">
        <button
          @click="handleActionClick($event, 'settings')"
          class="action-button p-1 text-gray-400 hover:text-primary-teal transition-colors rounded focus:outline-none focus:ring-2 focus:ring-primary-teal focus:ring-offset-2"
          :aria-label="`Configurações do ${tank.name}`"
          title="Configurações"
          tabindex="0"
        >
          <CogIcon class="w-4 h-4" />
        </button>
        <button
          @click="handleActionClick($event, 'alerts')"
          :disabled="tank.alertCount === 0"
          class="action-button p-1 text-gray-400 hover:text-red-600 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400"
          :aria-label="`${tank.alertCount > 0 ? 'Ver' : 'Nenhum'} alerta${tank.alertCount !== 1 ? 's' : ''} do ${tank.name}`"
          title="Alertas"
          tabindex="0"
        >
          <BellIcon class="w-4 h-4" />
        </button>
        <button
          @click="handleActionClick($event, 'export')"
          class="action-button p-1 text-gray-400 hover:text-accent-teal transition-colors rounded focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2"
          :aria-label="`Exportar dados do ${tank.name}`"
          title="Exportar dados"
          tabindex="0"
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  MapPinIcon,
  ClockIcon,
  CogIcon,
  BellIcon,
  ArrowDownTrayIcon
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
  }
})

// Emits
const emit = defineEmits(['settings-clicked', 'alerts-clicked', 'export-clicked'])

// Router
const router = useRouter()

// Computed properties
const rowStatusClass = computed(() => {
  switch (props.tank.status) {
    case 'critical':
      return 'bg-red-50/50 border-l-4 border-red-500'
    case 'warning':
      return 'bg-yellow-50/50 border-l-4 border-yellow-500'
    case 'healthy':
      return 'bg-green-50/50 border-l-4 border-green-500'
    default:
      return 'bg-gray-50/50 border-l-4 border-gray-400'
  }
})

const statusIndicatorClass = computed(() => {
  switch (props.tank.status) {
    case 'critical':
      return 'bg-red-500 animate-pulse'
    case 'warning':
      return 'bg-yellow-500'
    case 'healthy':
      return 'bg-green-500'
    default:
      return 'bg-gray-400'
  }
})

const statusTextClass = computed(() => {
  switch (props.tank.status) {
    case 'critical':
      return 'text-red-800'
    case 'warning':
      return 'text-yellow-800'
    case 'healthy':
      return 'text-green-800'
    default:
      return 'text-gray-700'
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
  // This would be enhanced to receive individual sensor statuses
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

const handleRowClick = () => {
  // Navigate to tank details
  router.push(`/tank/${props.tank.id}`)
}

const handleActionClick = (event, action) => {
  // Prevent event bubbling to row click handler
  event.stopPropagation()
  event.preventDefault()

  // Execute specific action
  switch (action) {
    case 'settings':
      emit('settings-clicked', props.tank.id)
      break
    case 'alerts':
      if (props.tank.alertCount > 0) {
        emit('alerts-clicked', props.tank.id)
      }
      break
    case 'export':
      emit('export-clicked', props.tank.id)
      break
  }
}
</script>

<style scoped>
.tank-list-item {
  user-select: none;
}

.tank-list-item:hover {
  background-color: rgba(var(--primary-teal-rgb, 13, 148, 136), 0.05);
}

.tank-list-item:focus {
  outline: 2px solid var(--primary-teal);
  outline-offset: -2px;
  background-color: rgba(var(--primary-teal-rgb, 13, 148, 136), 0.1);
}

.tank-list-item:focus-visible {
  outline: 2px solid var(--primary-teal);
  outline-offset: -2px;
  background-color: rgba(var(--primary-teal-rgb, 13, 148, 136), 0.1);
}

/* Action button styling */
.action-button {
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

.action-button:disabled {
  pointer-events: none;
}

.action-button:not(:disabled):hover {
  background-color: rgba(var(--primary-teal-rgb, 13, 148, 136), 0.1);
}

.action-button:focus {
  z-index: 20;
}

/* Prevent row click when clicking on actions */
.action-button:not(:disabled) {
  cursor: pointer;
}

/* Mobile responsiveness */
@media (max-width: 767px) {
  /* Stack important info on mobile */
  .tank-list-item td:first-child {
    padding-right: 2rem;
  }
  
  .tank-list-item .flex.items-center.space-x-2 {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-colors,
  .animate-pulse {
    transition: none;
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .tank-list-item:focus {
    outline: 3px solid;
    background-color: highlight;
    color: highlighttext;
  }
  
  .tank-list-item:hover {
    background-color: canvas;
    border: 2px solid canvastext;
  }
  
  .action-button:focus {
    outline: 2px solid;
    background-color: highlight;
    color: highlighttext;
  }
}

/* Critical status row animation */
.tank-list-item.bg-red-50\/50 .bg-red-500.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Smooth transitions for better UX */
.tank-list-item:not(:focus):not(:hover) {
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

/* Ensure proper table cell alignment */
td[role="gridcell"] {
  vertical-align: middle;
}

/* Action button hover effects */
.action-button:hover {
  transform: scale(1.1);
  transition: transform 0.1s ease;
}

@media (prefers-reduced-motion: reduce) {
  .action-button:hover {
    transform: none;
  }
}

/* Status indicator pulse animation only for critical */
.bg-red-500.animate-pulse {
  animation: statusPulse 1.5s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* Ensure proper spacing for icon and text combinations */
.flex.items-center.justify-center.space-x-1 {
  min-height: 1.5rem;
}

/* Better focus indicators for action buttons */
.action-button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>