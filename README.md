# Smartish - Aquaculture Monitoring System

A modern, professional web application for real-time monitoring of fish farming operations built with Vue 3, Firebase, and Tailwind CSS.

## Features

- **Real-time Monitoring**: Continuous monitoring of water quality parameters including temperature, pH, dissolved oxygen, and salinity
- **Smart Alert System**: Configurable thresholds with priority levels and instant notifications
- **Professional Dashboard**: Modern water-themed interface with glass morphism effects
- **Multi-parameter Tracking**: Comprehensive sensor data visualization with status indicators
- **Historical Data**: Data analysis and export capabilities
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: Vue 3 with Composition API
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS v3.4.17 with water-themed design
- **State Management**: Pinia
- **Database**: Firebase Firestore (real-time)
- **Icons**: Heroicons
- **Date Handling**: date-fns with Portuguese locale

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Environment variables are already set in `.env`
   - Firebase configuration is ready for the provided project

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000` (or next available port)

4. **Build for Production**
   ```bash
   npm run build
   ```

5. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── SensorCard.vue   # Individual sensor display
│   ├── TankOverview.vue # Tank status overview
│   └── AlertsPanel.vue  # Alert management
├── views/               # Page-level components
│   ├── HomeView.vue     # Landing page
│   ├── DashboardView.vue # Main monitoring interface
│   └── SettingsView.vue # Configuration page
├── stores/              # Pinia state management
│   └── tankStore.js     # Tank data and alerts
├── router/              # Vue Router configuration
│   └── index.js         # Route definitions
├── firebaseConfig.js    # Firebase initialization
├── index.css           # Global styles and theme
└── main.js             # Application entry point
```

## Firebase Data Structure

The application expects the following Firestore document structure:

```json
{
  "tankData": {
    "lastUpdate": "2025-08-26T18:09:51.191Z",
    "location": "Fish Farm - Section A",
    "name": "Central Tank",
    "sensors": {
      "oxygen": 8,
      "ph": 6,
      "salinity": 30,
      "temperature": 26
    },
    "stage": "Growth",
    "status": "healthy"
  },
  "historicalData": [],
  "exportedAt": "2025-08-26T18:09:51.191Z"
}
```

## Configuration

### Sensor Thresholds

Default thresholds can be configured in the Settings page:

- **Temperature**: 20°C - 30°C (Critical: 35°C)
- **pH**: 6.0 - 8.0 (Critical: 9.0)
- **Oxygen**: 5.0 - 12.0 mg/L (Critical: 3.0)
- **Salinity**: 25 - 35 ppt (Critical: 40)

### Water-Themed Design

The application uses a carefully crafted water-themed color palette:

- Primary Teal: `#0d9488`
- Light Teal: `#5eead4`
- Dark Teal: `#0f766e`
- Accent Teal: `#2dd4bf`
- Deep Teal: `#134e4a`

## Features in Detail

### Dashboard
- Real-time tank overview with sensor cards
- Live alert panel with severity levels
- System status monitoring
- Quick action buttons

### Home Page
- Professional landing page
- Feature highlights
- Technology stack showcase
- Call-to-action sections

### Settings
- Configurable sensor thresholds
- System preferences
- Notification settings
- Data retention options

## Browser Support

- Modern browsers supporting ES2020+
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Code Formatting
```bash
npm run format
```

### Node.js Requirements
- Node.js ^20.19.0 || >=22.12.0

## Accessibility

The application includes:
- WCAG AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences

## License

MIT License - see LICENSE file for details

---

Built with ❤️ for sustainable aquaculture operations.