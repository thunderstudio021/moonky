import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  brand_id: string;
  category_id: string;
  stock: number;
  is_on_sale: boolean;
  sale_price: number | null;
  rating?: number;
  reviews_count?: number;
  brands?: { name: string };
  product_categories?: { name: string };
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      searchProducts("");
    }
  }, [isOpen]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const searchProducts = async (query: string) => {
    try {
      setLoading(true);
      
      // Fetch all active products
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brands (name),
          product_categories (name)
        `)
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      let results = data || [];

      // Filter on the client side
      if (query.trim() !== "") {
        const searchNormalized = normalizeText(query);
        results = results.filter(product => {
          const productName = normalizeText(product.name);
          const brandName = product.brands?.name ? normalizeText(product.brands.name) : '';
          const categoryName = product.product_categories?.name ? normalizeText(product.product_categories.name) : '';
          
          return productName.includes(searchNormalized) ||
                 brandName.includes(searchNormalized) ||
                 categoryName.includes(searchNormalized);
        });
      } else {
        // Show only first 8 products when no search
        results = results.slice(0, 8);
      }

      // Limit results to 12 when searching
      if (query.trim() !== "") {
        results = results.slice(0, 12);
      }

      setFilteredProducts(results);
    } catch (error) {
      console.error("Error searching products:", error);
      toast({
        title: "Erro ao buscar produtos",
        description: "Não foi possível buscar os produtos.",
        variant: "destructive",
      });
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Produtos
            </DialogTitle>
            <button
              onClick={handleClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="flex-shrink-0 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite o nome da cerveja, marca ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? `${filteredProducts.length} resultado(s) encontrado(s)` : 'Produtos em destaque'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} onClick={handleClose}>
                    <ProductCard product={product} onAddToCart={addItem} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground">
                Tente buscar por outro termo ou navegue pelas categorias
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;