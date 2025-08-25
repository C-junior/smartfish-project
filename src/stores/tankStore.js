import { defineStore } from 'pinia'
import { database } from '../firebaseConfig'
import { ref, onValue, set, push } from 'firebase/database'

export const useTankStore = defineStore('tank', () => {
  const tankData = ref({
    temperature: 0,
    ph: 0,
    oxygen: 0,
    timestamp: 0
  })

  const thresholds = ref({
    temperature: { min: 20, max: 30 },
    ph: { min: 6.5, max: 8.5 },
    oxygen: { min: 5, max: 8 }
  })

  const alerts = ref([])

  // Function to fetch tank data from Firebase
  function fetchTankData() {
    const tankRef = ref(database, 'tank1')
    onValue(tankRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        tankData.value = data
        checkAlerts()
      }
    })
  }

  // Function to fetch thresholds from Firebase
  function fetchThresholds() {
    const thresholdsRef = ref(database, 'thresholds')
    onValue(thresholdsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        thresholds.value = data
        checkAlerts()
      }
    })
  }

  // Function to save thresholds to Firebase
  function saveThresholds(newThresholds) {
    const thresholdsRef = ref(database, 'thresholds')
    set(thresholdsRef, newThresholds)
  }

  // Function to check for alerts based on current data and thresholds
  function checkAlerts() {
    alerts.value = []
    const { temperature, ph, oxygen } = tankData.value
    const { temperature: tempThresholds, ph: phThresholds, oxygen: oxygenThresholds } = thresholds.value

    if (temperature < tempThresholds.min || temperature > tempThresholds.max) {
      alerts.value.push(`Temperature is out of range: ${temperature}°C`)
    }

    if (ph < phThresholds.min || ph > phThresholds.max) {
      alerts.value.push(`pH is out of range: ${ph}`)
    }

    if (oxygen < oxygenThresholds.min || oxygen > oxygenThresholds.max) {
      alerts.value.push(`Oxygen is out of range: ${oxygen} mg/L`)
    }
  }

  // Function to add historical data to Firebase
  function addHistoricalData(data) {
    const historyRef = ref(database, 'history')
    const newHistoryRef = push(historyRef)
    set(newHistoryRef, data)
  }

  return {
    tankData,
    thresholds,
    alerts,
    fetchTankData,
    fetchThresholds,
    saveThresholds,
    addHistoricalData
  }
})