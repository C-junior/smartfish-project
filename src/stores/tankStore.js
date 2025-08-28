import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const useTankStore = defineStore('tank', () => {
  // Enhanced State for Multi-Tank Support
  const tankData = ref({
    lastUpdate: null,
    location: 'Desconhecida',
    name: 'Tanque central',
    sensors: {
      oxygen: 0,
      ph: 0,
      salinity: 0,
      temperature: 0,
    },
    stage: 'Crescimento',
    status: 'healthy',
  });

  // Multi-tank state
  const tankCollection = ref(new Map());
  const selectedTankId = ref('central-tank');
  const isOverviewMode = ref(true);

  // Legacy state (maintained for backward compatibility)
  const historicalData = ref([]);
  const alerts = ref([]);
  const connectionStatus = ref('disconnected');
  const isLoading = ref(false);
  const error = ref(null);

  // Multi-tank specific state
  const allAlerts = ref(new Map()); // tankId -> alerts array
  const allHistoricalData = ref(new Map()); // tankId -> historical data
  const tankListeners = ref(new Map()); // tankId -> unsubscribe function

  // Sensor thresholds for alert generation
  const thresholds = ref({
    temperature: { min: 18, max: 28, criticalMin: 15, criticalMax: 30 },
    ph: { min: 6.5, max: 8.0, criticalMin: 6.0, criticalMax: 8.5 },
    oxygen: { min: 6.5, max: 12.0, criticalMin: 5.0 },
    salinity: { min: 28, max: 32, criticalMin: 25, criticalMax: 40 },
  });

  // Firestore listener reference
  let unsubscribe = null;

  // Computed getters
  const activeTanks = computed(() => Array.from(tankCollection.value.values()));

  const tankSummaries = computed(() => {
    return activeTanks.value.map(tank => {
      const tankAlerts = allAlerts.value.get(tank.id) || [];
      const alertCount = tankAlerts.filter(alert => !alert.acknowledged).length;

      return {
        ...tank,
        alertCount,
        status: calculateTankStatus(tank.sensors),
      };
    });
  });

  const selectedTank = computed(() => {
    if (isOverviewMode.value) return null;
    return tankCollection.value.get(selectedTankId.value) || null;
  });

  const sensorStatuses = computed(() => {
    const tank = selectedTank.value || tankData.value;
    const sensors = tank.sensors || {};
    return getSensorStatuses(sensors);
  });

  const criticalAlerts = computed(() => {
    return alerts.value.filter(
      alert => alert.severity === 'critical' && !alert.acknowledged
    );
  });

  const warningAlerts = computed(() => {
    return alerts.value.filter(
      alert => alert.severity === 'warning' && !alert.acknowledged
    );
  });

  const overallTankStatus = computed(() => {
    const tank = selectedTank.value || tankData.value;
    return calculateTankStatus(tank.sensors || {});
  });

  // Helper function to calculate sensor statuses
  const getSensorStatuses = sensors => {
    const statuses = {};

    if (!sensors || typeof sensors !== 'object') {
      return statuses;
    }

    Object.keys(sensors).forEach(sensorType => {
      const value = sensors[sensorType];
      const threshold = thresholds.value[sensorType];

      // Skip if value is not a valid number
      if (typeof value !== 'number' || isNaN(value) || !threshold) {
        statuses[sensorType] = 'normal';
        return;
      }

      let isCritical = false;
      let isWarning = false;

      switch (sensorType) {
        case 'temperature':
          isCritical =
            value < threshold.criticalMin || value > threshold.criticalMax;
          isWarning =
            !isCritical && (value < threshold.min || value > threshold.max);
          break;
        case 'ph':
          isCritical =
            value < threshold.criticalMin || value > threshold.criticalMax;
          isWarning =
            !isCritical && (value < threshold.min || value > threshold.max);
          break;
        case 'oxygen':
          isCritical = value < threshold.criticalMin;
          isWarning = !isCritical && value < threshold.min;
          break;
        case 'salinity':
          isCritical =
            value < threshold.criticalMin || value > threshold.criticalMax;
          isWarning =
            !isCritical && (value < threshold.min || value > threshold.max);
          break;
        default:
          isCritical =
            value < threshold.criticalMin ||
            value > (threshold.criticalMax || threshold.max * 1.5);
          isWarning =
            !isCritical && (value < threshold.min || value > threshold.max);
      }

      if (isCritical) {
        statuses[sensorType] = 'critical';
      } else if (isWarning) {
        statuses[sensorType] = 'warning';
      } else {
        statuses[sensorType] = 'normal';
      }
    });

    return statuses;
  };

  // Helper function to calculate overall tank status
  const calculateTankStatus = sensors => {
    if (!sensors) return 'healthy';

    const statuses = Object.values(getSensorStatuses(sensors));

    if (statuses.includes('critical')) {
      return 'critical';
    } else if (statuses.includes('warning')) {
      return 'warning';
    } else {
      return 'healthy';
    }
  };

  // Multi-tank Actions
  const initializeMultiTankData = () => {
    if (!tankCollection.value.has('central-tank')) {
      tankCollection.value.set('central-tank', {
        id: 'central-tank',
        name: 'Tanque Central',
        location: 'Local Principal',
        stage: 'Crescimento',
        sensors: { temperature: 24, ph: 7.2, oxygen: 8.5, salinity: 30 },
        lastUpdate: new Date().toISOString(),
      });
    }
  };

  const selectTank = tankId => {
    if (tankCollection.value.has(tankId)) {
      selectedTankId.value = tankId;
      isOverviewMode.value = false;

      const selected = tankCollection.value.get(tankId);
      tankData.value = { ...selected };

      alerts.value = allAlerts.value.get(tankId) || [];
      historicalData.value = allHistoricalData.value.get(tankId) || [];

      setupRealtimeListener();
    }
  };

  const switchToOverview = () => {
    isOverviewMode.value = true;
    selectedTankId.value = null;
  };

  const fetchAllTanks = async () => {
    try {
      isLoading.value = true;
      connectionStatus.value = 'connecting';

      initializeMultiTankData();

      connectionStatus.value = 'connected';
      error.value = null;
    } catch (err) {
      console.error('Error fetching tanks:', err);
      connectionStatus.value = 'error';
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  // Actions
  const setupRealtimeListener = (specificTankId = null) => {
    try {
      isLoading.value = true;
      connectionStatus.value = 'connecting';

      const tankId = specificTankId || selectedTankId.value || 'central-tank';
      const tankRef = doc(db, 'tanks', tankId);

      unsubscribe = onSnapshot(
        tankRef,
        docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Received Firestore data:', data); // Debug log

            // Handle the data structure based on how it's stored in Firestore
            let parsedData = {};

            // Check if data has the expected structure
            if (data.sensors && typeof data.sensors === 'object') {
              // Direct structure: { sensors: { temperature: 26, ph: 7.2, ... }, name: "...", ... }
              parsedData = {
                name: data.name || 'Tanque central',
                location: data.location || 'Galpão A',
                stage: data.stage || 'Crescimento',
                lastUpdate: data.lastUpdate || new Date().toISOString(),
                sensors: {
                  temperature: data.sensors.temperature || 0,
                  ph: data.sensors.ph || 0,
                  oxygen: data.sensors.oxygen || 0,
                  salinity: data.sensors.salinity || 0,
                },
              };
            } else if (data.tankData && data.tankData.sensors) {
              // Nested structure: { tankData: { sensors: { ... }, ... } }
              parsedData = {
                name: data.tankData.name || 'Tanque central',
                location: data.tankData.location || 'Galpão A',
                stage: data.tankData.stage || 'Crescimento',
                lastUpdate:
                  data.tankData.lastUpdate || new Date().toISOString(),
                sensors: {
                  temperature: data.tankData.sensors.temperature || 0,
                  ph: data.tankData.sensors.ph || 0,
                  oxygen: data.tankData.sensors.oxygen || 0,
                  salinity: data.tankData.sensors.salinity || 0,
                },
              };
            } else {
              // Fallback: try to extract what we can
              parsedData = {
                name: data.name || 'Tanque central',
                location: data.location || 'Galpão A',
                stage: data.stage || 'Crescimento',
                lastUpdate: data.lastUpdate || new Date().toISOString(),
                sensors: {
                  temperature: 0,
                  ph: 0,
                  oxygen: 0,
                  salinity: 0,
                },
              };
            }

            const newTankData = {
              id: tankId,
              ...tankData.value,
              ...parsedData,
            };

            // Don't use the status from Firestore, let our computed property handle it
            delete newTankData.status;
            tankData.value = newTankData;

            console.log('Parsed tank data:', newTankData); // Debug log

            // Update tank collection
            tankCollection.value.set(tankId, newTankData);

            // Handle historical data
            if (data.historicalData && Array.isArray(data.historicalData)) {
              historicalData.value = data.historicalData;
              allHistoricalData.value.set(tankId, data.historicalData);
            }

            // Check for alerts based on current sensor values
            checkAndGenerateAlerts();

            connectionStatus.value = 'connected';
            error.value = null;
          } else {
            createInitialTankData();
          }
          isLoading.value = false;
        },
        err => {
          console.error('Firestore listener error:', err);
          connectionStatus.value = 'error';
          error.value = err.message;
          isLoading.value = false;
        }
      );
    } catch (err) {
      console.error('Error setting up listener:', err);
      connectionStatus.value = 'error';
      error.value = err.message;
      isLoading.value = false;
    }
  };

  const createInitialTankData = () => {
    // This would be handled by your Firebase setup
    console.log(
      'Tank document does not exist. Please ensure the document is created in Firestore.'
    );
  };

  const checkAndGenerateAlerts = (specificTankId = null) => {
    const tankId = specificTankId || selectedTankId.value || 'central-tank';
    const tank = tankCollection.value.get(tankId) || tankData.value;
    const sensors = tank.sensors;

    const newAlerts = [];
    const currentTime = new Date().toISOString();
    const currentAlerts = allAlerts.value.get(tankId) || alerts.value;

    Object.keys(sensors).forEach(sensorType => {
      const value = sensors[sensorType];
      const threshold = thresholds.value[sensorType];
      const sensorStatuses = getSensorStatuses(sensors);
      const status = sensorStatuses[sensorType];

      if (status === 'critical' || status === 'warning') {
        const existingAlert = currentAlerts.find(
          alert => alert.sensor === sensorType && !alert.acknowledged
        );

        if (!existingAlert) {
          const alert = {
            id: `alert_${sensorType}_${Date.now()}`,
            timestamp: currentTime,
            severity: status,
            sensor: sensorType,
            currentValue: value,
            threshold: getThresholdForAlert(sensorType, value, status),
            message: generateAlertMessage(sensorType, value, status),
            acknowledged: false,
            tankId: tankId,
          };
          newAlerts.push(alert);
        }
      }
    });

    if (newAlerts.length > 0) {
      const updatedAlerts = [...newAlerts, ...currentAlerts];
      allAlerts.value.set(tankId, updatedAlerts);

      // Update legacy alerts if this is the selected tank
      if (selectedTankId.value === tankId || !selectedTankId.value) {
        alerts.value = updatedAlerts;
      }
    }
  };

  const generateAlertMessage = (sensorType, value, severity) => {
    const sensorNames = {
      temperature: 'Temperatura',
      ph: 'pH',
      oxygen: 'Oxigênio',
      salinity: 'Salinidade',
    };

    const units = {
      temperature: '°C',
      ph: '',
      oxygen: 'mg/L',
      salinity: 'ppt',
    };

    const name = sensorNames[sensorType] || sensorType;
    const unit = units[sensorType] || '';

    if (severity === 'critical') {
      return `${name} em nível crítico: ${value}${unit}`;
    } else {
      return `${name} fora do intervalo ideal: ${value}${unit}`;
    }
  };

  const getThresholdForAlert = (sensorType, value, severity) => {
    const threshold = thresholds.value[sensorType];
    if (!threshold) return null;

    if (severity === 'critical') {
      if (sensorType === 'oxygen') {
        return threshold.criticalMin;
      } else {
        return value < threshold.criticalMin
          ? threshold.criticalMin
          : threshold.criticalMax;
      }
    } else {
      return value < threshold.min ? threshold.min : threshold.max;
    }
  };

  const acknowledgeAlert = alertId => {
    const alertIndex = alerts.value.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
      alerts.value[alertIndex].acknowledged = true;
      alerts.value[alertIndex].acknowledgedAt = new Date().toISOString();
    }
  };

  const updateThresholds = newThresholds => {
    thresholds.value = { ...thresholds.value, ...newThresholds };
    // Re-check alerts with new thresholds
    checkAndGenerateAlerts();
  };

  const clearAllAlerts = () => {
    alerts.value = alerts.value.map(alert => ({
      ...alert,
      acknowledged: true,
      acknowledgedAt: new Date().toISOString(),
    }));
  };

  const disconnect = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    connectionStatus.value = 'disconnected';
  };

  // Return the store interface
  return {
    // Legacy State (maintained for backward compatibility)
    tankData,
    historicalData,
    alerts,
    connectionStatus,
    isLoading,
    error,
    thresholds,

    // Multi-tank State
    tankCollection,
    selectedTankId,
    isOverviewMode,
    allAlerts,
    allHistoricalData,

    // Computed
    sensorStatuses,
    criticalAlerts,
    warningAlerts,
    overallTankStatus,
    activeTanks,
    tankSummaries,
    selectedTank,

    // Legacy Actions (enhanced for multi-tank support)
    setupRealtimeListener,
    acknowledgeAlert,
    updateThresholds,
    clearAllAlerts,
    disconnect,

    // Multi-tank Actions
    fetchAllTanks,
    selectTank,
    switchToOverview,
    initializeMultiTankData,
  };
});
