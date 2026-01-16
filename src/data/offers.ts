import beerPack from "@/assets/beer-pack.jpg";
import whiskeyPremium from "@/assets/whisky-premium.jpg"; 
import winePremium from "@/assets/wine-premium.jpg";

export const dailyOffers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    title: "Pack 12 Cervejas",
    subtitle: "Seleção especial das melhores cervejas do Brasil",
    discount: 25,
    image: beerPack,
    originalPrice: 39.90,
    salePrice: 29.90,
    timeLeft: "Restam 18h 32min",
    gradient: "linear-gradient(135deg, hsl(45 100% 55%) 0%, hsl(45 100% 45%) 50%, hsl(45 100% 35%) 100%)"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008", 
    title: "Whisky Premium",
    subtitle: "Destilados premium com preços imperdíveis",
    discount: 18,
    image: whiskeyPremium,
    originalPrice: 109.99,
    salePrice: 89.99,
    timeLeft: "Restam 12h 15min",
    gradient: "linear-gradient(135deg, hsl(0 0% 10%) 0%, hsl(45 80% 40%) 50%, hsl(0 0% 10%) 100%)"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    title: "Vinho Premium",
    subtitle: "Vinhos selecionados com desconto especial",
    discount: 20,
    image: winePremium,
    originalPrice: 74.99,
    salePrice: 59.99,
    timeLeft: "Restam 6h 45min",
    gradient: "linear-gradient(135deg, hsl(0 0% 5%) 0%, hsl(30 60% 30%) 50%, hsl(0 0% 5%) 100%)"
  }
];