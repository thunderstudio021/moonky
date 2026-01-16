import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DollarSign,
  CreditCard,
  Smartphone,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Loader2,
  Clock,
  Check,
  X,
  Calculator,
  Receipt,
  Play,
  Square,
  Percent,
  Tag,
  Ticket,
  Calendar,
  Gift,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  stock: number | null;
  image_url: string | null;
}

interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  is_active: boolean;
  event?: Event;
}

interface Event {
  id: string;
  name: string;
  event_date: string;
  event_time: string;
  is_active: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
  type: 'product';
}

interface TicketCartItem {
  ticket: TicketType;
  quantity: number;
  type: 'ticket';
}

type CartItemType = CartItem | TicketCartItem;

interface Session {
  id: string;
  operator_id: string;
  initial_fund: number;
  expected_balance: number | null;
  actual_balance: number | null;
  difference: number | null;
  status: string;
  opened_at: string;
  closed_at: string | null;
}

interface Transaction {
  id: string;
  session_id: string;
  items: any[];
  subtotal: number;
  total: number;
  payment_method: string;
  amount_paid: number | null;
  change_amount: number | null;
  discount_type: string | null;
  discount_value: number | null;
  discount_amount: number | null;
  created_at: string;
}

export const CashRegister = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  
  // Dialogs
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [closeSessionDialog, setCloseSessionDialog] = useState(false);
  const [checkoutSheet, setCheckoutSheet] = useState(false);
  
  // Forms
  const [initialFund, setInitialFund] = useState("");
  const [actualBalance, setActualBalance] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [amountPaid, setAmountPaid] = useState("");
  
  // Discount
  const [discountType, setDiscountType] = useState<"percent" | "fixed" | "coupon" | "">("");
  const [discountValue, setDiscountValue] = useState("");
  
  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  // Search
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sale type tab
  const [saleType, setSaleType] = useState<"products" | "tickets">("products");

  useEffect(() => {
    loadProducts();
    loadEvents();
    loadCurrentSession();
  }, []);

  useEffect(() => {
    if (currentSession) {
      loadTransactions();
    }
  }, [currentSession]);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, sale_price, is_on_sale, stock, image_url")
      .eq("active", true)
      .order("name");
    
    if (error) {
      console.error("Error loading products:", error);
      return;
    }
    setProducts(data || []);
  };

  const loadEvents = async () => {
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .order("event_date");
    
    if (eventsError) {
      console.error("Error loading events:", eventsError);
      return;
    }
    setEvents(eventsData || []);

    const { data: ticketsData, error: ticketsError } = await supabase
      .from("ticket_types")
      .select("*")
      .eq("is_active", true);
    
    if (ticketsError) {
      console.error("Error loading tickets:", ticketsError);
      return;
    }
    
    // Add event info to tickets
    const ticketsWithEvents = (ticketsData || []).map(ticket => ({
      ...ticket,
      event: (eventsData || []).find(e => e.id === ticket.event_id)
    }));
    setTicketTypes(ticketsWithEvents);
  };

  const loadCurrentSession = async () => {
    const { data, error } = await supabase
      .from("cash_register_sessions")
      .select("*")
      .eq("status", "open")
      .maybeSingle();
    
    if (error) {
      console.error("Error loading session:", error);
      return;
    }
    setCurrentSession(data);
  };

  const loadTransactions = async () => {
    if (!currentSession) return;
    
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("session_id", currentSession.id)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error loading transactions:", error);
      return;
    }
    
    // Parse items from JSON and ensure discount fields exist
    const parsed: Transaction[] = (data || []).map(t => {
      const record = t as Record<string, any>;
      return {
        id: t.id,
        session_id: t.session_id,
        items: typeof t.items === 'string' ? JSON.parse(t.items) : t.items,
        subtotal: t.subtotal,
        total: t.total,
        payment_method: t.payment_method,
        amount_paid: t.amount_paid,
        change_amount: t.change_amount,
        discount_type: record.discount_type ?? null,
        discount_value: record.discount_value ?? null,
        discount_amount: record.discount_amount ?? null,
        created_at: t.created_at
      };
    });
    setTransactions(parsed);
  };

  const handleOpenSession = async () => {
    if (!user || !initialFund) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cash_register_sessions")
        .insert({
          operator_id: user.id,
          initial_fund: parseFloat(initialFund),
          status: "open"
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setCurrentSession(data);
      setOpenSessionDialog(false);
      setInitialFund("");
      
      toast({
        title: "Caixa aberto",
        description: `Fundo inicial: R$ ${parseFloat(initialFund).toFixed(2)}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao abrir caixa",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!currentSession || !actualBalance) return;
    
    setLoading(true);
    try {
      const cashSales = transactions
        .filter(t => t.payment_method === "cash")
        .reduce((sum, t) => sum + t.total - (t.change_amount || 0), 0);
      
      const expectedBalance = currentSession.initial_fund + cashSales;
      const actual = parseFloat(actualBalance);
      const difference = actual - expectedBalance;
      
      const { error } = await supabase
        .from("cash_register_sessions")
        .update({
          status: "closed",
          expected_balance: expectedBalance,
          actual_balance: actual,
          difference: difference,
          closed_at: new Date().toISOString()
        })
        .eq("id", currentSession.id);
      
      if (error) throw error;
      
      toast({
        title: "Caixa fechado",
        description: difference === 0 
          ? "Caixa fechado corretamente!" 
          : `Diferença: R$ ${difference.toFixed(2)}`,
        variant: difference === 0 ? "default" : "destructive",
      });
      
      setCurrentSession(null);
      setTransactions([]);
      setCloseSessionDialog(false);
      setActualBalance("");
    } catch (error: any) {
      toast({
        title: "Erro ao fechar caixa",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (product: Product) => {
    return product.is_on_sale && product.sale_price ? product.sale_price : product.price;
  };

  const getItemPrice = (item: CartItemType) => {
    if (item.type === 'product') {
      return getProductPrice(item.product);
    }
    return item.ticket.price;
  };

  const getItemId = (item: CartItemType) => {
    if (item.type === 'product') {
      return `product-${item.product.id}`;
    }
    return `ticket-${item.ticket.id}`;
  };

  const getItemName = (item: CartItemType) => {
    if (item.type === 'product') {
      return item.product.name;
    }
    return `${item.ticket.name} - ${item.ticket.event?.name || 'Evento'}`;
  };

  const addProductToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.type === 'product' && item.product.id === product.id) as CartItem | undefined;
      if (existing) {
        return prev.map(item =>
          item.type === 'product' && item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, type: 'product' as const }];
    });
  };

  const addTicketToCart = (ticket: TicketType) => {
    const available = ticket.quantity_available - ticket.quantity_sold;
    const currentInCart = cart.find(item => item.type === 'ticket' && item.ticket.id === ticket.id) as TicketCartItem | undefined;
    const currentQty = currentInCart?.quantity || 0;
    
    if (currentQty >= available) {
      toast({
        title: "Quantidade indisponível",
        description: `Apenas ${available} ingresso(s) disponível(is)`,
        variant: "destructive",
      });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.type === 'ticket' && item.ticket.id === ticket.id) as TicketCartItem | undefined;
      if (existing) {
        return prev.map(item =>
          item.type === 'ticket' && item.ticket.id === ticket.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ticket, quantity: 1, type: 'ticket' as const }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (getItemId(item) === itemId) {
          const newQty = item.quantity + delta;
          
          // Check ticket availability
          if (item.type === 'ticket' && delta > 0) {
            const available = item.ticket.quantity_available - item.ticket.quantity_sold;
            if (newQty > available) {
              toast({
                title: "Quantidade indisponível",
                description: `Apenas ${available} ingresso(s) disponível(is)`,
                variant: "destructive",
              });
              return item;
            }
          }
          
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
      return updated;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => getItemId(item) !== itemId));
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    // If coupon is applied, calculate based on coupon
    if (appliedCoupon) {
      if (appliedCoupon.discount_type === "percentage") {
        return Math.min(cartSubtotal, (cartSubtotal * appliedCoupon.discount_value) / 100);
      }
      return Math.min(cartSubtotal, appliedCoupon.discount_value);
    }
    
    // Manual discount
    if (!discountType || !discountValue || discountType === "coupon") return 0;
    const value = parseFloat(discountValue) || 0;
    if (discountType === "percent") {
      return Math.min(cartSubtotal, (cartSubtotal * value) / 100);
    }
    return Math.min(cartSubtotal, value);
  }, [discountType, discountValue, cartSubtotal, appliedCoupon]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount);
  }, [cartSubtotal, discountAmount]);

  const changeAmount = useMemo(() => {
    if (paymentMethod !== "cash" || !amountPaid) return 0;
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - cartTotal);
  }, [paymentMethod, amountPaid, cartTotal]);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Digite um código de cupom",
        variant: "destructive",
      });
      return;
    }

    setValidatingCoupon(true);

    try {
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase().trim())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!coupon) {
        toast({
          title: "Cupom não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Check if coupon is expired
      if (coupon.valid_until) {
        const expireDate = new Date(coupon.valid_until);
        expireDate.setHours(23, 59, 59, 999);
        if (expireDate < new Date()) {
          toast({
            title: "Cupom expirado",
            variant: "destructive",
          });
          return;
        }
      }

      // Check if coupon has started
      if (coupon.valid_from) {
        const startDate = new Date(coupon.valid_from);
        startDate.setHours(0, 0, 0, 0);
        if (startDate > new Date()) {
          toast({
            title: "Cupom ainda não está válido",
            variant: "destructive",
          });
          return;
        }
      }

      // Check max uses
      if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
        toast({
          title: "Cupom esgotado",
          variant: "destructive",
        });
        return;
      }

      // Check minimum order value
      if (coupon.minimum_order_value && cartSubtotal < coupon.minimum_order_value) {
        toast({
          title: `Pedido mínimo de R$ ${coupon.minimum_order_value.toFixed(2)} para este cupom`,
          variant: "destructive",
        });
        return;
      }

      // Coupon is valid!
      setAppliedCoupon(coupon);
      toast({
        title: "Cupom aplicado!",
        description: coupon.description || `${coupon.discount_type === "percentage" ? coupon.discount_value + "%" : "R$ " + coupon.discount_value.toFixed(2)} de desconto`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao validar cupom",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast({
      title: "Cupom removido",
    });
  };

  const handleCheckout = async () => {
    if (!currentSession || !user || cart.length === 0 || !paymentMethod) return;
    
    setLoading(true);
    try {
      // Determine discount info
      let finalDiscountType: string | null = null;
      let finalDiscountValue: number | null = null;
      
      if (appliedCoupon) {
        finalDiscountType = appliedCoupon.discount_type === "percentage" ? "coupon_percent" : "coupon_fixed";
        finalDiscountValue = appliedCoupon.discount_value;
      } else if (discountType && discountValue) {
        finalDiscountType = discountType;
        finalDiscountValue = parseFloat(discountValue);
      }

      const transaction = {
        session_id: currentSession.id,
        operator_id: user.id,
        items: cart.map(item => {
          if (item.type === 'product') {
            return {
              type: 'product',
              product_id: item.product.id,
              name: item.product.name,
              price: getProductPrice(item.product),
              quantity: item.quantity
            };
          }
          return {
            type: 'ticket',
            ticket_id: item.ticket.id,
            event_id: item.ticket.event_id,
            name: `${item.ticket.name} - ${item.ticket.event?.name || 'Evento'}`,
            price: item.ticket.price,
            quantity: item.quantity
          };
        }),
        subtotal: cartSubtotal,
        total: cartTotal,
        payment_method: paymentMethod,
        amount_paid: paymentMethod === "cash" ? parseFloat(amountPaid) || cartTotal : cartTotal,
        change_amount: paymentMethod === "cash" ? changeAmount : 0,
        discount_type: finalDiscountType,
        discount_value: finalDiscountValue,
        discount_amount: discountAmount > 0 ? discountAmount : null
      };
      
      const { error } = await supabase
        .from("transactions")
        .insert(transaction);
      
      if (error) throw error;
      
      // Update stock for products and tickets
      for (const item of cart) {
        if (item.type === 'product') {
          if (item.product.stock !== null) {
            await supabase
              .from("products")
              .update({ stock: Math.max(0, item.product.stock - item.quantity) })
              .eq("id", item.product.id);
          }
        } else {
          // Update ticket quantity sold
          await supabase
            .from("ticket_types")
            .update({ quantity_sold: item.ticket.quantity_sold + item.quantity })
            .eq("id", item.ticket.id);
        }
      }

      // Increment coupon usage if coupon was applied
      if (appliedCoupon) {
        await supabase
          .from("coupons")
          .update({ current_uses: appliedCoupon.current_uses + 1 })
          .eq("id", appliedCoupon.id);
      }
      
      toast({
        title: "Venda registrada!",
        description: `Total: R$ ${cartTotal.toFixed(2)}`,
      });
      
      setCart([]);
      setPaymentMethod("");
      setAmountPaid("");
      setDiscountType("");
      setDiscountValue("");
      setAppliedCoupon(null);
      setCouponCode("");
      setCheckoutSheet(false);
      loadTransactions();
      loadProducts();
      loadEvents();
    } catch (error: any) {
      toast({
        title: "Erro ao registrar venda",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const filteredTickets = useMemo(() => {
    if (!searchTerm) return ticketTypes;
    return ticketTypes.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.event?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ticketTypes, searchTerm]);

  const sessionStats = useMemo(() => {
    const cashSales = transactions
      .filter(t => t.payment_method === "cash")
      .reduce((sum, t) => sum + t.total, 0);
    const cardSales = transactions
      .filter(t => t.payment_method === "card")
      .reduce((sum, t) => sum + t.total, 0);
    const pixSales = transactions
      .filter(t => t.payment_method === "pix")
      .reduce((sum, t) => sum + t.total, 0);
    const totalSales = cashSales + cardSales + pixSales;
    
    return { cashSales, cardSales, pixSales, totalSales, count: transactions.length };
  }, [transactions]);

  // No session - show open session button
  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center space-y-2">
          <Calculator className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Caixa Fechado</h2>
          <p className="text-muted-foreground">Abra o caixa para iniciar as vendas</p>
        </div>
        
        <Button size="lg" onClick={() => setOpenSessionDialog(true)} className="gap-2">
          <Play className="w-5 h-5" />
          Abrir Caixa
        </Button>
        
        <Dialog open={openSessionDialog} onOpenChange={setOpenSessionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Abrir Caixa</DialogTitle>
              <DialogDescription>
                Informe o valor do fundo de troco inicial
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="initialFund">Fundo Inicial (R$)</Label>
                <Input
                  id="initialFund"
                  type="number"
                  step="0.01"
                  min="0"
                  value={initialFund}
                  onChange={(e) => setInitialFund(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleOpenSession}
                disabled={loading || !initialFund}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmar Abertura
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with session info */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="default" className="bg-green-600 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Caixa Aberto
          </Badge>
          <span className="text-sm text-muted-foreground">
            Desde {new Date(currentSession.opened_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <Button variant="destructive" size="sm" onClick={() => setCloseSessionDialog(true)}>
          <Square className="w-4 h-4 mr-2" />
          Fechar Caixa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Vendas</span>
            </div>
            <p className="text-xl font-bold">{sessionStats.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Dinheiro</span>
            </div>
            <p className="text-xl font-bold text-green-600">R$ {sessionStats.cashSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Cartão</span>
            </div>
            <p className="text-xl font-bold text-blue-600">R$ {sessionStats.cardSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-muted-foreground">Pix</span>
            </div>
            <p className="text-xl font-bold text-purple-600">R$ {sessionStats.pixSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-xl font-bold text-primary">R$ {sessionStats.totalSales.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sale" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sale">Nova Venda</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="sale" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Products/Tickets Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={saleType === "products" ? "default" : "outline"}
                  onClick={() => setSaleType("products")}
                  className="flex-1"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Produtos
                </Button>
                <Button
                  variant={saleType === "tickets" ? "default" : "outline"}
                  onClick={() => setSaleType("tickets")}
                  className="flex-1"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Ingressos
                </Button>
              </div>
              
              <Input
                placeholder={saleType === "products" ? "Buscar produto..." : "Buscar ingresso ou evento..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {saleType === "products" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addProductToCart(product)}
                      className="p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary transition-all text-left group"
                    >
                      <div className="font-medium text-sm truncate group-hover:text-primary">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {product.is_on_sale && product.sale_price ? (
                          <>
                            <span className="text-xs line-through text-muted-foreground">
                              R$ {product.price.toFixed(2)}
                            </span>
                            <span className="text-sm font-bold text-green-600">
                              R$ {product.sale_price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold">
                            R$ {product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.stock !== null && product.stock <= 5 && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {product.stock} un
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                  {filteredTickets.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum ingresso disponível</p>
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const available = ticket.quantity_available - ticket.quantity_sold;
                      return (
                        <button
                          key={ticket.id}
                          onClick={() => addTicketToCart(ticket)}
                          disabled={available <= 0}
                          className={`p-3 rounded-lg border bg-card text-left transition-all ${
                            available > 0 
                              ? 'border-border hover:bg-accent hover:border-primary group' 
                              : 'border-muted opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <Ticket className="w-3 h-3 text-primary" />
                            <span className="text-xs text-muted-foreground truncate">
                              {ticket.event?.name || 'Evento'}
                            </span>
                          </div>
                          <div className="font-medium text-sm truncate group-hover:text-primary">
                            {ticket.name}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-bold text-primary">
                              R$ {ticket.price.toFixed(2)}
                            </span>
                            <Badge variant={available > 10 ? "secondary" : available > 0 ? "outline" : "destructive"} className="text-xs">
                              {available} disp.
                            </Badge>
                          </div>
                          {ticket.event && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(ticket.event.event_date + 'T00:00:00'), "dd/MM", { locale: ptBR })}
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Card className="lg:sticky lg:top-4 h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Carrinho
                  {cart.length > 0 && (
                    <Badge variant="secondary">{cart.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Carrinho vazio
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                      {cart.map((item) => (
                        <div key={getItemId(item)} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              {item.type === 'ticket' && <Ticket className="w-3 h-3 text-primary flex-shrink-0" />}
                              <p className="text-sm font-medium truncate">{getItemName(item)}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              R$ {getItemPrice(item).toFixed(2)} x {item.quantity}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(getItemId(item), -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(getItemId(item), 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive"
                              onClick={() => removeFromCart(getItemId(item))}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Subtotal</span>
                        <span>R$ {cartSubtotal.toFixed(2)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-600">
                          <span>Desconto</span>
                          <span>- R$ {discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">R$ {cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => setCheckoutSheet(true)}
                    >
                      Finalizar Venda
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Vendas da Sessão</CardTitle>
              <CardDescription>{transactions.length} transações</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma venda registrada
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="flex items-center gap-2">
                          {transaction.payment_method === "cash" && <DollarSign className="w-4 h-4 text-green-600" />}
                          {transaction.payment_method === "card" && <CreditCard className="w-4 h-4 text-blue-600" />}
                          {transaction.payment_method === "pix" && <Smartphone className="w-4 h-4 text-purple-600" />}
                          <span className="font-medium">
                            R$ {transaction.total.toFixed(2)}
                            {transaction.discount_amount && transaction.discount_amount > 0 && (
                              <Badge variant="secondary" className="ml-2 text-xs gap-1">
                                {(transaction.discount_type?.includes("coupon")) && <Gift className="w-3 h-3" />}
                                -{transaction.discount_type?.includes("percent") ? `${transaction.discount_value}%` : `R$${transaction.discount_amount.toFixed(2)}`}
                              </Badge>
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {Array.isArray(transaction.items) ? transaction.items.length : 0} itens
                        </p>
                      </div>
                      <Badge variant="outline">
                        {transaction.payment_method === "cash" && "Dinheiro"}
                        {transaction.payment_method === "card" && "Cartão"}
                        {transaction.payment_method === "pix" && "Pix"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Checkout Sheet */}
      <Sheet open={checkoutSheet} onOpenChange={setCheckoutSheet}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Finalizar Venda</SheetTitle>
            <SheetDescription>
              Subtotal: R$ {cartSubtotal.toFixed(2)}
              {discountAmount > 0 && ` | Desconto: R$ ${discountAmount.toFixed(2)}`}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            {/* Discount Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Desconto
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={discountType === "percent" && !appliedCoupon ? "default" : "outline"}
                  className="gap-1 text-xs px-2"
                  onClick={() => {
                    if (appliedCoupon) removeCoupon();
                    setDiscountType(discountType === "percent" ? "" : "percent");
                  }}
                  disabled={!!appliedCoupon}
                >
                  <Percent className="w-3 h-3" />
                  Percentual
                </Button>
                <Button
                  type="button"
                  variant={discountType === "fixed" && !appliedCoupon ? "default" : "outline"}
                  className="gap-1 text-xs px-2"
                  onClick={() => {
                    if (appliedCoupon) removeCoupon();
                    setDiscountType(discountType === "fixed" ? "" : "fixed");
                  }}
                  disabled={!!appliedCoupon}
                >
                  <DollarSign className="w-3 h-3" />
                  Valor Fixo
                </Button>
                <Button
                  type="button"
                  variant={discountType === "coupon" || appliedCoupon ? "default" : "outline"}
                  className="gap-1 text-xs px-2"
                  onClick={() => {
                    setDiscountType(discountType === "coupon" ? "" : "coupon");
                    setDiscountValue("");
                  }}
                >
                  <Gift className="w-3 h-3" />
                  Cupom
                </Button>
              </div>
              
              {/* Manual discount input */}
              {(discountType === "percent" || discountType === "fixed") && !appliedCoupon && (
                <div className="space-y-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={discountType === "percent" ? 100 : cartSubtotal}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "percent" ? "Ex: 10%" : "Ex: 5,00"}
                  />
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm">
                      <span>Desconto aplicado</span>
                      <span className="font-bold">- R$ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Coupon input */}
              {discountType === "coupon" && !appliedCoupon && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Digite o código do cupom"
                      className="uppercase"
                    />
                    <Button
                      type="button"
                      onClick={validateCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                    >
                      {validatingCoupon ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Applied coupon display */}
              {appliedCoupon && (
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">
                          {appliedCoupon.code}
                        </span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {appliedCoupon.discount_type === "percentage" 
                          ? `${appliedCoupon.discount_value}% de desconto`
                          : `R$ ${appliedCoupon.discount_value.toFixed(2)} de desconto`
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600">
                        - R$ {discountAmount.toFixed(2)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-red-600 hover:bg-red-100"
                        onClick={removeCoupon}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total with discount */}
            <div className="p-4 rounded-lg bg-muted border">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total a Pagar</span>
                <span className="text-primary">R$ {cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Forma de Pagamento</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  className="flex-col h-20 gap-2"
                  onClick={() => setPaymentMethod("cash")}
                >
                  <DollarSign className="w-6 h-6" />
                  <span className="text-xs">Dinheiro</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  className="flex-col h-20 gap-2"
                  onClick={() => setPaymentMethod("card")}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs">Cartão</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "pix" ? "default" : "outline"}
                  className="flex-col h-20 gap-2"
                  onClick={() => setPaymentMethod("pix")}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="text-xs">Pix</span>
                </Button>
              </div>
            </div>
            
            {paymentMethod === "cash" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amountPaid">Valor Recebido (R$)</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    step="0.01"
                    min={cartTotal}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder={cartTotal.toFixed(2)}
                  />
                </div>
                
                {changeAmount > 0 && (
                  <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-800 dark:text-green-200">Troco</span>
                      <span className="text-2xl font-bold text-green-600">
                        R$ {changeAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={loading || !paymentMethod || (paymentMethod === "cash" && parseFloat(amountPaid || "0") < cartTotal)}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Confirmar Pagamento
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Close Session Dialog */}
      <Dialog open={closeSessionDialog} onOpenChange={setCloseSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fechar Caixa</DialogTitle>
            <DialogDescription>
              Informe o valor contado em dinheiro no caixa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fundo Inicial</span>
                  <span>R$ {currentSession.initial_fund.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Vendas em Dinheiro</span>
                  <span>R$ {sessionStats.cashSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Saldo Esperado</span>
                  <span>R$ {(currentSession.initial_fund + sessionStats.cashSales).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              <Label htmlFor="actualBalance">Valor Contado (R$)</Label>
              <Input
                id="actualBalance"
                type="number"
                step="0.01"
                min="0"
                value={actualBalance}
                onChange={(e) => setActualBalance(e.target.value)}
                placeholder="0,00"
              />
            </div>
            
            {actualBalance && (
              <div className={`p-3 rounded-lg ${
                parseFloat(actualBalance) === (currentSession.initial_fund + sessionStats.cashSales)
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Diferença</span>
                  <span className="font-bold">
                    R$ {(parseFloat(actualBalance) - (currentSession.initial_fund + sessionStats.cashSales)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            
            <Button 
              className="w-full" 
              variant="destructive"
              onClick={handleCloseSession}
              disabled={loading || !actualBalance}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Square className="w-4 h-4 mr-2" />}
              Confirmar Fechamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
