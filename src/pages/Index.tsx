import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Clock, Car, Users, Zap, Star, Phone, Shield, Wallet, ChevronRight, Tag, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import MapboxMap from "@/components/map/MapboxMap";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useOnlineDrivers } from "@/hooks/useRealtime";

interface RideType {
  id: string;
  name: string;
  icon: React.ElementType;
  priceMultiplier: number;
  eta: string;
  capacity: number;
}

const rideTypes: RideType[] = [
  { id: "economy", name: "Ekonom", icon: Car, priceMultiplier: 1, eta: "3 daqiqa", capacity: 4 },
  { id: "comfort", name: "Komfort", icon: Car, priceMultiplier: 1.3, eta: "5 daqiqa", capacity: 4 },
  { id: "xl", name: "XL", icon: Users, priceMultiplier: 1.5, eta: "8 daqiqa", capacity: 6 },
  { id: "premium", name: "Premium", icon: Zap, priceMultiplier: 2, eta: "10 daqiqa", capacity: 4 },
];

const Index: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { onlineDrivers } = useOnlineDrivers();
  
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [selectedRide, setSelectedRide] = useState<string>("economy");
  const [step, setStep] = useState<"input" | "select" | "searching" | "found">("input");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<any>(null);
  
  const basePrice = 15000;
  const selectedRideType = rideTypes.find((r) => r.id === selectedRide);
  const estimatedPrice = basePrice * (selectedRideType?.priceMultiplier || 1);
  const finalPrice = promoApplied ? estimatedPrice - promoApplied.discount : estimatedPrice;

  // Subscribe to realtime ride updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-rides')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `rider_id=eq.${user.id}`,
        },
        (payload) => {
          const ride = payload.new as any;
          if (ride.status === 'accepted' && ride.driver_id) {
            setStep('found');
            toast.success("Haydovchi topildi!", { description: "Haydovchi yo'lda" });
            // Fetch driver info
            fetchDriverInfo(ride.driver_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchDriverInfo = async (driverId: string) => {
    const { data } = await supabase
      .from('drivers')
      .select('*, profiles:user_id(full_name, phone)')
      .eq('id', driverId)
      .single();
    
    if (data) {
      setAssignedDriver(data);
      if (data.current_lat && data.current_lng) {
        setDriverLocation({ lat: data.current_lat, lng: data.current_lng });
      }
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    // Mock promo codes since table types aren't generated yet
    const mockPromoCodes: Record<string, { discount_type: string; discount_value: number; max_discount?: number }> = {
      "WELCOME10": { discount_type: "percentage", discount_value: 10, max_discount: 5000 },
      "TAXI20": { discount_type: "percentage", discount_value: 20, max_discount: 10000 },
      "FLAT5000": { discount_type: "fixed", discount_value: 5000 },
    };

    const promoData = mockPromoCodes[promoCode.toUpperCase()];
    
    if (!promoData) {
      toast.error("Promo kod topilmadi");
      return;
    }

    const discount = promoData.discount_type === 'percentage' 
      ? Math.min(estimatedPrice * (promoData.discount_value / 100), promoData.max_discount || Infinity)
      : promoData.discount_value;

    setPromoApplied({ code: promoCode.toUpperCase(), discount });
    toast.success(`${promoCode.toUpperCase()} promo kod qo'llanildi!`, {
      description: `${discount.toLocaleString()} so'm chegirma`,
    });
  };

  const handleFindRides = () => {
    if (!pickup || !dropoff) {
      toast.error("Manzillarni kiriting");
      return;
    }
    setStep("select");
  };

  const handleBookRide = async () => {
    if (!user) {
      toast.error("Avval tizimga kiring");
      navigate("/auth");
      return;
    }

    setStep("searching");

    // Create ride in database
    const { data: ride, error } = await supabase.from('rides').insert({
      rider_id: user.id,
      pickup_address: pickup,
      dropoff_address: dropoff,
      pickup_lat: 41.3111,
      pickup_lng: 69.2797,
      dropoff_lat: 41.2714,
      dropoff_lng: 69.2845,
      ride_type: selectedRide,
      fare_amount: finalPrice,
      status: 'pending',
    }).select().single();

    if (error) {
      toast.error("Buyurtma yaratishda xato");
      setStep("select");
      return;
    }

    // Simulate driver assignment after 3 seconds for demo
    setTimeout(() => {
      setStep("found");
      setAssignedDriver({
        id: 'demo',
        car_brand: 'Chevrolet',
        car_model: 'Cobalt',
        car_color: 'Oq',
        car_plate: '01 A 123 BC',
        rating: 4.92,
        profiles: { full_name: 'Sardor Toshmatov', phone: '+998 90 123 45 67' }
      });
      setDriverLocation({ lat: 41.308, lng: 69.275 });
      toast.success("Haydovchi topildi!");
    }, 3000);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('uz-UZ').format(value);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Fullscreen Map */}
      <div className="absolute inset-0">
        <MapboxMap
          className="h-full w-full rounded-none"
          center={[69.2797, 41.3111]}
          zoom={14}
          driverLocation={driverLocation}
          pickupLocation={step !== "input" ? { lat: 41.3111, lng: 69.2797 } : null}
          dropoffLocation={step === "found" ? { lat: 41.2714, lng: 69.2845 } : null}
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link to="/">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Car className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">AllOne Taxi</span>
            </div>
          </Link>

          {user ? (
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button
                variant="ghost"
                className="rounded-full bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg"
              >
                Kirish
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Side Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-card border-r border-border z-50 p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Menyu</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="space-y-2">
                {[
                  { icon: Car, label: "Buyurtma berish", href: "/" },
                  { icon: Clock, label: "Safarlar tarixi", href: "/history" },
                  { icon: User, label: "Profil", href: "/profile" },
                  { icon: Wallet, label: "To'lov usullari", href: "/profile" },
                  { icon: Tag, label: "Promo kodlar", href: "/" },
                  { icon: Shield, label: "Xavfsizlik", href: "/" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="absolute bottom-6 left-6 right-6 space-y-3">
                <Link to="/driver/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Haydovchi bo'lish
                  </Button>
                </Link>
                {user && (
                  <Button variant="ghost" className="w-full text-destructive" onClick={signOut}>
                    Chiqish
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Sheet - Booking Card */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <motion.div
          layout
          className="bg-gradient-to-t from-card via-card to-card/95 backdrop-blur-xl rounded-t-[2rem] border-t border-border/50 p-4 pb-8 shadow-2xl"
        >
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />

          <AnimatePresence mode="wait">
            {/* Step 1: Input locations */}
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold mb-4">Qayerga?</h2>
                
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 flex flex-col items-center justify-center z-10">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <div className="w-0.5 h-8 bg-border my-1" />
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                  </div>
                  
                  <div className="space-y-2 pl-2">
                    <Input
                      placeholder="Qayerdan?"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      className="pl-12 h-12 rounded-xl bg-secondary border-0"
                    />
                    <Input
                      placeholder="Qayerga?"
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                      className="pl-12 h-12 rounded-xl bg-secondary border-0"
                    />
                  </div>
                </div>

                <Button 
                  variant="taxi" 
                  size="lg" 
                  className="w-full h-14 rounded-2xl"
                  disabled={!pickup || !dropoff}
                  onClick={handleFindRides}
                >
                  Mashina tanlash
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>

                {/* Online drivers count */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span>{onlineDrivers.length > 0 ? onlineDrivers.length : 12} ta haydovchi onlayn</span>
                </div>
              </motion.div>
            )}

            {/* Step 2: Select ride type */}
            {step === "select" && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep("input")}>
                    ← Orqaga
                  </Button>
                  <h3 className="font-semibold">Mashina tanlang</h3>
                  <div className="w-16" />
                </div>

                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {rideTypes.map((ride) => (
                    <motion.button
                      key={ride.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRide(ride.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all",
                        selectedRide === ride.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                        selectedRide === ride.id ? "bg-primary/20" : "bg-secondary"
                      )}>
                        <ride.icon className={cn(
                          "w-7 h-7",
                          selectedRide === ride.id ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-lg">{ride.name}</span>
                          <span className="font-bold text-primary text-lg">
                            {formatCurrency(basePrice * ride.priceMultiplier)} so'm
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {ride.eta}
                          </span>
                          <span>{ride.capacity} o'rindiq</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Promo code */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Promo kod"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="pl-10 h-12 rounded-xl"
                      disabled={!!promoApplied}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="h-12 px-6"
                    onClick={applyPromoCode}
                    disabled={!!promoApplied}
                  >
                    {promoApplied ? "✓" : "Qo'llash"}
                  </Button>
                </div>

                {promoApplied && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 text-success">
                    <span>Chegirma: -{formatCurrency(promoApplied.discount)} so'm</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-success"
                      onClick={() => setPromoApplied(null)}
                    >
                      Bekor qilish
                    </Button>
                  </div>
                )}

                {/* Final price and book button */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary">
                  <div>
                    <p className="text-sm text-muted-foreground">Jami narx</p>
                    <p className="text-2xl font-bold">{formatCurrency(finalPrice)} so'm</p>
                  </div>
                  <Button 
                    variant="taxi" 
                    size="lg"
                    className="h-14 px-8 rounded-2xl"
                    onClick={handleBookRide}
                  >
                    Buyurtma berish
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Searching for driver */}
            {step === "searching" && (
              <motion.div
                key="searching"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-8 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
                >
                  <Car className="w-10 h-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Haydovchi qidirilmoqda...</h3>
                <p className="text-muted-foreground">Yaqin atrofdagi haydovchilar tekshirilmoqda</p>
                <Button
                  variant="ghost"
                  className="mt-4 text-destructive"
                  onClick={() => setStep("select")}
                >
                  Bekor qilish
                </Button>
              </motion.div>
            )}

            {/* Step 4: Driver found */}
            {step === "found" && assignedDriver && (
              <motion.div
                key="found"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                  <span className="font-semibold text-success">Haydovchi yo'lda</span>
                </div>

                {/* Driver info */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{assignedDriver.profiles?.full_name || 'Haydovchi'}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <span>{assignedDriver.rating || 4.9}</span>
                      <span>•</span>
                      <span>{assignedDriver.car_color} {assignedDriver.car_brand} {assignedDriver.car_model}</span>
                    </div>
                    <p className="text-sm font-mono mt-1">{assignedDriver.car_plate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Route summary */}
                <div className="p-4 rounded-2xl bg-secondary/50 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-success mt-1.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Olish manzili</p>
                      <p className="font-medium">{pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-destructive mt-1.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tushish manzili</p>
                      <p className="font-medium">{dropoff}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary">
                  <div>
                    <p className="text-sm text-muted-foreground">To'lov</p>
                    <p className="text-xl font-bold">{formatCurrency(finalPrice)} so'm</p>
                  </div>
                  <Button variant="destructive" onClick={() => {
                    setStep("input");
                    setAssignedDriver(null);
                    setDriverLocation(null);
                    setPickup("");
                    setDropoff("");
                  }}>
                    Bekor qilish
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;