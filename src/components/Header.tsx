import { useState, useEffect } from "react";
import { Search, ShoppingCart, User, LogIn, ClipboardList, Shield, Ticket } from "lucide-react";
import moonkyLogo from "@/assets/moonky-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SearchModal from "@/components/SearchModal";
import UserPoints from "@/components/UserPoints";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  onSearchChange: (value: string) => void;
  cartCount: number;
  onLogoClick?: () => void;
}

const Header = ({ onSearchChange, cartCount, onLogoClick }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { settings } = useStoreSettings();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load avatar from profile
  useEffect(() => {
    const loadAvatar = async () => {
      if (!user) {
        setAvatarUrl(null);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    };

    loadAvatar();
  }, [user]);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (onLogoClick) {
      e.preventDefault();
      onLogoClick();
    }
  };

  return (
    <header className={`sticky top-0 z-50 border-b border-border/50 shadow-elegant transition-all duration-300 ${
      isScrolled ? 'bg-background/95 backdrop-blur-md' : 'glass-effect'
    }`}>
      <div className="container mx-auto px-3 py-3 max-w-7xl">
        <div className="flex items-center justify-between gap-2 min-w-0">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 group" onClick={handleLogoClick}>
              <img 
                src={moonkyLogo} 
                alt="Moonky - Drink Delivery" 
                className="h-10 w-auto sm:h-12 md:h-14 object-contain group-hover:scale-105 transition-smooth"
              />
            </Link>
            {(settings?.show_age_restriction ?? true) && (
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-[5px] border border-border/50">
                +18
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto">
            <Link to="/cart" className="hidden md:block">
              <Button
                variant="outline"
                size="sm"
                className="relative transition-smooth hover:shadow-glow hover:border-primary/50 hover:bg-accent p-2 h-8 sm:h-9"
              >
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-primary text-primary-foreground text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center shadow-glow animate-pulse font-bold">
                    {cartCount}
                  </span>
                )}
                <span className="ml-1.5 hidden lg:inline text-xs">Carrinho</span>
              </Button>
            </Link>
            
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0">
                   <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-primary/20">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                   </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 sm:w-72 mr-2" align="end" sideOffset={8}>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-xs sm:text-sm truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="px-2 pb-2">
                    <UserPoints compact showHeader={false} />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer text-sm">
                      <User className="mr-2 h-3.5 w-3.5" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer text-sm">
                      <ClipboardList className="mr-2 h-3.5 w-3.5" />
                      Meus Pedidos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/events" className="cursor-pointer text-sm">
                      <Ticket className="mr-2 h-3.5 w-3.5" />
                      Eventos
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer text-sm">
                        <Shield className="mr-2 h-3.5 w-3.5" />
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-sm">
                    <LogIn className="mr-2 h-3.5 w-3.5" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0" asChild>
                <Link to="/auth">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-border">
                    <AvatarFallback className="bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />
    </header>
  );
};

export default Header;