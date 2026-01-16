import skolBeer from "@/assets/skol-beer.jpg";
import brahmaBeer from "@/assets/brahma-beer.jpg";
import antarcticaBeer from "@/assets/antarctica-beer.jpg";
import bohemiaBeer from "@/assets/bohemia-beer.jpg";
import itaipavaBeer from "@/assets/itaipava-beer.jpg";
import stellaBeer from "@/assets/stella-beer.jpg";
import beerBottles from "@/assets/beer-bottles.jpg";
import beerPack from "@/assets/beer-pack.jpg";
import whiskeyBottle from "@/assets/whiskey-bottle.jpg";
import whiskeyPremium from "@/assets/whisky-premium.jpg";
import wineBottle from "@/assets/wine-bottle.jpg";
import winePremium from "@/assets/wine-premium.jpg";

export const allProducts = [
  // Cervejas Retornáveis
  {
    id: "ret-001",
    name: "Skol Retornável 600ml",
    price: 3.49,
    originalPrice: 4.29,
    image: skolBeer,
    category: "Cervejas Retornáveis",
    brand: "Skol",
    rating: 4.2,
    reviews: 245,
    discount: 19,
    isNew: false,
    description: "Skol em garrafa retornável de 600ml, perfeita para economizar."
  },
  {
    id: "ret-002", 
    name: "Brahma Retornável 600ml",
    price: 3.79,
    originalPrice: 4.59,
    image: brahmaBeer,
    category: "Cervejas Retornáveis",
    brand: "Brahma",
    rating: 4.3,
    reviews: 312,
    discount: 17,
    isNew: false,
    description: "Brahma tradicional em garrafa retornável de 600ml."
  },
  {
    id: "ret-003",
    name: "Antarctica Retornável 600ml", 
    price: 3.89,
    image: antarcticaBeer,
    category: "Cervejas Retornáveis",
    brand: "Antarctica",
    rating: 4.1,
    reviews: 189,
    discount: 0,
    isNew: false,
    description: "Antarctica gelada em garrafa retornável de 600ml."
  },
  
  // Cerveja
  {
    id: "cer-001",
    name: "Skol Original Lata 350ml",
    price: 2.99,
    originalPrice: 3.49,
    image: skolBeer,
    category: "Cerveja",
    brand: "Skol",
    rating: 4.2,
    reviews: 1245,
    discount: 14,
    isNew: false,
    description: "Cerveja pilsen brasileira refrescante em lata."
  },
  {
    id: "cer-002",
    name: "Brahma Duplo Malte 350ml",
    price: 3.29,
    originalPrice: 3.99,
    image: brahmaBeer,
    category: "Cerveja",
    brand: "Brahma",
    rating: 4.5,
    reviews: 2156,
    discount: 18,
    isNew: false,
    description: "Cerveja encorpada com duplo malte."
  },
  {
    id: "cer-003",
    name: "Antarctica Original 350ml",
    price: 3.19,
    image: antarcticaBeer,
    category: "Cerveja",
    brand: "Antarctica",
    rating: 4.3,
    reviews: 1834,
    discount: 0,
    isNew: false,
    description: "A cerveja mais gelada do Brasil."
  },
  
  // Cervejas Sem Glúten
  {
    id: "glu-001",
    name: "Amstel Ultra Sem Glúten",
    price: 4.99,
    originalPrice: 5.99,
    image: stellaBeer,
    category: "Cervejas Sem Glúten",
    brand: "Amstel",
    rating: 4.4,
    reviews: 287,
    discount: 17,
    isNew: true,
    description: "Cerveja premium sem glúten para celíacos."
  },
  {
    id: "glu-002",
    name: "Stella Artois Sem Glúten",
    price: 6.49,
    originalPrice: 7.99,
    image: stellaBeer,
    category: "Cervejas Sem Glúten", 
    brand: "Stella Artois",
    rating: 4.6,
    reviews: 198,
    discount: 19,
    isNew: true,
    description: "Stella Artois especial para intolerantes ao glúten."
  },
  
  // Energéticos
  {
    id: "ene-001",
    name: "Red Bull Energy Drink",
    price: 7.99,
    originalPrice: 9.49,
    image: beerBottles,
    category: "Energéticos",
    brand: "Red Bull",
    rating: 4.7,
    reviews: 567,
    discount: 16,
    isNew: false,
    description: "Energético original Red Bull 250ml."
  },
  {
    id: "ene-002",
    name: "Monster Energy Original",
    price: 8.49,
    originalPrice: 9.99,
    image: beerBottles,
    category: "Energéticos",
    brand: "Monster",
    rating: 4.5,
    reviews: 432,
    discount: 15,
    isNew: false,
    description: "Monster Energy drink 473ml sabor original."
  },
  
  // Refrigerante
  {
    id: "ref-001",
    name: "Coca-Cola Original 350ml",
    price: 3.49,
    originalPrice: 4.19,
    image: beerBottles,
    category: "Refrigerante",
    brand: "Coca-Cola",
    rating: 4.8,
    reviews: 1234,
    discount: 17,
    isNew: false,
    description: "Coca-Cola gelada em lata de 350ml."
  },
  {
    id: "ref-002",
    name: "Guaraná Antarctica 350ml",
    price: 3.29,
    image: beerBottles,
    category: "Refrigerante",
    brand: "Antarctica",
    rating: 4.6,
    reviews: 987,
    discount: 0,
    isNew: false,
    description: "Guaraná Antarctica tradicional."
  },
  
  // Cervejas Artesanais
  {
    id: "art-001",
    name: "Colorado Indica IPA",
    price: 8.99,
    originalPrice: 10.99,
    image: bohemiaBeer,
    category: "Cervejas Artesanais",
    brand: "Colorado",
    rating: 4.8,
    reviews: 345,
    discount: 18,
    isNew: true,
    description: "IPA artesanal com lúpulos selecionados."
  },
  {
    id: "art-002",
    name: "Bohemia Weiss Artesanal",
    price: 7.49,
    originalPrice: 8.99,
    image: bohemiaBeer,
    category: "Cervejas Artesanais",
    brand: "Bohemia",
    rating: 4.6,
    reviews: 278,
    discount: 17,
    isNew: false,
    description: "Cerveja de trigo artesanal premium."
  },
  
  // Vodka
  {
    id: "vod-001",
    name: "Absolut Vodka Original",
    price: 89.99,
    originalPrice: 109.99,
    image: whiskeyBottle,
    category: "Vodka",
    brand: "Absolut",
    rating: 4.7,
    reviews: 156,
    discount: 18,
    isNew: false,
    description: "Vodka premium sueca Absolut 1L."
  },
  {
    id: "vod-002",
    name: "Smirnoff Red Label",
    price: 69.99,
    originalPrice: 84.99,
    image: whiskeyBottle,
    category: "Vodka",
    brand: "Smirnoff",
    rating: 4.5,
    reviews: 234,
    discount: 18,
    isNew: false,
    description: "Vodka Smirnoff clássica 998ml."
  },
  
  // Cachaça
  {
    id: "cac-001",
    name: "51 Cachaça Premium",
    price: 24.99,
    originalPrice: 29.99,
    image: whiskeyBottle,
    category: "Cachaça",
    brand: "51",
    rating: 4.3,
    reviews: 445,
    discount: 17,
    isNew: false,
    description: "Cachaça 51 premium 965ml."
  },
  {
    id: "cac-002",
    name: "Ypióca Ouro",
    price: 32.99,
    originalPrice: 39.99,
    image: whiskeyBottle,
    category: "Cachaça",
    brand: "Ypióca",
    rating: 4.4,
    reviews: 298,
    discount: 18,
    isNew: false,
    description: "Cachaça Ypióca envelhecida."
  },
  
  // Drinks Prontos
  {
    id: "dri-001",
    name: "Smirnoff Ice Original",
    price: 6.99,
    originalPrice: 8.49,
    image: beerBottles,
    category: "Drinks Prontos",
    brand: "Smirnoff",
    rating: 4.2,
    reviews: 387,
    discount: 18,
    isNew: false,
    description: "Drink pronto Smirnoff Ice gelado."
  },
  {
    id: "dri-002",
    name: "Skol Beats Senses",
    price: 5.49,
    originalPrice: 6.99,
    image: skolBeer,
    category: "Drinks Prontos",
    brand: "Skol",
    rating: 4.1,
    reviews: 523,
    discount: 21,
    isNew: true,
    description: "Drink pronto saborizado Skol Beats."
  },
  
  // Cervejas Long Neck
  {
    id: "lon-001",
    name: "Corona Extra Long Neck",
    price: 5.99,
    originalPrice: 7.49,
    image: stellaBeer,
    category: "Cervejas Long Neck",
    brand: "Corona",
    rating: 4.6,
    reviews: 667,
    discount: 20,
    isNew: false,
    description: "Corona Extra mexicana em garrafa long neck."
  },
  {
    id: "lon-002",
    name: "Stella Artois Long Neck",
    price: 6.49,
    originalPrice: 7.99,
    image: stellaBeer,
    category: "Cervejas Long Neck",
    brand: "Stella Artois",
    rating: 4.8,
    reviews: 445,
    discount: 19,
    isNew: false,
    description: "Stella Artois premium em long neck."
  },
  
  // Vinhos
  {
    id: "vin-001",
    name: "Concha y Toro Tinto",
    price: 39.99,
    originalPrice: 49.99,
    image: wineBottle,
    category: "Vinhos",
    brand: "Concha y Toro",
    rating: 4.5,
    reviews: 234,
    discount: 20,
    isNew: false,
    description: "Vinho tinto chileno premium."
  },
  {
    id: "vin-002",
    name: "Salton Branco Suave",
    price: 24.99,
    originalPrice: 32.99,
    image: winePremium,
    category: "Vinhos",
    brand: "Salton",
    rating: 4.2,
    reviews: 178,
    discount: 24,
    isNew: false,
    description: "Vinho branco brasileiro suave."
  },
  
  // Whisky
  {
    id: "whi-001",
    name: "Jack Daniel's Old No. 7",
    price: 149.99,
    originalPrice: 179.99,
    image: whiskeyPremium,
    category: "Whisky",
    brand: "Jack Daniel's",
    rating: 4.8,
    reviews: 456,
    discount: 17,
    isNew: false,
    description: "Whisky americano Jack Daniel's 1L."
  },
  {
    id: "whi-002",
    name: "Johnnie Walker Red Label",
    price: 89.99,
    originalPrice: 109.99,
    image: whiskeyPremium,
    category: "Whisky",
    brand: "Johnnie Walker",
    rating: 4.6,
    reviews: 334,
    discount: 18,
    isNew: false,
    description: "Whisky escocês Red Label 1L."
  },
  
  // Águas, Gelos e Suco
  {
    id: "agu-001",
    name: "Água Crystal 500ml",
    price: 1.99,
    originalPrice: 2.49,
    image: beerBottles,
    category: "Águas, Gelos e Suco",
    brand: "Crystal",
    rating: 4.1,
    reviews: 567,
    discount: 20,
    isNew: false,
    description: "Água mineral Crystal 500ml."
  },
  {
    id: "agu-002",
    name: "Suco Del Valle Laranja 1L",
    price: 6.99,
    originalPrice: 8.49,
    image: beerBottles,
    category: "Águas, Gelos e Suco",
    brand: "Del Valle",
    rating: 4.3,
    reviews: 445,
    discount: 18,
    isNew: false,
    description: "Suco de laranja Del Valle integral."
  },
  
  // Churrasco
  {
    id: "chu-001",
    name: "Kit Churrasco - 12 Cervejas Mix",
    price: 45.99,
    originalPrice: 59.99,
    image: beerPack,
    category: "Churrasco",
    brand: "Mix",
    rating: 4.7,
    reviews: 289,
    discount: 23,
    isNew: true,
    description: "Kit especial para churrasco com 12 cervejas sortidas."
  },
  {
    id: "chu-002",
    name: "Combo Churrasco Premium",
    price: 89.99,
    originalPrice: 119.99,
    image: beerPack,
    category: "Churrasco",
    brand: "Premium",
    rating: 4.8,
    reviews: 167,
    discount: 25,
    isNew: true,
    description: "Combo premium com cervejas e destilados para churrasco."
  }
];

// Função para obter produtos por categoria
export const getProductsByCategory = (category: string) => {
  return allProducts.filter(product => product.category === category);
};

// Lista de todas as categorias disponíveis
export const categories = [
  "Cervejas Retornáveis",
  "Cerveja", 
  "Cervejas Sem Glúten",
  "Energéticos",
  "Refrigerante",
  "Cervejas Artesanais",
  "Vodka",
  "Cachaça",
  "Drinks Prontos",
  "Cervejas Long Neck",
  "Vinhos",
  "Whisky",
  "Águas, Gelos e Suco",
  "Churrasco"
];