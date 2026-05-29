const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function geocodeLocation(
  locationName: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}?format=json&q=${encodeURIComponent(locationName)}`
    );

    if (!response.ok) {
      throw new Error('Geocoding service error');
    }

    const data = (await response.json()) as NominatimResult[];

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode location');
  }
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding service error');
    }

    const data = (await response.json()) as { display_name?: string };
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
