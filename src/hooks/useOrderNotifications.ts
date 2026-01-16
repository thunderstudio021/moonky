import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Create a beep sound using Web Audio API
const playBeep = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for beep
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure beep sound
    oscillator.frequency.value = 880; // A5 note
    oscillator.type = 'sine';
    
    // Configure volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    // Play beep
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    // Play second beep after short delay
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      
      osc2.frequency.value = 1100; // Higher note
      osc2.type = 'sine';
      
      gain2.gain.setValueAtTime(0, audioContext.currentTime);
      gain2.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
      gain2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.3);
    }, 150);
    
    console.log('Beep played for order notification');
  } catch (error) {
    console.error('Error playing beep:', error);
  }
};

const statusMessages: Record<string, { title: string; description: string }> = {
  confirmed: { 
    title: 'Pedido Confirmado! 🎉', 
    description: 'Seu pedido foi aceito e está sendo preparado.' 
  },
  preparing: { 
    title: 'Preparando seu pedido! 👨‍🍳', 
    description: 'Seu pedido está sendo preparado com carinho.' 
  },
  delivering: { 
    title: 'Pedido a caminho! 🚚', 
    description: 'Seu pedido saiu para entrega.' 
  },
  delivered: { 
    title: 'Pedido Entregue! ✅', 
    description: 'Seu pedido foi entregue. Bom proveito!' 
  },
  cancelled: { 
    title: 'Pedido Cancelado 😔', 
    description: 'Seu pedido foi cancelado.' 
  },
};

export const useOrderNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const previousStatusRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    console.log('Setting up order notifications for user:', user.id);

    // First, load current orders to track their status
    const loadInitialOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, status')
        .eq('user_id', user.id);

      if (data) {
        data.forEach(order => {
          previousStatusRef.current[order.id] = order.status;
        });
        console.log('Initial order statuses loaded:', previousStatusRef.current);
      }
    };

    loadInitialOrders();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('order-status-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newOrder = payload.new as any;
          const oldStatus = previousStatusRef.current[newOrder.id];
          const newStatus = newOrder.status;

          console.log('Order update received:', { orderId: newOrder.id, oldStatus, newStatus });

          // Only notify if status actually changed
          if (oldStatus && oldStatus !== newStatus) {
            // Play beep sound
            playBeep();

            // Show toast notification
            const message = statusMessages[newStatus];
            if (message) {
              toast({
                title: message.title,
                description: `Pedido #${newOrder.id.slice(0, 8)} - ${message.description}`,
              });
            }
          }

          // Update the tracked status
          previousStatusRef.current[newOrder.id] = newStatus;
        }
      )
      .subscribe((status) => {
        console.log('Order notifications subscription status:', status);
      });

    return () => {
      console.log('Cleaning up order notifications');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
};
