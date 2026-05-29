import { useState, useCallback, useEffect } from 'react';
import type { Trip, POI, Day } from '../types/routes';
import { storageService } from '../services/storageService';

export function useTrips(initialTrips?: Trip[]) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips || []);
  const [isLoading, setIsLoading] = useState(true);

  // Load trips from IndexedDB on mount
  useEffect(() => {
    const loadTrips = async () => {
      try {
        const savedTrips = await storageService.getAllTrips();
        setTrips(savedTrips);
      } catch (error) {
        console.error('Failed to load trips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrips();
  }, []);

  const saveTrip = useCallback(
    async (trip: Trip) => {
      try {
        await storageService.saveTrip(trip);
        setTrips((prev) => {
          const existing = prev.find((t) => t.id === trip.id);
          if (existing) {
            return prev.map((t) => (t.id === trip.id ? trip : t));
          }
          return [trip, ...prev];
        });
        return trip.id;
      } catch (error) {
        console.error('Failed to save trip:', error);
        throw error;
      }
    },
    []
  );

  const deleteTrip = useCallback(async (tripId: string) => {
    try {
      await storageService.deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (error) {
      console.error('Failed to delete trip:', error);
      throw error;
    }
  }, []);

  const updateTrip = useCallback(
    (tripId: string, updates: Partial<Trip>) => {
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error('Trip not found');

      const updated = { ...trip, ...updates };
      return saveTrip(updated);
    },
    [trips, saveTrip]
  );

  const addPOIToTrip = useCallback(
    (tripId: string, poi: POI) => {
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error('Trip not found');

      const updated: Trip = {
        ...trip,
        pois: [...trip.pois, poi],
      };

      return saveTrip(updated);
    },
    [trips, saveTrip]
  );

  const updatePOI = useCallback(
    (tripId: string, poiId: string, updates: Partial<POI>) => {
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error('Trip not found');

      const updated: Trip = {
        ...trip,
        pois: trip.pois.map((p) =>
          p.id === poiId ? { ...p, ...updates } : p
        ),
      };

      return saveTrip(updated);
    },
    [trips, saveTrip]
  );

  const removePOI = useCallback(
    (tripId: string, poiId: string) => {
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error('Trip not found');

      const updated: Trip = {
        ...trip,
        pois: trip.pois.filter((p) => p.id !== poiId),
      };

      return saveTrip(updated);
    },
    [trips, saveTrip]
  );

  const addDay = useCallback(
    (tripId: string, day: Day) => {
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) throw new Error('Trip not found');

      const updated: Trip = {
        ...trip,
        days: [...trip.days, day],
      };

      return saveTrip(updated);
    },
    [trips, saveTrip]
  );

  return {
    trips,
    isLoading,
    saveTrip,
    deleteTrip,
    updateTrip,
    addPOIToTrip,
    updatePOI,
    removePOI,
    addDay,
  };
}
