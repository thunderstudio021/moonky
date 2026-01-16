import { Flame } from "lucide-react";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  rating?: number;
  reviews_count?: number;
  brands?: { name: string };
  product_categories?: { name: string };
}

interface OffersSectionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

const OffersSection = ({ products, onAddToCart, onProductClick }: OffersSectionProps) => {
  // Only show products that are on sale
  const offerProducts = products
    .filter(product => (product as any).is_on_sale === true)
    .slice(0, 8);

  if (offerProducts.length === 0) return null;

  return (
    <div>
      {/* Horizontal scroll for offers */}
      <div className="overflow-x-auto pb-2 sm:pb-4 -mx-3 px-3 sm:-mx-4 sm:px-4">
        <div className="flex gap-2 sm:gap-3 min-w-fit">
          {offerProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-28 sm:w-36">
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onClick={() => onProductClick?.(product)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Show all offers button */}
      <div className="text-center mt-3 sm:mt-4">
        <button 
          onClick={() => window.location.href = '/offers'}
          className="text-xs sm:text-sm text-primary hover:text-primary/90 font-medium transition-colors underline underline-offset-4"
        >
          Ver todas
        </button>
      </div>
    </div>
  );
};

export default OffersSection;