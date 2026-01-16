// Map local asset paths to imported images
import skolBeer from "@/assets/skol-beer.jpg";
import brahmaBeer from "@/assets/brahma-beer.jpg";
import antarcticaBeer from "@/assets/antarctica-beer.jpg";
import stellaBeer from "@/assets/stella-beer.jpg";
import bohemiaBeer from "@/assets/bohemia-beer.jpg";
import itaipavaBeer from "@/assets/itaipava-beer.jpg";
import beerBottles from "@/assets/beer-bottles.jpg";
import beerPack from "@/assets/beer-pack.jpg";
import wineBottle from "@/assets/wine-bottle.jpg";
import winePremium from "@/assets/wine-premium.jpg";
import whiskeyBottle from "@/assets/whiskey-bottle.jpg";
import whiskyPremium from "@/assets/whisky-premium.jpg";

const imageMap: Record<string, string> = {
  "/src/assets/skol-beer.jpg": skolBeer,
  "/src/assets/brahma-beer.jpg": brahmaBeer,
  "/src/assets/antarctica-beer.jpg": antarcticaBeer,
  "/src/assets/stella-beer.jpg": stellaBeer,
  "/src/assets/bohemia-beer.jpg": bohemiaBeer,
  "/src/assets/itaipava-beer.jpg": itaipavaBeer,
  "/src/assets/beer-bottles.jpg": beerBottles,
  "/src/assets/beer-pack.jpg": beerPack,
  "/src/assets/wine-bottle.jpg": wineBottle,
  "/src/assets/wine-premium.jpg": winePremium,
  "/src/assets/whiskey-bottle.jpg": whiskeyBottle,
  "/src/assets/whisky-premium.jpg": whiskyPremium,
};

export function getProductImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return "/placeholder.svg";
  }
  
  // Check if it's a local asset path that needs mapping
  if (imageUrl.startsWith("/src/assets/")) {
    return imageMap[imageUrl] || "/placeholder.svg";
  }
  
  // If it's already a full URL or public path, use it directly
  return imageUrl;
}
