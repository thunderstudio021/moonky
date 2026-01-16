import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useStoreSettings } from '@/hooks/useStoreSettings';

interface Address {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

const AddressBar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings } = useStoreSettings();
  
  // Get fixed location from store settings
  const fixedLocation = {
    zipCode: settings?.delivery_cep || '48970-000',
    city: settings?.delivery_city || 'SENHOR DO BONFIM',
    state: settings?.delivery_state || 'BA'
  };
  
  const [address, setAddress] = useState<Address | null>(null);
  const [editAddress, setEditAddress] = useState<Address>({
    ...fixedLocation
  });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Update editAddress when settings load
  useEffect(() => {
    if (settings) {
      setEditAddress(prev => ({
        ...prev,
        zipCode: settings.delivery_cep || prev.zipCode,
        city: settings.delivery_city || prev.city,
        state: settings.delivery_state || prev.state
      }));
    }
  }, [settings]);

  useEffect(() => {
    if (user) {
      fetchAddress();
    }
  }, [user]);

  // Don't show AddressBar if user is not logged in
  if (!user) {
    return null;
  }

  const fetchAddress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('address')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.address) {
        const savedAddress = data.address as Address;
        setAddress({ ...savedAddress, ...fixedLocation });
        setEditAddress({ ...savedAddress, ...fixedLocation });
      } else {
        // Try from user metadata
        const userAddress = user.user_metadata?.address;
        if (userAddress) {
          setAddress({ ...userAddress, ...fixedLocation });
          setEditAddress({ ...userAddress, ...fixedLocation });
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const saveAddress = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          address: editAddress as any
        })
        .eq('id', user.id);

      if (error) throw error;

      setAddress(editAddress);
      setIsOpen(false);
      toast({
        title: 'Endereço atualizado!',
        description: 'Seu endereço de entrega foi salvo.',
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

  const getDisplayAddress = () => {
    if (!address) return 'Adicionar endereço';
    
    const parts = [];
    if (address.street) {
      let streetPart = address.street;
      if (address.number) streetPart += `, ${address.number}`;
      if (address.complement) streetPart += ` - ${address.complement}`;
      parts.push(streetPart);
    }
    if (address.neighborhood) parts.push(address.neighborhood);
    
    return parts.length > 0 ? parts.join(' - ') : 'Adicionar endereço';
  };

  return (
    <div className="bg-primary text-primary-foreground">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="w-full px-4 py-2.5 flex items-center justify-between touch-manipulation">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm font-medium line-clamp-2 text-left">
                {getDisplayAddress()}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2 opacity-70" />
          </button>
        </SheetTrigger>
        
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl">Endereço de Entrega</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto pb-24">
            <div className="space-y-2">
              <Label htmlFor="edit-zipCode">CEP</Label>
              <Input
                id="edit-zipCode"
                value={fixedLocation.zipCode}
                readOnly
                disabled
                className="h-12 bg-muted cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-street">Rua</Label>
                <Input
                  id="edit-street"
                  value={editAddress.street || ''}
                  onChange={(e) => setEditAddress(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="Nome da rua"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-number">Nº</Label>
                <Input
                  id="edit-number"
                  value={editAddress.number || ''}
                  onChange={(e) => setEditAddress(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="123"
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-complement">Complemento</Label>
              <Input
                id="edit-complement"
                value={editAddress.complement || ''}
                onChange={(e) => setEditAddress(prev => ({ ...prev, complement: e.target.value }))}
                placeholder="Apto, Bloco, etc"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-neighborhood">Bairro</Label>
              <Input
                id="edit-neighborhood"
                value={editAddress.neighborhood || ''}
                onChange={(e) => setEditAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                placeholder="Nome do bairro"
                className="h-12"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-city">Cidade</Label>
                <Input
                  id="edit-city"
                  value={fixedLocation.city}
                  readOnly
                  disabled
                  className="h-12 bg-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-state">UF</Label>
                <Input
                  id="edit-state"
                  value={fixedLocation.state}
                  readOnly
                  disabled
                  className="h-12 bg-muted cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Fixed Bottom Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
            <Button 
              onClick={saveAddress} 
              disabled={loading}
              className="w-full h-14 text-base font-semibold"
            >
              {loading ? 'Salvando...' : 'Salvar Endereço'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AddressBar;
