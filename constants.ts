
import { Product, ProductCategory, BeerType } from './types';

// ==============================================================================
// CONFIGURAÇÃO DOS WHATSAPPS (POR UNIDADE)
// ==============================================================================
export const WHATSAPP_NUMBERS = {
  // Matriz - Marechal Cândido Rondon
  MARECHAL: "5545988175171", 
  // Filial - Foz do Iguaçu
  FOZ: "5545999901000" 
};

// Mantido para compatibilidade se necessário
export const WHATSAPP_NUMBER = "5545988175171"; 

// ==============================================================================
// CONFIGURAÇÃO DO FLYER / DESTAQUE
// ==============================================================================
export const HERO_IMAGES = [
  'https://i.ibb.co/jZWpr3kK/IMG-9249-1.jpg',
];

export const PRODUCTS: Product[] = [
  // ============================================================================
  // GROWLERS
  // ============================================================================
  {
    id: 'growler-pilsen-cristal-1l',
    name: 'Pilsen Cristal 1L',
    description: 'A típica Pilsen dos brasileiros. Cerveja clara, leve, refrescante e de baixo amargor.',
    price: 17,
    image: 'https://www.starkdistribuidora.com.br/storage/products/PWekuFutk8cQeNmz.jpg',
    category: ProductCategory.GROWLER,
    type: BeerType.PILSEN,
    volumeLiters: 1,
    abv: 4.5,
    ibu: 7,
    pairing: 'Hambúrguer, Massas, Aperitivos, Queijos',
  },
  {
    id: 'growler-premium-lager-1l',
    name: 'Premium Lager 1L',
    description: 'Cerveja dourada com notas maltadas, corpo médio, amargor moderado e espuma cremosa.',
    price: 18,
    image: 'https://www.starkdistribuidora.com.br/storage/products/u9xHRJtgWyiKh3r2.jpg',
    category: ProductCategory.GROWLER,
    type: BeerType.LAGER,
    volumeLiters: 1,
    abv: 4.5,
    ibu: 12,
    pairing: 'Hambúrguer, Massas, Pizza, Frutos do mar',
  },
  {
    id: 'growler-american-ipa-1l',
    name: 'American IPA 1L',
    description: 'IPA de coloração acobreada, com amargor moderado e aromas cítricos intensos, remetendo ao maracujá.',
    price: 25,
    image: 'https://www.starkdistribuidora.com.br/storage/products/8OSjWs8QLdlDOtLo.jpg',
    category: ProductCategory.GROWLER,
    type: BeerType.IPA,
    volumeLiters: 1,
    abv: 6.1,
    ibu: 47,
    pairing: 'Hambúrguer, Carne assada, Comida mexicana, Massas',
  },
  {
    id: 'growler-session-ipa-1l',
    name: 'Session IPA 1L',
    description: 'Cerveja leve, dourada, extremamente refrescante, com amargor moderado e aroma cítrico intenso.',
    price: 25,
    image: 'https://www.starkdistribuidora.com.br/storage/products/L8ciZMapSqAfmEja.jpg',
    category: ProductCategory.GROWLER,
    type: BeerType.IPA,
    volumeLiters: 1,
    abv: 5.0,
    ibu: 30,
    pairing: 'Hambúrguer, Comida mexicana, Carne assada, Massas',
  },
  {
    id: 'growler-vinho-tinto-1l',
    name: 'Chopp de Vinho Tinto 1L',
    description: 'Fermentado de uvas Isabel e Bordeaux, com perfil frisante e creme marcante.',
    price: 25,
    image: 'https://www.starkdistribuidora.com.br/storage/products/TQp206a6s5GjQbRy.jpg',
    category: ProductCategory.GROWLER,
    type: BeerType.LAGER,
    volumeLiters: 1,
    abv: 5.0,
    ibu: 0,
    pairing: 'Carnes, Queijos, Massas, Sobremesas',
  },
  {
    id: 'growler-vinho-branco-1l',
    name: 'Chopp de Vinho Branco 1L',
    description: 'Fermentado de uvas Moscato, levemente adocicado, ideal para dias quentes.',
    price: 25,
    image: 'https://www.starkdistribuidora.com.br/storage/products/a95saNB5bXxb9oOg.jpg',
    category: ProductCategory.GROWLER,
    type: BeerType.LAGER,
    volumeLiters: 1,
    abv: 5.0,
    ibu: 0,
    pairing: 'Carnes assadas, Queijos, Massas, Sobremesas',
  },

  // ============================================================================
  // BARRIS 30L
  // ============================================================================
  {
    id: 'keg-pilsen-30',
    name: 'Barril Pilsen 30L',
    description: 'A típica Pilsen dos brasileiros. Cerveja clara, leve, refrescante e de baixo amargor.',
    price: 450,
    image: 'https://i.ibb.co/szz3tB3/patanegra-1765760642049.png',
    category: ProductCategory.KEG30,
    type: BeerType.PILSEN,
    volumeLiters: 30,
    isPopular: true,
    abv: 4.5,
    ibu: 7,
    pairing: 'Churrasco completo, frango a passarinho e pizza margherita.',
  },
  {
    id: 'keg-lager-30',
    name: 'Barril Premium Lager 30L',
    description: 'Cerveja dourada com notas maltadas, corpo médio, amargor moderado e espuma cremosa.',
    price: 480,
    image: 'https://i.ibb.co/4w56W9gb/patanegra-1765760786878.png',
    category: ProductCategory.KEG30,
    type: BeerType.LAGER,
    volumeLiters: 30,
    abv: 4.5,
    ibu: 12,
    pairing: 'Hambúrguer, Massas, Pizza, Frutos do mar',
  },
  {
    id: 'keg-vinho-tinto-30',
    name: 'Barril Vinho Tinto 30L',
    description: 'Fermentado de uvas Isabel e Bordeaux, com perfil frisante e creme marcante.',
    price: 550,
    image: 'https://i.ibb.co/xqBsYVDJ/patanegra-1765760427371.jpg',
    category: ProductCategory.KEG30,
    type: BeerType.LAGER,
    volumeLiters: 30,
    abv: 5.0,
    ibu: 0,
    pairing: 'Carnes, Queijos, Massas, Sobremesas',
  },
  {
    id: 'keg-vinho-branco-30',
    name: 'Barril Vinho Branco 30L',
    description: 'Fermentado de uvas Moscato, levemente adocicado, ideal para dias quentes.',
    price: 550,
    image: 'https://i.ibb.co/21CdL4Gy/patanegra-1765760193272.jpg',
    category: ProductCategory.KEG30,
    type: BeerType.LAGER,
    volumeLiters: 30,
    abv: 5.0,
    ibu: 0,
    pairing: 'Carnes assadas, Queijos, Massas, Sobremesas',
  },
  {
    id: 'keg-session-ipa-30',
    name: 'Barril Session IPA 30L',
    description: 'Cerveja leve, dourada, extremamente refrescante, com amargor moderado e aroma cítrico intenso.',
    price: 580,
    image: 'https://i.ibb.co/gZLtmYQq/patanegra-1765760756583.png',
    category: ProductCategory.KEG30,
    type: BeerType.IPA,
    volumeLiters: 30,
    abv: 5.0,
    ibu: 30,
    pairing: 'Hambúrguer, Comida mexicana, Carne assada, Massas',
  },

  // ============================================================================
  // BARRIS 50L
  // ============================================================================
  {
    id: 'keg-pilsen-50',
    name: 'Barril Pilsen 50L',
    description: 'A típica Pilsen dos brasileiros. Cerveja clara, leve, refrescante e de baixo amargor.',
    price: 700,
    image: 'https://i.ibb.co/szz3tB3/patanegra-1765760642049.png',
    category: ProductCategory.KEG50,
    type: BeerType.PILSEN,
    volumeLiters: 50,
    abv: 4.5,
    ibu: 7,
    pairing: 'Churrasco completo e eventos corporativos.',
  },
  {
    id: 'keg-lager-50',
    name: 'Barril Premium Lager 50L',
    description: 'Cerveja dourada com notas maltadas, corpo médio, amargor moderado e espuma cremosa.',
    price: 750,
    image: 'https://i.ibb.co/4w56W9gb/patanegra-1765760786878.png',
    category: ProductCategory.KEG50,
    type: BeerType.LAGER,
    volumeLiters: 50,
    abv: 4.5,
    ibu: 12,
    pairing: 'Churrasco completo, frango a passarinho e pizza margherita.',
  },
];
