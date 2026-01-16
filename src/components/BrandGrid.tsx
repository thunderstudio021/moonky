import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

const BrandGrid = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      if (data) {
        setBrands(data);
      }
    } catch (error) {
      console.error("Error loading brands:", error);
      toast({
        title: "Erro ao carregar marcas",
        description: "Não foi possível carregar as marcas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brandName: string) => {
    navigate(`/brand/${encodeURIComponent(brandName)}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 sm:h-40 bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-muted-foreground">
          Nenhuma marca cadastrada ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile/Tablet Carousel */}
      {isMobile ? (
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {brands.map((brand) => (
                <CarouselItem key={brand.id} className="pl-3 basis-1/3 sm:basis-1/4">
                  <button
                    className="w-full aspect-square hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl overflow-hidden shadow-md bg-card"
                    onClick={() => handleBrandClick(brand.name)}
                    aria-label={`Ver produtos da marca ${brand.name}`}
                  >
                    <div className="w-full h-full p-3 flex items-center justify-center">
                      {brand.logo_url ? (
                        <img 
                          src={brand.logo_url} 
                          alt={brand.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-muted-foreground">
                          {brand.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="carousel-nav-button -left-2" />
            <CarouselNext className="carousel-nav-button -right-2" />
          </Carousel>
        </div>
      ) : (
        /* Desktop Grid - Aligned Grid */
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <button
              key={brand.id}
              className="aspect-square hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl overflow-hidden shadow-md bg-card"
              onClick={() => handleBrandClick(brand.name)}
              aria-label={`Ver produtos da marca ${brand.name}`}
            >
              <div className="w-full h-full p-4 flex items-center justify-center">
                {brand.logo_url ? (
                  <img 
                    src={brand.logo_url} 
                    alt={brand.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-3xl font-bold text-muted-foreground">
                    {brand.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandGrid;
