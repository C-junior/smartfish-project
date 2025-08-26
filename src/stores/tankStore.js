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
    temperature: { min: 20, max: 30, critical: 35 },
    ph: { min: 6.0, max: 8.0, critical: 9.0 },
    oxygen: { min: 5.0, max: 12.0, critical: 3.0 },
    salinity: { min: 25, max: 35, critical: 40 },
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

      if (value >= threshold.critical || value <= threshold.critical * 0.5) {
        statuses[sensorType] = 'critical';
      } else if (value > threshold.max || value < threshold.min) {
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
            tankData.value = {
              ...tankData.value,
              ...data.tankData,
              lastUpdate: data.tankData?.lastUpdate || new Date().toISOString(),
            };

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
            threshold:
              status === 'critical'
                ? threshold.critical
                : value > threshold.max
                  ? threshold.max
                  : threshold.min,
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
