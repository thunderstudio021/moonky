import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  brands?: { name: string };
}

interface OfferSlideshowProps {
  products: Product[];
}

const OfferSlideshow = ({ products }: OfferSlideshowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const offerProducts = products.slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % offerProducts.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [offerProducts.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % offerProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + offerProducts.length) % offerProducts.length);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (!offerProducts.length) return null;

  const currentProduct = offerProducts[currentSlide];

  return (
    <div className="relative mb-4 sm:mb-6 md:mb-8 lg:mb-12 w-full overflow-hidden">
      <Card 
        className="overflow-hidden shadow-elegant cursor-pointer hover:shadow-hover transition-smooth hover-lift border border-border/50 hover:border-primary/30"
        style={{ borderRadius: '5px' }}
        onClick={() => handleProductClick(currentProduct.id)}
      >
        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-96" style={{ borderRadius: '5px' }}>
          <img
            src={currentProduct.image_url}
            alt={currentProduct.name}
            className="w-full h-full object-cover transition-smooth group-hover:scale-105"
            style={{ borderRadius: '5px' }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" style={{ borderRadius: '5px' }} />

          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 md:bottom-6 md:left-6 md:right-6 text-white">
            {currentProduct.brands && (
              <p className="text-[10px] sm:text-xs md:text-sm font-medium opacity-90 mb-1 sm:mb-1.5 md:mb-2 tracking-wide uppercase">
                {currentProduct.brands.name}
              </p>
            )}
            <h3 className="text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-bold mb-1.5 sm:mb-2 md:mb-3 drop-shadow-lg line-clamp-2">
              {currentProduct.name}
            </h3>
            <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold drop-shadow-lg">
              {formatPrice(currentProduct.price)}
            </span>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-1 sm:left-2 md:left-3 lg:left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/30 backdrop-blur-sm p-1.5 sm:p-2 md:p-2.5 lg:p-3 z-10 rounded-full transition-bounce hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 sm:right-2 md:right-3 lg:right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/30 backdrop-blur-sm p-1.5 sm:p-2 md:p-2.5 lg:p-3 z-10 rounded-full transition-bounce hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </Button>
        </div>
      </Card>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-3 sm:mt-4 md:mt-5 lg:mt-6 gap-1.5 sm:gap-2 md:gap-3">
        {offerProducts.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 sm:h-2 rounded-full transition-bounce hover:scale-125 ${
              index === currentSlide 
                ? 'bg-gradient-primary w-4 sm:w-6 md:w-8 shadow-glow' 
                : 'bg-muted-foreground/30 w-1.5 sm:w-2 hover:bg-muted-foreground/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default OfferSlideshow;