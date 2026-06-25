import { skydiverToolCards } from './skydiverTools';

export const categories = [
  'Sistemas Completos',
  'Containers',
  'Velames',
  'Reservas',
  'Altímetros',
  'Audíveis',
  'Capacetes e Equipamentos',
  'BASE',
];

export const brands = ['PD', 'UPT', 'Sun Path', 'Cookie', 'L&B', 'JYRO'];

export type CategoryIconKey =
  | 'wind'
  | 'backpack'
  | 'shield'
  | 'package'
  | 'hardHat'
  | 'gauge';

export type CategoryCardData = {
  name: string;
  pillLabel?: string;
  description: string;
  icon: CategoryIconKey;
};

export const categoryCards: CategoryCardData[] = [
  {
    name: 'Velames',
    description: 'Mains, wings e crossovers',
    icon: 'wind',
  },
  {
    name: 'Containers',
    description: 'Harnesses e rigs',
    icon: 'backpack',
  },
  {
    name: 'Reservas',
    description: 'Reserves e repacks',
    icon: 'shield',
  },
  {
    name: 'Sistemas Completos',
    pillLabel: 'Sistemas',
    description: 'Rig completo pronto para saltar',
    icon: 'package',
  },
  {
    name: 'Capacetes e Equipamentos',
    pillLabel: 'Capacetes',
    description: 'Capacetes, suits e acessórios',
    icon: 'hardHat',
  },
  {
    name: 'Altímetros',
    description: 'Visuais, audíveis e digitais',
    icon: 'gauge',
  },
];

export const homeSeals = [
  { icon: '🔒', title: 'Pagamento seguro', sub: 'Custódia (escrow)' },
  { icon: '🔍', title: 'Busca fácil', sub: 'Filtros de paraquedismo' },
  { icon: '🪂', title: 'Itens novos', sub: 'Todos os dias' },
  { icon: '📈', title: 'Mais visibilidade', sub: 'Para o seu anúncio' },
  { icon: '🔔', title: 'Alertas', sub: 'De equipamento' },
];

export const resources = skydiverToolCards;

export const protectionItems = [
  'Pagamento via custódia (escrow)',
  'Compromisso com a autenticidade',
  'Garantia de reembolso por anúncio enganoso',
  'Regras rígidas para vendedores',
  'Suporte do Trade2Fly',
];

export const reviews = [
  { stars: '★★★★★', text: 'Vendi meu Sabre2 em 3 dias. O pagamento protegido deu segurança pra mim e pro comprador.', name: 'Ana Martins', role: 'Vendedora · SP', initials: 'AM', color: '#2D7DD2' },
  { stars: '★★★★★', text: 'Comprei um container de outro estado sem medo. Só liberei o pagamento quando recebi.', name: 'Diego Alves', role: 'Comprador · PR', initials: 'DA', color: '#FF512E' },
  { stars: '★★★★★', text: 'Os filtros por tamanho e saltos economizam muito tempo. Achei exatamente o que queria.', name: 'Marina Reis', role: 'Compradora · RJ', initials: 'MR', color: '#1FB98A' },
];

export type FooterLink = {
  label: string;
  href?: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export const footerColumns: FooterColumn[] = [
  {
    title: 'Comprar',
    links: [
      { label: 'Como comprar' },
      { label: 'Proteção ao comprador' },
      { label: 'Envio e retirada' },
    ],
  },
  {
    title: 'Vender',
    links: [
      { label: 'Vender equipamento' },
      { label: 'Vendedor parceiro' },
      { label: 'Como vender' },
      { label: 'Envio e retirada' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Wingloading', href: '/ferramentas/wingloading' },
      { label: 'Valor do equipamento', href: '/ferramentas/calculadora-valor' },
      { label: 'Guia de harness', href: '/ferramentas/guia-harness' },
      { label: 'Blog' },
    ],
  },
  {
    title: 'Suporte',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Contato', href: `mailto:suporte@trade2fly.com.br` },
      { label: 'Taxas' },
      { label: 'Termos de Uso' },
    ],
  },
];
