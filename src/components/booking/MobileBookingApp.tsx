import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Navigation, Clock, Star, ChevronRight, Wallet, Gift, Shield, Headphones, Menu, X, User, Car, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneFrame, PhoneScreen } from "@/components/ui/phone-frame";
import MapboxMap from "@/components/map/MapboxMap";
import { useMapbox } from "@/hooks/useMapbox";
import { cn } from "@/lib/utils";

interface LocationState {
  pickup: { lat: number; lng: number; address: string } | null;
  dropoff: { lat: number; lng: number; address: string } | null;
}

const QUICK_DESTINATIONS = [
  { id: 1, name: "Uy", address: "Sergeli, Tashkent", icon: "🏠" },
  { id: 2, name: "Ish", address: "Minor, Yunusobod", icon: "💼" },
  { id: 3, name: "Chorsu Bozor", address: "Chorsu, Tashkent", icon: "🛍️" },
];

const RIDE_TYPES = [
  { id: "standard", name: "Standard", multiplier: 1, time: "3 min", icon: Car, desc: "Arzon va tez" },
  { id: "comfort", name: "Comfort", multiplier: 1.5, time: "5 min", icon: Car, desc: "Qulay avtomobil" },
  { id: "business", name: "Business", multiplier: 2.5, time: "7 min", icon: Sparkles, desc: "Premium xizmat" },
];

