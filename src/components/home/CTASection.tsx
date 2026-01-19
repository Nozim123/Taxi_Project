import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 lg:p-16 text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-10 h-10 text-primary" />
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Ready to <span className="gradient-text">Get Started?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Join millions of riders who trust AllOne Taxi for their daily commute. Download the app or book directly from your browser.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/ride">
                <Button variant="taxi" size="xl" className="w-full sm:w-auto">
                  Book a Ride Now
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Button variant="glass" size="xl" className="w-full sm:w-auto">
                <Download size={20} />
                Download App
              </Button>
            </div>

            {/* App store badges placeholder */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="h-12 w-36 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">App Store</span>
              </div>
              <div className="h-12 w-36 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Google Play</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
