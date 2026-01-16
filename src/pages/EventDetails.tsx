import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Calendar, MapPin, Clock, ArrowLeft, Ticket, Users, 
  Minus, Plus, ShoppingCart, CreditCard, Share2, Heart,
  CheckCircle, AlertCircle, Sparkles, Star, ChevronDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  event_time: string;
  location: string | null;
  image_url: string | null;
  is_active: boolean;
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
}

interface SelectedTicket {
  ticketType: TicketType;
  quantity: number;
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [openSection, setOpenSection] = useState<string>("tickets");

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    
    const [eventResult, ticketsResult] = await Promise.all([
      supabase.from("events").select("*").eq("id", id).maybeSingle(),
      supabase.from("ticket_types").select("*").eq("event_id", id).eq("is_active", true).order("price", { ascending: true }),
    ]);

    if (eventResult.error) {
      console.error("Error fetching event:", eventResult.error);
      toast({ title: "Erro ao carregar evento", variant: "destructive" });
      navigate("/events");
      return;
    }

    setEvent(eventResult.data);
    setTicketTypes(ticketsResult.data || []);
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatEventDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return {
      day: format(date, "dd", { locale: ptBR }),
      month: format(date, "MMMM", { locale: ptBR }),
      year: format(date, "yyyy", { locale: ptBR }),
      weekday: format(date, "EEEE", { locale: ptBR }),
      full: format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
    };
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const getAvailableQuantity = (ticket: TicketType) => {
    return ticket.quantity_available - ticket.quantity_sold;
  };

  const updateTicketQuantity = (ticketId: string, delta: number) => {
    setSelectedTickets((prev) => {
      const current = prev[ticketId] || 0;
      const ticket = ticketTypes.find((t) => t.id === ticketId);
      if (!ticket) return prev;
      
      const available = getAvailableQuantity(ticket);
      const newQuantity = Math.max(0, Math.min(current + delta, available, 10));
      
      if (newQuantity === 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [ticketId]: newQuantity };
    });
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find((t) => t.id === ticketId);
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para comprar ingressos",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (getTotalTickets() === 0) {
      toast({
        title: "Selecione ingressos",
        description: "Adicione pelo menos um ingresso ao carrinho",
        variant: "destructive",
      });
      return;
    }
    
