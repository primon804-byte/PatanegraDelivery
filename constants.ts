
import { Product, ProductCategory, BeerType } from './types';

export const WHATSAPP_NUMBERS = {
  MARECHAL: "5545988175171", 
  FOZ: "5545999901000" 
};

export const WHATSAPP_NUMBER = "5545988175171"; 

export const HERO_IMAGES = [
  'https://i.ibb.co/jZWpr3kK/IMG-9249-1.jpg',
];

export const PRODUCTS: Product[] = [
  {
    id: 'growler-pilsen-cristal-1l',
    name: 'Pilsen Cristal 1L',
    description: 'A típica Pilsen dos brasileiros. Cerveja clara, leve, refrescante e de baixo amargor.',
    price: 17,
    image: 'https://www.starkdistribuidora.com.br/storage/products/PWekuFutk8cQeNmz.jpg',
    backImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800', // PRAIA
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
    backImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800', // FAZENDA
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
    backImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800', // BAR
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
    backImage: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=800', // CACHOEIRA
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
    backImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800', // CIDADE
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
    backImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800', // BAR/NOITE
    category: ProductCategory.GROWLER,
    type: BeerType.LAGER,
    volumeLiters: 1,
    abv: 5.0,
    ibu: 0,
    pairing: 'Carnes assadas, Queijos, Massas, Sobremesas',
  },

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
];
