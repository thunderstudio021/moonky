import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, ShoppingCart, Heart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import ProductRating from "@/components/ProductRating";
import { useFavorites } from "@/hooks/useFavorites";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/utils/imageHelper";

const ProductDetails = () => {
  const { id } = useParams();
  const { addItem, getTotalItems } = useCart();
  const { toast } = useToast();
  const { toggleFavorite, isFavorite: isFav, loading: favLoading } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            brands(id, name),
            product_categories(id, name)
          `)
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setProduct({
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.sale_price && data.is_on_sale ? data.sale_price : data.price,
            originalPrice: data.is_on_sale ? data.price : undefined,
            discount: data.is_on_sale && data.sale_price 
              ? Math.round(((data.price - data.sale_price) / data.price) * 100)
              : undefined,
            image: getProductImage(data.image_url),
            category: data.product_categories?.name || 'Sem categoria',
            brand: data.brands?.name || 'Sem marca',
            rating: 4.5,
            isNew: false
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearchChange={() => {}} cartCount={getTotalItems()} />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearchChange={() => {}} cartCount={getTotalItems()} />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link to="/">
            <Button>Voltar para a loja</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast({
      title: "Adicionado ao carrinho!",
      description: `${quantity}x ${product.name} adicionado ao seu carrinho.`,
    });
  };

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchChange={() => {}} cartCount={getTotalItems()} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-smooth">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a loja
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden shadow-card">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Brand */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{product.category}</Badge>
              <span className="text-sm text-muted-foreground">{product.brand}</span>
            </div>

            {/* Title & Badges */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-xl md:text-3xl font-bold text-foreground">{product.name}</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 ${isFav(product.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                  disabled={favLoading}
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isFav(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {product.isNew && (
                  <Badge variant="default">Novo</Badge>
                )}
                {product.discount && (
                  <Badge variant="destructive">-{product.discount}%</Badge>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 md:h-4 md:w-4 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs md:text-sm text-muted-foreground">
                {product.rating} ({(product as any).reviews || 0} avaliações)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl md:text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base md:text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.discount && (
                <p className="text-xs md:text-sm text-green-600">
                  Economia de {formatPrice((product.originalPrice || product.price) - product.price)}
                </p>
              )}
            </div>

            <Separator />

            {/* Quantity & Add to Cart */}
            <Card className="p-3 md:p-4">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base font-medium">Quantidade:</span>
                  <div className="flex items-center gap-2 md:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <span className="font-semibold text-base md:text-lg min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <Plus className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-base md:text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatPrice(product.price * quantity)}</span>
                </div>

                <Button 
                  size="lg" 
                  className="w-full text-sm md:text-base"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </Card>

            {/* Product Details */}
            <Card className="p-3 md:p-4">
              <h3 className="text-sm md:text-base font-semibold mb-2 md:mb-3">Detalhes do Produto</h3>
              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marca:</span>
                  <span>{product.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avaliação:</span>
                  <span>{product.rating}/5.0</span>
                </div>
              </div>
            </Card>

            {/* Avaliações */}
            <div className="mt-8">
              <ProductRating 
                productId={product.id} 
                currentRating={product.rating || 0}
                reviewsCount={(product as any).reviews || 0}
              />
            </div>

            {/* Related Products - Escondido por enquanto, precisa ser implementado com Supabase */}
            {/* <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Produtos Relacionados</h3>
            </div> */}
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden pb-20">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default ProductDetails;