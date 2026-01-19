import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentResult {
  success: boolean;
  transaction_id?: string;
  payment_url?: string;
  payment_data?: any;
  error?: string;
}

interface Receipt {
  id: string;
  ride_id: string;
  total_amount: number;
  distance_km: number;
  duration_min: number;
  payment_method: string;
  payment_status: string;
  driver_name: string;
  pickup_address: string;
  dropoff_address: string;
}

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const processPayment = useCallback(async (
    rideId: string,
    amount: number,
    paymentMethod: 'click' | 'payme' | 'stripe' | 'cash',
    userId: string
  ): Promise<PaymentResult> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          ride_id: rideId,
          amount,
          payment_method: paymentMethod,
          user_id: userId,
        },
      });

      if (error) throw error;

      if (data.payment_url) {
        // Redirect to payment provider
        window.open(data.payment_url, '_blank');
      }

      if (paymentMethod === 'cash') {
        toast.success("Naqd to'lov tanlandi. Haydovchiga to'lang.");
      } else if (data.payment_data?.simulated) {
        toast.info("Demo rejim: To'lov tizimi ulanmagan");
      } else {
        toast.success("To'lov sahifasiga yo'naltirilmoqda...");
      }

      return data as PaymentResult;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("To'lov xatosi yuz berdi");
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment failed' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReceipt = useCallback(async (rideId: string): Promise<Receipt | null> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-receipt', {
        body: { ride_id: rideId },
      });

      if (error) throw error;

      if (data.success) {
        setReceipt(data.receipt);
        return data.receipt;
      }
      
      return null;
    } catch (error) {
      console.error('Receipt generation error:', error);
      toast.error("Kvitansiya yaratishda xatolik");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmCashPayment = useCallback(async (transactionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transactionId);

      if (error) throw error;

      toast.success("Naqd to'lov tasdiqlandi!");
      return true;
    } catch (error) {
      console.error('Cash confirmation error:', error);
      toast.error("Tasdiqlashda xatolik");
      return false;
    }
  }, []);

  return {
    processPayment,
    generateReceipt,
    confirmCashPayment,
    loading,
    receipt,
  };
};
