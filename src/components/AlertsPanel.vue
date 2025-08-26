<template>
  <div class="glass-card">
    <!-- Alerts Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-red-100 rounded-lg">
          <BellIcon class="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-dark-teal">Alertas do Sistema</h3>
          <p class="text-sm text-gray-600">
            {{ totalActiveAlerts }} alerta{{ totalActiveAlerts !== 1 ? 's' : '' }} ativo{{ totalActiveAlerts !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>

      <!-- Alert Actions -->
      <div class="flex items-center space-x-2">
        <!-- Sound Toggle -->
        <button
          @click="toggleSound"
          :class="[
            'p-2 rounded-lg transition-colors focus-ring',
            soundEnabled ? 'bg-primary-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
          :aria-label="soundEnabled ? 'Desativar som' : 'Ativar som'"
        >
          <component :is="soundIcon" class="w-5 h-5" />
        </button>

        <!-- Clear All Alerts -->
        <button
          v-if="totalActiveAlerts > 0"
          @click="confirmClearAll"
          class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium focus-ring"
        >
          Limpar Todos
        </button>
      </div>
    </div>

    <!-- Alert Statistics -->
    <div v-if="totalActiveAlerts > 0" class="grid grid-cols-3 gap-4 mb-6">
      <div class="text-center p-3 bg-red-50 rounded-lg">
        <div class="text-lg font-semibold text-red-600">{{ criticalCount }}</div>
        <div class="text-xs text-red-700">Críticos</div>
      </div>
      <div class="text-center p-3 bg-yellow-50 rounded-lg">
        <div class="text-lg font-semibold text-yellow-600">{{ warningCount }}</div>
        <div class="text-xs text-yellow-700">Atenção</div>
      </div>
      <div class="text-center p-3 bg-blue-50 rounded-lg">
        <div class="text-lg font-semibold text-blue-600">{{ infoCount }}</div>
        <div class="text-xs text-blue-700">Informação</div>
      </div>
    </div>

    <!-- Alerts List -->
    <div class="space-y-3 max-h-96 overflow-y-auto">
      <!-- No Alerts State -->
      <div v-if="activeAlerts.length === 0" class="text-center py-8">
        <CheckCircleIcon class="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h4 class="text-lg font-medium text-gray-900 mb-2">Tudo Funcionando Bem</h4>
        <p class="text-gray-600">Não há alertas ativos no momento.</p>
      </div>

      <!-- Alert Items -->
      <div
        v-for="alert in sortedAlerts"
        :key="alert.id"
        class="alert-item"
        :class="alertClasses(alert.severity)"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-3 flex-1">
            <!-- Alert Icon -->
            <div class="flex-shrink-0 mt-1">
              <component 
                :is="getAlertIcon(alert.severity)" 
                class="w-5 h-5"
                :class="getIconColor(alert.severity)"
              />
            </div>

            <!-- Alert Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h4 class="font-medium text-sm">{{ alert.message }}</h4>
                <span class="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {{ formatAlertTime(alert.timestamp) }}
                </span>
              </div>
              
              <div class="text-xs text-gray-600 space-y-1">
                <p>Sensor: {{ getSensorDisplayName(alert.sensor) }}</p>
                <p>Valor atual: {{ alert.currentValue }}{{ getSensorUnit(alert.sensor) }}</p>
                <p>Limite: {{ alert.threshold }}{{ getSensorUnit(alert.sensor) }}</p>
              </div>

              <!-- Alert Actions -->
              <div class="flex items-center space-x-2 mt-2">
                <button
                  @click="acknowledgeAlert(alert.id)"
                  class="text-xs px-2 py-1 bg-white/50 hover:bg-white/80 rounded border transition-colors focus-ring"
                >
                  Reconhecer
                </button>
                <button
                  v-if="alert.severity === 'critical'"
                  @click="markAsUrgent(alert.id)"
                  class="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded border border-red-300 transition-colors focus-ring"
                >
                  Urgente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert History Toggle -->
    <div v-if="acknowledgedAlerts.length > 0" class="mt-6 pt-4 border-t border-gray-200">
      <button
        @click="showHistory = !showHistory"
        class="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-teal transition-colors focus-ring"
      >
        <component :is="showHistory ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4" />
        <span>Histórico de Alertas ({{ acknowledgedAlerts.length }})</span>
      </button>

      <!-- Alert History -->
      <div v-if="showHistory" class="mt-3 space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="alert in acknowledgedAlerts.slice(0, 10)"
          :key="alert.id"
          class="p-3 bg-gray-50 rounded-lg text-sm"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="font-medium text-gray-700">{{ alert.message }}</span>
            <span class="text-xs text-gray-500">{{ formatAlertTime(alert.timestamp) }}</span>
          </div>
          <p class="text-xs text-gray-600">
            Reconhecido {{ formatAlertTime(alert.acknowledgedAt) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div 
      v-if="showConfirmation"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="cancelClearAll"
    >
      <div 
        class="bg-white rounded-lg p-6 max-w-sm mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmar Ação</h3>
        <p class="text-gray-600 mb-4">
          Tem certeza de que deseja limpar todos os alertas ativos?
        </p>
        <div class="flex space-x-3">
          <button
            @click="clearAllAlerts"
            class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors focus-ring"
          >
            Confirmar
          </button>
          <button
            @click="cancelClearAll"
            class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors focus-ring"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTankStore } from '../stores/tankStore'

// Store
const tankStore = useTankStore()

// Local state
const soundEnabled = ref(true)
const showHistory = ref(false)
const showConfirmation = ref(false)

// Computed properties from store
const alerts = computed(() => tankStore.alerts)
const criticalAlerts = computed(() => tankStore.criticalAlerts)
const warningAlerts = computed(() => tankStore.warningAlerts)

// Alert filtering and sorting
const activeAlerts = computed(() => {
  return alerts.value.filter(alert => !alert.acknowledged)
})

const acknowledgedAlerts = computed(() => {
  return alerts.value.filter(alert => alert.acknowledged)
    .sort((a, b) => new Date(b.acknowledgedAt) - new Date(a.acknowledgedAt))
})

const sortedAlerts = computed(() => {
  return activeAlerts.value.sort((a, b) => {
    // Sort by severity (critical first), then by timestamp (newest first)
    const severityOrder = { critical: 3, warning: 2, info: 1 }
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
    
    if (severityDiff !== 0) return severityDiff
    
    return new Date(b.timestamp) - new Date(a.timestamp)
  })
})

// Alert statistics
const totalActiveAlerts = computed(() => activeAlerts.value.length)
const criticalCount = computed(() => criticalAlerts.value.length)
const warningCount = computed(() => warningAlerts.value.length)
const infoCount = computed(() => {
  return activeAlerts.value.filter(alert => alert.severity === 'info').length
})

// Sound icon
const soundIcon = computed(() => {
  return soundEnabled.value ? SpeakerWaveIcon : SpeakerXMarkIcon
})

// Methods
const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
  // Here you could implement actual sound notification logic
}

const acknowledgeAlert = (alertId) => {
  tankStore.acknowledgeAlert(alertId)
}

const markAsUrgent = (alertId) => {
  // Implementation for marking alerts as urgent
  console.log('Marking alert as urgent:', alertId)
}

const confirmClearAll = () => {
  showConfirmation.value = true
}

const clearAllAlerts = () => {
  tankStore.clearAllAlerts()
  showConfirmation.value = false
}

const cancelClearAll = () => {
  showConfirmation.value = false
}

const alertClasses = (severity) => {
  switch (severity) {
    case 'critical':
      return 'alert-critical border-l-red-500'
    case 'warning':
      return 'alert-warning border-l-yellow-500'
    default:
      return 'alert-info border-l-blue-500'
  }
}

const getAlertIcon = (severity) => {
  switch (severity) {
    case 'critical':
      return XCircleIcon
    case 'warning':
      return ExclamationTriangleIcon
    default:
      return InformationCircleIcon
  }
}

const getIconColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    default:
      return 'text-blue-600'
  }
}

const getSensorDisplayName = (sensorType) => {
  const names = {
    temperature: 'Temperatura',
    ph: 'pH',
    oxygen: 'Oxigênio',
    salinity: 'Salinidade'
  }
  return names[sensorType] || sensorType
}

const getSensorUnit = (sensorType) => {
  const units = {
    temperature: '°C',
    ph: '',
    oxygen: 'mg/L',
    salinity: 'ppt'
  }
  return units[sensorType] || ''
}

const formatAlertTime = (timestamp) => {
  try {
    const date = new Date(timestamp)
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    })
  } catch (error) {
    return 'Desconhecido'
  }
}
</script>

<style scoped>
/* Custom scrollbar for alerts list */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Alert item animations */
.alert-item {
  transition: all 0.2s ease-in-out;
}

.alert-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Critical alert pulse effect */
.alert-critical {
  animation: critical-glow 2s ease-in-out infinite alternate;
}

@keyframes critical-glow {
  from {
    box-shadow: 0 0 5px rgba(239, 68, 68, 0.3);
  }
  to {
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
  }
}

/* Modal backdrop */
.fixed.inset-0 {
  backdrop-filter: blur(4px);
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .alert-critical,
  .alert-item {
    animation: none;
    transition: none;
  }
}
</style>