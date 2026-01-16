import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, CreditCard, MapPin, Clock, Check, 
  Truck, Banknote, ChevronRight, ShoppingBag, Tag, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNavigation from "@/components/BottomNavigation";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useCouponContext } from "@/contexts/CouponContext";

const Checkout = () => {
  const { items, getTotalItems, placeOrder } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { settings } = useStoreSettings();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [couponCode, setCouponCode] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [formData, setFormData] = useState({
    cep: settings?.delivery_cep || "48970-000",
    city: settings?.delivery_city || "SENHOR DO BONFIM",
    address: "",
    neighborhood: "",
    complement: "",
    state: settings?.delivery_state || "BA"
  });

  const {
    isValidating,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    recordCouponUse,
    recalculateDiscount,
  } = useCouponContext();

  // Update formData when settings load
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        cep: settings.delivery_cep || prev.cep,
        city: settings.delivery_city || prev.city,
        state: settings.delivery_state || prev.state
      }));
    }
  }, [settings]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para continuar com seu pedido.",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('address')
          .eq('id', user.id)
          .maybeSingle();

        if (data?.address) {
          const addr = data.address as any;
          setFormData(prev => ({
            ...prev,
            address: addr?.street ? `${addr.street}, ${addr.number || ""}`.trim() : addr?.address || "",
            neighborhood: addr?.neighborhood || "",
            complement: addr?.complement || ""
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadUserProfile();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const baseDeliveryFee = settings?.delivery_fee || 0;
  const freeDeliveryThreshold = settings?.free_delivery_threshold;
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate delivery fee: express adds extra, check free delivery threshold
  const expressExtra = deliveryTime === "express" ? 7 : 0;
  const deliveryFee = freeDeliveryThreshold && subtotal >= freeDeliveryThreshold 
    ? 0 
    : baseDeliveryFee + expressExtra;
  
  // Recalculate discount when subtotal changes
  const currentDiscount = appliedCoupon ? recalculateDiscount(subtotal) : 0;
  const total = subtotal + deliveryFee - currentDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    const result = await applyCoupon(couponCode, subtotal);
    
    if (result.valid) {
      toast({
        title: "Cupom aplicado! 🎉",
        description: result.coupon?.discount_type === "percentage" 
          ? `${result.coupon?.discount_value}% de desconto`
          : formatPrice(result.discount || 0) + " de desconto",
      });
      setCouponCode("");
      setShowCouponInput(false);
    } else {
      toast({
        title: "Cupom inválido",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast({ title: "Cupom removido" });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para finalizar.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    const missingFields = [];
    if (!formData.address.trim()) missingFields.push("Endereço");
    if (!formData.neighborhood.trim()) missingFields.push("Bairro");

    if (missingFields.length > 0) {
      toast({
        title: "Endereço incompleto",
        description: `Preencha: ${missingFields.join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const paymentLabels: Record<string, string> = {
        pix: "PIX",
        cartao: "Cartão na Entrega",
        dinheiro: "Dinheiro na Entrega"
      };

      const orderData = {
        address: formData,
        paymentMethod: paymentLabels[paymentMethod] || "PIX",
        deliveryTime: deliveryTime === "standard" ? "20-30 min" : "10-15 min",
        deliveryFee,
        couponDiscount: currentDiscount,
        appliedCoupon: appliedCoupon ? {
          code: appliedCoupon.code,
          discount_type: appliedCoupon.discount_type,
          discount_value: appliedCoupon.discount_value,
        } : null,
        notes: ""
      };

      const result = await placeOrder(orderData);
      
      if (result.success) {
        // Record coupon usage if a coupon was applied
        if (appliedCoupon && result.orderId) {
          await recordCouponUse(result.orderId);
        }
        
        toast({
          title: "Pedido realizado! 🎉",
          description: `#${result.orderId?.slice(0, 8)}`,
        });
        navigate("/orders");
      } else {
        toast({
          title: "Erro no pedido",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const hasAddress = formData.address.trim() && formData.neighborhood.trim();
  const isAddressComplete = hasAddress;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 pb-24">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Carrinho vazio</h2>
        <p className="text-muted-foreground text-center mb-6">
          Adicione produtos antes de finalizar
        </p>
        <Link to="/">
          <Button className="h-12 px-8">Ver produtos</Button>
        </Link>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-44">
      {/* Header Mobile */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 touch-manipulation">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">Finalizar Pedido</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Itens do Pedido */}
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Itens ({getTotalItems()})
            </h3>
            <Link to="/cart" className="text-sm text-primary">Editar</Link>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-medium">
                    {item.quantity}x
                  </span>
                  <span className="truncate text-xs">{item.name}</span>
                </div>
                <span className="font-medium text-xs ml-2">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Endereço de Entrega */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-green-600" />
              Endereço de Entrega
            </h3>
            
            {hasAddress && !isEditingAddress ? (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium">{formData.address}</p>
                <p className="text-sm text-muted-foreground">
                  {formData.neighborhood}, SENHOR DO BONFIM - BA
                </p>
                <p className="text-sm text-muted-foreground">CEP: 48970-000</p>
                {formData.complement && (
                  <p className="text-sm text-muted-foreground">{formData.complement}</p>
                )}
                <button 
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs text-primary font-medium mt-2"
                >
                  Editar endereço
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">CEP</Label>
                    <Input 
                      value="48970-000"
                      className="h-11 bg-muted cursor-not-allowed"
                      readOnly
                      disabled
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Cidade</Label>
                    <Input 
                      value="SENHOR DO BONFIM"
                      className="h-11 bg-muted cursor-not-allowed text-xs"
                      readOnly
                      disabled
                    />
                  </div>
                  <div>
                    <Label className="text-xs">UF</Label>
                    <Input 
                      value="BA"
                      className="h-11 bg-muted cursor-not-allowed"
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Bairro *</Label>
                  <Input 
                    placeholder="Bairro" 
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                    className="h-11"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Endereço (Rua, Número) *</Label>
                  <Input 
                    placeholder="Rua Exemplo, 123" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="h-11"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Complemento</Label>
                  <Input 
                    placeholder="Apto, bloco (opcional)" 
                    value={formData.complement}
                    onChange={(e) => setFormData({...formData, complement: e.target.value})}
                    className="h-11"
                  />
                </div>
                <p className="text-xs text-muted-foreground">* Campos obrigatórios</p>
                {isEditingAddress && hasAddress && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditingAddress(false)}
                    className="w-full mt-2"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tempo de Entrega */}
        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-blue-600" />
            Tempo de Entrega
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setDeliveryTime("standard")}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all touch-manipulation ${
                deliveryTime === "standard" 
                  ? "border-primary bg-primary/5" 
                  : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className={`h-5 w-5 ${deliveryTime === "standard" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <p className="font-medium">Padrão</p>
                  <p className="text-xs text-muted-foreground">20-30 minutos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatPrice(5.90)}</p>
                {deliveryTime === "standard" && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setDeliveryTime("express")}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all touch-manipulation ${
                deliveryTime === "express" 
                  ? "border-primary bg-primary/5" 
                  : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className={`h-5 w-5 ${deliveryTime === "express" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <p className="font-medium">Expressa</p>
                  <p className="text-xs text-muted-foreground">10-15 minutos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatPrice(12.90)}</p>
                {deliveryTime === "express" && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Forma de Pagamento */}
        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-purple-600" />
            Forma de Pagamento *
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setPaymentMethod("pix")}
              className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all touch-manipulation ${
                paymentMethod === "pix" 
                  ? "border-primary bg-primary/10" 
                  : "border-border bg-muted/50"
              }`}
            >
              <span className={`text-lg font-bold ${paymentMethod === "pix" ? "text-primary" : "text-muted-foreground"}`}>PIX</span>
              {paymentMethod === "pix" && (
                <Check className="h-3 w-3 text-primary" />
              )}
            </button>
            <button
              onClick={() => setPaymentMethod("cartao")}
              className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all touch-manipulation ${
                paymentMethod === "cartao" 
                  ? "border-primary bg-primary/10" 
                  : "border-border bg-muted/50"
              }`}
            >
              <CreditCard className={`h-5 w-5 ${paymentMethod === "cartao" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium ${paymentMethod === "cartao" ? "text-primary" : ""}`}>Cartão</span>
              {paymentMethod === "cartao" && (
                <Check className="h-3 w-3 text-primary" />
              )}
            </button>
            <button
              onClick={() => setPaymentMethod("dinheiro")}
              className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all touch-manipulation ${
                paymentMethod === "dinheiro" 
                  ? "border-primary bg-primary/10" 
                  : "border-border bg-muted/50"
              }`}
            >
              <Banknote className={`h-5 w-5 ${paymentMethod === "dinheiro" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium ${paymentMethod === "dinheiro" ? "text-primary" : ""}`}>Dinheiro</span>
              {paymentMethod === "dinheiro" && (
                <Check className="h-3 w-3 text-primary" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {paymentMethod === "pix" && "Você receberá o código PIX após confirmar o pedido"}
            {paymentMethod === "cartao" && "Pague com cartão de crédito ou débito na entrega"}
            {paymentMethod === "dinheiro" && "Pague em dinheiro na entrega"}
          </p>
        </div>

        {/* Cupom de Desconto */}
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-orange-600" />
              Cupom
            </h3>
            {!appliedCoupon && !showCouponInput && (
              <button 
                onClick={() => setShowCouponInput(true)}
                className="text-sm text-primary font-medium"
              >
                Adicionar
              </button>
            )}
          </div>

          {appliedCoupon && (
            <div className="mt-3 flex items-center justify-between p-3 bg-green-500/10 rounded-xl">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-green-700">{appliedCoupon.code}</p>
                  <p className="text-xs text-green-600">-{formatPrice(currentDiscount)}</p>
                </div>
              </div>
              <button onClick={handleRemoveCoupon} className="p-1 text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {showCouponInput && !appliedCoupon && (
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Código do cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                className="h-11"
              />
              <Button 
                onClick={handleApplyCoupon} 
                disabled={isValidating || !couponCode.trim()}
                className="h-11 px-4"
              >
                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom - Resumo e Botão */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-40">
        <div className="px-4 py-3 space-y-2">
          {/* Resumo dos valores */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrega</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            {currentDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto</span>
                <span>-{formatPrice(currentDiscount)}</span>
              </div>
            )}
          </div>

          {/* Total e Botão */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{formatPrice(total)}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {!hasAddress && (
                <p className="text-xs text-destructive">Preencha o endereço</p>
              )}
              <Button 
                size="lg"
                className="h-14 px-8 text-base font-semibold"
                onClick={handlePlaceOrder}
                disabled={isProcessing || !hasAddress || isEditingAddress}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Pedir
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
