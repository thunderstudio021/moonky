import { useState } from "react";
import { Plus, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick?: () => void;
}

const ProductCard = ({ product, onAddToCart, onClick }: ProductCardProps) => {
  const { toggleFavorite, isFavorite, loading: favLoading } = useFavorites();
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Calculate discount percentage
  const isOnSale = product.is_on_sale && product.sale_price && product.sale_price < product.price;
  const discountPercentage = isOnSale 
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100) 
    : 0;
  const displayPrice = isOnSale ? product.sale_price! : product.price;

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-200 hover:shadow-hover cursor-pointer bg-card border border-border"
      style={{ borderRadius: '5px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="block">
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-square bg-muted" style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>
          <img
            src={getProductImage(product.image_url)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-1.5 right-1.5 h-7 w-7 p-0 rounded-full bg-background/90 border border-border hover:bg-background transition-all ${
              isFavorite(product.id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            }`}
            disabled={favLoading}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            aria-label={isFavorite(product.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite(product.id) ? "fill-current" : ""}`} />
          </Button>

          {/* Discount Badge */}
          {isOnSale && (
            <Badge 
              className="absolute top-1.5 left-1.5 bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.5 border-0"
            >
              -{discountPercentage}%
            </Badge>
          )}

          {/* Category Badge */}
          {product.product_categories && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-1.5 left-1.5 bg-background/90 border border-border font-medium text-[9px] px-1.5 py-0.5"
            >
              {product.product_categories.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="p-2.5 space-y-1">
        {/* Brand */}
        {product.brands && (
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            {product.brands.name}
          </p>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-xs leading-tight line-clamp-2 text-foreground min-h-[2rem]">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 ${
                    i < Math.floor(product.rating!)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">
              ({product.reviews_count || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="pt-1.5 mt-1">
          {isOnSale ? (
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-base font-bold text-red-500">
                {formatPrice(displayPrice)}
              </span>
            </div>
          ) : (
            <span className="text-base font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;