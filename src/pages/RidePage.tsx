import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import MapPlaceholder from "@/components/ride/MapPlaceholder";
import RideBookingCard from "@/components/ride/RideBookingCard";
import { useToast } from "@/hooks/use-toast";

const RidePage: React.FC = () => {
  const { toast } = useToast();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [showRoute, setShowRoute] = useState(false);

  const handleLocationChange = (pickupLoc: string, dropoffLoc: string) => {
    setPickup(pickupLoc);
    setDropoff(dropoffLoc);
    setShowRoute(true);
  };

  const handleBookRide = (rideType: string) => {
    toast({
      title: "Ride Booked!",
      description: `Looking for available ${rideType} drivers near you...`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16 md:pt-20">
        <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] relative">
          {/* Map takes full screen on mobile, split on desktop */}
          <div className="absolute inset-0 lg:right-[420px]">
            <MapPlaceholder 
              className="w-full h-full rounded-none"
              showRoute={showRoute}
              pickupLocation={pickup || undefined}
              dropoffLocation={dropoff || undefined}
            />
          </div>

          {/* Booking card - bottom sheet on mobile, sidebar on desktop */}
          <div className="absolute bottom-0 left-0 right-0 lg:top-0 lg:left-auto lg:right-0 lg:w-[420px] lg:h-full">
            <div className="lg:h-full lg:overflow-auto lg:bg-background lg:border-l lg:border-border p-4 lg:p-6">
              <div className="lg:pt-4">
                <RideBookingCard 
                  onLocationChange={handleLocationChange}
                  onBookRide={handleBookRide}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RidePage;
