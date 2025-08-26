# Vue-HTML Sensor Integration Design

## Overview

This document outlines the design for integrating the standalone HTML sensor collection page with the existing Vue.js SmartFish application. The integration will enable seamless data flow between the HTML-based sensor input interface and the Vue app's real-time monitoring dashboard while maintaining data consistency and Firebase synchronization.

## Architecture

### Current System Architecture

```mermaid
graph TB
    subgraph "Current Vue App"
        A[Vue Components] --> B[Pinia Store]
        B --> C[Firebase Firestore]
        C --> B
        B --> A
    end

    subgraph "Standalone HTML Sensor Page"
        D[HTML Form] --> E[JavaScript]
        E --> F[Firebase SDK]
        F --> G[Firestore Collection]
    end

    subgraph "Firebase Backend"
        C
        G
    end
```

### Target Integration Architecture

```mermaid
graph TB
    subgraph "Integrated System"
        A[Vue Dashboard] --> B[Pinia tankStore]
        H[HTML Sensor Page] --> I[Shared Firebase Config]
        I --> J[Unified Firestore Structure]
        J --> B
        B --> A
        K[Data Synchronization Layer] --> J
        I --> K
    end

    subgraph "Firebase Firestore"
        J --> L[tanks/{tankId}]
        L --> M[sensors object]
        L --> N[history subcollection]
        L --> O[metadata fields]
    end
```

## Data Models & Schema Alignment

### Vue App Current Data Structure

The Vue application expects this Firestore document structure:

```typescript
// Document: tanks/{tankId}
{
  name: string,
  location: string,
  status: 'healthy' | 'warning' | 'critical',
  stage: string,
  lastUpdate: string, // ISO string
  sensors: {
    temperature: number,
    ph: number,
    oxygen: number,
    salinity: number
  }
}
```

### HTML Page Current Data Structure

The HTML sensor page currently writes:

```typescript
// Document: tanks/{tankId}
{
  name: string,
  location: "Desconhecida",
  status: 'healthy',
  stage: "Crescimento",
  lastUpdate: string, // ISO string
  sensors: {
    ph: number,
    temperature: number,
    oxygen: number,
    salinity: number
  }
}

// Subcollection: tanks/{tankId}/history/{docId}
{
  ph: number,
  temperature: number,
  oxygen: number,
  salinity: number,
  timestamp: serverTimestamp()
}
```

### Unified Data Schema

To ensure compatibility, both systems will use this standardized schema:

```typescript
// Main Document: tanks/{tankId}
{
  name: string,
  location: string,
  status: 'healthy' | 'warning' | 'critical',
  stage: string,
  lastUpdate: string, // ISO 8601 format
  sensors: {
    temperature: number,
    ph: number,
    oxygen: number,
    salinity: number
  }
}

// History Subcollection: tanks/{tankId}/history/{autoId}
{
  temperature: number,
  ph: number,
  oxygen: number,
  salinity: number,
  timestamp: Timestamp // Firebase serverTimestamp()
}
```

## Integration Strategy

### Approach 1: Direct Firebase Integration (Recommended)

Update the HTML sensor page to write data in the exact format expected by the Vue app's tankStore.

**Advantages:**

- Minimal changes to Vue app
- Real-time synchronization works immediately
- Maintains existing Vue app functionality

**Implementation:**

1. Modify HTML page JavaScript to match Vue app data structure
2. Ensure consistent tankId generation between systems
3. Update Firebase write operations to match tankStore expectations

### Approach 2: API Layer Integration

Create a middleware API that normalizes data between the HTML page and Vue app.

**Advantages:**

- Clean separation of concerns
- Can handle data validation and transformation
- Easier to extend for future integrations

**Disadvantages:**

- Additional complexity
- Potential latency issues
- Requires backend infrastructure

## Updated HTML Sensor Page Code

### Firebase Configuration Alignment

