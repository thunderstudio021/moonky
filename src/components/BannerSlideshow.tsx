import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  link_type: string;
  link_id: string | null;
  display_order: number;
  is_active: boolean;
}

const BannerSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("display_order", { ascending: true });

      if (error) throw error;
      if (data) setBanners(data);
    } catch (error) {
      console.error("Error loading banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.link_type === "product" && banner.link_id) {
      navigate(`/product/${banner.link_id}`);
    } else if (banner.link_type === "category" && banner.link_id) {
      navigate(`/?category=${banner.link_id}`);
    } else if (banner.link_type === "external" && banner.link_url) {
      window.open(banner.link_url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="relative mb-4 sm:mb-6 md:mb-8 lg:mb-12 w-full">
        <Card className="overflow-hidden shadow-elegant border border-border/50" style={{ borderRadius: '5px' }}>
          <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-96 bg-muted animate-pulse" />
        </Card>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentSlide];

  return (
    <div className="relative mb-4 sm:mb-6 md:mb-8 lg:mb-12 w-full overflow-hidden">
      <Card 
        className={`overflow-hidden shadow-elegant border border-border/50 hover:border-primary/30 transition-smooth hover-lift ${
          currentBanner.link_type !== "none" ? "cursor-pointer" : ""
        }`}
        style={{ borderRadius: '5px' }}
        onClick={() => handleBannerClick(currentBanner)}
      >
        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-96" style={{ borderRadius: '5px' }}>
          <img
            src={currentBanner.image_url}
            alt={currentBanner.title}
            className="w-full h-full object-cover transition-smooth"
            style={{ borderRadius: '5px' }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" style={{ borderRadius: '5px' }} />

          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 md:bottom-6 md:left-6 md:right-6 text-white">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1.5 sm:mb-2 md:mb-3 drop-shadow-lg line-clamp-2">
              {currentBanner.title}
            </h3>
            {currentBanner.subtitle && (
              <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 drop-shadow-md line-clamp-2">
                {currentBanner.subtitle}
              </p>
            )}
          </div>

          {/* Navigation Buttons */}
          {banners.length > 1 && (
            <>
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
            </>
          )}
        </div>
      </Card>

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="flex justify-center mt-3 sm:mt-4 md:mt-5 lg:mt-6 gap-1.5 sm:gap-2 md:gap-3">
          {banners.map((_, index) => (
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
      )}
    </div>
  );
};

export default BannerSlideshow;
