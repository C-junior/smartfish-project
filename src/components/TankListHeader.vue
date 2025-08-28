<template>
  <thead class="bg-gray-50/50 backdrop-blur-sm">
    <tr>
      <!-- Tank Name & Location -->
      <th 
        @click="handleSort('name')"
        @keydown.enter="handleSort('name')"
        @keydown.space.prevent="handleSort('name')"
        class="sortable-header px-4 py-3 text-left"
        role="columnheader" 
        :aria-sort="getSortAriaAttribute('name')"
        tabindex="0"
      >
        <div class="flex items-center space-x-2 group cursor-pointer">
          <span class="text-sm font-semibold text-gray-700 group-hover:text-primary-teal transition-colors">
            Tanque
          </span>
          <component 
            :is="getSortIcon('name')" 
            class="w-4 h-4 text-gray-400 group-hover:text-primary-teal transition-colors"
            :class="getSortIconClass('name')"
          />
        </div>
      </th>

      <!-- Status -->
      <th 
        @click="handleSort('status')"
        @keydown.enter="handleSort('status')"
        @keydown.space.prevent="handleSort('status')"
        class="sortable-header px-4 py-3 text-left"
        role="columnheader" 
        :aria-sort="getSortAriaAttribute('status')"
        tabindex="0"
      >
        <div class="flex items-center space-x-2 group cursor-pointer">
          <span class="text-sm font-semibold text-gray-700 group-hover:text-primary-teal transition-colors">
            Status
          </span>
          <component 
            :is="getSortIcon('status')" 
            class="w-4 h-4 text-gray-400 group-hover:text-primary-teal transition-colors"
            :class="getSortIconClass('status')"
          />
        </div>
      </th>

      <!-- Temperature -->
      <th 
        @click="handleSort('temperature')"
        @keydown.enter="handleSort('temperature')"
        @keydown.space.prevent="handleSort('temperature')"
        class="sortable-header px-4 py-3 text-center"
        role="columnheader" 
        :aria-sort="getSortAriaAttribute('temperature')"
        tabindex="0"
      >
        <div class="flex items-center justify-center space-x-2 group cursor-pointer">
          <span class="text-sm font-semibold text-gray-700 group-hover:text-primary-teal transition-colors">
            Temp (°C)
          </span>
          <component 
            :is="getSortIcon('temperature')" 
            class="w-4 h-4 text-gray-400 group-hover:text-primary-teal transition-colors"
            :class="getSortIconClass('temperature')"
          />
        </div>
      </th>

      <!-- pH Level -->
      <th 
        @click="handleSort('ph')"
        @keydown.enter="handleSort('ph')"
        @keydown.space.prevent="handleSort('ph')"
        class="sortable-header px-4 py-3 text-center"
        role="columnheader" 
        :aria-sort="getSortAriaAttribute('ph')"
        tabindex="0"
      >
        <div class="flex items-center justify-center space-x-2 group cursor-pointer">
          <span class="text-sm font-semibold text-gray-700 group-hover:text-primary-teal transition-colors">
            pH
          </span>
          <component 
            :is="getSortIcon('ph')" 
            class="w-4 h-4 text-gray-400 group-hover:text-primary-teal transition-colors"
            :class="getSortIconClass('ph')"
          />
        </div>
      </th>

      <!-- Oxygen -->
      <th 
        @click="handleSort('oxygen')"
        @keydown.enter="handleSort('oxygen')"
        @keydown.space.prevent="handleSort('oxygen')"
        class="sortable-header px-4 py-3 text-center hidden lg:table-cell"
        role="columnheader" 
        :aria-sort="getSortAriaAttribute('oxygen')"
        tabindex="0"
      >
        <div class="flex items-center justify-center space-x-2 group cursor-pointer">
          <span class="text-sm font-semibold text-gray-700 group-hover:text-primary-teal transition-colors">
            O₂ (mg/L)
          </span>
          <component 
            :is="getSortIcon('oxygen')" 
            class="w-4 h-4 text-gray-400 group-hover:text-primary-teal transition-colors"
            :class="getSortIconClass('oxygen')"
          />
        </div>
      </th>

      <!-- Salinity -->
      <th 
        @click="handleSort('salinity')"
        @keydown.enter="handleSort('salinity')"
        @keydown.space.prevent="handleSort('salinity')"
        class="sortable-header px-4 py-3 text-center hidden xl:table-cell"
        role="columnheader" 
        :aria-sort="getSortAriaAttribute('salinity')"
        tabindex="0"
      >
        <div class="flex items-center justify-center space-x-2 group cursor-pointer">
          <span class="text-sm font-semibold text-gray-700 group-hover:text-primary-teal transition-colors">
            Sal (ppt)
          </span>
          <component 
            :is="getSortIcon('salinity')" 
            class="w-4 h-4 text-gray-400 group-hover:text-primary-teal transition-colors"
            :class="getSortIconClass('salinity')"
          />
        </div>
      </th>

      <!-- Last Update -->
      <th 
        @click="handleSort('lastUpdate')"
        @keydown.enter="handleSort('lastUpdate')"
        @keydown.space.prevent="handleSort('lastUpdate')"
        class="sortable-header px-4 py-3 text-center hidden md:table-cell"
        role="columnheader" 
        :aria-sort="getSortAriaAttribute('lastUpdate')"
        tabindex="0"
      >
        <div class="flex items-center justify-center space-x-2 group cursor-pointer">
          <span class="text-sm font-semibold text-gray-700 group-hover:text-primary-teal transition-colors">
            Atualização
          </span>
          <component 
            :is="getSortIcon('lastUpdate')" 
            class="w-4 h-4 text-gray-400 group-hover:text-primary-teal transition-colors"
            :class="getSortIconClass('lastUpdate')"
          />
        </div>
      </th>

      <!-- Alert Count -->
      <th 
        @click="handleSort('alertCount')"
        @keydown.enter="handleSort('alertCount')"
        @keydown.space.prevent="handleSort('alertCount')"
        class="sortable-header px-4 py-3 text-center"
        role="columnheader" 
        :aria-sort="getSortAriaAttribute('alertCount')"
        tabindex="0"
      >
        <div class="flex items-center justify-center space-x-2 group cursor-pointer">
          <span class="text-sm font-semibold text-gray-700 group-hover:text-primary-teal transition-colors">
            Alertas
          </span>
          <component 
            :is="getSortIcon('alertCount')" 
            class="w-4 h-4 text-gray-400 group-hover:text-primary-teal transition-colors"
            :class="getSortIconClass('alertCount')"
          />
        </div>
      </th>

      <!-- Actions -->
      <th class="px-4 py-3 text-center" role="columnheader">
        <span class="text-sm font-semibold text-gray-700">
          Ações
        </span>
      </th>
    </tr>
  </thead>
