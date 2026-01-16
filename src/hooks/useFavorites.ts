import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setIsInitialized(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data.map(fav => fav.product_id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsInitialized(true);
    }
  }, [user]);

  useEffect(() => {
    setIsInitialized(false);
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para favoritar produtos.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const isFavorited = favorites.includes(productId);

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        
        setFavorites(prev => prev.filter(id => id !== productId));
        toast({
          title: "Removido dos favoritos",
          description: "Produto removido da sua lista de favoritos."
        });
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert([{
            user_id: user.id,
            product_id: productId
          }]);

        if (error) throw error;
        
        setFavorites(prev => [...prev, productId]);
        toast({
          title: "Adicionado aos favoritos",
          description: "Produto adicionado à sua lista de favoritos."
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    loading,
    isInitialized,
    refetch: fetchFavorites
  };
};

export default useFavorites;
