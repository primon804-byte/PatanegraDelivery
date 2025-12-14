
import { Product, ProductCategory, BeerType } from './types';

// ==============================================================================
// CONFIGURAÇÃO DOS WHATSAPPS (POR UNIDADE)
// ==============================================================================
export const WHATSAPP_NUMBERS = {
  // Matriz
  MARECHAL: "5545999111741", 
  // Filial (Coloque o número correto de Foz aqui, mantive o mesmo para teste)
  FOZ: "5545999111741" 
};

// Mantido para compatibilidade se necessário, mas o código usará o objeto acima
export const WHATSAPP_NUMBER = "5545999111741"; 

// ==============================================================================
// CONFIGURAÇÃO DO FLYER ROTATIVO (TELA INICIAL)
// ==============================================================================
// Substitua os links abaixo pelas URLs das suas imagens.
// Você pode usar links da internet ou caminhos locais (ex: '/assets/foto1.jpg')
export const HERO_IMAGES = [
  'https://i.imgur.com/gZiNOEd.png', // Foto 1: Puro Malte
  'https://i.imgur.com/SA2rL5d.jpeg', // Foto 2: Vinho Branco
  'https://i.imgur.com/z56aU0d.jpeg', // Foto 3: IPA GELO
  'https://i.imgur.com/oCMsckR.jpeg', // Foto 4:  IPA DRINK
  'https://i.imgur.com/8klnamF.jpeg', // Foto 5: HEFE WEISS
  'https://i.imgur.com/21wePkb.jpeg', // Foto 6: Natalino 1
  'https://i.imgur.com/35PIyrN.jpeg', // Foto 7: Chopeira 1
  'https://i.imgur.com/mAEF2Ah.jpeg', // Foto 8: Produtos Patanegra
  'https://i.imgur.com/hm4KO4J_d.webp?maxwidth=760&fidelity=grand', // Foto 9:  MARCA PATANEGRA
  'https://i.imgur.com/O4A9IeK.jpeg', // Foto 10: Trave 1
];

export const PRODUCTS: Product[] = [
  // GROWLERS (ATUALIZADO)
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

  // BARRIS
  {
    id: 'keg-pilsen-30',
    name: 'Barril Pilsen 30L',
    description: 'Leve, refrescante e perfeito para grandes churrascos.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&q=80&w=400',
    category: ProductCategory.KEG,
    type: BeerType.PILSEN,
    volumeLiters: 30,
    isPopular: true,
    abv: 4.8,
    ibu: 12,
    pairing: 'Churrasco completo, frango a passarinho e pizza margherita.',
  },
  {
    id: 'keg-pilsen-50',
    name: 'Barril Pilsen 50L',
    description: 'O melhor custo-benefício para festas médias.',
    price: 700,
    image: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=400',
    category: ProductCategory.KEG,
    type: BeerType.PILSEN,
    volumeLiters: 50,
    abv: 4.8,
    ibu: 12,
    pairing: 'Churrasco completo e eventos corporativos.',
  },
  {
    id: 'keg-ipa-30',
    name: 'Barril IPA 30L',
    description: 'Amargor pronunciado e notas cítricas para paladares exigentes.',
    price: 580,
    image: 'https://images.unsplash.com/photo-1615332572787-8c7162e48fa4?auto=format&fit=crop&q=80&w=400',
    category: ProductCategory.KEG,
    type: BeerType.IPA,
    volumeLiters: 30,
    abv: 6.5,
    ibu: 55,
    pairing: 'Costela no bafo, queijo gorgonzola e pratos apimentados.',
  },

  // COMBOS
  {
    id: 'combo-party',
    name: 'Combo Festa Completa',
    description: '50L Pilsen + Chopeira Elétrica + 100 Copos.',
    price: 850,
    image: 'https://images.unsplash.com/photo-1505075137441-205462b7105d?auto=format&fit=crop&q=80&w=400',
    category: ProductCategory.COMBO,
    isPopular: true,
    pairing: 'Ideal para festas de até 40 pessoas.',
  },
  {
    id: 'combo-degustacao',
    name: 'Combo Degustação',
    description: '30L IPA + 30L Weiss + Chopeira Dupla.',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?auto=format&fit=crop&q=80&w=400',
    category: ProductCategory.COMBO,
    pairing: 'Perfeito para apreciadores de cervejas especiais.',
  },

  // ESTRUTURA
  {
    id: 'acc-chopeira',
    name: 'Chopeira Elétrica (Aluguel)',
    description: 'Aluguel de máquina extra (110v ou 220v).',
    price: 150,
    image: 'https://images.unsplash.com/photo-1572569766687-b0885141d402?auto=format&fit=crop&q=80&w=400',
    category: ProductCategory.STRUCTURE,
  },
  {
    id: 'acc-copos',
    name: 'Kit 50 Copos Premium',
    description: 'Copos rígidos personalizados Patanegra.',
    price: 80,
    image: 'https://images.unsplash.com/photo-1543599538-a6c4f6cc5c05?auto=format&fit=crop&q=80&w=400',
    category: ProductCategory.STRUCTURE,
  }
];
