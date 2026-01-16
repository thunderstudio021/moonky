import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (authLoading) {
      console.log('[useAdmin] Auth still loading');
      setLoading(true);
      return;
    }

    const checkAdminStatus = async () => {
      if (!user) {
        console.log('[useAdmin] No user found');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log('[useAdmin] Checking admin status for user:', user.id, (user as any).email);

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        console.log('[useAdmin] Query result:', { data, error });

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          const isAdminUser = !!data;
          console.log('[useAdmin] Is admin:', isAdminUser);
          setIsAdmin(isAdminUser);
        }
      } catch (error) {
        console.error('Error in checkAdminStatus:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

  return { isAdmin, loading };
};
