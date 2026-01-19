import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface DriverLocation {
  driver_id: string;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  recorded_at: string;
}

interface RideUpdate {
  id: string;
  status: string;
  driver_id: string | null;
}

export const useDriverTracking = (rideId: string | null) => {
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!rideId) return;

    const newChannel = supabase
      .channel(`ride-tracking-${rideId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "driver_locations",
          filter: `ride_id=eq.${rideId}`,
        },
        (payload) => {
          const newLocation = payload.new as DriverLocation;
          setDriverLocation(newLocation);
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [rideId]);

  return { driverLocation };
};

export const useRideUpdates = (rideId: string | null) => {
  const [rideStatus, setRideStatus] = useState<RideUpdate | null>(null);

  useEffect(() => {
    if (!rideId) return;

    const channel = supabase
      .channel(`ride-status-${rideId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rides",
          filter: `id=eq.${rideId}`,
        },
        (payload) => {
          setRideStatus(payload.new as RideUpdate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rideId]);

  return { rideStatus };
};

export const useOnlineDrivers = () => {
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);

  const fetchOnlineDrivers = useCallback(async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("is_online", true);

    if (!error && data) {
      setOnlineDrivers(data);
    }
  }, []);

  useEffect(() => {
    fetchOnlineDrivers();

    const channel = supabase
      .channel("online-drivers")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "drivers",
        },
        () => {
          fetchOnlineDrivers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOnlineDrivers]);

  return { onlineDrivers, refetch: fetchOnlineDrivers };
};
