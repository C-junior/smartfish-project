<template>
  <div
    class="min-h-screen bg-gradient-to-br from-water-50 via-water-100 to-teal-50"
  >
    <!-- Dashboard Header -->
    <div
      class="bg-white/80 backdrop-blur-md border-b border-water-200 sticky top-16 z-40"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <!-- Breadcrumb Navigation -->
        <div class="flex items-center space-x-2 text-sm text-gray-600 mb-3">
          <router-link to="/" class="hover:text-primary-teal transition-colors">
            Visão Geral
          </router-link>
          <ChevronRightIcon class="w-4 h-4" />
          <span class="text-dark-teal font-medium">{{ currentTankName }}</span>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- Back Button -->
            <button
              @click="goBack"
              class="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-primary-teal transition-colors focus-ring rounded-lg"
            >
              <ArrowLeftIcon class="w-4 h-4" />
              <span class="hidden sm:inline">Voltar</span>
            </button>

            <!-- Tank Info -->
            <div>
              <h1 class="text-2xl font-bold text-dark-teal">
                {{ currentTankName }}
              </h1>
              <p class="text-gray-600 text-sm">
                {{ currentTankLocation }} • {{ currentTankStage }}
                <span v-if="formattedLastUpdate" class="ml-2">
                  • Atualizado {{ formattedLastUpdate }}
                </span>
              </p>
            </div>
          </div>

          <!-- Tank Selector and Actions -->
          <div class="flex items-center space-x-3">
            <!-- Tank Quick Selector -->
            <div class="relative">
              <select
                v-model="selectedTankId"
                @change="switchTank"
                class="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary-teal focus:border-transparent"
              >
                <option value="" disabled>Trocar tanque</option>
                <option
                  v-for="tank in availableTanks"
                  :key="tank.id"
                  :value="tank.id"
                  :selected="tank.id === currentTankId"
                >
                  {{ tank.name }}
                </option>
              </select>
              <ChevronDownIcon
                class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
              />
            </div>

            <!-- Tank Status Indicator -->
            <div class="flex items-center space-x-2">
              <div
                class="w-3 h-3 rounded-full"
                :class="tankStatusIndicator"
              ></div>
              <span class="text-sm font-medium" :class="tankStatusTextClass">
                {{ tankStatusText }}
              </span>
            </div>

            <!-- Dashboard Actions -->
            <div class="flex items-center space-x-3">
              <!-- Auto-refresh toggle -->
              <button
                @click="toggleAutoRefresh"
                :class="[
                  'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-ring',
                  autoRefresh
                    ? 'bg-primary-teal text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                ]"
              >
                <component
                  :is="autoRefresh ? PauseIcon : PlayIcon"
                  class="w-4 h-4"
                />
                <span class="hidden sm:inline">{{
                  autoRefresh ? 'Pausar' : 'Iniciar'
                }}</span>
              </button>

              <!-- Refresh button -->
              <button
                @click="manualRefresh"
                :disabled="isLoading"
                class="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus-ring disabled:opacity-50"
                :class="{ 'animate-spin': isLoading }"
              >
                <ArrowPathIcon class="w-5 h-5" />
              </button>

              <!-- Export data button -->
              <button
                @click="exportData"
                class="flex items-center space-x-2 px-3 py-2 bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-colors focus-ring text-sm font-medium"
              >
                <ArrowDownTrayIcon class="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Critical Alerts Banner -->
        <div
          v-if="criticalAlerts.length > 0"
          class="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <ExclamationTriangleIcon
              class="w-6 h-6 text-red-600 flex-shrink-0"
            />
            <div>
              <h3 class="font-semibold text-red-800">
                {{ criticalAlerts.length }} Alerta{{
                  criticalAlerts.length !== 1 ? 's' : ''
                }}
                Crítico{{ criticalAlerts.length !== 1 ? 's' : '' }}
              </h3>
              <p class="text-red-700 text-sm">
                Ação imediata necessária para manter a saúde dos peixes.
              </p>
            </div>
          </div>
        </div>

        <!-- Dashboard Grid -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <!-- Main Tank Overview (Left Column) -->
          <div class="xl:col-span-2">
            <TankOverview />
          </div>

          <!-- Alerts Panel (Right Column) -->
          <div class="xl:col-span-1">
            <AlertsPanel />
          </div>
        </div>

        <!-- Additional Dashboard Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <!-- System Status Card -->
          <div class="glass-card">
            <div class="flex items-center space-x-3 mb-6">
              <div class="p-2 bg-primary-teal/10 rounded-lg">
                <CpuChipIcon class="w-6 h-6 text-primary-teal" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-dark-teal">
                  Status do Sistema
                </h3>
                <p class="text-sm text-gray-600">
                  Informações de conectividade e performance
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <!-- Connection Status -->
              <div class="flex items-center justify-between py-2">
                <span class="text-gray-700">Conexão Firebase</span>
                <div class="flex items-center space-x-2">
                  <div
                    class="w-3 h-3 rounded-full"
                    :class="connectionStatusIndicator"
                  ></div>
                  <span class="text-sm" :class="connectionStatusTextClass">
                    {{ connectionStatusText }}
                  </span>
                </div>
              </div>

              <!-- Last Update -->
              <div class="flex items-center justify-between py-2">
                <span class="text-gray-700">Última Atualização</span>
                <span class="text-sm text-gray-600">{{
                  formattedLastUpdate
                }}</span>
              </div>

              <!-- Data Points -->
              <div class="flex items-center justify-between py-2">
                <span class="text-gray-700">Pontos de Dados</span>
                <span class="text-sm text-gray-600">{{
                  historicalDataPoints
                }}</span>
              </div>

              <!-- Uptime -->
              <div class="flex items-center justify-between py-2">
                <span class="text-gray-700">Tempo Ativo</span>
                <span class="text-sm text-gray-600">{{ systemUptime }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions Card -->
          <div class="glass-card">
            <div class="flex items-center space-x-3 mb-6">
              <div class="p-2 bg-accent-teal/10 rounded-lg">
                <BoltIcon class="w-6 h-6 text-accent-teal" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-dark-teal">
                  Ações Rápidas
                </h3>
                <p class="text-sm text-gray-600">
                  Controles e configurações rápidas
                </p>
              </div>
            </div>

            <div class="space-y-3">
              <button
                @click="navigateToSettings"
                class="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-colors focus-ring"
              >
                <div class="flex items-center space-x-3">
                  <CogIcon class="w-5 h-5 text-gray-600" />
                  <span class="font-medium text-gray-700"
                    >Configurar Limites</span
                  >
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400" />
              </button>

              <button
                @click="acknowledgeAllAlerts"
                :disabled="activeAlertsCount === 0"
                class="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div class="flex items-center space-x-3">
                  <CheckIcon class="w-5 h-5 text-gray-600" />
                  <span class="font-medium text-gray-700"
                    >Reconhecer Alertas</span
                  >
                </div>
                <span
                  v-if="activeAlertsCount > 0"
                  class="text-sm text-gray-500"
                >
                  ({{ activeAlertsCount }})
                </span>
              </button>

              <button
                @click="downloadReport"
                class="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-colors focus-ring"
              >
                <div class="flex items-center space-x-3">
                  <DocumentArrowDownIcon class="w-5 h-5 text-gray-600" />
                  <span class="font-medium text-gray-700"
                    >Baixar Relatório</span
                  >
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div
        v-if="isInitialLoading"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-teal mx-auto mb-4"
          ></div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Conectando ao Sistema
          </h3>
          <p class="text-gray-600">
            Estabelecendo conexão com o banco de dados...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  PauseIcon,
  PlayIcon,
  CpuChipIcon,
  BoltIcon,
  CogIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
} from '@heroicons/vue/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TankOverview from '../components/TankOverview.vue';
import AlertsPanel from '../components/AlertsPanel.vue';
import { useTankStore } from '../stores/tankStore';

