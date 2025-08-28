# Firestore Data Synchronization Design

## Overview

This design document addresses the data synchronization issue between the HTML sensor collection interface and the Vue.js dashboard application. The current HTML interface is sending sensor data to Firestore in a format that doesn't match the expected structure in the Vue.js tankStore, causing data to appear in separate documents rather than synchronizing properly with the dashboard.

## Problem Analysis

### Current Issues

1. **Data Structure Mismatch**: The HTML interface saves data in a different document structure than what the Vue.js tankStore expects
2. **Document Path Inconsistency**: Data may be written to different collection paths or document IDs
3. **Field Mapping Discrepancy**: Sensor field names and organization don't align between systems
4. **Real-time Sync Failure**: Changes made through HTML interface don't appear in the dashboard

### Root Cause

The Vue.js tankStore expects data in a specific format at `/tanks/{tankId}` with either:

- Direct structure: `{ sensors: { temperature, ph, oxygen, salinity }, name, location, stage, status }`
- Nested structure: `{ tankData: { sensors: { ... }, name, location, stage, status } }`

The HTML interface currently uses a different document structure or writes to different document paths.

## Architecture

### Current Vue.js Data Structure

```mermaid
erDiagram
    TANKS {
        string id PK
        string name
        string location
        string stage
        string status
        string lastUpdate
        object sensors
    }

    SENSORS {
        number temperature
        number ph
        number oxygen
        number salinity
    }

    HISTORY {
        string id PK
        timestamp timestamp
        object sensors
        string tankId FK
    }

    TANKS ||--o{ HISTORY : contains
    TANKS ||--|| SENSORS : has
```

### Expected Firestore Document Structure

**Tank Document Path**: `/tanks/{tankId}`

```json
{
  "name": "string",
  "location": "string",
  "stage": "string",
  "status": "string (healthy|warning|critical)",
  "lastUpdate": "ISO string",
  "sensors": {
    "temperature": "number",
    "ph": "number",
    "oxygen": "number",
    "salinity": "number"
  }
}
```

**History Subcollection Path**: `/tanks/{tankId}/history/{recordId}`

```json
{
  "timestamp": "timestamp",
  "temperature": "number",
  "ph": "number",
  "oxygen": "number",
  "salinity": "number"
}
```

## Data Flow Requirements

### Synchronization Flow

```mermaid
sequenceDiagram
    participant HTML as "HTML Sensor Interface"
    participant Firestore as "Firebase Firestore"
    participant TankStore as "Vue.js Tank Store"
    participant Dashboard as "Dashboard UI"

    HTML->>Firestore: 1. Write to /tanks/{tankId}
    HTML->>Firestore: 2. Add to /tanks/{tankId}/history
    Firestore->>TankStore: 3. Real-time listener triggers
    TankStore->>TankStore: 4. Parse data structure
    TankStore->>TankStore: 5. Calculate status
    TankStore->>Dashboard: 6. Update UI components
```

### Tank ID Generation Strategy

Both systems must use identical tank ID generation:

```javascript
function generateTankId(name) {
  if (!name) return 'central-tank';

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

## Data Synchronization Implementation

### HTML Interface Corrections

#### 1. Firebase Configuration Alignment

Ensure HTML interface uses exact Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSyBge9DUGttm4OMVWKLSzHMKmQzc1oYxchs',
  authDomain: 'smartfish-c4ac7.firebaseapp.com',
  projectId: 'smartfish-c4ac7',
  storageBucket: 'smartfish-c4ac7.firebasestorage.app',
  messagingSenderId: '260869781807',
  appId: '1:260869781807:web:ef105a272181166b7349da',
  measurementId: 'G-R0CHPDN105',
};
```

#### 2. Document Structure Standardization

HTML interface must write data in the exact format expected by Vue.js:

```javascript
// Main tank document update
await setDoc(
  tankRef,
  {
    name: tankName,
    location: location,
    stage: stage,
    status: calculateTankStatus(ph, temperature, oxygen, salinity),
    lastUpdate: new Date().toISOString(),
    sensors: {
      temperature: temperatureValue, // Must match field order
      ph: phValue,
      oxygen: oxygenValue,
      salinity: salinityValue,
    },
  },
  { merge: true }
);

// Historical data subcollection
await addDoc(historyRef, {
  timestamp: serverTimestamp(),
  temperature: temperatureValue,
  ph: phValue,
  oxygen: oxygenValue,
  salinity: salinityValue,
});
```

#### 3. Status Calculation Alignment

HTML interface must use identical status calculation logic:

```javascript
function calculateTankStatus(ph, temperature, oxygen, salinity) {
  // Critical thresholds (must match Vue.js tankStore)
  if (
    ph < 6.0 ||
    ph > 8.5 ||
    temperature < 15 ||
    temperature > 30 ||
    oxygen < 5
  ) {
    return 'critical';
  }

  // Warning thresholds
  if (
    ph < 6.5 ||
    ph > 8.0 ||
    temperature < 18 ||
    temperature > 28 ||
    oxygen < 6.5
  ) {
    return 'warning';
  }

  return 'healthy';
}
```

