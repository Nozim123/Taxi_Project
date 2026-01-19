import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "framer-motion";

interface MapboxMapProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  pickupLocation?: { lat: number; lng: number } | null;
  dropoffLocation?: { lat: number; lng: number } | null;
  driverLocation?: { lat: number; lng: number; heading?: number } | null;
  routeGeometry?: GeoJSON.LineString | null;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  interactive?: boolean;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  className = "",
  center = [69.2401, 41.2995], // Tashkent
  zoom = 13,
  pickupLocation,
  dropoffLocation,
  driverLocation,
  routeGeometry,
  onMapClick,
  interactive = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarker = useRef<mapboxgl.Marker | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtNXdrOHJ6djBkM3UybHB5NWxqcWE4aTAifQ.VWPwZl8jqM0vD7vKkH4fwA";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: center,
      zoom: zoom,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-right"
    );

    map.current.on("load", () => {
      setMapLoaded(true);

      // Add 3D buildings
      if (map.current) {
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
        )?.id;

        map.current.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#1a1a2e",
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "height"],
              ],
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "min_height"],
              ],
              "fill-extrusion-opacity": 0.8,
            },
          },
          labelLayerId
        );
      }
    });

    if (interactive && onMapClick) {
      map.current.on("click", (e) => {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update pickup marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (pickupMarker.current) {
      pickupMarker.current.remove();
    }

    if (pickupLocation) {
      const el = document.createElement("div");
      el.className = "pickup-marker";
      el.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
      `;

      pickupMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .addTo(map.current);
    }
  }, [pickupLocation, mapLoaded]);

  // Update dropoff marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (dropoffMarker.current) {
      dropoffMarker.current.remove();
    }

    if (dropoffLocation) {
      const el = document.createElement("div");
      el.className = "dropoff-marker";
      el.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;

      dropoffMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([dropoffLocation.lng, dropoffLocation.lat])
        .addTo(map.current);
    }
  }, [dropoffLocation, mapLoaded]);

  // Update driver marker with rotation
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (driverMarker.current) {
      if (driverLocation) {
        driverMarker.current.setLngLat([driverLocation.lng, driverLocation.lat]);
        if (driverLocation.heading !== undefined) {
          driverMarker.current.setRotation(driverLocation.heading);
        }
      } else {
        driverMarker.current.remove();
        driverMarker.current = null;
      }
      return;
    }

    if (driverLocation) {
      const el = document.createElement("div");
      el.className = "driver-marker";
      el.innerHTML = `
        <div class="relative">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/50 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.3-.8-2-.7H5c-1.2 0-2.3.5-3.1 1.3C1.3 9 1 9.9 1 11v5c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-amber-500"></div>
        </div>
      `;

      driverMarker.current = new mapboxgl.Marker({
        element: el,
        rotationAlignment: "map",
      })
        .setLngLat([driverLocation.lng, driverLocation.lat])
        .addTo(map.current);
    }
  }, [driverLocation, mapLoaded]);

  // Update route
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (map.current.getSource("route")) {
      (map.current.getSource("route") as mapboxgl.GeoJSONSource).setData({
        type: "Feature",
        properties: {},
        geometry: routeGeometry || { type: "LineString", coordinates: [] },
      });
    } else if (routeGeometry) {
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: routeGeometry,
        },
      });

      map.current.addLayer({
        id: "route-glow",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#f5a623",
          "line-width": 12,
          "line-opacity": 0.3,
          "line-blur": 3,
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#f5a623",
          "line-width": 5,
          "line-opacity": 1,
        },
      });
    }

    // Fit bounds to show route
    if (pickupLocation && dropoffLocation && map.current) {
      const bounds = new mapboxgl.LngLatBounds()
        .extend([pickupLocation.lng, pickupLocation.lat])
        .extend([dropoffLocation.lng, dropoffLocation.lat]);

      map.current.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 50, right: 50 },
        duration: 1000,
      });
    }
  }, [routeGeometry, mapLoaded, pickupLocation, dropoffLocation]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative ${className}`}
    >
      <div ref={mapContainer} className="w-full h-full rounded-3xl overflow-hidden" />
      
      {/* Map overlay gradient */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent" />
      </div>
    </motion.div>
  );
};

export default MapboxMap;
