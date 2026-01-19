import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface RideNotification {
  id: string;
  type: "new_ride" | "ride_accepted" | "driver_arrived" | "ride_started" | "ride_completed";
  ride: any;
  timestamp: Date;
}

export const useRealtimeRides = () => {
  const { user } = useAuth();
  const [pendingRides, setPendingRides] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<RideNotification[]>([]);

  // Fetch pending rides for drivers
  const fetchPendingRides = useCallback(async () => {
    const { data, error } = await supabase
      .from("rides")
      .select(`
        *,
        profiles:rider_id(full_name, phone)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setPendingRides(data);
    }
  }, []);

  // Subscribe to ride changes for drivers
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchPendingRides();

    // Subscribe to new rides
    const channel = supabase
      .channel("driver-rides")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rides",
        },
        (payload) => {
          const newRide = payload.new as any;
          if (newRide.status === "pending") {
            setPendingRides((prev) => [newRide, ...prev]);
            
            // Show notification
            toast.info("Yangi buyurtma!", {
              description: `${newRide.pickup_address} → ${newRide.dropoff_address}`,
              duration: 10000,
            });

            setNotifications((prev) => [
              {
                id: newRide.id,
                type: "new_ride",
                ride: newRide,
                timestamp: new Date(),
              },
              ...prev,
            ]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rides",
        },
        (payload) => {
          const updatedRide = payload.new as any;
          
          // Remove from pending if accepted
          if (updatedRide.status !== "pending") {
            setPendingRides((prev) => prev.filter((r) => r.id !== updatedRide.id));
          }

          // Notify based on status change
          if (updatedRide.status === "accepted") {
            toast.success("Buyurtma qabul qilindi");
            setNotifications((prev) => [
              {
                id: updatedRide.id,
                type: "ride_accepted",
                ride: updatedRide,
                timestamp: new Date(),
              },
              ...prev,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPendingRides]);

  // Accept a ride
  const acceptRide = async (rideId: string, driverId: string) => {
    const { error } = await supabase
      .from("rides")
      .update({
        driver_id: driverId,
        status: "accepted",
      })
      .eq("id", rideId)
      .eq("status", "pending"); // Only if still pending

    if (error) {
      toast.error("Buyurtmani qabul qilishda xato");
      return false;
    }

    toast.success("Buyurtma qabul qilindi!");
    return true;
  };

  // Update ride status
  const updateRideStatus = async (rideId: string, status: string) => {
    const { error } = await supabase
      .from("rides")
      .update({ status })
      .eq("id", rideId);

    if (error) {
      toast.error("Statusni yangilashda xato");
      return false;
    }

    return true;
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    pendingRides,
    notifications,
    acceptRide,
    updateRideStatus,
    clearNotifications,
    refetch: fetchPendingRides,
  };
};

export default useRealtimeRides;