// Router and Route
const router = useRouter();
const route = useRoute();

// Store
const tankStore = useTankStore();

// Local state
const autoRefresh = ref(true);
const isInitialLoading = ref(true);
const systemStartTime = ref(new Date());
const selectedTankId = ref(route.params.tankId || 'central-tank');

// Computed properties from store
const tankData = computed(() => tankStore.tankData);
const connectionStatus = computed(() => tankStore.connectionStatus);
const isLoading = computed(() => tankStore.isLoading);
const criticalAlerts = computed(() => tankStore.criticalAlerts);
const alerts = computed(() => tankStore.alerts);
const historicalData = computed(() => tankStore.historicalData);
const activeTanks = computed(() => tankStore.activeTanks);
const selectedTank = computed(() => tankStore.selectedTank);
const overallTankStatus = computed(() => tankStore.overallTankStatus);

// Tank-specific computed properties
const currentTankId = computed(() => route.params.tankId || 'central-tank');

const currentTankName = computed(() => {
  if (selectedTank.value) {
    return selectedTank.value.name;
  }
  return tankData.value.name || 'Tanque Central';
});

const currentTankLocation = computed(() => {
  if (selectedTank.value) {
    return selectedTank.value.location;
  }
  return tankData.value.location || 'Local Principal';
});

const currentTankStage = computed(() => {
  if (selectedTank.value) {
    return selectedTank.value.stage;
  }
  return tankData.value.stage || 'Crescimento';
});

