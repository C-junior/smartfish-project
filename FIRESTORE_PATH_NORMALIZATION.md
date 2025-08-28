# Firestore Path Normalization Implementation

## Overview

This document describes the implementation of Firestore path normalization in the SmartFish monitoring system. The changes ensure all dashboards use consistent `/tanks/{tank-id}` paths and standardized data structure matching the sensor format.

## Key Changes Made

### 1. Tank Store Modifications

#### Standardized Path Structure
- **Before**: Mixed paths (`/tanks/central-tank`, `/tanks/tanque-central/historicalData/`)
- **After**: Consistent `/tanks/{tank-id}` pattern for all tanks

#### Data Structure Normalization
The `normalizeTankData()` function ensures all data matches the exact sensor format:

```javascript
{
  "lastUpdate": "2025-08-28T18:26:08.499Z",  // ISO string
  "location": "Laboratório",                 // string
  "name": "Tanque Sul",                      // string
  "sensors": {                               // map
    "oxygen": 8.3,                          // number
    "ph": 7.2,                             // number
    "salinity": 32,                        // number
    "temperature": 24.5                    // number
  },
  "stage": "Monitoramento",                 // string
  "status": "healthy"                       // computed (not from Firestore)
}
```

#### Removed Hardcoded References
- Eliminated `'central-tank'` defaults
- Dynamic tank ID resolution
- Proper error handling for missing tank IDs

### 2. Dashboard Component Updates

#### DashboardView.vue
- Tank ID now required from route parameters
- Proper validation and error handling for missing tank IDs
- Automatic redirect to home if no tank ID provided

#### Router Changes
- Removed hardcoded `central-tank` redirect
- Old `/dashboard` route now redirects to home for tank selection

## Usage Instructions

### For Sensor Data Writers
Ensure your sensor data follows this exact structure when writing to Firestore:

```javascript
// Write to: /tanks/{your-tank-id}
const tankData = {
  lastUpdate: new Date().toISOString(),
  location: "Your Location",
  name: "Your Tank Name",
  sensors: {
    oxygen: parseFloat(oxygenValue),
    ph: parseFloat(phValue),
    salinity: parseFloat(salinityValue),
    temperature: parseFloat(temperatureValue)
  },
  stage: "Monitoramento" // or appropriate stage
  // Do NOT include 'status' - it's computed automatically
};

await setDoc(doc(db, 'tanks', tankId), tankData);
```

### For Dashboard Access
Access tank dashboards using the URL pattern:
```
/tank/{tank-id}
```

Examples:
- `/tank/tanque-central`
- `/tank/tank-001`
- `/tank/laboratorio-a`

### Historical Data Separation
- Real-time data: `/tanks/{tank-id}` (main document)
- Historical data: `/tanks/{tank-id}/historicalData/{timestamp}` (subcollection)

## Implementation Details

### Data Flow
1. Sensor writes data to `/tanks/{tank-id}` with exact structure
2. Tank store `setupRealtimeListener()` listens to document changes
3. `normalizeTankData()` validates and normalizes incoming data
4. Dashboard components receive consistent data format
5. Status calculation happens in computed properties

### Error Handling
- Missing tank ID → redirect to home
- Invalid tank document → error message with tank ID
- Connection errors → retry mechanism

### Performance Considerations
- Single document listener per tank
- Efficient tank switching without multiple concurrent listeners
- Proper cleanup of listeners on navigation

## Testing

### Validate Implementation
1. Navigate to home page (`/`)
2. Create or select a tank
3. Verify dashboard loads with correct tank data
4. Check browser console for path logging
5. Confirm data structure matches sensor format

### Test Real-time Updates
1. Open dashboard for a specific tank
2. Update sensor data in Firestore console
3. Verify updates appear in dashboard without refresh
4. Check console logs for normalization messages

## Troubleshooting

### Common Issues

**Dashboard shows different data**
- Ensure all tanks use `/tanks/{tank-id}` path
- Verify data structure matches sensor format
- Check for cached old data

**Tank not found errors**
- Verify tank document exists in Firestore
- Check tank ID spelling in URL
- Ensure tank document has required fields

**Real-time updates not working**
- Check Firestore security rules
- Verify internet connection
- Look for JavaScript console errors

### Console Logging
The implementation includes debug logging:
```javascript
console.log(`Setting up listener for tank: ${tankId}`);
console.log('Received Firestore data:', data);
console.log('Normalized tank data:', normalizedData);
```

## Migration Notes

### Backward Compatibility
- Existing `/dashboard` route redirects to home
- Old nested data structures are handled during transition
- Gradual migration supported

### Breaking Changes
- Tank ID is now required for dashboard access
- Hardcoded `central-tank` references removed
- Status field no longer accepted from Firestore (computed only)

## Security Considerations

### Firestore Rules
Ensure your Firestore security rules allow:
```javascript
// Read access to tank documents
match /tanks/{tankId} {
  allow read: if request.auth != null;
}

// Write access for sensors (adjust based on your auth setup)
match /tanks/{tankId} {
  allow write: if request.auth != null && isValidSensorData(resource.data);
}
```

### Data Validation
The normalization function includes:
- Type coercion for sensor values
- Default value handling
- Field validation

## Future Enhancements

### Planned Improvements
1. Tank discovery API for dynamic tank list
2. Enhanced historical data queries
3. Real-time tank status broadcasting
4. Advanced caching strategies

### Extension Points
- `normalizeTankData()` can be extended for new sensor types
- Tank validation rules can be customized
- Path structure can accommodate multiple facilities

---

## Support

For issues related to this implementation:
1. Check browser console for error messages
2. Verify Firestore document structure
3. Confirm tank ID format and existence
4. Review implementation logs for debugging information