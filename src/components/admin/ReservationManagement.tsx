import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  CalendarIcon,
  Users,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  LogIn,
  MessageCircle,
  Grid3X3,
  List,
  Loader2,
} from "lucide-react";

type TableStatus = "free" | "reserved" | "occupied" | "unavailable";

interface DbTable {
  id: string;
  number: number;
  status: TableStatus;
  created_at: string;
  updated_at: string;
}

interface DbReservation {
  id: string;
  table_id: string;
  client_name: string;
  client_phone: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  created_at: string;
  updated_at: string;
}

interface TableWithReservation extends DbTable {
  reservation?: DbReservation;
}

const statusConfig = {
  free: { 
    label: "Livre", 
    color: "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400",
    badgeColor: "bg-emerald-500"
  },
  reserved: { 
    label: "Reservada", 
    color: "bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-400",
    badgeColor: "bg-amber-500"
  },
  occupied: { 
    label: "Ocupada", 
    color: "bg-red-500/20 border-red-500 text-red-700 dark:text-red-400",
    badgeColor: "bg-red-500"
  },
  unavailable: { 
    label: "Indisponível", 
    color: "bg-gray-500/20 border-gray-500 text-gray-700 dark:text-gray-400",
    badgeColor: "bg-gray-500"
  },
};

