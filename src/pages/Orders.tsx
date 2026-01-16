import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, Package, Clock, CheckCircle, XCircle, 
  Truck, ChevronRight, ShoppingBag, RefreshCw
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_address: any;
  payment_method: string | null;
  notes: string | null;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_id: string;
  }[];
}

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            product_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data as any || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (!user) return;

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchOrders();
            toast({
              title: "Novo pedido criado! 🎉",
              description: `Pedido #${(payload.new as any).id.slice(0, 8)} foi criado.`,
            });
          } else if (payload.eventType === 'UPDATE') {
            const oldStatus = (payload.old as any).status;
            const newStatus = (payload.new as any).status;
            
            if (oldStatus !== newStatus) {
              const statusMessages: Record<string, string> = {
                confirmed: 'Seu pedido foi aceito! 🎉',
                preparing: 'Seu pedido está sendo preparado! 👨‍🍳',
                delivering: 'Seu pedido saiu para entrega! 🚚',
                delivered: 'Pedido entregue! ✅',
                cancelled: 'Seu pedido foi cancelado. 😔'
              };
              
              toast({
                title: statusMessages[newStatus] || 'Status atualizado',
                description: `Pedido #${(payload.new as any).id.slice(0, 8)}`,
              });
            }
            
            fetchOrders();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Hoje, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Ontem, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return d.toLocaleDateString('pt-BR', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
      pending: { 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-500/10', 
        icon: <Clock className="h-4 w-4" />,
        label: 'Pendente'
      },
      confirmed: { 
        color: 'text-blue-600', 
        bg: 'bg-blue-500/10', 
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Confirmado'
      },
      preparing: { 
        color: 'text-orange-600', 
        bg: 'bg-orange-500/10', 
        icon: <Package className="h-4 w-4" />,
        label: 'Preparando'
      },
      delivering: { 
        color: 'text-purple-600', 
        bg: 'bg-purple-500/10', 
        icon: <Truck className="h-4 w-4" />,
        label: 'A caminho'
      },
      delivered: { 
        color: 'text-green-600', 
        bg: 'bg-green-500/10', 
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Entregue'
      },
      cancelled: { 
        color: 'text-red-600', 
        bg: 'bg-red-500/10', 
        icon: <XCircle className="h-4 w-4" />,
        label: 'Cancelado'
      },
    };
    return configs[status] || configs.pending;
  };

  const tabs = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Pendentes' },
    { id: 'confirmed', label: 'Confirmados' },
    { id: 'delivering', label: 'A caminho' },
    { id: 'delivered', label: 'Entregues' },
  ];

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const getTabCount = (tabId: string) => {
    if (tabId === 'all') return orders.length;
    return orders.filter(o => o.status === tabId).length;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Faça login para ver seus pedidos</h2>
        <p className="text-muted-foreground text-center mb-6">
          Acompanhe o status das suas compras em tempo real
        </p>
        <Link to="/auth">
          <Button className="h-12 px-8">Entrar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Mobile */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 touch-manipulation">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">Meus Pedidos</h1>
          <button 
            onClick={() => fetchOrders()} 
            className="p-2 -mr-2 touch-manipulation"
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tabs Horizontais */}
        <div className="flex overflow-x-auto scrollbar-hide gap-2 px-4 py-3">
          {tabs.map((tab) => {
            const count = getTabCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all touch-manipulation
                  ${activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1.5 ${activeTab === tab.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl border p-4 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-5 w-24 bg-muted rounded" />
                  <div className="h-6 w-20 bg-muted rounded-full" />
                </div>
                <div className="h-4 w-32 bg-muted rounded mb-3" />
                <div className="h-10 w-full bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {activeTab === 'all' ? 'Nenhum pedido ainda' : 'Nenhum pedido nesta categoria'}
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-[250px]">
              {activeTab === 'all' 
                ? 'Quando você fizer seu primeiro pedido, ele aparecerá aqui'
                : 'Seus pedidos aparecerão aqui quando houver'}
            </p>
            <Link to="/">
              <Button className="h-12">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Explorar produtos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const itemCount = order.order_items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
              
              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="w-full bg-card rounded-xl border p-4 text-left touch-manipulation active:scale-[0.98] transition-transform"
                >
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">Pedido #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.icon}
                      <span className="text-xs font-medium">{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* Info do Pedido */}
                  <div className="flex items-center justify-between py-3 border-t border-dashed">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Itens</p>
                        <p className="font-medium">{itemCount}</p>
                      </div>
                      {order.payment_method && (
                        <div>
                          <p className="text-xs text-muted-foreground">Pagamento</p>
                          <p className="font-medium text-sm">{order.payment_method}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Progress Bar para pedidos em andamento */}
                  {['pending', 'confirmed', 'preparing', 'delivering'].includes(order.status) && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between mb-2">
                        {['pending', 'confirmed', 'preparing', 'delivering', 'delivered'].map((step, index) => {
                          const currentIndex = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered'].indexOf(order.status);
                          const isActive = index <= currentIndex;
                          const stepConfig = getStatusConfig(step);
                          
                          return (
                            <div 
                              key={step} 
                              className={`flex flex-col items-center ${isActive ? stepConfig.color : 'text-muted-foreground/40'}`}
                            >
                              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-current' : 'bg-muted'}`} />
                            </div>
                          );
                        })}
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ 
                            width: `${(['pending', 'confirmed', 'preparing', 'delivering', 'delivered'].indexOf(order.status) + 1) * 20}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Orders;
