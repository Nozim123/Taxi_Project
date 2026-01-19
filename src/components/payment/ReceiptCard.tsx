import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Navigation, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReceiptProps {
  receipt: {
    id: string;
    pickup_address: string;
    dropoff_address: string;
    distance_km: number;
    duration_min: number;
    base_fare?: number;
    distance_fare?: number;
    time_fare?: number;
    surge_multiplier?: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    driver_name?: string;
    completed_at?: string;
  };
  onClose?: () => void;
}

export const ReceiptCard: React.FC<ReceiptProps> = ({ receipt, onClose }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('uz-UZ').format(value) + " so'm";
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AllOne Taxi - Kvitansiya',
          text: `Safar: ${receipt.pickup_address} → ${receipt.dropoff_address}\nSumma: ${formatCurrency(receipt.total_amount)}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-card border border-border/50"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <span className="text-2xl">🚕</span>
        </div>
        <h3 className="text-xl font-bold">AllOne Taxi</h3>
        <p className="text-sm text-muted-foreground">{receipt.id}</p>
      </div>

      {/* Status */}
      <div className="flex justify-center mb-6">
        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
          receipt.payment_status === 'completed' 
            ? 'bg-success/20 text-success' 
            : 'bg-primary/20 text-primary'
        }`}>
          {receipt.payment_status === 'completed' ? 'To\'langan' : 'Kutilmoqda'}
        </span>
      </div>

      {/* Route */}
      <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 rounded-full bg-success mt-1.5" />
          <div>
            <p className="text-xs text-muted-foreground">Olish</p>
            <p className="font-medium">{receipt.pickup_address}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 rounded-full bg-destructive mt-1.5" />
          <div>
            <p className="text-xs text-muted-foreground">Tushirish</p>
            <p className="font-medium">{receipt.dropoff_address}</p>
          </div>
        </div>
      </div>

      {/* Trip Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30">
          <Navigation className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Masofa</p>
            <p className="font-semibold">{receipt.distance_km} km</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30">
          <Clock className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Vaqt</p>
            <p className="font-semibold">{receipt.duration_min} min</p>
          </div>
        </div>
      </div>

      {/* Fare Breakdown */}
      <div className="space-y-2 mb-6">
        {receipt.base_fare && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Boshlang'ich tarif</span>
            <span>{formatCurrency(receipt.base_fare)}</span>
          </div>
        )}
        {receipt.distance_fare && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Masofa ({receipt.distance_km} km)</span>
            <span>{formatCurrency(receipt.distance_fare)}</span>
          </div>
        )}
        {receipt.time_fare && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vaqt ({receipt.duration_min} min)</span>
            <span>{formatCurrency(receipt.time_fare)}</span>
          </div>
        )}
        {receipt.surge_multiplier && receipt.surge_multiplier > 1 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Surge ({receipt.surge_multiplier}x)</span>
            <span className="text-primary">Qo'llanildi</span>
          </div>
        )}
        <div className="border-t border-dashed border-border/50 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="font-semibold">Jami</span>
            <span className="text-xl font-bold gradient-text">{formatCurrency(receipt.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Driver & Payment Info */}
      <div className="space-y-2 p-4 rounded-2xl bg-secondary/30 mb-6 text-sm">
        {receipt.driver_name && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Haydovchi</span>
            <span className="font-medium">{receipt.driver_name}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">To'lov usuli</span>
          <span className="font-medium capitalize">{receipt.payment_method}</span>
        </div>
        {receipt.completed_at && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sana</span>
            <span className="font-medium">{new Date(receipt.completed_at).toLocaleDateString('uz-UZ')}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Ulashish
        </Button>
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Yuklab olish
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        Rahmat! AllOne Taxi sizning ishonchingiz uchun minnatdor.
      </p>
    </motion.div>
  );
};

export default ReceiptCard;
