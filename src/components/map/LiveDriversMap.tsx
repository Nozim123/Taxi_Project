import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "framer-motion";
import { useOnlineDrivers } from "@/hooks/useRealtime";
import { Car, Users, Clock, MapPin } from "lucide-react";

// Demo Mapbox token for display
const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtNXdrOHJ6djBkM3UybHB5NWxqcWE4aTAifQ.VWPwZl8jqM0vD7vKkH4fwA";

// Simulated driver positions in Tashkent
const MOCK_DRIVERS = [
  { id: "1", lat: 41.3111, lng: 69.2797, heading: 45, name: "Sardor" },
  { id: "2", lat: 41.2995, lng: 69.2401, heading: 120, name: "Bobur" },
  { id: "3", lat: 41.3256, lng: 69.2845, heading: 200, name: "Jamshid" },
  { id: "4", lat: 41.2850, lng: 69.2650, heading: 90, name: "Rustam" },
  { id: "5", lat: 41.3050, lng: 69.2200, heading: 310, name: "Aziz" },
  { id: "6", lat: 41.2714, lng: 69.2845, heading: 180, name: "Timur" },
  { id: "7", lat: 41.3400, lng: 69.3100, heading: 60, name: "Farrux" },
  { id: "8", lat: 41.2600, lng: 69.2100, heading: 270, name: "Ulugbek" },
];

const LiveDriversMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { onlineDrivers } = useOnlineDrivers();

  // Use real drivers or mock data
  const drivers = onlineDrivers.length > 0 ? onlineDrivers : MOCK_DRIVERS;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [69.2401, 41.2995], // Tashkent center
      zoom: 11.5,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
      interactive: true,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
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
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.8,
            },
          },
          labelLayerId
        );
      }
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add/update driver markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    drivers.forEach((driver, index) => {
      const el = document.createElement("div");
      el.className = "driver-3d-marker";
      el.innerHTML = `
        <div class="relative group cursor-pointer">
          <div class="absolute -inset-4 bg-amber-500/20 rounded-full animate-ping" style="animation-delay: ${index * 0.2}s;"></div>
          <div class="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/50 transform hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.3-.8-2-.7H5c-1.2 0-2.3.5-3.1 1.3C1.3 9 1 9.9 1 11v5c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
          <div class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-card/90 backdrop-blur rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            ${(driver as any).name || 'Haydovchi'}
          </div>
        </div>
      `;

      const lat = (driver as any).lat || (driver as any).current_lat || 41.2995;
      const lng = (driver as any).lng || (driver as any).current_lng || 69.2401;

      const marker = new mapboxgl.Marker({
        element: el,
        rotationAlignment: "map",
      })
        .setLngLat([lng, lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [drivers, mapLoaded]);

  // Animate drivers movement
  useEffect(() => {
    if (!mapLoaded) return;

    const animateDrivers = () => {
      markersRef.current.forEach((marker, i) => {
        const pos = marker.getLngLat();
        const newLng = pos.lng + (Math.random() - 0.5) * 0.001;
        const newLat = pos.lat + (Math.random() - 0.5) * 0.001;
        marker.setLngLat([newLng, newLat]);
      });
    };

    const interval = setInterval(animateDrivers, 2000);
    return () => clearInterval(interval);
  }, [mapLoaded]);

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Real-time</span> haydovchilar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Toshkent bo'ylab faol haydovchilarni jonli xaritada ko'ring
          </p>
        </motion.div>

        <div className="relative">
          {/* Map container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden border border-border/50 shadow-2xl"
          >
            <div ref={mapContainer} className="w-full h-full" />
            
            {/* Map overlays */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </motion.div>

          {/* Stats cards */}
          <div className="absolute -bottom-8 left-4 right-4 md:left-8 md:right-8 flex flex-wrap justify-center gap-4">
            {[
              { icon: Car, value: drivers.length, label: "Faol haydovchilar", color: "text-primary" },
              { icon: Users, value: "2,847", label: "Bugungi safarlar", color: "text-accent" },
              { icon: Clock, value: "3 min", label: "O'rtacha kutish", color: "text-success" },
              { icon: MapPin, value: "12", label: "Hudud", color: "text-primary" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50 shadow-xl"
              >
                <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDriversMap;
