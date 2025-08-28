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
  getDocs,
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
  const selectedTankId = ref(null); // Remove hardcoded default
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

  // Data structure normalization helper
  const normalizeTankData = (firestoreData, tankId) => {
    // Enforce the exact sensor data format as saved by sensors
    const normalizedData = {
      id: tankId,
      lastUpdate: firestoreData.lastUpdate || new Date().toISOString(),
      location: firestoreData.location || 'Desconhecida',
      name: firestoreData.name || `Tanque ${tankId}`,
      sensors: {
        oxygen: Number(firestoreData.sensors?.oxygen) || 0,
        ph: Number(firestoreData.sensors?.ph) || 0,
        salinity: Number(firestoreData.sensors?.salinity) || 0,
        temperature: Number(firestoreData.sensors?.temperature) || 0
      },
      stage: firestoreData.stage || 'Monitoramento'
    };

    // Don't include status from Firestore - let computed property calculate it
    return normalizedData;
  };

  // Multi-tank Actions
  const initializeMultiTankData = () => {
    // Remove hardcoded tank initialization
    // Tanks will be loaded from Firestore dynamically
  };

  const selectTank = tankId => {
    if (!tankId) {
      console.error('Tank ID is required');
      return;
    }

    selectedTankId.value = tankId;
    isOverviewMode.value = false;

    // Get existing tank data if available
    const existing = tankCollection.value.get(tankId);
    if (existing) {
      tankData.value = { ...existing };
    }

    // Load alerts and historical data for this tank
    alerts.value = allAlerts.value.get(tankId) || [];
    historicalData.value = allHistoricalData.value.get(tankId) || [];

    // Setup listener with the specific tank ID
    setupRealtimeListener(tankId);
  };

  const switchToOverview = () => {
    isOverviewMode.value = true;
    selectedTankId.value = null;
  };

  const fetchAllTanks = async () => {
    try {
      isLoading.value = true;
      connectionStatus.value = 'connecting';

      // Initialize without hardcoded data
      // Tanks will be discovered and loaded dynamically
      // when selectTank() is called or through other means

      connectionStatus.value = 'connected';
      error.value = null;
    } catch (err) {
      console.error('Error initializing tank system:', err);
      connectionStatus.value = 'error';
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  // Actions
  const setupRealtimeListener = (tankId) => {
    if (!tankId) {
      console.error('Tank ID is required for setting up listener');
      return;
    }

    try {
      isLoading.value = true;
      connectionStatus.value = 'connecting';

      // Standardized path: /tanks/{tank-id}
      const tankRef = doc(db, 'tanks', tankId);
      console.log(`Setting up listener for tank: ${tankId}`);

      unsubscribe = onSnapshot(
        tankRef,
        docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Received Firestore data:', data);

            // Normalize data to match sensor format exactly
            const normalizedData = normalizeTankData(data, tankId);
            console.log('Normalized tank data:', normalizedData);

            // Update tank data
            tankData.value = normalizedData;

            // Update tank collection
            tankCollection.value.set(tankId, normalizedData);

            // Note: Historical data should be in /tanks/{tank-id}/historicalData subcollection
            // We don't load it here to keep real-time data separate from historical data

            // Check for alerts based on current sensor values
            checkAndGenerateAlerts();

            connectionStatus.value = 'connected';
            error.value = null;
          } else {
            console.log(`Tank document ${tankId} does not exist`);
            createInitialTankData(tankId);
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

  const createInitialTankData = (tankId) => {
    console.log(
      `Tank document ${tankId} does not exist. Please ensure the document is created in Firestore with the correct structure.`
    );
    
    connectionStatus.value = 'error';
    error.value = `Tanque ${tankId} não encontrado no banco de dados`;
  };

  const checkAndGenerateAlerts = (tankId = null) => {
    const currentTankId = tankId || selectedTankId.value;
    if (!currentTankId) {
      console.warn('No tank ID available for alert checking');
      return;
    }

    const tank = tankCollection.value.get(currentTankId) || tankData.value;
    const sensors = tank.sensors;

    const newAlerts = [];
    const currentTime = new Date().toISOString();
    const currentAlerts = allAlerts.value.get(currentTankId) || alerts.value;

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
            tankId: currentTankId,
          };
          newAlerts.push(alert);
        }
      }
    });

    if (newAlerts.length > 0) {
      const updatedAlerts = [...newAlerts, ...currentAlerts];
      allAlerts.value.set(currentTankId, updatedAlerts);

      // Update legacy alerts if this is the selected tank
      if (selectedTankId.value === currentTankId) {
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

  // Tank Discovery Methods
  const discoverTanks = async () => {
    try {
      isLoading.value = true;
      connectionStatus.value = 'connecting';
      console.log('Discovering available tanks in Firestore...');

      const tanksQuery = query(collection(db, 'tanks'));
      const snapshot = await getDocs(tanksQuery);

      const discoveredTanks = [];
      
      snapshot.forEach(docSnap => {
        if (docSnap.exists()) {
          const tankId = docSnap.id;
          const firestoreData = docSnap.data();
          
          console.log(`Found tank: ${tankId}`, firestoreData);
          
          // Normalize and store tank data
          const normalizedData = normalizeTankData(firestoreData, tankId);
          tankCollection.value.set(tankId, normalizedData);
          discoveredTanks.push(tankId);
        }
      });

      console.log(`Discovered ${discoveredTanks.length} tanks:`, discoveredTanks);
      
      connectionStatus.value = 'connected';
      error.value = null;
      
      return discoveredTanks;
    } catch (err) {
      console.error('Error discovering tanks:', err);
      connectionStatus.value = 'error';
      error.value = err.message;
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const setupTankCollectionListener = () => {
    try {
      console.log('Setting up real-time tank collection listener...');
      
      const tanksQuery = query(collection(db, 'tanks'));
      
      const unsubscribeCollection = onSnapshot(tanksQuery, snapshot => {
        console.log('Tank collection changed, processing updates...');
        
        snapshot.docChanges().forEach(change => {
          const tankId = change.doc.id;
          const firestoreData = change.doc.data();
          
          if (change.type === 'added' || change.type === 'modified') {
            console.log(`Tank ${change.type}: ${tankId}`);
            const normalizedData = normalizeTankData(firestoreData, tankId);
            tankCollection.value.set(tankId, normalizedData);
          }
          
          if (change.type === 'removed') {
            console.log(`Tank removed: ${tankId}`);
            tankCollection.value.delete(tankId);
          }
        });
        
        console.log(`Tank collection now has ${tankCollection.value.size} tanks`);
      }, err => {
        console.error('Tank collection listener error:', err);
        connectionStatus.value = 'error';
        error.value = err.message;
      });
      
      // Store the unsubscribe function for cleanup
      tankListeners.value.set('collection', unsubscribeCollection);
      
      return unsubscribeCollection;
    } catch (err) {
      console.error('Error setting up collection listener:', err);
      connectionStatus.value = 'error';
      error.value = err.message;
    }
  };

  const getDefaultTankForDashboard = () => {
    const tanks = Array.from(tankCollection.value.keys());
    
    // Priority order: central-tank, first alphabetical, any tank
    if (tanks.includes('central-tank')) return 'central-tank';
    if (tanks.length > 0) return tanks.sort()[0];
    return null;
  };

  const navigateToFirstAvailableTank = (router) => {
    const defaultTank = getDefaultTankForDashboard();
    if (defaultTank) {
      console.log(`Auto-navigating to tank: ${defaultTank}`);
      router.push(`/tank/${defaultTank}`);
      return defaultTank;
    } else {
      console.log('No tanks found - staying on home page');
      return null;
    }
  };

  const cleanupAllListeners = () => {
    // Disconnect main tank listener
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    
    // Disconnect all tank listeners
    tankListeners.value.forEach((unsubscribeFn, key) => {
      if (typeof unsubscribeFn === 'function') {
        unsubscribeFn();
      }
    });
    tankListeners.value.clear();
    
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
    
    // Tank Discovery Actions
    discoverTanks,
    setupTankCollectionListener,
    getDefaultTankForDashboard,
    navigateToFirstAvailableTank,
    cleanupAllListeners,
  };
});
