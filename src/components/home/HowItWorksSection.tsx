import React from "react";
import { MapPin, Car, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Set Your Location",
    description: "Open the app and enter your pickup and drop-off locations. Our smart system will find the best route.",
  },
  {
    number: "02",
    icon: Car,
    title: "Get Matched",
    description: "We'll instantly match you with the nearest available driver. See their rating, car details, and ETA.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Enjoy Your Ride",
    description: "Track your driver in real-time. Pay easily when you arrive. Rate your experience.",
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Getting a ride has never been easier. Just three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
              )}
              
              <div className="text-center">
                {/* Step number */}
                <div className="relative inline-flex">
                  <div className="w-32 h-32 rounded-full bg-card border border-border flex items-center justify-center mb-6 mx-auto shadow-card">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                  <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-button">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
