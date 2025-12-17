
export enum BeerType {
  PILSEN = 'Pilsen',
  IPA = 'IPA',
  WEISS = 'Weiss',
  STOUT = 'Stout',
  LAGER = 'Puro Malte'
}

export enum ProductCategory {
  GROWLER = 'Growlers',
  KEG30 = 'Barris 30L',
  KEG50 = 'Barris 50L'
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
  // Extra options for Event Kegs
  rentTables?: boolean;
  rentUmbrellas?: boolean;
  cupsQuantity?: number | null; // 100 - 1000
}

export interface CalculatorResult {
  totalLiters: number;
  recommendedKegs: string[]; // IDs of products
}

export type ViewState = 'home' | 'menu' | 'calculator' | 'cart' | 'contact';

// --- Auth & Admin Types ---

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  category: string; // Added category/class
  quantity: number;
  price: number;
  extras?: {
    rentTables?: boolean;
    rentUmbrellas?: boolean;
    cupsQuantity?: number | null;
  };
}

export interface Order {
  id: string;
  user_id: string;
  customer_name?: string; // Snapshot of name at time of order
  customer_phone?: string;
  total: number;
  status: string;
  payment_method: string;
  branch_location: string;
  delivery_address?: string;
  created_at: string;
  order_items?: OrderItem[]; // For nested fetching
}

export interface OrderHistoryItem {
  id: string;
  date: string;
  total: number;
  status: 'Entregue' | 'Em Andamento' | 'Cancelado';
  itemsSummary: string;
}
