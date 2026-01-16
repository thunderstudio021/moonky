import { useState } from "react";
import { Star, Heart, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useFavorites } from "@/hooks/useFavorites";
import { getProductImage } from "@/utils/imageHelper";

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price?: number | null;
  is_on_sale?: boolean | null;
  image_url?: string;
  rating?: number;
  reviews_count?: number;
  brands?: { name: string };
  product_categories?: { name: string };
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const COMBO_OPTIONS = [
  { id: 'combo-6', label: 'Combo 6', quantity: 6 },
  { id: 'combo-12', label: 'Combo 12', quantity: 12 },
  { id: 'combo-23', label: 'Combo 23', quantity: 23 },
];

const ProductModal = ({ product, isOpen, onClose, onAddToCart }: ProductModalProps) => {
  const { toggleFavorite, isFavorite, loading: favLoading } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);

  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Calculate discount
  const isOnSale = product.is_on_sale && product.sale_price && product.sale_price < product.price;
  const discountPercentage = isOnSale 
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100) 
    : 0;
  const displayPrice = isOnSale ? product.sale_price! : product.price;

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleComboSelect = (comboId: string) => {
    if (selectedCombo === comboId) {
      setSelectedCombo(null);
      setQuantity(1);
    } else {
      setSelectedCombo(comboId);
      const combo = COMBO_OPTIONS.find(c => c.id === comboId);
      if (combo) setQuantity(combo.quantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
    setSelectedCombo(null);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="max-h-[85vh] h-auto rounded-t-3xl p-0"
      >
        <div className="flex flex-col">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>
          
          <div className="flex flex-col px-4 pb-4">
            {/* Product Header - Image + Info side by side */}
            <div className="flex gap-3 mb-4">
              {/* Small Image */}
              <div className="relative w-20 h-20 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={getProductImage(product.image_url)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                {/* Category */}
                {product.product_categories && (
                  <Badge 
                    variant="secondary" 
                    className="bg-muted border border-border text-[10px] mb-1"
                  >
                    {product.product_categories.name}
                  </Badge>
                )}
                
                {/* Brand */}
                {product.brands && (
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    {product.brands.name}
                  </p>
                )}
                
                {/* Product Name */}
                <h2 className="text-sm font-bold text-foreground leading-tight line-clamp-2">
                  {product.name}
                </h2>
                
                {/* Price */}
                {isOnSale ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-lg font-bold text-red-500">
                      {formatPrice(displayPrice)}
                    </span>
                    <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 border-0">
                      -{discountPercentage}%
                    </Badge>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 flex-shrink-0 ${isFavorite(product.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                disabled={favLoading}
                onClick={() => toggleFavorite(product.id)}
              >
                <Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Combo Selection */}
            <div className="mb-3 sm:mb-4">
              <label className="text-sm font-medium text-foreground mb-2 sm:mb-3 block">
                Selecione o combo:
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {COMBO_OPTIONS.map((combo) => (
                  <button
                    key={combo.id}
                    onClick={() => handleComboSelect(combo.id)}
                    className={`p-2 sm:p-3 rounded-xl border-2 transition-all text-center ${
                      selectedCombo === combo.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/50 text-foreground hover:border-primary/50'
                    }`}
                  >
                    <span className="text-base sm:text-lg font-bold block">{combo.quantity}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">unidades</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-3 sm:mb-4">
              <label className="text-sm font-medium text-foreground mb-2 sm:mb-3 block">
                Quantidade:
              </label>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleQuantityChange(-1);
                  }}
                  disabled={quantity <= 1}
                  className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-xl"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-lg sm:text-xl min-w-[2.5rem] sm:min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleQuantityChange(1);
                  }}
                  className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-border">
              <span className="text-base sm:text-lg font-medium text-muted-foreground">Total:</span>
              <span className={`text-xl sm:text-2xl font-bold ${isOnSale ? 'text-red-500' : 'text-foreground'}`}>
                {formatPrice(displayPrice * quantity)}
              </span>
            </div>

            {/* Add to Cart Button */}
            <Button 
              size="lg" 
              className="w-full rounded-xl h-11 sm:h-12 text-sm sm:text-base"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProductModal;
