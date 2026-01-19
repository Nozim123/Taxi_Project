import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Wifi, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className="relative p-6 rounded-3xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl">
          <button
            onClick={() => setShowPrompt(false)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Ilovani o'rnating</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AllOne Taxi ni telefon ekraniga qo'shing - tezroq va qulayroq
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { icon: Zap, text: "Tezroq" },
                  { icon: Wifi, text: "Offline" },
                  { icon: Check, text: "Bepul" },
                ].map((item) => (
                  <span
                    key={item.text}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/50 text-xs"
                  >
                    <item.icon className="w-3 h-3 text-primary" />
                    {item.text}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 taxi-button rounded-xl h-10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  O'rnatish
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowPrompt(false)}
                  className="rounded-xl h-10"
                >
                  Keyinroq
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const InstallPage: React.FC = () => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/30">
          <Smartphone className="w-12 h-12 text-primary-foreground" />
        </div>

        <h1 className="text-3xl font-bold mb-4">AllOne Taxi</h1>
        <p className="text-muted-foreground mb-8">
          Ilovani telefon ekraniga qo'shib, tez va qulay foydalaning
        </p>

        <div className="p-6 rounded-3xl bg-card border border-border/50 text-left space-y-4">
          <h3 className="font-semibold">Qanday o'rnatish kerak:</h3>
          
          {isIOS ? (
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</span>
                <span>Safari brauzerida "Share" tugmasini bosing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</span>
                <span>"Add to Home Screen" ni tanlang</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</span>
                <span>"Add" tugmasini bosing</span>
              </li>
            </ol>
          ) : (
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</span>
                <span>Brauzer menyusini oching (3 nuqta)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</span>
                <span>"Install app" yoki "Add to Home Screen" ni tanlang</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</span>
                <span>"Install" tugmasini bosing</span>
              </li>
            </ol>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {[
            { icon: Zap, label: "Tez yuklash" },
            { icon: Wifi, label: "Offline ishlaydi" },
            { icon: Download, label: "Bepul" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="w-4 h-4 text-primary" />
              {item.label}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PWAInstallPrompt;
