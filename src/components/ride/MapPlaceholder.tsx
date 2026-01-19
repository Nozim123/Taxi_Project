import React from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface MapPlaceholderProps {
  className?: string;
  showRoute?: boolean;
  pickupLocation?: string;
  dropoffLocation?: string;
}

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  className = "",
  showRoute = false,
  pickupLocation,
  dropoffLocation,
}) => {
  return (
    <div className={`relative bg-secondary/50 rounded-2xl overflow-hidden ${className}`}>
      {/* Grid pattern for map effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Simulated roads */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
        {/* Main roads */}
        <path d="M 0 200 L 400 200" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
        <path d="M 200 0 L 200 400" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
        <path d="M 100 0 L 100 400" stroke="hsl(var(--muted))" strokeWidth="4" fill="none" />
        <path d="M 300 0 L 300 400" stroke="hsl(var(--muted))" strokeWidth="4" fill="none" />
        <path d="M 0 100 L 400 100" stroke="hsl(var(--muted))" strokeWidth="4" fill="none" />
        <path d="M 0 300 L 400 300" stroke="hsl(var(--muted))" strokeWidth="4" fill="none" />
        
        {/* Route path when showing route */}
        {showRoute && (
          <path 
            d="M 80 320 Q 100 280 120 260 T 180 200 T 280 120 T 340 80" 
            stroke="hsl(var(--primary))" 
            strokeWidth="4" 
            fill="none" 
            strokeDasharray="8 4"
            className="animate-pulse"
          />
        )}
      </svg>
      
      {/* Pickup marker */}
      {pickupLocation && (
        <div className="absolute bottom-[20%] left-[20%] transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-lg">
              <MapPin className="w-4 h-4 text-success-foreground" />
            </div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="bg-card px-2 py-1 rounded text-xs font-medium shadow-md whitespace-nowrap">
                {pickupLocation}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Dropoff marker */}
      {dropoffLocation && (
        <div className="absolute top-[20%] right-[15%] transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center shadow-lg">
              <Navigation className="w-4 h-4 text-destructive-foreground" />
            </div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="bg-card px-2 py-1 rounded text-xs font-medium shadow-md whitespace-nowrap">
                {dropoffLocation}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Center indicator when no route */}
      {!showRoute && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Enter locations to see the route
            </p>
          </div>
        </div>
      )}
      
      {/* Map attribution placeholder */}
      <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/50">
        Map powered by Mapbox
      </div>
    </div>
  );
};

export default MapPlaceholder;
