import skolBeer from "@/assets/skol-beer.jpg";
import brahmaBeer from "@/assets/brahma-beer.jpg";
import antarcticaBeer from "@/assets/antarctica-beer.jpg";
import bohemiaBeer from "@/assets/bohemia-beer.jpg";
import itaipavaBeer from "@/assets/itaipava-beer.jpg";
import stellaBeer from "@/assets/stella-beer.jpg";

export const products = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Skol Original",
    price: 3.99,
    originalPrice: 4.99,
    image: skolBeer,
    category: "Cerveja Pilsen",
    brand: "Skol",
    rating: 4.2,
    reviews: 1245,
    discount: 20,
    isNew: false,
    description: "Cerveja pilsen brasileira refrescante e leve, perfeita para momentos descontraídos."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002", 
    name: "Brahma Duplo Malte",
    price: 4.49,
    originalPrice: 5.49,
    image: brahmaBeer,
    category: "Cerveja Pilsen",
    brand: "Brahma",
    rating: 4.5,
    reviews: 2156,
    discount: 18,
    isNew: false,
    description: "Cerveja encorpada com duplo malte, sabor mais intenso e cremosidade especial."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Antarctica Original",
    price: 4.29,
    image: antarcticaBeer, 
    category: "Cerveja Pilsen",
    brand: "Antarctica",
    rating: 4.3,
    reviews: 1834,
    discount: 0,
    isNew: false,
    description: "A cerveja mais gelada do Brasil, com sabor refrescante e tradicional."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Bohemia Puro Malte",
    price: 5.99,
    originalPrice: 7.49,
    image: bohemiaBeer,
    category: "Cerveja Premium",
    brand: "Bohemia", 
    rating: 4.7,
    reviews: 987,
    discount: 25,
    isNew: false,
    description: "Cerveja premium 100% puro malte, com sabor diferenciado e qualidade superior."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Itaipava Original",
    price: 3.79,
    image: itaipavaBeer,
    category: "Cerveja Pilsen",
    brand: "Itaipava",
    rating: 4.1,
    reviews: 756,
    discount: 0,
    isNew: false,
    description: "Cerveja brasileira tradicional com sabor marcante e refrescância única."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    name: "Stella Artois",
    price: 7.99,
    originalPrice: 9.99,
    image: stellaBeer,
    category: "Cerveja Premium",
    brand: "Stella Artois",
    rating: 4.8,
    reviews: 1456,
    discount: 20,
    isNew: true,
    description: "Cerveja belga premium com sabor refinado e tradição centenária."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    name: "Skol Beats",
    price: 4.49,
    originalPrice: 5.99,
    image: skolBeer,
    category: "Cerveja Saborizada", 
    brand: "Skol",
    rating: 4.0,
    reviews: 643,
    discount: 25,
    isNew: true,
    description: "Cerveja saborizada inovadora, perfeita para baladas e festas."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    name: "Brahma Chopp Escuro",
    price: 4.99,
    originalPrice: 6.49,
    image: brahmaBeer,
    category: "Cerveja Escura",
    brand: "Brahma",
    rating: 4.6,
    reviews: 892,
    discount: 23,
    isNew: false,
    description: "Cerveja escura com sabor encorpado e aroma diferenciado."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    name: "Antarctica Sub Zero",
    price: 4.99,
    image: antarcticaBeer,
    category: "Cerveja Premium",
    brand: "Antarctica",
    rating: 4.4,
    reviews: 1123,
    discount: 0,
    isNew: false,
    description: "Cerveja ultra-refrescante com tecnologia Sub Zero para máximo gelado."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "Bohemia Weiss",
    price: 6.99,
    originalPrice: 8.99,
    image: bohemiaBeer,
    category: "Cerveja de Trigo",
    brand: "Bohemia",
    rating: 4.5,
    reviews: 567,
    discount: 22,
    isNew: true,
    description: "Cerveja de trigo tradicional alemã com toque brasileiro único."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    name: "Itaipava Malzbier",
    price: 3.99,
    image: itaipavaBeer,
    category: "Cerveja Malzbier",
    brand: "Itaipava",
    rating: 3.9,
    reviews: 834,
    discount: 0,
    isNew: false,
    description: "Cerveja maltada doce e suave, ideal para quem aprecia sabores únicos."
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    name: "Stella Artois Cidre",
    price: 8.99,
    originalPrice: 10.99,
    image: stellaBeer,
    category: "Cidra Premium",
    brand: "Stella Artois",
    rating: 4.7,
    reviews: 1234,
    discount: 18,
    isNew: true,
    description: "Cidra premium refrescante com sabor de maçã e elegância europeia."
  }
];