import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Wallet, Banknote, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePayment } from "@/hooks/usePayment";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rideId: string;
  amount: number;
  userId: string;
  onPaymentComplete?: (transactionId: string) => void;
}

const PAYMENT_METHODS = [
  { 
    id: 'click' as const, 
    name: 'Click', 
    icon: Wallet, 
    color: 'bg-blue-500',
    description: 'Click orqali to\'lash'
  },
  { 
    id: 'payme' as const, 
    name: 'Payme', 
    icon: CreditCard, 
    color: 'bg-cyan-500',
    description: 'Payme orqali to\'lash'
  },
  { 
    id: 'stripe' as const, 
    name: 'Karta', 
    icon: CreditCard, 
    color: 'bg-purple-500',
    description: 'Xalqaro karta (Visa/Mastercard)'
  },
  { 
    id: 'cash' as const, 
    name: 'Naqd', 
    icon: Banknote, 
    color: 'bg-success',
    description: 'Haydovchiga naqd to\'lash'
  },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  rideId,
  amount,
  userId,
  onPaymentComplete,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<typeof PAYMENT_METHODS[number]['id'] | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const { processPayment, loading } = usePayment();

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setPaymentStatus('processing');
    const result = await processPayment(rideId, amount, selectedMethod, userId);

    if (result.success) {
      setPaymentStatus('success');
      setTimeout(() => {
        onPaymentComplete?.(result.transaction_id || '');
        onClose();
      }, 2000);
    } else {
      setPaymentStatus('idle');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('uz-UZ').format(value) + " so'm";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-card border border-border/50 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">To'lov</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {paymentStatus === 'success' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-success" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">To'lov muvaffaqiyatli!</h3>
              <p className="text-muted-foreground">{formatCurrency(amount)}</p>
            </motion.div>
          ) : (
            <>
              {/* Amount */}
              <div className="text-center mb-6 p-4 rounded-2xl bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-1">To'lov summasi</p>
                <p className="text-3xl font-bold gradient-text">{formatCurrency(amount)}</p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-muted-foreground">To'lov usulini tanlang</p>
                {PAYMENT_METHODS.map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMethod(method.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all",
                      selectedMethod === method.id
                        ? "bg-primary/10 border-primary"
                        : "bg-secondary/30 border-border/50 hover:border-primary/50"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", method.color)}>
                      <method.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Pay Button */}
              <Button
                className="w-full h-14 taxi-button rounded-2xl text-lg font-semibold"
                onClick={handlePayment}
                disabled={!selectedMethod || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Jarayonda...
                  </>
                ) : (
                  <>To'lash • {formatCurrency(amount)}</>
                )}
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;
