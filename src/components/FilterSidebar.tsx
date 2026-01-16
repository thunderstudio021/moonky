import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface FilterSidebarProps {
  onFiltersChange: (filters: any) => void;
}

const FilterSidebar = ({ onFiltersChange }: FilterSidebarProps) => {
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const categories = [
    { id: "cerveja pilsen", label: "Cerveja Pilsen", count: 15 },
    { id: "cerveja premium", label: "Cerveja Premium", count: 12 },
    { id: "cerveja saborizada", label: "Cerveja Saborizada", count: 8 },
    { id: "cerveja escura", label: "Cerveja Escura", count: 6 },
    { id: "cerveja de trigo", label: "Cerveja de Trigo", count: 4 },
    { id: "cerveja malzbier", label: "Malzbier", count: 3 },
    { id: "cidra premium", label: "Cidra", count: 2 },
  ];

  const brands = [
    { id: "skol", label: "Skol", count: 8 },
    { id: "brahma", label: "Brahma", count: 6 },
    { id: "antarctica", label: "Antarctica", count: 4 },
    { id: "bohemia", label: "Bohemia", count: 3 },
    { id: "itaipava", label: "Itaipava", count: 2 },
    { id: "stella artois", label: "Stella Artois", count: 2 },
    { id: "heineken", label: "Heineken", count: 1 },
    { id: "budweiser", label: "Budweiser", count: 1 },
  ];

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const updated = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter(id => id !== categoryId);
    
    setSelectedCategories(updated);
    onFiltersChange({
      categories: updated,
      brands: selectedBrands,
      priceRange
    });
  };

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const updated = checked
      ? [...selectedBrands, brandId]
      : selectedBrands.filter(id => id !== brandId);
    
    setSelectedBrands(updated);
    onFiltersChange({
      categories: selectedCategories,
      brands: updated,
      priceRange
    });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    onFiltersChange({
      categories: selectedCategories,
      brands: selectedBrands,
      priceRange: value
    });
  };

  return (
    <div className="w-80 space-y-6">
      <Card className="p-6 shadow-card transition-smooth hover:shadow-hover">
        <h3 className="font-semibold text-lg mb-4">Filtros</h3>
        
        {/* Price Range */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Faixa de Preço</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={500}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>R$ {priceRange[0]}</span>
              <span>R$ {priceRange[1]}</span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Categories */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Categorias</Label>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={category.id} 
                  className="text-sm flex-1 cursor-pointer"
                >
                  {category.label}
                </Label>
                <span className="text-xs text-muted-foreground">
                  ({category.count})
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Brands */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Marcas</Label>
          <div className="space-y-3">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={brand.id}
                  checked={selectedBrands.includes(brand.id)}
                  onCheckedChange={(checked) => 
                    handleBrandChange(brand.id, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={brand.id} 
                  className="text-sm flex-1 cursor-pointer"
                >
                  {brand.label}
                </Label>
                <span className="text-xs text-muted-foreground">
                  ({brand.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FilterSidebar;