import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  minimum_order_value: number | null;
  max_uses: number | null;
  current_uses: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  error?: string;
}

export function useCoupon() {
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const { user } = useAuth();

  const validateCoupon = async (
    code: string, 
    subtotal: number
  ): Promise<CouponValidationResult> => {
    if (!code.trim()) {
      return { valid: false, error: "Digite um código de cupom" };
    }

    setIsValidating(true);

    try {
      // Fetch the coupon
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase().trim())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!coupon) {
        return { valid: false, error: "Cupom não encontrado" };
      }

      // Check if coupon is expired
      if (coupon.valid_until) {
        const expireDate = new Date(coupon.valid_until);
        expireDate.setHours(23, 59, 59, 999);
        if (expireDate < new Date()) {
          return { valid: false, error: "Cupom expirado" };
        }
      }

      // Check if coupon has started
      if (coupon.valid_from) {
        const startDate = new Date(coupon.valid_from);
        startDate.setHours(0, 0, 0, 0);
        if (startDate > new Date()) {
          return { valid: false, error: "Cupom ainda não está válido" };
        }
      }

      // Check max uses
      if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
        return { valid: false, error: "Cupom esgotado" };
      }

      // Check minimum order value
      if (coupon.minimum_order_value && subtotal < coupon.minimum_order_value) {
        const formatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(coupon.minimum_order_value);
        return { 
          valid: false, 
          error: `Pedido mínimo de ${formatted} para este cupom` 
        };
      }

      // Check if user already used this coupon (if logged in)
      if (user) {
        const { data: existingUse } = await supabase
          .from("coupon_uses")
          .select("id")
          .eq("coupon_id", coupon.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingUse) {
          return { valid: false, error: "Você já usou este cupom" };
        }
      }

      // Calculate discount
      const discount = coupon.discount_type === "percentage"
        ? (subtotal * coupon.discount_value) / 100
        : coupon.discount_value;

      return {
        valid: true,
        coupon,
        discount: Math.min(discount, subtotal), // Discount can't exceed subtotal
      };
    } catch (error: any) {
      console.error("Error validating coupon:", error);
      return { valid: false, error: "Erro ao validar cupom" };
    } finally {
      setIsValidating(false);
    }
  };

  const applyCoupon = async (code: string, subtotal: number) => {
    const result = await validateCoupon(code, subtotal);
    
    if (result.valid && result.coupon && result.discount !== undefined) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discount);
    }
    
    return result;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const recordCouponUse = async (orderId: string) => {
    if (!appliedCoupon || !user) return;

    try {
      // Record the usage
      await supabase
        .from("coupon_uses")
        .insert({
          coupon_id: appliedCoupon.id,
          user_id: user.id,
          order_id: orderId,
        });

      // Increment current_uses
      await supabase
        .from("coupons")
        .update({ 
          current_uses: appliedCoupon.current_uses + 1 
        })
        .eq("id", appliedCoupon.id);
    } catch (error) {
      console.error("Error recording coupon use:", error);
    }
  };

  // Recalculate discount when subtotal changes
  const recalculateDiscount = (subtotal: number) => {
    if (!appliedCoupon) return 0;
    
    const discount = appliedCoupon.discount_type === "percentage"
      ? (subtotal * appliedCoupon.discount_value) / 100
      : appliedCoupon.discount_value;
    
    const finalDiscount = Math.min(discount, subtotal);
    setCouponDiscount(finalDiscount);
    return finalDiscount;
  };

  return {
    isValidating,
    appliedCoupon,
    couponDiscount,
    validateCoupon,
    applyCoupon,
    removeCoupon,
    recordCouponUse,
    recalculateDiscount,
  };
}