### Vue.js tankStore Compatibility

#### 1. Enhanced Data Structure Parsing

Ensure tankStore can handle both direct and nested data structures:

```javascript
// Handle multiple data structure formats
if (data.sensors && typeof data.sensors === 'object') {
  // Direct structure
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
  // Nested structure (backward compatibility)
  parsedData = {
    name: data.tankData.name || 'Tanque central',
    location: data.tankData.location || 'Galpão A',
    stage: data.tankData.stage || 'Crescimento',
    lastUpdate: data.tankData.lastUpdate || new Date().toISOString(),
    sensors: {
      temperature: data.tankData.sensors.temperature || 0,
      ph: data.tankData.sensors.ph || 0,
      oxygen: data.tankData.sensors.oxygen || 0,
      salinity: data.tankData.sensors.salinity || 0,
    },
  };
}
```

#### 2. Real-time Listener Robustness

Strengthen error handling and data validation:

```javascript
const setupRealtimeListener = (tankId = 'central-tank') => {
  const tankRef = doc(db, 'tanks', tankId);

  unsubscribe = onSnapshot(
    tankRef,
    docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Validate data structure
        if (!data.sensors || typeof data.sensors !== 'object') {
          console.warn('Invalid sensor data structure:', data);
          return;
        }

        // Process and store data
        const parsedData = parseFirestoreData(data);
        tankData.value = { id: tankId, ...parsedData };

        // Trigger status recalculation
        checkAndGenerateAlerts();
      }
    },
    error => {
      console.error('Firestore listener error:', error);
      connectionStatus.value = 'error';
    }
  );
};
```

## Testing Strategy

### Data Synchronization Validation

#### 1. End-to-End Testing Flow

```mermaid
flowchart TD
    A[HTML Interface] --> B[Input Sensor Data]
    B --> C[Generate Tank ID]
    C --> D[Save to Firestore]
    D --> E[Verify Document Structure]
    E --> F[Check Vue.js Listener]
    F --> G[Validate Dashboard Update]
    G --> H[Confirm Status Calculation]
    H --> I[Test Historical Data]
```

#### 2. Test Cases

| Test Case          | Input                                            | Expected Output             | Validation           |
| ------------------ | ------------------------------------------------ | --------------------------- | -------------------- |
| Basic Sync         | pH: 7.2, Temp: 25°C, O2: 8.5 mg/L, Salinity: 30‰ | Dashboard shows same values | Values match exactly |
| Tank ID Generation | "Tanque Principal"                               | "tanque-principal"          | ID consistency       |
| Status Calculation | pH: 5.8 (critical)                               | Status: "critical"          | Alert generation     |
| Historical Data    | Multiple readings                                | Chart displays timeline     | Data chronology      |
| Real-time Updates  | Immediate sensor change                          | Dashboard updates instantly | <2 second delay      |

#### 3. Debugging Tools

Enable comprehensive logging for troubleshooting:

```javascript
// HTML Interface Debug
console.log('Generated Tank ID:', tankId);
console.log('Firestore Data Structure:', dataToSave);
console.log('Write Success:', result);

// Vue.js tankStore Debug
console.log('Received Firestore Data:', data);
console.log('Parsed Tank Data:', parsedData);
console.log('Calculated Status:', status);
```

## Validation Rules

### Data Integrity Constraints

| Field       | Type   | Range           | Required | Default        |
| ----------- | ------ | --------------- | -------- | -------------- |
| temperature | number | -10 to 50°C     | Yes      | 25             |
| ph          | number | 0 to 14         | Yes      | 7.0            |
| oxygen      | number | 0 to 20 mg/L    | Yes      | 8.0            |
| salinity    | number | 0 to 50‰        | Yes      | 30             |
| tankName    | string | 1-50 chars      | Yes      | "Central Tank" |
| location    | string | predefined list | Yes      | "Laboratory"   |
| stage       | string | predefined list | Yes      | "Monitoring"   |

### Error Handling

```javascript
// Input validation
function validateSensorData(data) {
  const errors = [];

  if (!data.temperature || data.temperature < -10 || data.temperature > 50) {
    errors.push('Temperature must be between -10°C and 50°C');
  }

  if (!data.ph || data.ph < 0 || data.ph > 14) {
    errors.push('pH must be between 0 and 14');
  }

  if (!data.oxygen || data.oxygen < 0 || data.oxygen > 20) {
    errors.push('Oxygen must be between 0 and 20 mg/L');
  }

  if (!data.salinity || data.salinity < 0 || data.salinity > 50) {
    errors.push('Salinity must be between 0 and 50‰');
  }

  return errors;
}
```