```html
<script type="module">
  // Use environment-based config to match Vue app
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
  import {
    getFirestore,
    collection,
    doc,
    setDoc,
    addDoc,
    serverTimestamp,
  } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

  // Match Vue app Firebase config structure
  const firebaseConfig = {
    apiKey: 'AIzaSyBge9DUGttm4OMVWKLSzHMKmQzc1oYxchs',
    authDomain: 'smartfish-c4ac7.firebaseapp.com',
    projectId: 'smartfish-c4ac7',
    storageBucket: 'smartfish-c4ac7.firebasestorage.app',
    messagingSenderId: '260869781807',
    appId: '1:260869781807:web:ef105a272181166b7349da',
    measurementId: 'G-R0CHPDN105',
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
</script>
```

### Tank ID Standardization

```javascript
// Generate consistent tankId that matches Vue app expectations
function generateTankId(name) {
  if (!name) return 'central-tank'; // Default fallback

  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30) || 'central-tank'
  );
}
```

### Data Write Operations

```javascript
window.saveReading = async function () {
  const tankName = document.getElementById('tankName').value.trim();
  const phValue = parseFloat(document.getElementById('phValue').value);
  const temperatureValue = parseFloat(
    document.getElementById('temperatureValue').value
  );
  const oxygenValue = parseFloat(document.getElementById('oxygenValue').value);
  const salinityValue = parseFloat(
    document.getElementById('salinityValue').value
  );

  const tankId = generateTankId(tankName);

  // Validation
  if (!tankName || !tankId) {
    showStatus('Nome do Tanque é obrigatório.', 'error');
    return;
  }

  if (
    isNaN(phValue) ||
    isNaN(temperatureValue) ||
    isNaN(oxygenValue) ||
    isNaN(salinityValue)
  ) {
    showStatus('Todos os valores de sensores são obrigatórios.', 'error');
    return;
  }

  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  saveBtn.disabled = true;
  saveBtn.textContent = 'Salvando...';

  try {
    const tankRef = doc(db, 'tanks', tankId);
    const historyRef = collection(tankRef, 'history');

    const currentDate = new Date();
    const timestamp = serverTimestamp();

    // 1. Add to history subcollection (matches Vue app expectations)
    await addDoc(historyRef, {
      temperature: temperatureValue,
      ph: phValue,
      oxygen: oxygenValue,
      salinity: salinityValue,
      timestamp: timestamp,
    });

    // 2. Update main tank document (exact format expected by Vue tankStore)
    await setDoc(
      tankRef,
      {
        name: tankName,
        location: 'Laboratório', // More descriptive than "Desconhecida"
        status: 'healthy',
        stage: 'Monitoramento',
        lastUpdate: currentDate.toISOString(),
        sensors: {
          temperature: temperatureValue,
          ph: phValue,
          oxygen: oxygenValue,
          salinity: salinityValue,
        },
      },
      { merge: true }
    );

    showStatus(
      'Leitura salva com sucesso! Dados sincronizados com o dashboard.',
      'success'
    );

    // Clear sensor values but keep tank name
    document.getElementById('phValue').value = '';
    document.getElementById('temperatureValue').value = '';
    document.getElementById('oxygenValue').value = '';
    document.getElementById('salinityValue').value = '';

    // Reset pH display
    document.getElementById('phDisplay').textContent = 'Digite um valor de pH';
    document.getElementById('phDisplay').className = 'ph-display';
  } catch (error) {
    console.error('Erro ao salvar leitura:', error);
    showStatus(`Erro ao salvar: ${error.message}`, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Salvar Leitura';
  }
};
```

## Vue App Modifications

### tankStore Updates

The current tankStore needs minimal modifications to handle the integrated data:

```javascript
// Update the setupRealtimeListener to handle dynamic tankIds
const setupRealtimeListener = (tankId = 'central-tank') => {
  try {
    isLoading.value = true;
    connectionStatus.value = 'connecting';

    // Listen to tank data changes with dynamic tankId
    const tankRef = doc(db, 'tanks', tankId);

    unsubscribe = onSnapshot(
      tankRef,
      docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Direct assignment since data structure matches
          tankData.value = {
            lastUpdate: data.lastUpdate || new Date().toISOString(),
            location: data.location || 'Desconhecida',
            name: data.name || 'Tanque Central',
            sensors: {
              temperature: data.sensors?.temperature || 0,
              ph: data.sensors?.ph || 0,
              oxygen: data.sensors?.oxygen || 0,
              salinity: data.sensors?.salinity || 0,
            },
            stage: data.stage || 'Crescimento',
            status: data.status || 'healthy',
          };

          checkAndGenerateAlerts();
          connectionStatus.value = 'connected';
          error.value = null;
        } else {
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
```

