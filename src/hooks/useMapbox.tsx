import { useState, useCallback } from "react";

const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtNXdrOHJ6djBkM3UybHB5NWxqcWE4aTAifQ.example"; // Will be replaced by server-side token

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
  geometry: GeoJSON.LineString;
}

interface GeocodingResult {
  address: string;
  coordinates: Coordinates;
}

export const useMapbox = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRoute = useCallback(async (
    origin: Coordinates,
    destination: Coordinates
  ): Promise<RouteInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );

      if (!response.ok) {
        throw new Error("Failed to get route");
      }

      const data = await response.json();
      const route = data.routes[0];

      return {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get route");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const geocode = useCallback(async (query: string): Promise<GeocodingResult[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=UZ&limit=5`
      );

      if (!response.ok) {
        throw new Error("Geocoding failed");
      }

      const data = await response.json();
      return data.features.map((feature: any) => ({
        address: feature.place_name,
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1],
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Geocoding failed");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (coords: Coordinates): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.features[0]?.place_name || null;
    } catch {
      return null;
    }
  }, []);

  return {
    getRoute,
    geocode,
    reverseGeocode,
    loading,
    error,
  };
};
