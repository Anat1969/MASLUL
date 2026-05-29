# MASLUL - RouteAI Application

A modern travel route planner with AI-powered itinerary generation, interactive mapping, and POI management.

## Features

- 🗺️ **Interactive Map** - Leaflet-based map with real-time markers, polylines, and filtering
- 🤖 **AI-Powered Parsing** - Text-to-route conversion using Gemini 2.5 Flash API
- 📍 **POI Management** - Add, edit, and delete points of interest with geocoding
- 📅 **Multi-day Planning** - Organize trips by days with category-based filtering
- 💾 **Offline Persistence** - IndexedDB for local data storage without authentication
- 📱 **Responsive Design** - Mobile-friendly interface with RTL (Hebrew) language support
- 🎨 **Category Styling** - Color-coded markers for hotels, restaurants, attractions, and waypoints

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
git clone <repository-url>
cd MASLUL
npm install
```

### Development

```bash
# Start both frontend and backend servers
npm run dev:all

# Or run separately:
npm run dev          # Frontend: http://localhost:5173/
npm run dev:server   # Backend: http://localhost:3001/api
```

### Build

```bash
npm run build
npm run preview
```

## Environment Setup

Create a `.env` file based on `.env.example`:

```env
# Frontend
VITE_API_URL=http://localhost:3001/api

# Backend
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
```

**To enable AI parsing:**
1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Add it to your `.env` file as `GEMINI_API_KEY`

## Architecture

### Frontend (React + TypeScript)
- **Components**: Modular UI components (Sidebar, Map, Itinerary, AIParser, POIForm, TripLibrary)
- **Hooks**: Custom state management (useTrips)
- **Services**: API client, Nominatim geocoding, IndexedDB storage
- **Styling**: Tailwind CSS with custom color scheme and RTL support

### Backend (Express)
- **API Endpoint**: `POST /api/gemini/parse` - Securely proxies Gemini API calls
- **Health Check**: `GET /api/health` - Server status verification
- **Environment**: Node.js with CORS enabled for frontend communication

### Data Persistence
- **Storage**: Dexie (IndexedDB wrapper)
- **Stores**: trips, pois, metadata
- **Sync**: Local-first with optional backend integration

## Project Structure

```
src/
├── components/RouteAI/
│   ├── App.tsx              # Main application component
│   ├── Sidebar.tsx          # Journal/controls container
│   ├── Itinerary.tsx        # Timeline view with filters
│   ├── Map.tsx              # Leaflet interactive map
│   ├── AIParser.tsx         # Text-to-route parsing UI
│   ├── POIForm.tsx          # POI add/edit form
│   ├── TabNavigation.tsx    # Tab switcher
│   ├── TripLibrary.tsx      # Trip archive modal
│   └── MobileTabBar.tsx     # Mobile view toggle
├── hooks/
│   └── useTrips.ts          # Trip state management
├── services/
│   ├── apiClient.ts         # Gemini API proxy client
│   ├── nominatimService.ts  # OpenStreetMap geocoding
│   └── storageService.ts    # IndexedDB operations
├── types/
│   └── routes.ts            # TypeScript interfaces
└── styles/
    └── globals.css          # Global styles & Tailwind

server.js                     # Express backend server
package.json                  # Dependencies & scripts
vite.config.ts               # Vite configuration
tsconfig.json                # TypeScript configuration
```

## Usage

### Adding a Trip Manually
1. Open the **"הוסף יעד"** (Add Place) tab
2. Fill in location name and search for coordinates
3. Select the day and category
4. Save the POI

### Parsing Text to Route
1. Switch to **"טקסט למפה (AI)"** tab
2. Describe your trip in free text (Hebrew or English)
3. Click **"ניתוח טקסט"** to let AI parse the itinerary
4. Review and adjust if needed

### Filtering
- **By Day**: Click day buttons to show only that day's POIs
- **By Category**: Select hotel, restaurant, or attraction
- **Clear Filters**: Click "נקה סינון" button

## Testing with Sample Data

The app includes a sample Italy trip by default. To test:
1. Start the dev servers
2. Open http://localhost:5173/
3. Explore the map and itinerary
4. Try adding or editing POIs
5. Test filters with different day/category combinations

## API Reference

### Gemini Parse Endpoint
```bash
POST /api/gemini/parse
Content-Type: application/json

{
  "text": "User's trip description",
  "language": "en"  # Optional
}
```

Response:
```json
{
  "title": "Trip Title",
  "description": "Trip description",
  "days": [
    {
      "dayNumber": 1,
      "title": "Day 1",
      "description": "Day description"
    }
  ],
  "pois": [
    {
      "name": "Location name",
      "description": "Details",
      "category": "hotel|restaurant|attraction|waypoint",
      "dayNumber": 1,
      "locationName": "City, Country",
      "latitude": 45.434,
      "longitude": 12.342
    }
  ]
}
```

## Type Safety

All data structures are fully typed with TypeScript:
- `Trip` - Main trip container with days and POIs
- `Day` - Multi-day itinerary element
- `POI` - Point of interest with location and metadata
- `POICategory` - Category enum (hotel, restaurant, attraction, waypoint)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires IndexedDB support

## Performance

- **Bundle Size**: ~727 KB (minified), 220 KB (gzipped)
- **Map Tiles**: CartoDB Voyager tiles with max zoom level 20
- **Geocoding**: Nominatim (OpenStreetMap) with caching
- **Storage**: IndexedDB for unlimited offline trips (browser dependent)

## Troubleshooting

### Servers not starting?
```bash
# Kill any processes on ports 5173 or 3001
lsof -ti:5173 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Then restart
npm run dev:all
```

### API Key not working?
- Verify `GEMINI_API_KEY` is set in `.env`
- Check that the backend server shows "Gemini API configured: YES"
- Ensure you're using a valid Google AI API key (not Cloud credentials)

### Map not loading?
- Check browser console for Leaflet CSS errors
- Verify `leaflet/dist/leaflet.css` is being loaded
- Clear browser cache and reload

### Geocoding failures?
- Verify location name is correct
- Try with city and country format: "Milan, Italy"
- Nominatim has rate limits (1 request/second recommended)

## License

MIT

## Architecture Notes

This application demonstrates:
- Modern React 19 with TypeScript for type safety
- Custom hooks for state management (no external state library)
- Service layer architecture for API communication
- Secure API key handling via backend proxy
- IndexedDB for offline-first data persistence
- Leaflet for interactive mapping with custom markers
- Tailwind CSS for responsive, mobile-first styling
- RTL language support (Hebrew)

## Future Enhancements

- User authentication and cloud sync
- Trip sharing and collaboration
- Export to PDF/print
- Route optimization algorithm
- Weather integration
- Hotel/restaurant reservations integration
- Mobile app (React Native)
- Voice input for trip descriptions
