<template>
  <div v-if="alerts.length > 0" class="alerts-panel bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
    <strong class="font-bold">Alerts!</strong>
    <ul class="list-disc pl-5 mt-2">
      <li v-for="(alert, index) in alerts" :key="index">{{ alert }}</li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTankStore } from '../stores/tankStore'

const store = useTankStore()
const alerts = computed(() => store.alerts)
</script>

<style scoped>
/* Add any component-specific styles here */
</style>