export const ReservationManagement = () => {
  const { toast } = useToast();
  const [tables, setTables] = useState<TableWithReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [isManageSheetOpen, setIsManageSheetOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableWithReservation | null>(null);
  
  const [reservationForm, setReservationForm] = useState({
    clientName: "",
    whatsapp: "",
    date: new Date(),
    time: "",
    partySize: "",
  });

  const fetchTablesAndReservations = async () => {
    try {
      setLoading(true);
      
      // Fetch tables
      const { data: tablesData, error: tablesError } = await supabase
        .from("tables")
        .select("*")
        .order("number");
      
      if (tablesError) throw tablesError;

      // Fetch reservations for selected date
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data: reservationsData, error: reservationsError } = await supabase
        .from("reservations")
        .select("*")
        .eq("reservation_date", dateStr);
      
      if (reservationsError) throw reservationsError;

      // Merge tables with reservations
      const tablesWithReservations: TableWithReservation[] = (tablesData || []).map((table) => {
        const reservation = (reservationsData || []).find(r => r.table_id === table.id);
        return {
          ...table,
          status: table.status as TableStatus,
          reservation: reservation || undefined
        };
      });

      setTables(tablesWithReservations);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as mesas e reservas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTablesAndReservations();
  }, [selectedDate]);

  const handleTableClick = (table: TableWithReservation) => {
    setSelectedTable(table);
    
    if (table.status === "free") {
      setReservationForm({
        clientName: "",
        whatsapp: "",
        date: selectedDate,
        time: "",
        partySize: "",
      });
      setIsNewReservationOpen(true);
    } else if (table.status === "reserved" || table.status === "occupied") {
      setIsManageSheetOpen(true);
    }
  };

  const handleConfirmReservation = async () => {
    if (!selectedTable) return;
    
    if (!reservationForm.clientName || !reservationForm.whatsapp || !reservationForm.time || !reservationForm.partySize) {
      toast({
        title: "Preencha todos os campos",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Update table status
      const { error: tableError } = await supabase
        .from("tables")
        .update({ status: "reserved" })
        .eq("id", selectedTable.id);

      if (tableError) throw tableError;

      // Create reservation
      const { error: reservationError } = await supabase
        .from("reservations")
        .insert({
          table_id: selectedTable.id,
          client_name: reservationForm.clientName,
          client_phone: reservationForm.whatsapp,
          reservation_date: format(reservationForm.date, "yyyy-MM-dd"),
          reservation_time: reservationForm.time,
          party_size: parseInt(reservationForm.partySize),
        });

      if (reservationError) throw reservationError;

      toast({
        title: "Reserva confirmada!",
        description: `Mesa ${selectedTable.number} reservada para ${reservationForm.clientName}`,
      });

      setIsNewReservationOpen(false);
      setSelectedTable(null);
      fetchTablesAndReservations();
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast({
        title: "Erro ao criar reserva",
        description: "Não foi possível criar a reserva. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedTable) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("tables")
        .update({ status: "occupied" })
        .eq("id", selectedTable.id);

      if (error) throw error;

      toast({
        title: "Check-in realizado!",
        description: `Mesa ${selectedTable.number} agora está ocupada.`,
      });

      setIsManageSheetOpen(false);
      setSelectedTable(null);
      fetchTablesAndReservations();
    } catch (error) {
      console.error("Error doing check-in:", error);
      toast({
        title: "Erro ao fazer check-in",
        description: "Não foi possível fazer o check-in. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedTable) return;

    try {
      setSaving(true);

      // Update table status
      const { error: tableError } = await supabase
        .from("tables")
        .update({ status: "free" })
        .eq("id", selectedTable.id);

      if (tableError) throw tableError;

      // Delete reservation if exists
      if (selectedTable.reservation) {
        const { error: reservationError } = await supabase
          .from("reservations")
          .delete()
          .eq("id", selectedTable.reservation.id);

        if (reservationError) throw reservationError;
      }

      toast({
        title: "Mesa liberada!",
        description: `Mesa ${selectedTable.number} está disponível novamente.`,
      });

      setIsManageSheetOpen(false);
      setSelectedTable(null);
      fetchTablesAndReservations();
    } catch (error) {
      console.error("Error finalizing:", error);
      toast({
        title: "Erro ao liberar mesa",
        description: "Não foi possível liberar a mesa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedTable) return;

    try {
      setSaving(true);

      // Update table status
      const { error: tableError } = await supabase
        .from("tables")
        .update({ status: "free" })
        .eq("id", selectedTable.id);

      if (tableError) throw tableError;

      // Delete reservation
      if (selectedTable.reservation) {
        const { error: reservationError } = await supabase
          .from("reservations")
          .delete()
          .eq("id", selectedTable.reservation.id);

        if (reservationError) throw reservationError;
      }

      toast({
        title: "Reserva cancelada",
        description: `A reserva da Mesa ${selectedTable.number} foi cancelada.`,
      });

      setIsManageSheetOpen(false);
      setSelectedTable(null);
      fetchTablesAndReservations();
    } catch (error) {
      console.error("Error canceling:", error);
      toast({
        title: "Erro ao cancelar reserva",
        description: "Não foi possível cancelar a reserva. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://wa.me/${encodeURIComponent(formattedPhone)}`, "_blank");
  };

  // Filter reservations for today's list
  const todayReservations = tables
    .filter(t => t.reservation && (t.status === "reserved" || t.status === "occupied"))
    .sort((a, b) => {
      if (!a.reservation || !b.reservation) return 0;
      return a.reservation.reservation_time.localeCompare(b.reservation.reservation_time);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Date Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestão de Reservas</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as mesas e reservas do estabelecimento
          </p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "PPP", { locale: ptBR })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(statusConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", config.badgeColor)} />
            <span className="text-sm text-muted-foreground">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Mesas
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Próximas Reservas
          </TabsTrigger>
        </TabsList>

        {/* Grid View */}
        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map((table) => (
              <Card
                key={table.id}
                onClick={() => table.status !== "unavailable" && handleTableClick(table)}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:scale-105 border-2",
                  statusConfig[table.status].color,
                  table.status === "unavailable" && "opacity-60 cursor-not-allowed"
                )}
              >
                <CardContent className="p-4 min-h-[140px] flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">
                      Mesa {String(table.number).padStart(2, "0")}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs text-white", statusConfig[table.status].badgeColor)}
                    >
                      {statusConfig[table.status].label}
                    </Badge>
                  </div>
                  
                  {table.reservation && (
                    <div className="mt-auto space-y-1">
                      <p className="text-sm font-medium truncate">
                        {table.reservation.client_name}
                      </p>
                      <div className="flex items-center gap-1 text-xs opacity-80">
                        <Clock className="h-3 w-3" />
                        {table.reservation.reservation_time.slice(0, 5)}
                      </div>
                      <div className="flex items-center gap-1 text-xs opacity-80">
                        <Users className="h-3 w-3" />
                        {table.reservation.party_size} pessoas
                      </div>
                    </div>
                  )}
                  
                  {table.status === "free" && (
                    <div className="mt-auto flex items-center justify-center text-sm opacity-70">
                      Toque para reservar
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-6">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Próximas Reservas do Dia
              </h4>
              
              {todayReservations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma reserva para esta data
                </p>
              ) : (
                <div className="space-y-3">
                  {todayReservations.map((table) => (
                    <div
                      key={table.id}
                      onClick={() => handleTableClick(table)}
                      className={cn(
                        "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                        statusConfig[table.status].color
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold">
                              {table.reservation?.reservation_time.slice(0, 5)}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold">{table.reservation?.client_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Mesa {String(table.number).padStart(2, "0")} • {table.reservation?.party_size} pessoas
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={cn("text-white", statusConfig[table.status].badgeColor)}
                        >
                          {statusConfig[table.status].label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Reservation Dialog */}
      <Dialog open={isNewReservationOpen} onOpenChange={setIsNewReservationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Nova Reserva - Mesa {selectedTable?.number && String(selectedTable.number).padStart(2, "0")}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados para confirmar a reserva
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                placeholder="Digite o nome"
                value={reservationForm.clientName}
                onChange={(e) => setReservationForm(prev => ({ ...prev, clientName: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                placeholder="(11) 99999-9999"
                value={reservationForm.whatsapp}
                onChange={(e) => setReservationForm(prev => ({ ...prev, whatsapp: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(reservationForm.date, "dd/MM")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={reservationForm.date}
                      onSelect={(date) => date && setReservationForm(prev => ({ ...prev, date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={reservationForm.time}
                  onChange={(e) => setReservationForm(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="partySize">Quantidade de Pessoas</Label>
              <Input
                id="partySize"
                type="number"
                min="1"
                placeholder="Ex: 4"
                value={reservationForm.partySize}
                onChange={(e) => setReservationForm(prev => ({ ...prev, partySize: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsNewReservationOpen(false)} className="flex-1" disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmReservation} className="flex-1" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Confirmar Reserva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Reservation Sheet */}
      <Sheet open={isManageSheetOpen} onOpenChange={setIsManageSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              Mesa {selectedTable?.number && String(selectedTable.number).padStart(2, "0")}
            </SheetTitle>
            <SheetDescription>
              {selectedTable && (
                <Badge 
                  className={cn("text-white mt-2", statusConfig[selectedTable.status].badgeColor)}
                >
                  {statusConfig[selectedTable.status].label}
                </Badge>
              )}
            </SheetDescription>
          </SheetHeader>
          
          {selectedTable?.reservation && (
            <div className="mt-6 space-y-6">
              {/* Client Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{selectedTable.reservation.client_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedTable.reservation.party_size} pessoas
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{selectedTable.reservation.reservation_time.slice(0, 5)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(selectedTable.reservation.reservation_date), "PPP", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{selectedTable.reservation.client_phone}</p>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={() => openWhatsApp(selectedTable.reservation!.client_phone)}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={saving}
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
                  Abrir WhatsApp
                </Button>
                
                {selectedTable.status === "reserved" && (
                  <Button
                    onClick={handleCheckIn}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="mr-2 h-4 w-4" />
                    )}
                    Fazer Check-in
                  </Button>
                )}
                
                <Button
                  onClick={handleFinalize}
                  variant="outline"
                  className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Finalizar / Liberar Mesa
                </Button>
                
                {selectedTable.status === "reserved" && (
                  <Button
                    onClick={handleCancelReservation}
                    variant="outline"
                    className="w-full border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Cancelar Reserva
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