</template>

<script setup>
import { computed } from 'vue'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  sortBy: {
    type: String,
    required: true
  },
  sortOrder: {
    type: String,
    required: true,
    validator: value => ['asc', 'desc'].includes(value)
  }
})

// Emits
const emit = defineEmits(['sort-changed'])

// Methods
const handleSort = (column) => {
  const newOrder = (props.sortBy === column && props.sortOrder === 'asc') ? 'desc' : 'asc'
  emit('sort-changed', { sortBy: column, sortOrder: newOrder })
}

const getSortIcon = (column) => {
  if (props.sortBy !== column) {
    return ChevronUpDownIcon
  }
  return props.sortOrder === 'asc' ? ChevronUpIcon : ChevronDownIcon
}

const getSortIconClass = (column) => {
  if (props.sortBy === column) {
    return 'text-primary-teal'
  }
  return ''
}

const getSortAriaAttribute = (column) => {
  if (props.sortBy !== column) {
    return 'none'
  }
  return props.sortOrder === 'asc' ? 'ascending' : 'descending'
}
</script>

<style scoped>
.sortable-header {
  position: relative;
  user-select: none;
}

.sortable-header:hover {
  background-color: rgba(var(--primary-teal-rgb, 13, 148, 136), 0.05);
}

.sortable-header:focus {
  outline: 2px solid var(--primary-teal);
  outline-offset: -2px;
  background-color: rgba(var(--primary-teal-rgb, 13, 148, 136), 0.1);
}

.sortable-header:focus-visible {
  outline: 2px solid var(--primary-teal);
  outline-offset: -2px;
  background-color: rgba(var(--primary-teal-rgb, 13, 148, 136), 0.1);
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .transition-colors {
    transition: none;
  }
}

/* Mobile column visibility adjustments */
@media (max-width: 767px) {
  .hidden-mobile {
    display: none;
  }
}

@media (max-width: 1023px) {
  .hidden-tablet {
    display: none;
  }
}

@media (max-width: 1279px) {
  .hidden-desktop {
    display: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .sortable-header:focus {
    outline: 3px solid;
    background-color: highlight;
    color: highlighttext;
  }
  
  .bg-gray-50\/50 {
    background-color: canvas;
    border-bottom: 2px solid canvastext;
  }
}

/* Keyboard navigation improvements */
.sortable-header:focus .group {
  color: var(--primary-teal);
}

.sortable-header:focus .w-4.h-4 {
  color: var(--primary-teal);
}

/* Tooltip-like effect for column headers on small screens */
@media (max-width: 640px) {
  .sortable-header[title]:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #374151;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    white-space: nowrap;
    z-index: 50;
  }
}
</style>