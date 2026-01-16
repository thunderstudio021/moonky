import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Category {
  name: string;
  count: number;
}

interface HeroSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  onCategoryClick: (category: string) => void;
}

const HeroSearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  categories,
  onCategoryClick 
}: HeroSearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value when searchTerm changes externally (e.g., category click or clear)
  useEffect(() => {
    setLocalValue(searchTerm);
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!localValue.trim()) return;
    
    setIsSearching(true);
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    onSearchChange(localValue);
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setLocalValue("");
    onSearchChange("");
  };

  return (
    <div className="relative z-10 mb-6 sm:mb-8">
      {/* Search Container - Full Width */}
      <div className="w-full">
        {/* Glow effect background */}
        <div 
          className={cn(
            "absolute inset-0 rounded-2xl transition-all duration-500 blur-xl",
            isFocused 
              ? "bg-primary/20 scale-[1.02]" 
              : "bg-transparent scale-100"
          )}
        />
        
        {/* Search Input Container */}
        <div 
          className={cn(
            "relative bg-card/80 backdrop-blur-md rounded-2xl border-2 transition-all duration-300",
            isFocused 
              ? "border-primary shadow-lg shadow-primary/20" 
              : "border-border hover:border-primary/50"
          )}
        >
          <div className="flex items-center">
            <div className={cn(
              "pl-4 sm:pl-5 transition-colors duration-300",
              isFocused ? "text-primary" : "text-muted-foreground"
            )}>
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            
            <Input
              ref={inputRef}
              placeholder="O que você procura hoje?"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="border-0 bg-transparent h-12 sm:h-14 text-base sm:text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 px-3"
            />
            
            {localValue && (
              <button
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            
            <Button
              onClick={handleSearch}
              disabled={isSearching || !localValue.trim()}
              size="sm"
              className="mr-2 h-9 px-4 rounded-xl min-w-[90px]"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1" />
                  Buscar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Categories - Inline Scroll */}
      {categories.length > 0 && (
        <div className="mt-3 sm:mt-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 sm:gap-2.5 pb-1">
            {categories.map((category, index) => (
              <button
                key={category.name}
                onClick={() => onCategoryClick(category.name)}
                className={cn(
                  "group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0",
                  "bg-card/60 backdrop-blur-sm border border-border",
                  "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                  "hover:shadow-md hover:shadow-primary/20",
                  "transition-all duration-300 hover:scale-105",
                  "animate-fade-in"
                )}
                style={{ 
                  animationDelay: `${index * 30}ms`,
                  animationFillMode: 'backwards'
                }}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {category.name}
                  <span className={cn(
                    "text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full",
                    "bg-muted/80 text-muted-foreground",
                    "group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground",
                    "transition-colors duration-300"
                  )}>
                    {category.count}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSearchBar;
