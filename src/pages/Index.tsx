import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Package, TrendingUp, Grid3x3, Sparkles, ArrowLeft, Calendar, Search } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import BannerSlideshow from "@/components/BannerSlideshow";
import OffersSection from "@/components/OffersSection";
import EventsSection from "@/components/EventsSection";
import BrandGrid from "@/components/BrandGrid";
import BottomNavigation from "@/components/BottomNavigation";
import CartFloatingBar from "@/components/CartFloatingBar";
import { useAuth } from "@/contexts/AuthContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import Footer from "@/components/Footer";
import HeroSearchBar from "@/components/HeroSearchBar";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem, getTotalItems } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Load products from database
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brands(id, name),
          product_categories(id, name)
        `)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setProducts(data);
        // Extract unique categories with counts
        const categoryMap = data.reduce((acc: Record<string, number>, p) => {
          const categoryName = p.product_categories?.name;
          if (categoryName) {
            acc[categoryName] = (acc[categoryName] || 0) + 1;
          }
          return acc;
        }, {});
        const uniqueCategories = Object.keys(categoryMap);
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle brand filter from URL params
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
  }, [searchParams]);

  // Filter products based on search and brand
  const filteredProducts = useMemo(() => {
    if (searchTerm || selectedBrand) {
      return products.filter(product => {
        // Search filter
        const matchesSearch = !searchTerm || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.product_categories?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brands?.name.toLowerCase().includes(searchTerm.toLowerCase());

        // Brand filter
        const matchesBrand = !selectedBrand ||
          product.brands?.name.toLowerCase().includes(selectedBrand.split(' ')[0].toLowerCase());

        return matchesSearch && matchesBrand;
      });
    }
    return [];
  }, [searchTerm, selectedBrand, products]);

  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.product_categories?.name === category);
  };

  const categoriesWithCount = useMemo(() => {
    return categories.map(cat => ({
      name: cat,
      count: getProductsByCategory(cat).length
    }));
  }, [categories, products]);

  const handleCategorySearch = (category: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSearchTerm(category), 100);
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '/placeholder.svg',
      category: product.product_categories?.name || 'Sem categoria',
      brand: product.brands?.name || 'Sem marca',
      rating: product.rating || 0,
      reviews: product.reviews_count || 0
    });
    toast({
      title: "Adicionado ao carrinho!",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModalAddToCart = (product: any, quantity: number) => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || '/placeholder.svg',
        category: product.product_categories?.name || 'Sem categoria',
        brand: product.brands?.name || 'Sem marca',
        rating: product.rating || 0,
        reviews: product.reviews_count || 0
      });
    }
    toast({
      title: "Adicionado ao carrinho!",
      description: `${quantity}x ${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedBrand("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header 
        onSearchChange={handleSearchChange}
        cartCount={getTotalItems()}
        onLogoClick={handleClearFilters}
      />
      
      <main className="mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12 max-w-7xl">
        {/* Hero Search Bar with Categories */}
        {!searchTerm && !selectedBrand && (
          <HeroSearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            categories={categoriesWithCount}
            onCategoryClick={handleCategorySearch}
          />
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3" role="status" aria-live="polite">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-border"></div>
              <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin"></div>
            </div>
            <p className="text-sm text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Hero Banner with Slideshow */}
            {!searchTerm && !selectedBrand && (
              <section aria-labelledby="hero-title" className="overflow-hidden mb-4 sm:mb-6" style={{ borderRadius: '5px' }}>
                <h1 className="sr-only" id="hero-title">Ofertas em Destaque</h1>
                <BannerSlideshow />
              </section>
            )}

            {/* Brand Showcase */}
            {!searchTerm && !selectedBrand && (
              <section aria-labelledby="brands-title" className="mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-4">
                  <h2 id="brands-title" className="text-base sm:text-xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2">
                    <Grid3x3 className="h-4 w-4 sm:h-5 sm:w-5" />
                    Marcas
                  </h2>
                </div>
                <BrandGrid />
              </section>
            )}

            {/* Special Offers */}
            {!searchTerm && !selectedBrand && (
              <section aria-labelledby="offers-title" className="mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-4">
                  <h2 id="offers-title" className="text-base sm:text-xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    Ofertas
                  </h2>
                </div>
                <OffersSection 
                  products={products} 
                  onAddToCart={handleAddToCart}
                  onProductClick={handleProductClick}
                />
              </section>
            )}

            {/* Events Section */}
            {!searchTerm && !selectedBrand && (
              <section aria-labelledby="events-title" className="mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-4">
                  <h2 id="events-title" className="text-base sm:text-xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    Eventos
                  </h2>
                </div>
                <EventsSection />
              </section>
            )}

            {/* Search Results */}
            {(searchTerm || selectedBrand) && (
              <section aria-labelledby="search-results-title">
                {/* Search Bar in Results */}
                <div className="mb-4 sm:mb-6 max-w-2xl mx-auto">
                  <div className="relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 sm:pl-12 pr-3 py-4 sm:py-6 text-sm sm:text-base transition-smooth focus:shadow-glow hover:shadow-elegant w-full bg-background border-border"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="flex-shrink-0 h-8 px-2 sm:px-3"
                    aria-label="Voltar para página inicial"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Voltar</span>
                  </Button>
                  <div>
                    <h2 id="search-results-title" className="text-lg sm:text-2xl font-bold text-foreground">
                      {filteredProducts.length > 0 ? 'Resultados' : 'Sem resultados'}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {searchTerm && `"${searchTerm}"`}
                      {selectedBrand && ` ${selectedBrand}`}
                    </p>
                  </div>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onClick={() => handleProductClick(product)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-20 px-4">
                    <div className="max-w-md mx-auto">
                      <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 text-muted-foreground/30" />
                      <h3 className="text-base sm:text-xl font-semibold text-foreground mb-1">
                        Nenhum produto
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Tente outros termos
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Products by Category */}
            {!searchTerm && !selectedBrand && categories.length > 0 && (
              <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                <div className="mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    Categorias
                  </h2>
                </div>

                {categories.map((category) => {
                  const categoryProducts = getProductsByCategory(category);
                  if (categoryProducts.length === 0) return null;
                  
                  const displayedProducts = categoryProducts.slice(0, 5);

                  return (
                    <section 
                      key={category} 
                      aria-labelledby={`category-${category.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      <div className="mb-2 sm:mb-3 flex items-center justify-between">
                        <h3 
                          id={`category-${category.replace(/\s+/g, '-').toLowerCase()}`}
                          className="text-sm sm:text-base font-semibold text-primary flex items-center gap-1.5"
                        >
                          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {category}
                        </h3>
                        {categoryProducts.length > 5 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              setTimeout(() => setSearchTerm(category), 300);
                            }}
                            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground h-7 px-2"
                          >
                            Ver todos
                          </Button>
                        )}
                      </div>

                      {isMobile ? (
                        <div className="relative carousel-has-more">
                          <Carousel
                          opts={{
                            align: "start",
                            loop: false,
                          }}
                          className="w-full"
                        >
                          <CarouselContent className="-ml-1.5">
                             {displayedProducts.map((product) => (
                               <CarouselItem key={product.id} className="pl-1.5 basis-1/3">
                                 <ProductCard
                                   product={product}
                                   onAddToCart={handleAddToCart}
                                   onClick={() => handleProductClick(product)}
                                 />
                               </CarouselItem>
                             ))}
                          </CarouselContent>
                          <CarouselPrevious className="carousel-nav-button -left-2" />
                          <CarouselNext className="carousel-nav-button -right-2" />
                          </Carousel>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                           {displayedProducts.map((product) => (
                             <ProductCard
                               key={product.id}
                               product={product}
                               onAddToCart={handleAddToCart}
                               onClick={() => handleProductClick(product)}
                             />
                           ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      <CartFloatingBar />
      <BottomNavigation />

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleModalAddToCart}
      />
    </div>
  );
};

export default Index;
