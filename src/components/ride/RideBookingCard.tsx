import React, { useState } from "react";
import { MapPin, Navigation, Clock, DollarSign, Car, Users, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RideType {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  priceMultiplier: number;
  eta: string;
  capacity: number;
}

const rideTypes: RideType[] = [
  {
    id: "economy",
    name: "Economy",
    icon: Car,
    description: "Affordable, everyday rides",
    priceMultiplier: 1,
    eta: "3 min",
    capacity: 4,
  },
  {
    id: "comfort",
    name: "Comfort",
    icon: Car,
    description: "Newer cars with extra legroom",
    priceMultiplier: 1.3,
    eta: "5 min",
    capacity: 4,
  },
  {
    id: "xl",
    name: "XL",
    icon: Users,
    description: "SUVs and minivans for groups",
    priceMultiplier: 1.5,
    eta: "8 min",
    capacity: 6,
  },
  {
    id: "premium",
    name: "Premium",
    icon: Zap,
    description: "Luxury vehicles, top-rated drivers",
    priceMultiplier: 2,
    eta: "10 min",
    capacity: 4,
  },
];

interface RideBookingCardProps {
  onLocationChange?: (pickup: string, dropoff: string) => void;
  onBookRide?: (rideType: string) => void;
}

const RideBookingCard: React.FC<RideBookingCardProps> = ({
  onLocationChange,
  onBookRide,
}) => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [selectedRide, setSelectedRide] = useState<string>("economy");
  const [step, setStep] = useState<"location" | "select" | "confirm">("location");

  const basePrice = 15000; // Base price in UZS
  const selectedRideType = rideTypes.find((r) => r.id === selectedRide);
  const estimatedPrice = basePrice * (selectedRideType?.priceMultiplier || 1);

  const handleContinue = () => {
    if (pickup && dropoff && step === "location") {
      onLocationChange?.(pickup, dropoff);
      setStep("select");
    } else if (step === "select") {
      setStep("confirm");
    }
  };

  const handleBook = () => {
    onBookRide?.(selectedRide);
  };

  return (
    <Card variant="glass" className="w-full max-w-md">
      <CardContent className="p-6">
        {/* Location inputs */}
        {(step === "location" || step === "select") && (
          <div className="space-y-4 mb-6">
            <h3 className="font-display text-lg font-semibold mb-4">Where to?</h3>
            
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 flex flex-col items-center justify-center z-10">
                <div className="w-3 h-3 rounded-full bg-success" />
                <div className="w-0.5 h-8 bg-border my-1" />
                <div className="w-3 h-3 rounded-full bg-destructive" />
              </div>
              
              <div className="space-y-2 pl-2">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-transparent" size={20} />
                  <Input
                    placeholder="Pickup location"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="pl-12"
                    disabled={step === "select"}
                  />
                </div>
                <div className="relative">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-transparent" size={20} />
                  <Input
                    placeholder="Where to?"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="pl-12"
                    disabled={step === "select"}
                  />
                </div>
              </div>
            </div>

            {step === "select" && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
                onClick={() => setStep("location")}
              >
                Change locations
              </Button>
            )}
          </div>
        )}

        {/* Ride type selection */}
        {step === "select" && (
          <div className="space-y-3 mb-6">
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Choose your ride</h4>
            {rideTypes.map((ride) => (
              <button
                key={ride.id}
                onClick={() => setSelectedRide(ride.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                  selectedRide === ride.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  selectedRide === ride.id ? "bg-primary/20" : "bg-secondary"
                )}>
                  <ride.icon className={cn(
                    "w-6 h-6",
                    selectedRide === ride.id ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{ride.name}</span>
                    <span className="font-bold text-primary">
                      {(basePrice * ride.priceMultiplier).toLocaleString()} UZS
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{ride.description}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {ride.eta}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Confirmation step */}
        {step === "confirm" && selectedRideType && (
          <div className="space-y-4 mb-6">
            <h3 className="font-display text-lg font-semibold">Confirm your ride</h3>
            
            {/* Route summary */}
            <div className="bg-secondary/50 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-success mt-1.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Pickup</p>
                  <p className="font-medium">{pickup}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-destructive mt-1.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Dropoff</p>
                  <p className="font-medium">{dropoff}</p>
                </div>
              </div>
            </div>

            {/* Ride details */}
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <selectedRideType.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{selectedRideType.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRideType.capacity} seats • {selectedRideType.eta}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {estimatedPrice.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">UZS</p>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => setStep("select")}
            >
              Change ride type
            </Button>
          </div>
        )}

        {/* Action buttons */}
        {step === "location" && (
          <Button 
            variant="taxi" 
            size="lg" 
            className="w-full"
            disabled={!pickup || !dropoff}
            onClick={handleContinue}
          >
            Find rides
            <ChevronRight size={20} />
          </Button>
        )}

        {step === "select" && (
          <Button 
            variant="taxi" 
            size="lg" 
            className="w-full"
            onClick={handleContinue}
          >
            Continue
            <ChevronRight size={20} />
          </Button>
        )}

        {step === "confirm" && (
          <Button 
            variant="taxi" 
            size="lg" 
            className="w-full"
            onClick={handleBook}
          >
            Book {selectedRideType?.name}
            <DollarSign size={20} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RideBookingCard;
