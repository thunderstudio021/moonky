import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Ticket, Calendar, MapPin, Clock, Users, DollarSign, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  event_date: string;
  event_time: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
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

export const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Event form state
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    location: "",
    event_date: "",
    event_time: "",
    image_url: "",
    is_active: true
  });

  // Ticket form state
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [ticketForm, setTicketForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity_available: "",
    is_active: true
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchTicketTypes(selectedEvent.id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      if (data && data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketTypes = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("ticket_types")
        .select("*")
        .eq("event_id", eventId)
        .order("price", { ascending: true });

      if (error) throw error;
      setTicketTypes(data || []);
    } catch (error) {
      console.error("Error fetching ticket types:", error);
      toast.error("Erro ao carregar ingressos");
    }
  };

  const openEventDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        name: event.name,
        description: event.description || "",
        location: event.location || "",
        event_date: event.event_date,
        event_time: event.event_time,
        image_url: event.image_url || "",
        is_active: event.is_active
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        name: "",
        description: "",
        location: "",
        event_date: "",
        event_time: "",
        image_url: "",
        is_active: true
      });
    }
    setEventDialogOpen(true);
  };

  const saveEvent = async () => {
    if (!eventForm.name || !eventForm.event_date || !eventForm.event_time) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from("events")
          .update({
            name: eventForm.name,
            description: eventForm.description || null,
            location: eventForm.location || null,
            event_date: eventForm.event_date,
            event_time: eventForm.event_time,
            image_url: eventForm.image_url || null,
            is_active: eventForm.is_active
          })
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast.success("Evento atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("events")
          .insert({
            name: eventForm.name,
            description: eventForm.description || null,
            location: eventForm.location || null,
            event_date: eventForm.event_date,
            event_time: eventForm.event_time,
            image_url: eventForm.image_url || null,
            is_active: eventForm.is_active
          });

        if (error) throw error;
        toast.success("Evento criado com sucesso!");
      }

      setEventDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Erro ao salvar evento");
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento? Todos os ingressos associados serão excluídos.")) {
      return;
    }

    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Evento excluído com sucesso!");
      if (selectedEvent?.id === id) {
        setSelectedEvent(null);
        setTicketTypes([]);
      }
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Erro ao excluir evento");
    }
  };

  const toggleEventStatus = async (event: Event) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ is_active: !event.is_active })
        .eq("id", event.id);

      if (error) throw error;
      toast.success(event.is_active ? "Evento desativado" : "Evento ativado");
      fetchEvents();
    } catch (error) {
      console.error("Error toggling event status:", error);
      toast.error("Erro ao alterar status");
    }
  };

  const openTicketDialog = (ticket?: TicketType) => {
    if (ticket) {
      setEditingTicket(ticket);
      setTicketForm({
        name: ticket.name,
        description: ticket.description || "",
        price: ticket.price.toString(),
        quantity_available: ticket.quantity_available.toString(),
        is_active: ticket.is_active
      });
    } else {
      setEditingTicket(null);
      setTicketForm({
        name: "",
        description: "",
        price: "",
        quantity_available: "",
        is_active: true
      });
    }
    setTicketDialogOpen(true);
  };

  const saveTicket = async () => {
    if (!selectedEvent) {
      toast.error("Selecione um evento primeiro");
      return;
    }

    if (!ticketForm.name || !ticketForm.price || !ticketForm.quantity_available) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      if (editingTicket) {
        const { error } = await supabase
          .from("ticket_types")
          .update({
            name: ticketForm.name,
            description: ticketForm.description || null,
            price: parseFloat(ticketForm.price),
            quantity_available: parseInt(ticketForm.quantity_available),
            is_active: ticketForm.is_active
          })
          .eq("id", editingTicket.id);

        if (error) throw error;
        toast.success("Ingresso atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("ticket_types")
          .insert({
            event_id: selectedEvent.id,
            name: ticketForm.name,
            description: ticketForm.description || null,
            price: parseFloat(ticketForm.price),
            quantity_available: parseInt(ticketForm.quantity_available),
            is_active: ticketForm.is_active
          });

        if (error) throw error;
        toast.success("Ingresso criado com sucesso!");
      }

      setTicketDialogOpen(false);
      fetchTicketTypes(selectedEvent.id);
    } catch (error) {
      console.error("Error saving ticket:", error);
      toast.error("Erro ao salvar ingresso");
    }
  };

  const deleteTicket = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este tipo de ingresso?")) {
      return;
    }

    try {
      const { error } = await supabase.from("ticket_types").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Ingresso excluído com sucesso!");
      if (selectedEvent) {
        fetchTicketTypes(selectedEvent.id);
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Erro ao excluir ingresso");
    }
  };

  const toggleTicketStatus = async (ticket: TicketType) => {
    try {
      const { error } = await supabase
        .from("ticket_types")
        .update({ is_active: !ticket.is_active })
        .eq("id", ticket.id);

      if (error) throw error;
      toast.success(ticket.is_active ? "Ingresso desativado" : "Ingresso ativado");
      if (selectedEvent) {
        fetchTicketTypes(selectedEvent.id);
      }
    } catch (error) {
      console.error("Error toggling ticket status:", error);
      toast.error("Erro ao alterar status");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const getEventStats = (event: Event) => {
    const eventTickets = ticketTypes.filter(t => t.event_id === event.id);
    const totalAvailable = eventTickets.reduce((sum, t) => sum + t.quantity_available, 0);
    const totalSold = eventTickets.reduce((sum, t) => sum + t.quantity_sold, 0);
    const totalRevenue = eventTickets.reduce((sum, t) => sum + (t.quantity_sold * t.price), 0);
    return { totalAvailable, totalSold, totalRevenue };
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Eventos e Ingressos</h2>
          <p className="text-muted-foreground">Gerencie eventos e tipos de ingressos</p>
        </div>
        <Button onClick={() => openEventDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">
            <Calendar className="mr-2 h-4 w-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="tickets" disabled={!selectedEvent}>
            <Ticket className="mr-2 h-4 w-4" />
            Ingressos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {events.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum evento cadastrado</p>
                <Button onClick={() => openEventDialog()} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Evento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedEvent?.id === event.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    {event.image_url ? (
                      <img 
                        src={event.image_url} 
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge 
                      className="absolute top-2 right-2"
                      variant={event.is_active ? "default" : "secondary"}
                    >
                      {event.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">{event.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(event.event_date + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.event_time.substring(0, 5)}
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); openEventDialog(event); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); toggleEventStatus(event); }}
                      >
                        {event.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          {selectedEvent && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedEvent.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedEvent.event_date + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedEvent.event_time.substring(0, 5)}
                      </p>
                    </div>
                    <Button onClick={() => openTicketDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Ingresso
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {ticketTypes.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum tipo de ingresso cadastrado</p>
                    <Button onClick={() => openTicketDialog()} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Ingresso
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo de Ingresso</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-center">Disponíveis</TableHead>
                        <TableHead className="text-center">Vendidos</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ticketTypes.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {ticket.description || "-"}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(ticket.price)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{ticket.quantity_available}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{ticket.quantity_sold}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={ticket.is_active ? "default" : "secondary"}>
                              {ticket.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openTicketDialog(ticket)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => toggleTicketStatus(ticket)}
                              >
                                {ticket.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteTicket(ticket.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}

              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Disponível</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {ticketTypes.reduce((sum, t) => sum + t.quantity_available, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">ingressos disponíveis</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {ticketTypes.reduce((sum, t) => sum + t.quantity_sold, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">ingressos vendidos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(ticketTypes.reduce((sum, t) => sum + (t.quantity_sold * t.price), 0))}
                    </div>
                    <p className="text-xs text-muted-foreground">em vendas de ingressos</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Editar Evento" : "Novo Evento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-name">Nome do Evento *</Label>
              <Input
                id="event-name"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                placeholder="Ex: Show de Rock"
              />
            </div>
            <div>
              <Label htmlFor="event-description">Descrição</Label>
              <Textarea
                id="event-description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Descreva o evento..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="event-location">Local</Label>
              <Input
                id="event-location"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="Ex: Arena Moonky"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-date">Data *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={eventForm.event_date}
                  onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="event-time">Horário *</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={eventForm.event_time}
                  onChange={(e) => setEventForm({ ...eventForm, event_time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Imagem do Evento</Label>
              <ImageUpload
                currentImageUrl={eventForm.image_url}
                onImageUploaded={(url) => setEventForm({ ...eventForm, image_url: url })}
                bucketName="event-images"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="event-active"
                checked={eventForm.is_active}
                onCheckedChange={(checked) => setEventForm({ ...eventForm, is_active: checked })}
              />
              <Label htmlFor="event-active">Evento ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEvent}>
              {editingEvent ? "Salvar Alterações" : "Criar Evento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTicket ? "Editar Ingresso" : "Novo Tipo de Ingresso"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ticket-name">Nome do Ingresso *</Label>
              <Input
                id="ticket-name"
                value={ticketForm.name}
                onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                placeholder="Ex: Pista, VIP, Camarote"
              />
            </div>
            <div>
              <Label htmlFor="ticket-description">Descrição</Label>
              <Textarea
                id="ticket-description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                placeholder="Benefícios inclusos, regras, etc."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticket-price">Preço (R$) *</Label>
                <Input
                  id="ticket-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={ticketForm.price}
                  onChange={(e) => setTicketForm({ ...ticketForm, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="ticket-quantity">Quantidade Disponível *</Label>
                <Input
                  id="ticket-quantity"
                  type="number"
                  min="0"
                  value={ticketForm.quantity_available}
                  onChange={(e) => setTicketForm({ ...ticketForm, quantity_available: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ticket-active"
                checked={ticketForm.is_active}
                onCheckedChange={(checked) => setTicketForm({ ...ticketForm, is_active: checked })}
              />
              <Label htmlFor="ticket-active">Ingresso ativo (disponível para venda)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTicketDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveTicket}>
              {editingTicket ? "Salvar Alterações" : "Criar Ingresso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
