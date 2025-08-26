<template>
  <div class="min-h-screen bg-gradient-to-br from-water-50 via-teal-50 to-cyan-50">
    <!-- Settings Header -->
    <div class="bg-white/80 backdrop-blur-md border-b border-water-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-primary-teal/10 rounded-lg">
            <CogIcon class="w-8 h-8 text-primary-teal" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-dark-teal">Configurações do Sistema</h1>
            <p class="text-gray-600">
              Configure limites de sensores e preferências do sistema
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- Sensor Thresholds Section -->
        <div class="glass-card">
          <div class="flex items-center space-x-3 mb-6">
            <div class="p-2 bg-blue-100 rounded-lg">
              <BeakerIcon class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-dark-teal">Limites dos Sensores</h2>
              <p class="text-sm text-gray-600">Configure os valores ideais e críticos para cada sensor</p>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Temperature Settings -->
            <div class="border border-gray-200 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BeakerIcon class="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">Temperatura</h3>
                    <p class="text-sm text-gray-600">Faixa ideal: 20°C - 30°C</p>
                  </div>
                </div>
                <span class="text-sm text-orange-600 font-medium">°C</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Mínimo Ideal
                  </label>
                  <input
                    v-model.number="localThresholds.temperature.min"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
                    @input="markAsModified"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Máximo Ideal
                  </label>
                  <input
                    v-model.number="localThresholds.temperature.max"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
                    @input="markAsModified"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nível Crítico
                  </label>
                  <input
                    v-model.number="localThresholds.temperature.critical"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    @input="markAsModified"
                  />
                </div>
              </div>
            </div>

            <!-- pH Settings -->
            <div class="border border-gray-200 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BeakerIcon class="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">pH</h3>
                    <p class="text-sm text-gray-600">Faixa ideal: 6.0 - 8.0</p>
                  </div>
                </div>
                <span class="text-sm text-purple-600 font-medium">pH</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Mínimo Ideal
                  </label>
                  <input
                    v-model.number="localThresholds.ph.min"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
                    @input="markAsModified"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Máximo Ideal
                  </label>
                  <input
                    v-model.number="localThresholds.ph.max"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
                    @input="markAsModified"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nível Crítico
                  </label>
                  <input
                    v-model.number="localThresholds.ph.critical"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    @input="markAsModified"
                  />
                </div>
              </div>
            </div>

            <!-- Oxygen Settings -->
            <div class="border border-gray-200 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BeakerIcon class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">Oxigênio Dissolvido</h3>
                    <p class="text-sm text-gray-600">Faixa ideal: 5.0 - 12.0 mg/L</p>
                  </div>
                </div>
                <span class="text-sm text-blue-600 font-medium">mg/L</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Mínimo Ideal
                  </label>
                  <input
                    v-model.number="localThresholds.oxygen.min"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
                    @input="markAsModified"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Máximo Ideal
                  </label>
                  <input
                    v-model.number="localThresholds.oxygen.max"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
                    @input="markAsModified"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nível Crítico
                  </label>
                  <input
                    v-model.number="localThresholds.oxygen.critical"
                    type="number"
                    step="0.1"
                    class="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    @input="markAsModified"
                  />
                </div>
              </div>
            </div>

            <!-- Salinity Settings -->
            <div class="border border-gray-200 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <BeakerIcon class="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">Salinidade</h3>
                    <p class="text-sm text-gray-600">Faixa ideal: 25 - 35 ppt</p>
                  </div>
                </div>
                <span class="text-sm text-green-600 font-medium">ppt</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Mínimo Ideal
                  </label>
                  <input
                    v-model.number="localThresholds.salinity.min"
                    type="number"
                    step="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
                    @input="markAsModified"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Máximo Ideal
                  </label>
                  <input
                    v-model.number="localThresholds.salinity.max"
                    type="number"
                    step="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
                    @input="markAsModified"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nível Crítico
                  </label>
                  <input
                    v-model.number="localThresholds.salinity.critical"
                    type="number"
                    step="1"
                    class="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    @input="markAsModified"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Preferences Section -->
        <div class="glass-card">
          <div class="flex items-center space-x-3 mb-6">
            <div class="p-2 bg-purple-100 rounded-lg">
              <CpuChipIcon class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-dark-teal">Preferências do Sistema</h2>
              <p class="text-sm text-gray-600">Configure notificações e outras preferências</p>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Notification Settings -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Notificações</h3>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium text-gray-700">Alertas de Som</label>
                    <p class="text-sm text-gray-600">Reproduzir som quando alertas críticos ocorrerem</p>
                  </div>
                  <input
                    v-model="preferences.soundAlerts"
                    type="checkbox"
                    class="w-4 h-4 text-primary-teal focus:ring-primary-teal border-gray-300 rounded"
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium text-gray-700">Notificações Push</label>
                    <p class="text-sm text-gray-600">Receber notificações no navegador</p>
                  </div>
                  <input
                    v-model="preferences.pushNotifications"
                    type="checkbox"
                    class="w-4 h-4 text-primary-teal focus:ring-primary-teal border-gray-300 rounded"
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="font-medium text-gray-700">Auto-refresh</label>
                    <p class="text-sm text-gray-600">Atualizar dados automaticamente</p>
                  </div>
                  <input
                    v-model="preferences.autoRefresh"
                    type="checkbox"
                    class="w-4 h-4 text-primary-teal focus:ring-primary-teal border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            <!-- Data Settings -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Dados</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block font-medium text-gray-700 mb-2">
                    Intervalo de Atualização
                  </label>
                  <select
                    v-model="preferences.updateInterval"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
                  >
                    <option value="1">1 segundo</option>
                    <option value="5">5 segundos</option>
                    <option value="10">10 segundos</option>
                    <option value="30">30 segundos</option>
                    <option value="60">1 minuto</option>
                  </select>
                </div>

                <div>
                  <label class="block font-medium text-gray-700 mb-2">
                    Retenção de Dados Históricos
                  </label>
                  <select
                    v-model="preferences.dataRetention"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
                  >
                    <option value="7">7 dias</option>
                    <option value="30">30 dias</option>
                    <option value="90">90 dias</option>
                    <option value="365">1 ano</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            @click="resetToDefaults"
            class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium focus-ring"
          >
            Restaurar Padrões
          </button>
          
          <button
            @click="saveSettings"
            :disabled="!hasChanges || isSaving"
            :class="[
              'px-6 py-3 rounded-lg font-medium transition-colors focus-ring',
              hasChanges && !isSaving
                ? 'bg-primary-teal text-white hover:bg-dark-teal'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <span v-if="isSaving">Salvando...</span>
            <span v-else>Salvar Configurações</span>
          </button>
        </div>

        <!-- Success Message -->
        <div 
          v-if="showSuccessMessage"
          class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          <div class="flex items-center space-x-2">
            <CheckCircleIcon class="w-5 h-5" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  CogIcon,
  BeakerIcon,
  CpuChipIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import { useTankStore } from '../stores/tankStore'

