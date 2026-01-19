import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Star, ChevronRight, Download, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import { Link } from "react-router-dom";
import ReceiptCard from "@/components/payment/ReceiptCard";

interface RideHistory {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  distance_meters: number;
  duration_seconds: number;
  fare_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  driver_id: string;
}

const RideHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState<RideHistory[]>([]);
  const [selectedRide, setSelectedRide] = useState<RideHistory | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRideHistory();
    }
  }, [user]);

  const fetchRideHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("rides")
      .select("*")
      .eq("rider_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRides(data);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRateDriver = async (rideId: string, stars: number) => {
    setRating(stars);
    // In real app, save rating to database
    console.log("Rating ride", rideId, "with", stars, "stars");
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Safar tarixi</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Filter className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Calendar className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : rides.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Safarlar yo'q</h3>
            <p className="text-muted-foreground mb-6">Siz hali hech qanday safar qilmadingiz</p>
            <Link to="/ride">
              <Button className="taxi-button">Birinchi safarni boshlash</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride, i) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl bg-card border border-border/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ride.status === "completed" ? "bg-success/20" : "bg-muted"
                    }`}>
                      <MapPin className={`w-5 h-5 ${
                        ride.status === "completed" ? "text-success" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{formatDate(ride.created_at)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ride.status === "completed" ? "bg-success/20 text-success" :
                        ride.status === "cancelled" ? "bg-destructive/20 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {ride.status === "completed" ? "Tugallangan" :
                         ride.status === "cancelled" ? "Bekor qilingan" : ride.status}
                      </span>
                    </div>
                  </div>
                  <p className="font-bold">{formatCurrency(ride.fare_amount || 0)}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-success mt-1.5" />
                    <p className="text-sm">{ride.pickup_address || "Olish manzili"}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-destructive mt-1.5" />
                    <p className="text-sm">{ride.dropoff_address || "Tushirish manzili"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{((ride.distance_meters || 0) / 1000).toFixed(1)} km</span>
                    <span>{Math.round((ride.duration_seconds || 0) / 60)} min</span>
                    <span className="capitalize">{ride.payment_method || "naqd"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRide(ride);
                        setShowReceipt(true);
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Kvitansiya
                    </Button>
                  </div>
                </div>

                {/* Rating section for completed rides */}
                {ride.status === "completed" && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">Haydovchini baholang</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRateDriver(ride.id, star)}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              star <= rating ? "text-primary fill-primary" : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Receipt Modal */}
      {showReceipt && selectedRide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setShowReceipt(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <ReceiptCard
              receipt={{
                id: `RCP-${selectedRide.id.slice(0, 8).toUpperCase()}`,
                pickup_address: selectedRide.pickup_address || "Olish manzili",
                dropoff_address: selectedRide.dropoff_address || "Tushirish manzili",
                distance_km: (selectedRide.distance_meters || 0) / 1000,
                duration_min: Math.round((selectedRide.duration_seconds || 0) / 60),
                total_amount: selectedRide.fare_amount || 0,
                payment_method: selectedRide.payment_method || "cash",
                payment_status: selectedRide.status === "completed" ? "completed" : "pending",
                completed_at: selectedRide.created_at,
              }}
              onClose={() => setShowReceipt(false)}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default RideHistoryPage;
