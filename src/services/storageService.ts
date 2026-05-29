import Dexie from 'dexie';
import type { Trip, POI } from '../types/routes';

class RouteAIDB extends Dexie {
  trips!: Dexie.Table<Trip, string>;
  pois!: Dexie.Table<POI, string>;

  constructor() {
    super('RouteAIDatabase');
    this.version(1).stores({
      trips: 'id',
      pois: 'id, dayNumber',
    });
  }
}

const db = new RouteAIDB();

export class StorageService {
  async saveTrip(trip: Trip): Promise<string> {
    const timestamp = Date.now();
    const tripWithTime = {
      ...trip,
      updatedAt: timestamp,
      createdAt: trip.createdAt || timestamp,
    };

    await db.trips.put(tripWithTime);

    // Save POIs separately
    for (const poi of trip.pois) {
      await db.pois.put(poi);
    }

    return trip.id;
  }

  async getTrip(tripId: string): Promise<Trip | undefined> {
    const trip = await db.trips.get(tripId);
    if (!trip) return undefined;

    const pois = await db.pois.where('id').anyOf(trip.pois.map(p => p.id)).toArray();

    return {
      ...trip,
      pois,
    };
  }

  async getAllTrips(): Promise<Trip[]> {
    const trips = await db.trips.toArray();

    const tripsWithPOIs = await Promise.all(
      trips.map(async (trip) => {
        const pois = await db.pois.where('id').anyOf(trip.pois.map(p => p.id)).toArray();
        return {
          ...trip,
          pois,
        };
      })
    );

    return tripsWithPOIs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  async deleteTrip(tripId: string): Promise<void> {
    const trip = await db.trips.get(tripId);
    if (trip) {
      await db.pois.bulkDelete(trip.pois.map(p => p.id));
      await db.trips.delete(tripId);
    }
  }

  async clearAll(): Promise<void> {
    await db.trips.clear();
    await db.pois.clear();
  }
}

export const storageService = new StorageService();
