import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, Package, MapPin, CreditCard, 
  Clock, CheckCircle2, Truck, XCircle, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_id: string;
  products?: {
    name: string;
    image_url: string | null;
    brands: { name: string } | null;
    product_categories: { name: string } | null;
  } | null;
}

interface Order {
  id: string;
  status: string;
  total: number;
  payment_method: string | null;
  shipping_address: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchOrderDetails();

      // Subscribe to realtime updates for this specific order
      const channel = supabase
        .channel(`order-details-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${id}`
          },
          (payload) => {
            console.log('Order updated:', payload);
            // Update order state with new data
            setOrder(prev => prev ? { ...prev, ...payload.new } : null);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, id]);

  const fetchOrderDetails = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('id', id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (orderError) throw orderError;
      
      if (!orderData) {
        setOrder(null);
        setLoading(false);
        return;
      }

      const productIds = orderData.order_items.map((item: any) => item.product_id);
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, image_url, brands(name), product_categories(name)')
        .in('id', productIds);

      const productsMap = new Map(productsData?.map((p: any) => [p.id, p]) || []);
      const orderWithProducts = {
        ...orderData,
        order_items: orderData.order_items.map((item: any) => ({
          ...item,
          products: productsMap.get(item.product_id) || null
        }))
      };

      setOrder(orderWithProducts as any);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do pedido.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!order || order.status !== 'pending') return;
    
    setCancelling(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Pedido cancelado",
        description: "Seu pedido foi cancelado com sucesso.",
      });
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o pedido.",
        variant: "destructive"
      });
    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        bg: "bg-yellow-500/10", 
        text: "text-yellow-600", 
        icon: Clock, 
        label: "Pendente" 
      },
      confirmed: { 
        bg: "bg-blue-500/10", 
        text: "text-blue-600", 
        icon: CheckCircle2, 
        label: "Confirmado" 
      },
      preparing: { 
        bg: "bg-orange-500/10", 
        text: "text-orange-600", 
        icon: Package, 
        label: "Preparando" 
      },
      out_for_delivery: { 
        bg: "bg-purple-500/10", 
        text: "text-purple-600", 
        icon: Truck, 
        label: "Saiu para entrega" 
      },
      delivered: { 
        bg: "bg-green-500/10", 
        text: "text-green-600", 
        icon: CheckCircle2, 
        label: "Entregue" 
      },
      cancelled: { 
        bg: "bg-red-500/10", 
        text: "text-red-600", 
        icon: XCircle, 
        label: "Cancelado" 
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 pb-24">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">Faça login para ver os detalhes.</p>
        <Button onClick={() => navigate('/auth')} className="mt-4 h-12 px-8">
          Entrar
        </Button>
        <BottomNavigation />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 pb-24">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Pedido não encontrado</h2>
        <p className="text-muted-foreground text-center mb-6">
          O pedido solicitado não existe ou foi removido.
        </p>
        <Button onClick={() => navigate('/orders')} className="h-12 px-8">
          Ver meus pedidos
        </Button>
        <BottomNavigation />
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Mobile */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/orders')} className="p-2 -ml-2 touch-manipulation">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">Pedido #{order.id.slice(0, 8)}</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Status Card */}
        <div className={`${statusConfig.bg} rounded-xl p-4`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 ${statusConfig.bg} rounded-full`}>
              <StatusIcon className={`h-6 w-6 ${statusConfig.text}`} />
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-lg ${statusConfig.text}`}>
                {statusConfig.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Itens do Pedido */}
        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Package className="h-4 w-4" />
            Itens ({order.order_items.length})
          </h3>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                  {item.products?.image_url ? (
                    <img
                      src={item.products.image_url}
                      alt={item.products.name || "Produto"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {item.products?.name || `Produto`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity}x {formatPrice(item.unit_price)}
                  </p>
                </div>
                <p className="font-semibold text-sm">
                  {formatPrice(item.total_price)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Endereço de Entrega */}
        {order.shipping_address && (
          <div className="bg-card rounded-xl border p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-green-600" />
              Endereço de Entrega
            </h3>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-medium text-sm">{order.shipping_address.address}</p>
              {order.shipping_address.neighborhood && (
                <p className="text-xs text-muted-foreground">
                  {order.shipping_address.neighborhood}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {order.shipping_address.city}
                {order.shipping_address.state && ` - ${order.shipping_address.state}`}
              </p>
              <p className="text-xs text-muted-foreground">
                CEP: {order.shipping_address.cep}
              </p>
              {order.shipping_address.complement && (
                <p className="text-xs text-muted-foreground mt-1">
                  {order.shipping_address.complement}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pagamento */}
        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-purple-600" />
            Pagamento
          </h3>
          <p className="text-sm text-muted-foreground">
            {order.payment_method || 'Pagamento na entrega'}
          </p>
        </div>

        {/* Observações */}
        {order.notes && (
          <div className="bg-card rounded-xl border p-4">
            <h3 className="font-semibold mb-2">Observações</h3>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </div>
        )}

        {/* Total */}
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total do Pedido</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Botão Cancelar - apenas para pedidos pendentes */}
        {order.status === 'pending' && (
          <Button 
            variant="destructive" 
            className="w-full h-12"
            onClick={cancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Cancelando...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar Pedido
              </>
            )}
          </Button>
        )}

        {/* Botão Ajuda */}
        <Button 
          variant="outline" 
          className="w-full h-12"
          onClick={() => toast({ title: "Em breve", description: "Funcionalidade de suporte em desenvolvimento." })}
        >
          Precisa de ajuda com este pedido?
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default OrderDetails;