    setShowConfirmDialog(true);
  };

  const confirmPurchase = async () => {
    setPurchasing(true);
    
    try {
      // Update ticket quantities sold and create ticket_sales records
      for (const [ticketId, quantity] of Object.entries(selectedTickets)) {
        const ticket = ticketTypes.find((t) => t.id === ticketId);
        if (!ticket) continue;
        
        // Update quantity sold
        const { error: updateError } = await supabase
          .from("ticket_types")
          .update({ quantity_sold: ticket.quantity_sold + quantity })
          .eq("id", ticketId);
        
        if (updateError) throw updateError;

        // Create ticket sale record for financial tracking
        const { error: saleError } = await supabase
          .from("ticket_sales")
          .insert({
            user_id: user!.id,
            event_id: id,
            ticket_type_id: ticketId,
            quantity: quantity,
            unit_price: ticket.price,
            total_price: ticket.price * quantity,
            payment_status: 'completed'
          });
        
        if (saleError) throw saleError;
      }
      
      // Show success
      setPurchaseSuccess(true);
      setSelectedTickets({});
      
      // Refresh data
      await fetchEventDetails();
      
      toast({
        title: "Compra realizada!",
        description: "Seus ingressos foram reservados com sucesso.",
      });
    } catch (error) {
      console.error("Error purchasing tickets:", error);
      toast({
        title: "Erro na compra",
        description: "Não foi possível completar a compra. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.name,
          text: `Confira o evento: ${event.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copiado!" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearchChange={() => {}} cartCount={getTotalItems()} />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 md:h-96 w-full rounded-2xl mb-6" />
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearchChange={() => {}} cartCount={getTotalItems()} />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Evento não encontrado</h1>
          <p className="text-muted-foreground mb-6">O evento que você está procurando não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/events">Ver todos os eventos</Link>
          </Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const dateInfo = formatEventDate(event.event_date);
  const isEventPast = isBefore(parseISO(event.event_date), new Date());
  const totalAvailable = ticketTypes.reduce((sum, t) => sum + getAvailableQuantity(t), 0);

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header onSearchChange={() => {}} cartCount={getTotalItems()} />
      
      {/* Hero Image */}
      <div className="relative h-64 md:h-[450px] overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary-dark flex items-center justify-center">
            <Ticket className="w-24 h-24 text-white/30" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm shadow-lg"
          onClick={() => navigate("/events")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm shadow-lg"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm shadow-lg"
          >
            <Heart className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Date Badge */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-card rounded-2xl p-4 shadow-xl border border-border">
          <div className="text-3xl md:text-4xl font-bold text-primary leading-none">{dateInfo.day}</div>
          <div className="text-sm font-medium text-muted-foreground capitalize">{dateInfo.month}</div>
        </div>
        
        {/* Status Badge */}
        {isEventPast ? (
          <Badge variant="secondary" className="absolute bottom-4 right-4 bg-muted text-muted-foreground">
            Evento encerrado
          </Badge>
        ) : totalAvailable === 0 ? (
          <Badge variant="destructive" className="absolute bottom-4 right-4">
            Esgotado
          </Badge>
        ) : totalAvailable <= 50 ? (
          <Badge className="absolute bottom-4 right-4 bg-amber-500 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Últimas vagas
          </Badge>
        ) : null}
      </div>

      <div className="container mx-auto px-4 -mt-2">
        {/* Event Info */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            {event.name}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground capitalize">{dateInfo.weekday}</div>
                <div className="text-xs">{dateInfo.full}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{formatTime(event.event_time)}</div>
                <div className="text-xs">Horário</div>
              </div>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{event.location}</div>
                  <div className="text-xs">Local</div>
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <Collapsible open={openSection === "about"} onOpenChange={() => setOpenSection(openSection === "about" ? "" : "about")}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-y border-border">
                <span className="font-semibold text-foreground">Sobre o evento</span>
                <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", openSection === "about" && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent className="py-4">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Tickets Section */}
        <Collapsible open={openSection === "tickets"} onOpenChange={() => setOpenSection(openSection === "tickets" ? "" : "tickets")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-y border-border">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Ingressos</span>
            </div>
            <div className="flex items-center gap-2">
              {totalAvailable > 0 && (
                <Badge variant="outline" className="text-xs">
                  {totalAvailable} disponíveis
                </Badge>
              )}
              <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", openSection === "tickets" && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="py-4">
            <div className="space-y-4">
              {ticketTypes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum tipo de ingresso disponível</p>
                </div>
              ) : (
                ticketTypes.map((ticket) => {
                  const available = getAvailableQuantity(ticket);
                  const selected = selectedTickets[ticket.id] || 0;
                  const isSoldOut = available === 0;
                  const isVIP = ticket.name.toLowerCase().includes("vip") || ticket.name.toLowerCase().includes("camarote");
                  
                  return (
                    <Card
                      key={ticket.id}
                      className={cn(
                        "p-4 border-2 transition-all duration-200",
                        selected > 0 ? "border-primary bg-primary/5" : "border-border",
                        isSoldOut && "opacity-60",
                        isVIP && "relative overflow-hidden"
                      )}
                    >
                      {isVIP && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-400 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                          <Star className="w-3 h-3 inline mr-1" />
                          Mais vendido
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{ticket.name}</h3>
                          </div>
                          {ticket.description && (
                            <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                          )}
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-primary">
                              {formatCurrency(ticket.price)}
                            </span>
                            {!isSoldOut && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {available} restantes
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {isSoldOut ? (
                            <Badge variant="secondary" className="bg-muted text-muted-foreground">
                              Esgotado
                            </Badge>
                          ) : isEventPast ? (
                            <Badge variant="secondary">Encerrado</Badge>
                          ) : (
                            <div className="flex items-center gap-2 bg-secondary rounded-full p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => updateTicketQuantity(ticket.id, -1)}
                                disabled={selected === 0}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-6 text-center font-semibold">{selected}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => updateTicketQuantity(ticket.id, 1)}
                                disabled={selected >= Math.min(available, 10)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Fixed Bottom Purchase Bar */}
      {!isEventPast && totalAvailable > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border p-4 z-40">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">
                {getTotalTickets() > 0 ? `${getTotalTickets()} ingresso(s)` : "Selecione ingressos"}
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(getTotalPrice())}
              </div>
            </div>
            <Button
              size="lg"
              className="px-8 rounded-full"
              onClick={handlePurchase}
              disabled={getTotalTickets() === 0}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Comprar
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          {purchaseSuccess ? (
            <>
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <DialogTitle className="text-2xl mb-2">Compra Confirmada!</DialogTitle>
                <DialogDescription>
                  Seus ingressos foram reservados com sucesso. Apresente este comprovante na entrada do evento.
                </DialogDescription>
              </div>
              <DialogFooter>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setPurchaseSuccess(false);
                  }}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Compra</DialogTitle>
                <DialogDescription>
                  Revise seus ingressos antes de confirmar
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-3">
                {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
                  const ticket = ticketTypes.find((t) => t.id === ticketId);
                  if (!ticket) return null;
                  
                  return (
                    <div key={ticketId} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{ticket.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {quantity}x {formatCurrency(ticket.price)}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(ticket.price * quantity)}
                      </div>
                    </div>
                  );
                })}
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(getTotalPrice())}</span>
                </div>
              </div>
              
              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button 
                  className="w-full" 
                  onClick={confirmPurchase}
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <>Processando...</>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Confirmar Compra
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={purchasing}
                >
                  Cancelar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default EventDetails;