export const MobileBookingApp: React.FC = () => {
  const [location, setLocation] = useState<LocationState>({ pickup: null, dropoff: null });
  const [searchMode, setSearchMode] = useState<"pickup" | "dropoff" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRideType, setSelectedRideType] = useState("standard");
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number; geometry: any } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [step, setStep] = useState<"home" | "search" | "select" | "confirm">("home");
  
  const { getRoute, geocode, loading } = useMapbox();

  // Get user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(prev => ({
            ...prev,
            pickup: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              address: "Joriy joylashuv"
            }
          }));
        },
        () => {
          // Default to Tashkent center
          setLocation(prev => ({
            ...prev,
            pickup: {
              lat: 41.2995,
              lng: 69.2401,
              address: "Toshkent markazi"
            }
          }));
        }
      );
    }
  }, []);

  // Calculate route when both locations are set
  useEffect(() => {
    const calculateRoute = async () => {
      if (location.pickup && location.dropoff) {
        const route = await getRoute(location.pickup, location.dropoff);
        if (route) {
          setRouteInfo(route);
          setStep("select");
        }
      }
    };
    calculateRoute();
  }, [location.pickup, location.dropoff, getRoute]);

  const calculateFare = (multiplier: number) => {
    if (!routeInfo) return 0;
    const baseFare = 5000; // UZS
    const perKm = 3000;
    const perMin = 500;
    const distance = routeInfo.distance / 1000;
    const duration = routeInfo.duration / 60;
    return Math.round((baseFare + distance * perKm + duration * perMin) * multiplier);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours} soat ${remainingMins} min`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <PhoneFrame className="min-h-[750px]">
      {/* Map Background */}
      <div className="absolute inset-0">
        <MapboxMap
          className="h-full"
          pickupLocation={location.pickup}
          dropoffLocation={location.dropoff}
          routeGeometry={routeInfo?.geometry}
          interactive={step === "home"}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-12 left-4 right-4 z-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-card/90 backdrop-blur-lg border border-border/50"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          
          <motion.div
            className="px-4 py-2 rounded-full bg-card/90 backdrop-blur-lg border border-border/50"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm font-medium gradient-text">AllOne</span>
          </motion.div>
          
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-card/90 backdrop-blur-lg border border-border/50"
          >
            <User className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      {/* Side Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute top-24 left-4 z-30 w-64 p-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50"
          >
            <nav className="space-y-2">
              {[
                { icon: Clock, label: "Tarix", href: "/history" },
                { icon: Wallet, label: "To'lov", href: "/payment" },
                { icon: Gift, label: "Promokod", href: "/promo" },
                { icon: Shield, label: "Xavfsizlik", href: "/safety" },
                { icon: Headphones, label: "Yordam", href: "/help" },
              ].map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <item.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <motion.div
        layout
        className="absolute bottom-0 left-0 right-0 z-20"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
      >
        <div className="bg-gradient-to-t from-card via-card to-card/95 backdrop-blur-xl rounded-t-[2rem] border-t border-border/50 p-4 pt-3">
          {/* Handle */}
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />

          {step === "home" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Search Box */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSearchMode("dropoff");
                  setStep("search");
                }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 border border-border/50 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm">Qayerga?</p>
                  <p className="font-medium">Manzilni kiriting</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>

              {/* Quick Destinations */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {QUICK_DESTINATIONS.map((dest, i) => (
                  <motion.button
                    key={dest.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50"
                  >
                    <span className="text-lg">{dest.icon}</span>
                    <span className="font-medium text-sm">{dest.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Recent/Promo Banner */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">20% chegirma!</p>
                    <p className="text-sm text-muted-foreground">Birinchi safar uchun</p>
                  </div>
                  <Button size="sm" className="taxi-button rounded-full text-sm">
                    Olish
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {step === "search" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Location Inputs */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <Input
                    placeholder="Qayerdan?"
                    value={location.pickup?.address || ""}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchMode("pickup")}
                    className="flex-1 bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <Input
                    placeholder="Qayerga?"
                    value={searchMode === "dropoff" ? searchQuery : (location.dropoff?.address || "")}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchMode("dropoff")}
                    className="flex-1 bg-secondary/50 border-border/50"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Locations */}
              <div className="space-y-2">
                {[
                  { icon: MapPin, name: "Tashkent City Mall", address: "Sergeli, Tashkent", coords: { lat: 41.2714, lng: 69.2845 } },
                  { icon: MapPin, name: "Amir Temur Xiyoboni", address: "Amir Temur, Tashkent", coords: { lat: 41.3111, lng: 69.2797 } },
                  { icon: MapPin, name: "Tashkent Airport", address: "TAS Airport", coords: { lat: 41.2579, lng: 69.2812 } },
                ].map((place, i) => (
                  <motion.button
                    key={place.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      setLocation(prev => ({
                        ...prev,
                        [searchMode || "dropoff"]: { ...place.coords, address: place.name }
                      }));
                      setSearchQuery("");
                      if (searchMode === "dropoff" && location.pickup) {
                        // Route will be calculated automatically
                      }
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <place.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{place.name}</p>
                      <p className="text-sm text-muted-foreground">{place.address}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("home")}
              >
                Bekor qilish
              </Button>
            </motion.div>
          )}

          {step === "select" && routeInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Route Info */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatDuration(routeInfo.duration)}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatDistance(routeInfo.distance)}</span>
                </div>
              </div>

              {/* Ride Type Selection */}
              <div className="space-y-2">
                {RIDE_TYPES.map((ride, i) => (
                  <motion.button
                    key={ride.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedRideType(ride.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all",
                      selectedRideType === ride.id
                        ? "bg-primary/10 border-primary"
                        : "bg-secondary/30 border-border/50 hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      selectedRideType === ride.id ? "bg-primary/20" : "bg-secondary"
                    )}>
                      <ride.icon className={cn(
                        "w-7 h-7",
                        selectedRideType === ride.id ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{ride.name}</span>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          {ride.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{ride.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(calculateFare(ride.multiplier))}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Confirm Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  className="w-full h-14 taxi-button rounded-2xl text-lg font-semibold"
                  onClick={() => setStep("confirm")}
                >
                  Buyurtma berish • {formatCurrency(calculateFare(
                    RIDE_TYPES.find(r => r.id === selectedRideType)?.multiplier || 1
                  ))}
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center"
              >
                <Car className="w-10 h-10 text-primary" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold">Haydovchi qidirilmoqda...</h3>
                <p className="text-muted-foreground mt-1">Taxminan 2-3 daqiqa</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                onClick={() => setStep("select")}
                className="text-muted-foreground"
              >
                Bekor qilish
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </PhoneFrame>
  );
};

export default MobileBookingApp;
