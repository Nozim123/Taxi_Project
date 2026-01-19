import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Power, Navigation, DollarSign, Clock, Star, TrendingUp, MapPin, User, Phone, 
  MessageSquare, CheckCircle, XCircle, Wallet, ChevronRight, BarChart3, Calendar, Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import MapboxMap from "@/components/map/MapboxMap";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import EarningsChart from "@/components/driver/EarningsChart";
import { useRealtimeRides } from "@/hooks/useRealtimeRides";

interface RideRequest {
  id: string;
  rider: {
    name: string;
    rating: number;
    phone: string;
  };
  pickup: { lat: number; lng: number; address: string };
  dropoff: { lat: number; lng: number; address: string };
  distance: number;
  duration: number;
  estimatedFare: number;
}

interface DriverStats {
  todayEarnings: number;
  todayTrips: number;
  onlineHours: number;
  rating: number;
  weeklyEarnings: number;
  totalTrips: number;
}

const DriverPage: React.FC = () => {
  const { user } = useAuth();
  const { pendingRides, acceptRide: acceptRealtimeRide, updateRideStatus } = useRealtimeRides();
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pendingRide, setPendingRide] = useState<RideRequest | null>(null);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [ridePhase, setRidePhase] = useState<'idle' | 'heading_to_pickup' | 'arrived' | 'in_progress'>('idle');
  const [stats, setStats] = useState<DriverStats>({
    todayEarnings: 156000,
    todayTrips: 12,
    onlineHours: 6.5,
    rating: 4.92,
    weeklyEarnings: 1250000,
    totalTrips: 847,
  });
  const [showEarnings, setShowEarnings] = useState(false);
  const [driverInfo, setDriverInfo] = useState<any>(null);

  // Fetch driver info
  useEffect(() => {
    const fetchDriverInfo = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setDriverInfo(data);
      }
    };

    fetchDriverInfo();
  }, [user]);

  // Handle realtime ride notifications
  useEffect(() => {
    if (pendingRides.length > 0 && isOnline && !activeRide && !pendingRide) {
      const latestRide = pendingRides[0];
      setPendingRide({
        id: latestRide.id,
        rider: {
          name: latestRide.profiles?.full_name || "Yo'lovchi",
          rating: 4.8,
          phone: latestRide.profiles?.phone || "+998 90 000 00 00",
        },
        pickup: {
          lat: latestRide.pickup_lat || 41.3111,
          lng: latestRide.pickup_lng || 69.2797,
          address: latestRide.pickup_address || "Olish manzili",
        },
        dropoff: {
          lat: latestRide.dropoff_lat || 41.2714,
          lng: latestRide.dropoff_lng || 69.2845,
          address: latestRide.dropoff_address || "Tushirish manzili",
        },
        distance: latestRide.distance_meters || 5000,
        duration: latestRide.duration_seconds || 600,
        estimatedFare: latestRide.fare_amount || 18000,
      });
    }
  }, [pendingRides, isOnline, activeRide, pendingRide]);

  // Get current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(newLocation);
          
          // Send location to server if online and have active ride
          if (isOnline && activeRide) {
            sendLocationUpdate(newLocation, position.coords.heading, position.coords.speed);
          }
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isOnline, activeRide]);

  const sendLocationUpdate = useCallback(async (
    location: { lat: number; lng: number },
    heading?: number | null,
    speed?: number | null
  ) => {
    if (!user) return;

    try {
      await supabase.from('driver_locations').insert({
        driver_id: user.id,
        lat: location.lat,
        lng: location.lng,
        heading: heading || null,
        speed: speed || null,
        ride_id: activeRide?.id || null,
      });
    } catch (error) {
      console.error('Failed to send location:', error);
    }
  }, [user, activeRide]);

  const toggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    // Update driver status in database
    if (user && driverInfo) {
      await supabase
        .from('drivers')
        .update({ is_online: newStatus })
        .eq('user_id', user.id);
    }

    if (newStatus) {
      toast.success("Siz onlaysiz! Buyurtmalar keladi.", {
        description: "Eng yaqin buyurtmalarni kutmoqdasiz",
      });

      // Simulate incoming ride after delay for demo
      setTimeout(() => {
        if (!pendingRide && !activeRide) {
          setPendingRide({
            id: "ride-" + Date.now(),
            rider: { name: "Aziz Karimov", rating: 4.8, phone: "+998 90 123 45 67" },
            pickup: { lat: 41.3111, lng: 69.2797, address: "Amir Temur xiyoboni" },
            dropoff: { lat: 41.2714, lng: 69.2845, address: "Tashkent City Mall" },
            distance: 5200,
            duration: 720,
            estimatedFare: 18000,
          });
        }
      }, 3000);
    } else {
      toast.info("Siz offlaysiz", { description: "Buyurtmalar kelmaydi" });
      setPendingRide(null);
    }
  };

  const acceptRide = async () => {
    if (!pendingRide || !driverInfo) return;
    
    // Update ride in database
    const success = await acceptRealtimeRide(pendingRide.id, driverInfo.id);
    if (success !== false) {
      setActiveRide(pendingRide);
      setPendingRide(null);
      setRidePhase('heading_to_pickup');
      toast.success("Buyurtma qabul qilindi!", { description: "Yo'lovchiga yo'l oling" });
    }
  };

  const declineRide = () => {
    setPendingRide(null);
    toast.info("Buyurtma rad etildi");
  };

  const arrivedAtPickup = async () => {
    if (activeRide) {
      await updateRideStatus(activeRide.id, 'arriving');
    }
    setRidePhase('arrived');
    toast.success("Yetib keldingiz!", { description: "Yo'lovchini kuting" });
  };

  const startRide = async () => {
    if (activeRide) {
      await updateRideStatus(activeRide.id, 'in_progress');
    }
    setRidePhase('in_progress');
    toast.success("Safar boshlandi!");
  };

  const completeRide = async () => {
    if (!activeRide) return;
    
    await updateRideStatus(activeRide.id, 'completed');
    
    setStats(prev => ({
      ...prev,
      todayEarnings: prev.todayEarnings + activeRide.estimatedFare,
      todayTrips: prev.todayTrips + 1,
      totalTrips: prev.totalTrips + 1,
    }));

    toast.success("Safar tugadi!", {
      description: `${activeRide.estimatedFare.toLocaleString()} so'm topildingiz`,
    });

    setActiveRide(null);
    setRidePhase('idle');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('uz-UZ').format(value);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-30">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-card/80 backdrop-blur-lg">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Button>
        </Link>
      </div>

      {/* Map */}
      <div className="absolute inset-0 lg:right-[420px]">
        <MapboxMap
          className="h-full"
          center={currentLocation ? [currentLocation.lng, currentLocation.lat] : undefined}
          driverLocation={currentLocation}
          pickupLocation={activeRide?.pickup || pendingRide?.pickup}
          dropoffLocation={ridePhase === 'in_progress' ? activeRide?.dropoff : undefined}
        />

        {/* Online Toggle */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleOnline}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-full font-semibold shadow-lg transition-all",
              isOnline 
                ? "bg-success text-success-foreground" 
                : "bg-card text-foreground border border-border/50"
            )}
          >
            <div className={cn(
              "w-3 h-3 rounded-full",
              isOnline ? "bg-success-foreground animate-pulse" : "bg-muted-foreground"
            )} />
            {isOnline ? "Online" : "Offline"}
          </motion.button>
        </div>

        {/* Quick Stats Bar */}
        <div className="absolute top-20 left-4 right-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          >
            {[
              { icon: DollarSign, value: formatCurrency(stats.todayEarnings), label: "Bugun", color: "text-success" },
              { icon: Car, value: stats.todayTrips.toString(), label: "Safarlar", color: "text-primary" },
              { icon: Star, value: stats.rating.toString(), label: "Reyting", color: "text-primary" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-card/90 backdrop-blur-lg border border-border/50"
              >
                <stat.icon className={cn("w-4 h-4", stat.color)} />
                <div>
                  <p className="font-bold text-sm">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="absolute bottom-0 left-0 right-0 lg:top-0 lg:left-auto lg:right-0 lg:w-[420px] z-20">
        <div className="bg-gradient-to-t from-card via-card to-card/95 backdrop-blur-xl rounded-t-[2rem] lg:rounded-none lg:h-full lg:overflow-auto border-t lg:border-l border-border/50 p-4 lg:p-6">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4 lg:hidden" />

          {/* Pending Ride Request */}
          <AnimatePresence>
            {pendingRide && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="mb-6"
              >
                <div className="p-5 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 animate-pulse-slow">
                  <div className="flex items-center gap-2 mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-primary"
                    />
                    <span className="font-semibold text-primary">Yangi buyurtma!</span>
                  </div>

                  {/* Rider Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{pendingRide.rider.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        {pendingRide.rider.rating}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold gradient-text">
                        {formatCurrency(pendingRide.estimatedFare)}
                      </p>
                      <p className="text-xs text-muted-foreground">so'm</p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="space-y-2 mb-4 p-3 rounded-xl bg-background/50">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-success mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Olish</p>
                        <p className="font-medium text-sm">{pendingRide.pickup.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-destructive mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tushirish</p>
                        <p className="font-medium text-sm">{pendingRide.dropoff.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{(pendingRide.distance / 1000).toFixed(1)} km</span>
                    <span>~{Math.round(pendingRide.duration / 60)} min</span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-14 rounded-2xl border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={declineRide}
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Rad etish
                    </Button>
                    <Button
                      className="h-14 rounded-2xl taxi-button"
                      onClick={acceptRide}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Qabul
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Ride */}
          <AnimatePresence>
            {activeRide && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <div className="p-5 rounded-3xl bg-card border border-success/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      ridePhase === 'heading_to_pickup' && "bg-primary/20 text-primary",
                      ridePhase === 'arrived' && "bg-accent/20 text-accent",
                      ridePhase === 'in_progress' && "bg-success/20 text-success"
                    )}>
                      {ridePhase === 'heading_to_pickup' && "Yo'lovchiga bormoqda"}
                      {ridePhase === 'arrived' && "Yetib keldi"}
                      {ridePhase === 'in_progress' && "Safarda"}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Rider */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{activeRide.rider.name}</p>
                      <p className="text-sm text-muted-foreground">{activeRide.rider.phone}</p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="space-y-2 p-3 rounded-xl bg-secondary/30 mb-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full mt-1",
                        ridePhase === 'in_progress' ? "bg-muted-foreground" : "bg-success"
                      )} />
                      <div>
                        <p className="text-xs text-muted-foreground">Olish</p>
                        <p className="font-medium text-sm">{activeRide.pickup.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full mt-1",
                        ridePhase === 'in_progress' ? "bg-success" : "bg-muted-foreground"
                      )} />
                      <div>
                        <p className="text-xs text-muted-foreground">Tushirish</p>
                        <p className="font-medium text-sm">{activeRide.dropoff.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fare */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Narx:</span>
                    <span className="text-xl font-bold">{formatCurrency(activeRide.estimatedFare)} so'm</span>
                  </div>

                  {/* Phase Actions */}
                  {ridePhase === 'heading_to_pickup' && (
                    <Button className="w-full h-14 rounded-2xl taxi-button" onClick={arrivedAtPickup}>
                      <MapPin className="w-5 h-5 mr-2" />
                      Yetib keldim
                    </Button>
                  )}
                  {ridePhase === 'arrived' && (
                    <Button className="w-full h-14 rounded-2xl taxi-button" onClick={startRide}>
                      <Navigation className="w-5 h-5 mr-2" />
                      Safarni boshlash
                    </Button>
                  )}
                  {ridePhase === 'in_progress' && (
                    <Button className="w-full h-14 rounded-2xl bg-success hover:bg-success/90 text-success-foreground" onClick={completeRide}>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Safarni tugatish
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty States */}
          {!pendingRide && !activeRide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              {isOnline ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-success animate-pulse" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">Buyurtmalar qidirilmoqda...</h3>
                  <p className="text-muted-foreground text-sm">Gavjum joylarda turing</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                    <Power className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Siz offlaysiz</h3>
                  <p className="text-muted-foreground text-sm mb-4">Buyurtmalarni olish uchun online bo'ling</p>
                  <Button className="taxi-button" onClick={toggleOnline}>
                    Online bo'lish
                  </Button>
                </>
              )}
            </motion.div>
          )}

          {/* Earnings Dashboard */}
          <div className="mt-6 lg:mt-auto">
            <button
              onClick={() => setShowEarnings(!showEarnings)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary/50 hover:bg-secondary/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="font-medium">Daromadlar</span>
              </div>
              <ChevronRight className={cn("w-5 h-5 transition-transform", showEarnings && "rotate-90")} />
            </button>

            <AnimatePresence>
              {showEarnings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4">
                    <EarningsChart />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">Haftalik</span>
                      </div>
                      <p className="text-xl font-bold">{formatCurrency(stats.weeklyEarnings)}</p>
                      <p className="text-xs text-muted-foreground">so'm</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-xs">Jami safarlar</span>
                      </div>
                      <p className="text-xl font-bold">{stats.totalTrips}</p>
                      <p className="text-xs text-muted-foreground">safarlar</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPage;
