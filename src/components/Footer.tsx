import { Link } from 'react-router-dom';
import { AlertTriangle, Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';
import { useStoreSettings } from '@/hooks/useStoreSettings';

const Footer = () => {
  const { settings } = useStoreSettings();

  const formatWhatsAppLink = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    return `https://wa.me/55${cleaned}`;
  };

  return (
    <footer className="bg-muted/50 border-t mt-8 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Age Warning */}
        {settings?.show_age_restriction && (
          <div className="flex items-center justify-center gap-2 bg-destructive/10 text-destructive rounded-xl p-3 mb-6">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium text-center">
              A venda de bebidas alcoólicas é proibida para menores de 18 anos
            </p>
          </div>
        )}

        {/* Store Info */}
        {settings && (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {/* Contact Info */}
            <div className="text-center md:text-left space-y-2">
              <h4 className="font-semibold text-sm text-foreground">Contato</h4>
              {settings.phone && (
                <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-1.5">
                  <Phone className="h-3 w-3" />
                  {settings.phone}
                </p>
              )}
              {settings.whatsapp && (
                <a 
                  href={formatWhatsAppLink(settings.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center justify-center md:justify-start gap-1.5 transition-colors"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}
              {settings.email && (
                <a 
                  href={`mailto:${settings.email}`}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center justify-center md:justify-start gap-1.5 transition-colors"
                >
                  <Mail className="h-3 w-3" />
                  {settings.email}
                </a>
              )}
            </div>

            {/* Address */}
            {settings.address && (
              <div className="text-center space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Endereço</h4>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  {settings.address}
                </p>
                {settings.delivery_city && settings.delivery_state && (
                  <p className="text-xs text-muted-foreground">
                    {settings.delivery_city}, {settings.delivery_state}
                    {settings.delivery_cep && ` - ${settings.delivery_cep}`}
                  </p>
                )}
              </div>
            )}

            {/* Social Media */}
            {(settings.instagram_url || settings.facebook_url || settings.tiktok_url) && (
              <div className="text-center md:text-right space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Redes Sociais</h4>
                <div className="flex items-center justify-center md:justify-end gap-3">
                  {settings.instagram_url && (
                    <a 
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {settings.facebook_url && (
                    <a 
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {settings.tiktok_url && (
                    <a 
                      href={settings.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="TikTok"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
          <Link 
            to="/terms" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Termos de Uso
          </Link>
          <span className="text-muted-foreground/50">•</span>
          <Link 
            to="/privacy" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Política de Privacidade
          </Link>
        </div>

        {/* Company Info */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {settings?.store_name || 'Moonky'} Delivery
          </p>
          {settings?.store_description && (
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-md mx-auto">
              {settings.store_description}
            </p>
          )}
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-muted-foreground/60 mt-4">
          © {new Date().getFullYear()} {settings?.store_name || 'Moonky'}. Todos os direitos reservados.
        </p>

        {/* Developer Credit */}
        <p className="text-center text-xs text-muted-foreground mt-2">
          Desenvolvido com ❤️ por{' '}
          <span className="text-primary font-medium">Paint Softwares</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
