import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ImageUpload";
import { 
  Store, 
  Palette, 
  DollarSign, 
  Share2, 
  Loader2, 
  Save,
  Clock,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook
} from "lucide-react";

interface StoreSettingsData {
  id: string;
  store_name: string;
  store_description: string | null;
  store_logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  opening_hours: any;
  primary_color: string | null;
  secondary_color: string | null;
  default_theme: string | null;
  minimum_order_value: number | null;
  delivery_fee: number | null;
  free_delivery_threshold: number | null;
  delivery_cep: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  show_age_restriction: boolean | null;
}

const defaultOpeningHours = {
  monday: { open: "08:00", close: "22:00" },
  tuesday: { open: "08:00", close: "22:00" },
  wednesday: { open: "08:00", close: "22:00" },
  thursday: { open: "08:00", close: "22:00" },
  friday: { open: "08:00", close: "22:00" },
  saturday: { open: "08:00", close: "22:00" },
  sunday: { open: "08:00", close: "22:00" },
};

const dayNames: { [key: string]: string } = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

export function StoreSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettingsData | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error: any) {
      console.error("Error loading settings:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("store_settings")
        .update(settings)
        .eq("id", settings.id);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof StoreSettingsData, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const updateOpeningHour = (day: string, type: 'open' | 'close', value: string) => {
    if (!settings) return;
    const hours = settings.opening_hours || defaultOpeningHours;
    setSettings({
      ...settings,
      opening_hours: {
        ...hours,
        [day]: { ...hours[day], [type]: value }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Configurações não encontradas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações da Loja</h2>
          <p className="text-muted-foreground">Personalize sua loja</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="info" className="gap-2">
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Informações</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Negócio</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Redes</span>
          </TabsTrigger>
        </TabsList>

        {/* Store Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Dados da Loja
                </CardTitle>
                <CardDescription>Informações básicas da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name">Nome da Loja</Label>
                  <Input
                    id="store_name"
                    value={settings.store_name || ""}
                    onChange={(e) => updateField("store_name", e.target.value)}
                    placeholder="Nome da sua loja"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store_description">Descrição</Label>
                  <Textarea
                    id="store_description"
                    value={settings.store_description || ""}
                    onChange={(e) => updateField("store_description", e.target.value)}
                    placeholder="Uma breve descrição da sua loja"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo da Loja</Label>
                  <ImageUpload
                    currentImageUrl={settings.store_logo_url || ""}
                    onImageUploaded={(url) => updateField("store_logo_url", url)}
                    bucketName="banners"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contato
                </CardTitle>
                <CardDescription>Informações de contato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={settings.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(00) 0000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={settings.whatsapp || ""}
                    onChange={(e) => updateField("whatsapp", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="contato@loja.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    value={settings.address || ""}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Endereço completo da loja"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horário de Funcionamento
              </CardTitle>
              <CardDescription>Configure os horários de abertura e fechamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Object.keys(dayNames).map((day) => {
                  const hours = settings.opening_hours?.[day] || defaultOpeningHours[day as keyof typeof defaultOpeningHours];
                  return (
                    <div key={day} className="p-4 border rounded-lg space-y-3">
                      <p className="font-medium">{dayNames[day]}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Abre</Label>
                          <Input
                            type="time"
                            value={hours?.open || "08:00"}
                            onChange={(e) => updateOpeningHour(day, 'open', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Fecha</Label>
                          <Input
                            type="time"
                            value={hours?.close || "22:00"}
                            onChange={(e) => updateOpeningHour(day, 'close', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Cores e Tema
              </CardTitle>
              <CardDescription>Personalize as cores da sua loja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Cor Principal</Label>
                  <div className="flex gap-3">
                    <Input
                      id="primary_color"
                      type="color"
                      value={settings.primary_color || "#3834ED"}
                      onChange={(e) => updateField("primary_color", e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.primary_color || "#3834ED"}
                      onChange={(e) => updateField("primary_color", e.target.value)}
                      placeholder="#3834ED"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cor usada em botões, links e elementos de destaque
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Cor Secundária</Label>
                  <div className="flex gap-3">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={settings.secondary_color || "#6366F1"}
                      onChange={(e) => updateField("secondary_color", e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.secondary_color || ""}
                      onChange={(e) => updateField("secondary_color", e.target.value)}
                      placeholder="#6366F1"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cor complementar para gradientes e detalhes
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Tema Padrão</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={settings.default_theme === 'light' ? 'default' : 'outline'}
                    onClick={() => updateField('default_theme', 'light')}
                    className="flex-1"
                  >
                    ☀️ Claro
                  </Button>
                  <Button
                    type="button"
                    variant={settings.default_theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => updateField('default_theme', 'dark')}
                    className="flex-1"
                  >
                    🌙 Escuro
                  </Button>
                  <Button
                    type="button"
                    variant={settings.default_theme === 'system' ? 'default' : 'outline'}
                    onClick={() => updateField('default_theme', 'system')}
                    className="flex-1"
                  >
                    💻 Sistema
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <strong>Prévia:</strong> As alterações de cor serão aplicadas em toda a loja após salvar.
                </p>
                <div className="mt-4 flex gap-2">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-sm" 
                    style={{ backgroundColor: settings.primary_color || '#3834ED' }}
                  />
                  <div 
                    className="w-12 h-12 rounded-lg shadow-sm" 
                    style={{ backgroundColor: settings.secondary_color || '#6366F1' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔞 Exibição +18
              </CardTitle>
              <CardDescription>Configure a exibição do indicador de restrição de idade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Mostrar indicador +18</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibe o badge "+18" ao lado da logomarca no menu superior
                  </p>
                </div>
                <Switch
                  checked={settings.show_age_restriction ?? true}
                  onCheckedChange={(checked) => updateField("show_age_restriction", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Rules Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Valores
                </CardTitle>
                <CardDescription>Configure valores mínimos e taxas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minimum_order_value">Valor Mínimo do Pedido</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      id="minimum_order_value"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.minimum_order_value || 0}
                      onChange={(e) => updateField("minimum_order_value", parseFloat(e.target.value) || 0)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valor mínimo para concluir um pedido
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_fee">Taxa de Entrega</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      id="delivery_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.delivery_fee || 0}
                      onChange={(e) => updateField("delivery_fee", parseFloat(e.target.value) || 0)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="free_delivery_threshold">Frete Grátis Acima de</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      id="free_delivery_threshold"
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.free_delivery_threshold || ""}
                      onChange={(e) => updateField("free_delivery_threshold", e.target.value ? parseFloat(e.target.value) : null)}
                      className="pl-10"
                      placeholder="Deixe vazio para desabilitar"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pedidos acima deste valor terão frete grátis
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Área de Entrega
                </CardTitle>
                <CardDescription>Configure a região de entrega</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_cep">CEP</Label>
                  <Input
                    id="delivery_cep"
                    value={settings.delivery_cep || ""}
                    onChange={(e) => updateField("delivery_cep", e.target.value)}
                    placeholder="00000-000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_city">Cidade</Label>
                  <Input
                    id="delivery_city"
                    value={settings.delivery_city || ""}
                    onChange={(e) => updateField("delivery_city", e.target.value)}
                    placeholder="Nome da cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_state">Estado</Label>
                  <Input
                    id="delivery_state"
                    value={settings.delivery_state || ""}
                    onChange={(e) => updateField("delivery_state", e.target.value)}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Redes Sociais
              </CardTitle>
              <CardDescription>Links das suas redes sociais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram_url" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram_url"
                  value={settings.instagram_url || ""}
                  onChange={(e) => updateField("instagram_url", e.target.value)}
                  placeholder="https://instagram.com/sualoja"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook_url" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook_url"
                  value={settings.facebook_url || ""}
                  onChange={(e) => updateField("facebook_url", e.target.value)}
                  placeholder="https://facebook.com/sualoja"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok_url" className="flex items-center gap-2">
                  🎵 TikTok
                </Label>
                <Input
                  id="tiktok_url"
                  value={settings.tiktok_url || ""}
                  onChange={(e) => updateField("tiktok_url", e.target.value)}
                  placeholder="https://tiktok.com/@sualoja"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