### Tank Selection Component

Add a tank selection interface to the Vue app:

```vue
<!-- TankSelector.vue -->
<template>
  <div class="tank-selector bg-white rounded-lg p-4 shadow-sm">
    <label
      for="tank-select"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      Selecionar Tanque:
    </label>
    <select
      id="tank-select"
      v-model="selectedTankId"
      @change="handleTankChange"
      class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
    >
      <option value="central-tank">Tanque Central</option>
      <option v-for="tank in availableTanks" :key="tank.id" :value="tank.id">
        {{ tank.name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useTankStore } from '@/stores/tankStore';

const tankStore = useTankStore();
const selectedTankId = ref('central-tank');
const availableTanks = ref([]);

const handleTankChange = () => {
  tankStore.disconnect();
  tankStore.setupRealtimeListener(selectedTankId.value);
};

const loadAvailableTanks = async () => {
  try {
    const tanksRef = collection(db, 'tanks');
    const snapshot = await getDocs(tanksRef);

    availableTanks.value = snapshot.docs
      .filter(doc => doc.id !== 'central-tank')
      .map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.id,
      }));
  } catch (error) {
    console.error('Error loading tanks:', error);
  }
};

onMounted(() => {
  loadAvailableTanks();
});
</script>
```

## Data Synchronization Flow

### Real-time Updates

```mermaid
sequenceDiagram
    participant HTML as HTML Sensor Page
    participant Firebase as Firebase Firestore
    participant Vue as Vue App
    participant Store as Pinia Store
    participant UI as Dashboard UI

    HTML->>Firebase: Save sensor reading
    Firebase->>Store: onSnapshot triggers
    Store->>Store: Update tankData.value
    Store->>Store: checkAndGenerateAlerts()
    Store->>UI: Reactive update
    UI->>UI: Re-render with new data
```

### Historical Data Integration

The Vue app can display historical data from sensors collected via the HTML page:

```javascript
// In Vue app - fetch historical data
const fetchHistoricalData = async (tankId, timeRange = '24h') => {
  try {
    const tankRef = doc(db, 'tanks', tankId);
    const historyRef = collection(tankRef, 'history');

    let historyQuery = query(
      historyRef,
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(historyQuery);

    historicalData.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(),
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
  }
};
```

## Testing Strategy

### Integration Testing

1. **Data Consistency Tests**
   - Verify HTML page writes data in correct format
   - Confirm Vue app reads and displays data correctly
   - Test real-time synchronization between systems

2. **Tank Management Tests**
   - Test tank creation from HTML page
   - Verify tank selection in Vue app
   - Confirm historical data persistence

3. **Error Handling Tests**
   - Test Firebase connection failures
   - Verify data validation in both systems
   - Test recovery from network interruptions

### Test Scenarios

```javascript
// Test data consistency
describe('HTML-Vue Integration', () => {
  test('HTML sensor data appears in Vue dashboard', async () => {
    // 1. Submit data via HTML page
    // 2. Wait for Firebase sync
    // 3. Verify data appears in Vue app
    // 4. Check alert generation
  });

  test('Historical data is preserved', async () => {
    // 1. Submit multiple readings via HTML
    // 2. Load historical chart in Vue app
    // 3. Verify all readings are displayed
  });
});
```

## Deployment Considerations

### Environment Configuration

Both systems should use environment variables for Firebase configuration:

```javascript
// Shared environment configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // ... other config
};
```

### Security Rules

Update Firestore security rules to handle the integrated data structure:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tanks/{tankId} {
      allow read, write: if true; // Adjust based on auth requirements

      match /history/{historyId} {
        allow read, write: if true;
      }
    }
  }
}
```
