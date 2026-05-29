export interface Day {
  dayNumber: number;
  title: string;
  description: string;
}

export type POICategory = 'hotel' | 'restaurant' | 'attraction' | 'waypoint';

export interface POI {
  id: string;
  dayNumber: number;
  name: string;
  category: POICategory;
  locationName: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  days: Day[];
  pois: POI[];
  createdAt?: number;
  updatedAt?: number;
}

export interface GeminiParseResponse {
  title: string;
  description: string;
  days: Day[];
  pois: POI[];
}

export interface MapState {
  center: [number, number];
  zoom: number;
  activeTrip: Trip | null;
  activeDayFilter: number;
  activeCategoryFilter: POICategory | 'all';
  mobileActiveView: 'journal' | 'map';
}
