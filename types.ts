
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
  backImage?: string; 
  type?: BeerType;
  category: ProductCategory;
  volumeLiters?: number; 
  isPopular?: boolean;
  abv?: number; 
  ibu?: number; 
  pairing?: string; 
}

export interface CartItem extends Product {
  quantity: number;
  rentTables?: boolean;
  rentUmbrellas?: boolean;
  cupsQuantity?: number | null; 
}

export interface CalculatorResult {
  totalLiters: number;
  recommendedKegs: string[]; 
}

export type ViewState = 'home' | 'menu' | 'calculator' | 'cart' | 'contact' | 'community' | 'collection';

// --- Auth & Admin Types ---

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
  cpf?: string;
  rg?: string;
  bairro?: string;
  city?: string;
  address_proof_url?: string;
  cnh_url?: string;
  created_at?: string;
  unlocked_stickers?: string[];
  completed_missions?: number[]; // IDs das missões concluídas
  redeemed_missions?: number[]; // IDs das missões cujas recompensas foram resgatadas
  used_discounts?: number[]; // IDs das missões cujos descontos já foram aplicados em pedidos
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  category: string; 
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
  customer_name?: string; 
  customer_phone?: string;
  total: number;
  status: string;
  payment_method: string;
  branch_location: string;
  delivery_address?: string;
  created_at: string;
  order_items?: OrderItem[]; 
  event_address?: string;
  event_date?: string;
  event_time?: string;
  voltage?: '110v' | '220v';
  provide_info_later?: boolean;
  discount_applied?: number;
}

export interface OrderHistoryItem {
  id: string;
  date: string;
  total: number;
  status: 'Entregue' | 'Em Andamento' | 'Cancelado';
  itemsSummary: string;
}

// --- Community Types ---

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  content_text: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content_text: string;
  content_image?: string;
  likes: number;
  location?: string;
  created_at: string;
  is_liked?: boolean;
  comments_count?: number;
}

export interface Story {
  id: number;
  name: string;
  img: string;
  content_img?: string;
  active?: boolean;
  isMe?: boolean;
}
