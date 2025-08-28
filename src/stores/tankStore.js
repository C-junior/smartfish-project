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
  // State
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

  const historicalData = ref([]);
  const alerts = ref([]);
  const connectionStatus = ref('disconnected');
  const isLoading = ref(false);
  const error = ref(null);

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
  const sensorStatuses = computed(() => {
    const statuses = {};
    const sensors = tankData.value.sensors;

    Object.keys(sensors).forEach(sensorType => {
      const value = sensors[sensorType];
      const threshold = thresholds.value[sensorType];

      if (!threshold) {
        statuses[sensorType] = 'normal';
        return;
      }

      // Critical conditions based on project specifications
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
          // Fallback to original logic for unknown sensors
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
    const statuses = Object.values(sensorStatuses.value);

    if (statuses.includes('critical')) {
      return 'critical';
    } else if (statuses.includes('warning')) {
      return 'warning';
    } else {
      return 'healthy';
    }
  });

  // Actions
  const setupRealtimeListener = () => {
    try {
      isLoading.value = true;
      connectionStatus.value = 'connecting';

      // Listen to tank data changes
      const tankRef = doc(db, 'tanks', 'central-tank');

      unsubscribe = onSnapshot(
        tankRef,
        docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Update tank data but compute status locally
            const newTankData = {
              ...tankData.value,
              ...data,
              lastUpdate: data?.lastUpdate || new Date().toISOString(),
            };

            // Don't use the status from Firestore, let our computed property handle it
            delete newTankData.status;
            tankData.value = newTankData;

            // Update historical data if available
            if (data.historicalData && Array.isArray(data.historicalData)) {
              historicalData.value = data.historicalData;
            }

            // Check for alerts based on current sensor values
            checkAndGenerateAlerts();

            connectionStatus.value = 'connected';
            error.value = null;
          } else {
            // Create initial document structure if it doesn't exist
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

  const checkAndGenerateAlerts = () => {
    const newAlerts = [];
    const sensors = tankData.value.sensors;
    const currentTime = new Date().toISOString();

    Object.keys(sensors).forEach(sensorType => {
      const value = sensors[sensorType];
      const threshold = thresholds.value[sensorType];
      const status = sensorStatuses.value[sensorType];

      if (status === 'critical' || status === 'warning') {
        const existingAlert = alerts.value.find(
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
            tankId: 'central-tank',
          };
          newAlerts.push(alert);
        }
      }
    });

    // Add new alerts to the beginning of the array
    if (newAlerts.length > 0) {
      alerts.value = [...newAlerts, ...alerts.value];
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
    // State
    tankData,
    historicalData,
    alerts,
    connectionStatus,
    isLoading,
    error,
    thresholds,

    // Computed
    sensorStatuses,
    criticalAlerts,
    warningAlerts,
    overallTankStatus,

    // Actions
    setupRealtimeListener,
    acknowledgeAlert,
    updateThresholds,
    clearAllAlerts,
    disconnect,
  };
});
