import React from "react";
import { 
  Shield, 
  Zap, 
  MapPin, 
  CreditCard, 
  Clock, 
  Users,
  Star,
  Car
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Get a ride in under 3 minutes. Our smart matching system finds the nearest available driver.",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "All drivers are verified. Share your trip details with family for peace of mind.",
  },
  {
    icon: MapPin,
    title: "Real-time Tracking",
    description: "Track your driver in real-time. Know exactly when they'll arrive.",
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description: "Pay with cash, card, or digital wallets. Transparent pricing, no hidden fees.",
  },
  {
    icon: Clock,
    title: "24/7 Available",
    description: "Need a ride at 3 AM? We've got you covered, any time, any day.",
  },
  {
    icon: Star,
    title: "Top-rated Drivers",
    description: "Our drivers maintain a 4.8+ rating. Quality service guaranteed.",
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-4">
            <Car className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Why Choose Us</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            The <span className="gradient-text">Smarter Way</span> to Travel
          </h2>
          <p className="text-muted-foreground text-lg">
            Experience the future of urban mobility with features designed for your comfort and safety.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              variant="glass-hover"
              className="group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats banner */}
        <div className="mt-20 glass-card p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2M+", label: "Completed Rides", icon: Car },
              { value: "500K+", label: "Happy Riders", icon: Users },
              { value: "15K+", label: "Active Drivers", icon: Star },
              { value: "50+", label: "Cities Covered", icon: MapPin },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
