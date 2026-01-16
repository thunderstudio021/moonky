import { ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const CartFloatingBar = () => {
  const { getTotalItems, getTotalPrice } = useCart();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (totalItems === 0) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-16 left-0 right-0 z-40 md:hidden",
        "animate-in slide-in-from-bottom-8 duration-500 ease-out"
      )}
    >
      <div className="mx-4 mb-2">
        <Link to="/cart">
          <div className="bg-gradient-to-r from-green-500 via-emerald-400 to-lime-500 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(34,197,94,0.4)] border border-green-300/40 overflow-hidden transition-all duration-500 ease-out hover:shadow-[0_12px_40px_rgba(34,197,94,0.5)] hover:scale-[1.01] active:scale-[0.99]">
            
            <div className="relative px-5 py-4 flex items-center justify-between">
              {/* Left side - Icon and count */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 border border-white/20 transition-transform duration-300 ease-out">
                    <ShoppingBag className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 bg-white text-emerald-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-emerald-300 shadow-sm">
                    {totalItems}
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-white/80 uppercase tracking-wide">
                    {totalItems} {totalItems === 1 ? 'Item' : 'Itens'}
                  </span>
                  <span className="text-lg font-bold text-white">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Right side - CTA */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm font-semibold text-white">
                  Ver Sacola
                </span>
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/20 transition-transform duration-300 ease-out hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-white/10">
              <div 
                className="h-full bg-white/50 transition-all duration-700 ease-out"
                style={{ width: `${Math.min((totalPrice / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CartFloatingBar;
