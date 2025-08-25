<template>
  <div class="dashboard">
    <h1> Dash</h1>
    <AlertsPanel />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div
        class="card p-4 rounded-lg shadow-md"
        :class="{
          'bg-red-100 border-red-500': isTemperatureOutOfRange,
          'bg-green-100 border-green-500': !isTemperatureOutOfRange
        }"
      >
        <h3 class="text-lg font-semibold">Temperature</h3>
        <p class="text-2xl">{{ tankData.temperature }}°C</p>
      </div>
      <div
        class="card p-4 rounded-lg shadow-md"
        :class="{
          'bg-red-100 border-red-500': isPhOutOfRange,
          'bg-green-100 border-green-500': !isPhOutOfRange
        }"
      >
        <h3 class="text-lg font-semibold">pH</h3>
        <p class="text-2xl">{{ tankData.ph }}</p>
      </div>
      <div
        class="card p-4 rounded-lg shadow-md"
        :class="{
          'bg-red-100 border-red-500': isOxygenOutOfRange,
          'bg-green-100 border-green-500': !isOxygenOutOfRange
        }"
      >
        <h3 class="text-lg font-semibold">Oxygen</h3>
        <p class="text-2xl">{{ tankData.oxygen }} mg/L</p>
      </div>
    </div>
    <div class="chart-container p-4 rounded-lg shadow-md bg-white">
      <h3 class="text-lg font-semibold mb-2">Historical Data (Last 24 Hours)</h3>
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { useTankStore } from '../stores/tankStore'
import AlertsPanel from '../components/AlertsPanel.vue'

// Register Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend)

const store = useTankStore()
const chartCanvas = ref(null)
let chartInstance = null

// Computed properties to check if values are out of range
const isTemperatureOutOfRange = computed(() => {
  const { temperature } = store.tankData
  const { min, max } = store.thresholds.temperature
  return temperature < min || temperature > max
})

const isPhOutOfRange = computed(() => {
  const { ph } = store.tankData
  const { min, max } = store.thresholds.ph
  return ph < min || ph > max
})

const isOxygenOutOfRange = computed(() => {
  const { oxygen } = store.tankData
  const { min, max } = store.thresholds.oxygen
  return oxygen < min || oxygen > max
})

const tankData = computed(() => store.tankData)

// Function to initialize the chart
function initChart() {
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [], // Timestamps
        datasets: [
          {
            label: 'Temperature (°C)',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            yAxisID: 'y'
          },
          {
            label: 'pH',
            data: [],
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            yAxisID: 'y1'
          },
          {
            label: 'Oxygen (mg/L)',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Temperature (°C)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'pH'
            },
            grid: {
              drawOnChartArea: false // only want the grid lines for one axis to show up
            }
          },
          y2: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Oxygen (mg/L)'
            },
            grid: {
              drawOnChartArea: false // only want the grid lines for one axis to show up
            }
          }
        }
      }
    })
  }
}

// Function to update the chart with new data
function updateChart() {
  if (chartInstance) {
    // Fetch historical data from Firebase and update the chart
    // This is a placeholder, you'll need to implement the actual data fetching
    // For now, I'll just add some dummy data
    const now = Date.now()
    const labels = []
    const temperatureData = []
    const phData = []
    const oxygenData = []

    for (let i = 0; i < 10; i++) {
      const timestamp = now - i * 60 * 60 * 1000 // 1 hour intervals
      labels.unshift(new Date(timestamp).toLocaleTimeString())
      temperatureData.unshift(Math.random() * 10 + 20) // Random temperature between 20 and 30
      phData.unshift(Math.random() * 2 + 6.5) // Random pH between 6.5 and 8.5
      oxygenData.unshift(Math.random() * 3 + 5) // Random oxygen between 5 and 8
    }

    chartInstance.data.labels = labels
    chartInstance.data.datasets[0].data = temperatureData
    chartInstance.data.datasets[1].data = phData
    chartInstance.data.datasets[2].data = oxygenData
    chartInstance.update()
  }
}

onMounted(() => {
  store.fetchTankData()
  store.fetchThresholds()
  initChart()
  updateChart()
})

// Watch for changes in tank data and update the chart
watch(
  () => store.tankData,
  () => {
    updateChart()
  },
  { deep: true }
)
</script>

<style scoped>
.card {
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>