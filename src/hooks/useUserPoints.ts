import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserPoints = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadPoints = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setPoints(data?.points || 0);
    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (
    pointsToAdd: number, 
    source: string, 
    description?: string, 
    orderId?: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase.rpc('add_user_points', {
        p_user_id: user.id,
        p_points: pointsToAdd,
        p_description: description || `Pontos de ${source}`
      });

      if (error) throw error;

      // Recarregar pontos
      await loadPoints();

      // Mostrar toast de sucesso
      toast({
        title: `🎉 Você ganhou ${pointsToAdd} pontos!`,
        description: description || `Pontos adicionados por ${source}`,
      });

      return true;
    } catch (error) {
      console.error('Error adding points:', error);
      return false;
    }
  };

  const calculatePointsFromPurchase = (totalAmount: number) => {
    // 10 pontos para cada R$ 1,00
    return Math.floor(totalAmount * 10);
  };

  useEffect(() => {
    loadPoints();
  }, [user]);

  return {
    points,
    loading,
    loadPoints,
    addPoints,
    calculatePointsFromPurchase
  };
};