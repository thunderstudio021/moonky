import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Camera, MapPin, User, Phone, Calendar, LogOut, Package, 
  ChevronLeft, Settings, Heart, Bell, HelpCircle, Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation';
import { useStoreSettings } from '@/hooks/useStoreSettings';

interface Profile {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: any;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  payment_method: string | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings } = useStoreSettings();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    avatar_url: '',
    date_of_birth: '',
    gender: '',
    address: null,
  });
  const [orders, setOrders] = useState<Order[]>();

  useEffect(() => {
    if (user) {
      getProfile();
      getOrders();
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const userMetadata = user.user_metadata || {};

      if (data) {
        setProfile({
          full_name: data.full_name || userMetadata.full_name || '',
          phone: data.phone || userMetadata.phone || '',
          avatar_url: data.avatar_url || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          address: data.address || userMetadata.address || null,
        });
      } else {
        setProfile({
          full_name: userMetadata.full_name || '',
          phone: userMetadata.phone || '',
          avatar_url: '',
          date_of_birth: '',
          gender: '',
          address: userMetadata.address || null,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar perfil',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total, created_at, payment_method')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
          address: profile.address
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Selecione uma imagem.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Save to profile immediately
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: avatarUrl
        }, {
          onConflict: 'id'
        });

      if (updateError) {
        throw updateError;
      }

      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
      
      toast({
        title: 'Foto atualizada!',
        description: 'Sua foto de perfil foi salva.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Até logo!',
      description: 'Você foi desconectado.',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      delivering: 'A caminho',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-600',
      confirmed: 'bg-blue-500/20 text-blue-600',
      preparing: 'bg-orange-500/20 text-orange-600',
      delivering: 'bg-purple-500/20 text-purple-600',
      delivered: 'bg-green-500/20 text-green-600',
      cancelled: 'bg-red-500/20 text-red-600',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Mobile */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 touch-manipulation">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">Meu Perfil</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <label 
              htmlFor="avatar" 
              className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer touch-manipulation active:scale-95 transition-transform"
            >
              <Camera className="h-4 w-4 text-primary-foreground" />
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={uploadAvatar}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <h2 className="mt-3 text-xl font-semibold">
            {profile.full_name || 'Seu Nome'}
          </h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          <Link to="/orders" className="flex flex-col items-center p-3 bg-card rounded-xl border touch-manipulation active:scale-95 transition-transform">
            <Package className="h-6 w-6 text-primary mb-1" />
            <span className="text-xs text-center">Pedidos</span>
          </Link>
          <Link to="/favorites" className="flex flex-col items-center p-3 bg-card rounded-xl border touch-manipulation active:scale-95 transition-transform">
            <Heart className="h-6 w-6 text-red-500 mb-1" />
            <span className="text-xs text-center">Favoritos</span>
          </Link>
          <button className="flex flex-col items-center p-3 bg-card rounded-xl border touch-manipulation active:scale-95 transition-transform">
            <Bell className="h-6 w-6 text-blue-500 mb-1" />
            <span className="text-xs text-center">Alertas</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-card rounded-xl border touch-manipulation active:scale-95 transition-transform">
            <HelpCircle className="h-6 w-6 text-green-500 mb-1" />
            <span className="text-xs text-center">Ajuda</span>
          </button>
        </div>

        {/* Recent Orders */}
        {orders && orders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pedidos Recentes</h3>
              <Link to="/orders" className="text-sm text-primary">Ver todos</Link>
            </div>
            <div className="space-y-2">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 bg-card rounded-xl border"
                >
                  <div className="flex-1">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Sections */}
        <Accordion type="multiple" defaultValue={["personal"]} className="space-y-3">
          {/* Personal Info */}
          <AccordionItem value="personal" className="border rounded-xl overflow-hidden bg-card">
            <AccordionTrigger className="px-4 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Dados Pessoais</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Seu nome completo"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">Telefone</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className="h-12"
                    type="tel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-sm">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={profile.date_of_birth || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm">Gênero</Label>
                  <Select
                    value={profile.gender || ''}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefiro não dizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Address */}
          <AccordionItem value="address" className="border rounded-xl overflow-hidden bg-card">
            <AccordionTrigger className="px-4 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <span className="font-medium">Endereço de Entrega</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-sm">CEP</Label>
                    <Input
                      id="zipCode"
                      value={settings?.delivery_cep || "48970-000"}
                      className="h-12 bg-muted cursor-not-allowed"
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm">Cidade</Label>
                    <Input
                      id="city"
                      value={settings?.delivery_city || "SENHOR DO BONFIM"}
                      className="h-12 bg-muted cursor-not-allowed"
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm">UF</Label>
                    <Input
                      id="state"
                      value={settings?.delivery_state || "BA"}
                      className="h-12 bg-muted cursor-not-allowed"
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="street" className="text-sm">Rua</Label>
                    <Input
                      id="street"
                      value={profile.address?.street || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      placeholder="Nome da rua"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number" className="text-sm">Nº</Label>
                    <Input
                      id="number"
                      value={profile.address?.number || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        address: { ...prev.address, number: e.target.value }
                      }))}
                      placeholder="123"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement" className="text-sm">Complemento</Label>
                  <Input
                    id="complement"
                    value={profile.address?.complement || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, complement: e.target.value }
                    }))}
                    placeholder="Apto, Bloco, etc"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood" className="text-sm">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={profile.address?.neighborhood || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, neighborhood: e.target.value }
                    }))}
                    placeholder="Nome do bairro"
                    className="h-12"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Security */}
          <AccordionItem value="security" className="border rounded-xl overflow-hidden bg-card">
            <AccordionTrigger className="px-4 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-medium">Segurança</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Email: {user.email}
                </p>
                <Button variant="outline" className="w-full h-12" disabled>
                  Alterar Senha
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Save Button */}
        <Button 
          onClick={updateProfile} 
          disabled={loading} 
          className="w-full h-14 text-base font-semibold"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sair da Conta
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
