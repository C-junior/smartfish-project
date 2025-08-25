<template>
  <div class="settings">
    <h2 class="text-2xl font-bold mb-4">Settings</h2>
    <form @submit.prevent="saveSettings">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="temp-min">
          Temperature Min (°C)
        </label>
        <input
          id="temp-min"
          v-model.number="localThresholds.temperature.min"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          step="0.1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="temp-max">
          Temperature Max (°C)
        </label>
        <input
          id="temp-max"
          v-model.number="localThresholds.temperature.max"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          step="0.1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="ph-min">
          pH Min
        </label>
        <input
          id="ph-min"
          v-model.number="localThresholds.ph.min"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          step="0.1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="ph-max">
          pH Max
        </label>
        <input
          id="ph-max"
          v-model.number="localThresholds.ph.max"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          step="0.1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="oxygen-min">
          Oxygen Min (mg/L)
        </label>
        <input
          id="oxygen-min"
          v-model.number="localThresholds.oxygen.min"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          step="0.1"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="oxygen-max">
          Oxygen Max (mg/L)
        </label>
        <input
          id="oxygen-max"
          v-model.number="localThresholds.oxygen.max"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          step="0.1"
        />
      </div>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="submit"
      >
        Save Settings
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTankStore } from '../stores/tankStore'

const store = useTankStore()
const localThresholds = ref({ ...store.thresholds })

onMounted(() => {
  // Fetch the latest thresholds from the store
  localThresholds.value = { ...store.thresholds }
})

function saveSettings() {
  // Save the thresholds to Firebase via the store
  store.saveThresholds(localThresholds.value)
  alert('Settings saved!')
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>