const availableTanks = computed(() => {
  return activeTanks.value.filter(tank => tank.id !== currentTankId.value);
});

// Tank status indicators
const tankStatusIndicator = computed(() => {
  switch (overallTankStatus.value) {
    case 'critical':
      return 'bg-red-500 animate-pulse';
    case 'warning':
      return 'bg-yellow-500';
    case 'healthy':
      return 'bg-green-500';
    default:
      return 'bg-gray-400';
  }
});

const tankStatusTextClass = computed(() => {
  switch (overallTankStatus.value) {
    case 'critical':
      return 'text-red-600';
    case 'warning':
      return 'text-yellow-600';
    case 'healthy':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
});

const tankStatusText = computed(() => {
  switch (overallTankStatus.value) {
    case 'critical':
      return 'Crítico';
    case 'warning':
      return 'Atenção';
    case 'healthy':
      return 'Saudável';
    default:
      return 'Desconhecido';
  }
});

// Dashboard computed properties
const activeAlertsCount = computed(() => {
  return alerts.value.filter(alert => !alert.acknowledged).length;
});

const connectionStatusIndicator = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'bg-green-500 animate-pulse';
    case 'connecting':
      return 'bg-yellow-500 animate-pulse';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
});

const connectionStatusTextClass = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'text-green-600';
    case 'connecting':
      return 'text-yellow-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
});

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'Conectado';
    case 'connecting':
      return 'Conectando...';
    case 'error':
      return 'Erro de Conexão';
    default:
      return 'Desconectado';
  }
});

const formattedLastUpdate = computed(() => {
  try {
    const date = new Date(tankData.value.lastUpdate);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ptBR,
    });
  } catch (error) {
    return 'Desconhecido';
  }
});

const historicalDataPoints = computed(() => {
  return historicalData.value.length.toLocaleString();
});

const systemUptime = computed(() => {
  return formatDistanceToNow(systemStartTime.value, {
    locale: ptBR,
  });
});

// Methods
const goBack = () => {
  router.push('/');
};

const switchTank = () => {
  if (selectedTankId.value && selectedTankId.value !== currentTankId.value) {
    router.push(`/tank/${selectedTankId.value}`);
  }
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  if (autoRefresh.value) {
    tankStore.setupRealtimeListener(currentTankId.value);
  } else {
    tankStore.disconnect();
  }
};

const manualRefresh = () => {
  tankStore.setupRealtimeListener(currentTankId.value);
};

const exportData = () => {
  const data = {
    tankData: tankData.value,
    alerts: alerts.value,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smartfish-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const navigateToSettings = () => {
  router.push('/settings');
};

const acknowledgeAllAlerts = () => {
  tankStore.clearAllAlerts();
};

const downloadReport = () => {
  // Implementation for generating and downloading a detailed report
  console.log('Downloading detailed report...');
};

// Lifecycle hooks
onMounted(async () => {
  try {
    // Initialize tanks data first
    await tankStore.fetchAllTanks();

    // Select the specific tank from route params
    const tankId = route.params.tankId || 'central-tank';
    tankStore.selectTank(tankId);

    // Initialize the tank store and start listening for real-time updates
    tankStore.setupRealtimeListener(tankId);

    // Simulate initial loading time
    setTimeout(() => {
      isInitialLoading.value = false;
    }, 1500);
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    isInitialLoading.value = false;
  }
});

// Watch for route changes to switch tanks
watch(
  () => route.params.tankId,
  (newTankId, oldTankId) => {
    if (newTankId && newTankId !== oldTankId) {
      // Disconnect from previous tank
      tankStore.disconnect();

      // Select new tank
      tankStore.selectTank(newTankId);

      // Setup listener for new tank
      tankStore.setupRealtimeListener(newTankId);

      // Update local state
      selectedTankId.value = newTankId;
    }
  },
  { immediate: false }
);

onUnmounted(() => {
  // Clean up listeners
  tankStore.disconnect();
});
</script>

<style scoped>
/* Dashboard specific animations */
.dashboard-enter-active,
.dashboard-leave-active {
  transition: all 0.3s ease;
}

.dashboard-enter-from,
.dashboard-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Staggered animation for grid items */
.grid > * {
  animation: slideInUp 0.6s ease-out;
}

.grid > *:nth-child(1) {
  animation-delay: 0.1s;
}
.grid > *:nth-child(2) {
  animation-delay: 0.2s;
}
.grid > *:nth-child(3) {
  animation-delay: 0.3s;
}
.grid > *:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading spinner enhancement */
.animate-spin {
  animation: spin 1s linear infinite;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .animate-spin,
  .animate-pulse,
  .dashboard-enter-active,
  .dashboard-leave-active,
  .grid > * {
    animation: none;
    transition: none;
  }
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
</style>