// Store
const tankStore = useTankStore()

// Local state
const localThresholds = ref({
  temperature: { min: 20, max: 30, critical: 35 },
  ph: { min: 6.0, max: 8.0, critical: 9.0 },
  oxygen: { min: 5.0, max: 12.0, critical: 3.0 },
  salinity: { min: 25, max: 35, critical: 40 }
})

const preferences = ref({
  soundAlerts: true,
  pushNotifications: false,
  autoRefresh: true,
  updateInterval: 5,
  dataRetention: 30
})

const hasChanges = ref(false)
const isSaving = ref(false)
const showSuccessMessage = ref(false)

// Computed
const originalThresholds = computed(() => tankStore.thresholds)

// Methods
const markAsModified = () => {
  hasChanges.value = true
}

const resetToDefaults = () => {
  localThresholds.value = {
    temperature: { min: 20, max: 30, critical: 35 },
    ph: { min: 6.0, max: 8.0, critical: 9.0 },
    oxygen: { min: 5.0, max: 12.0, critical: 3.0 },
    salinity: { min: 25, max: 35, critical: 40 }
  }
  
  preferences.value = {
    soundAlerts: true,
    pushNotifications: false,
    autoRefresh: true,
    updateInterval: 5,
    dataRetention: 30
  }
  
  hasChanges.value = true
}

const saveSettings = async () => {
  try {
    isSaving.value = true
    
    // Update thresholds in store
    tankStore.updateThresholds(localThresholds.value)
    
    // Save preferences to localStorage
    localStorage.setItem('smartfish-preferences', JSON.stringify(preferences.value))
    
    // Simulate API save delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    hasChanges.value = false
    showSuccessMessage.value = true
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Error saving settings:', error)
  } finally {
    isSaving.value = false
  }
}

const loadPreferences = () => {
  try {
    const saved = localStorage.getItem('smartfish-preferences')
    if (saved) {
      preferences.value = { ...preferences.value, ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('Error loading preferences:', error)
  }
}

// Watch for changes
watch([localThresholds, preferences], () => {
  markAsModified()
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Load current thresholds from store
  localThresholds.value = { ...originalThresholds.value }
  
  // Load saved preferences
  loadPreferences()
  
  // Reset changes flag after initial load
  setTimeout(() => {
    hasChanges.value = false
  }, 100)
})
</script>

<style scoped>
/* Custom styling for form elements */
input[type="number"]:focus,
select:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

input[type="checkbox"]:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

/* Success message animation */
.fixed.bottom-4.right-4 {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Form sections animation */
.space-y-6 > div {
  animation: fadeInUp 0.5s ease-out;
}

.space-y-6 > div:nth-child(1) { animation-delay: 0.1s; }
.space-y-6 > div:nth-child(2) { animation-delay: 0.2s; }
.space-y-6 > div:nth-child(3) { animation-delay: 0.3s; }
.space-y-6 > div:nth-child(4) { animation-delay: 0.4s; }

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

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .fixed.bottom-4.right-4,
  .space-y-6 > div {
    animation: none;
  }
}
</style>