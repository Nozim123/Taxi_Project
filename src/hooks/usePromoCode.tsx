import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface PromoCodeResult {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  calculatedDiscount: number;
}

export const usePromoCode = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeResult | null>(null);

  const validatePromoCode = async (code: string, rideAmount: number): Promise<PromoCodeResult | null> => {
    if (!code.trim()) {
      toast.error("Promo kodni kiriting");
      return null;
    }

    setLoading(true);

    try {
      // Since types aren't generated yet, we'll simulate promo code validation
      // In production, this would query the promo_codes table
      const mockPromoCodes: Record<string, { discount_type: string; discount_value: number; max_discount?: number }> = {
        "WELCOME10": { discount_type: "percentage", discount_value: 10, max_discount: 5000 },
        "TAXI20": { discount_type: "percentage", discount_value: 20, max_discount: 10000 },
        "FLAT5000": { discount_type: "fixed", discount_value: 5000 },
      };

      const promoData = mockPromoCodes[code.toUpperCase()];
      
      if (!promoData) {
        toast.error("Promo kod topilmadi");
        return null;
      }

      let calculatedDiscount: number;
      if (promoData.discount_type === "percentage") {
        calculatedDiscount = rideAmount * (promoData.discount_value / 100);
        if (promoData.max_discount) {
          calculatedDiscount = Math.min(calculatedDiscount, promoData.max_discount);
        }
      } else {
        calculatedDiscount = promoData.discount_value;
      }

      const result: PromoCodeResult = {
        code: code.toUpperCase(),
        discountType: promoData.discount_type as "percentage" | "fixed",
        discountValue: promoData.discount_value,
        calculatedDiscount,
      };

      setAppliedPromo(result);
      toast.success(`Promo kod qo'llanildi!`, {
        description: `${calculatedDiscount.toLocaleString()} so'm chegirma`,
      });

      return result;
    } catch (error) {
      console.error("Promo code error:", error);
      toast.error("Promo kodni tekshirishda xatolik");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearPromo = () => {
    setAppliedPromo(null);
  };

  return {
    loading,
    appliedPromo,
    validatePromoCode,
    clearPromo,
  };
};

export default usePromoCode;