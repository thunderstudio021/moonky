import { Home, ShoppingCart, User, Heart, Wine } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const BottomNavigation = () => {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const { user } = useAuth();
  const cartCount = getTotalItems();
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setActiveOrdersCount(0);
      return;
    }

    const fetchActiveOrders = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirmed', 'preparing', 'out_for_delivery']);
      
      setActiveOrdersCount(count || 0);
    };

    fetchActiveOrders();

    const channel = supabase
      .channel('orders-nav')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchActiveOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Heart, path: "/favorites", label: "Favoritos" },
    { icon: Wine, path: "/orders", label: "Pedidos", isCenter: true, badge: activeOrdersCount },
    { icon: ShoppingCart, path: "/cart", label: "Carrinho", badge: cartCount },
    { icon: User, path: user ? "/profile" : "/auth", label: user ? "Perfil" : "Entrar" }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-primary border-t border-primary-foreground/10 shadow-lg"
      role="navigation"
      aria-label="Navegação principal mobile"
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isCenter = item.isCenter;
          const hasActiveOrders = isCenter && activeOrdersCount > 0;
          
          if (isCenter) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center justify-center relative"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Center button - slightly elevated with rounded corners */}
                <div className="absolute -top-3">
                  <div 
                    className={cn(
                      "relative w-14 h-14 rounded-2xl flex items-center justify-center",
                      "bg-background shadow-lg",
                      "border border-border/50",
                      "transition-all duration-300 ease-out",
                      isActive && "shadow-xl scale-[1.02]",
                      hasActiveOrders && "animate-bounce-gentle"
                    )}
                  >
                    <Icon 
                      className={cn(
                        "h-6 w-6 text-primary transition-transform duration-300",
                        isActive && "scale-110"
                      )} 
                    />
                    
                    {/* Badge */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full shadow-md">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                </div>
                
                <span className={cn(
                  "absolute bottom-1 text-[10px] font-medium text-primary-foreground/80",
                  isActive && "font-semibold text-primary-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200",
                isActive 
                  ? "text-primary-foreground" 
                  : "text-primary-foreground/60 hover:text-primary-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "transition-all duration-200",
                    isActive ? "h-6 w-6" : "h-5 w-5"
                  )} 
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px] font-bold bg-background text-primary rounded-full shadow-lg">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all",
                isActive && "font-bold"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary-foreground rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;