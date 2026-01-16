import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  discount?: number;
  isNew?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  placeOrder: (orderData: any) => Promise<{ success: boolean; orderId?: string; error?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.product.id);
      
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        return {
          items: [...state.items, { ...action.product, quantity: 1 }],
        };
      }
    }

    case 'REMOVE_ITEM': {
      return {
        items: state.items.filter(item => item.id !== action.productId),
      };
    }

    case 'UPDATE_QUANTITY': {
      return {
        items: state.items.map(item =>
          item.id === action.productId
            ? { ...item, quantity: Math.max(0, action.quantity) }
            : item
        ).filter(item => item.quantity > 0),
      };
    }

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const { toast } = useToast();
  const { user } = useAuth();

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', product });
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  const removeItem = (productId: string) => {
    const item = state.items.find(item => item.id === productId);
    dispatch({ type: 'REMOVE_ITEM', productId });
    if (item) {
      toast({
        title: "Produto removido",
        description: `${item.name} foi removido do carrinho.`,
      });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = async (orderData: any) => {
    try {
      if (!user) {
        return { success: false, error: 'Usuário deve estar logado para fazer pedidos' };
      }

      if (state.items.length === 0) {
        return { success: false, error: 'Carrinho está vazio' };
      }

      const totalAmount = getTotalPrice() + (orderData.deliveryFee || 0);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: totalAmount,
          payment_method: orderData.paymentMethod,
          shipping_address: orderData.address,
          notes: orderData.notes,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = state.items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Add points for purchase (10 pontos para cada R$ 1,00)
      const pointsEarned = Math.floor(totalAmount * 10);
      
      try {
        await supabase.rpc('add_user_points', {
          p_user_id: user.id,
          p_points: pointsEarned,
          p_description: `Compra #${order.id.slice(0, 8)} - ${pointsEarned} pontos`
        });

        // Show points earned notification
        toast({
          title: `🎉 Você ganhou ${pointsEarned} pontos!`,
          description: `Pontos adicionados pela sua compra de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}`,
        });
      } catch (pointsError) {
        console.error('Error adding points:', pointsError);
        // Não falhar o pedido se não conseguir dar pontos
      }

      // Clear cart after successful order
      dispatch({ type: 'CLEAR_CART' });

      return { success: true, orderId: order.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};