export enum BeerType {
  PILSEN = 'Pilsen',
  IPA = 'IPA',
  WEISS = 'Weiss',
  STOUT = 'Stout',
  LAGER = 'Puro Malte'
}

export enum ProductCategory {
  GROWLER = 'Growlers',
  KEG = 'Barris',
  COMBO = 'Combos',
  STRUCTURE = 'Estrutura'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type?: BeerType;
  category: ProductCategory;
  volumeLiters?: number; // e.g., 30, 50
  isPopular?: boolean;
  abv?: number; // Alcohol by volume
  ibu?: number; // Bitterness
  pairing?: string; // Food pairing suggestions
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CalculatorResult {
  totalLiters: number;
  recommendedKegs: string[]; // IDs of products
}

export type ViewState = 'home' | 'menu' | 'calculator' | 'cart';