export type SkydiverTool = {
  id: string;
  slug: string;
  path: string;
  icon: string;
  title: string;
  description: string;
  searchCategory?: string;
};

export const skydiverTools: SkydiverTool[] = [
  {
    id: 'harness-guide',
    slug: 'guia-harness',
    path: '/ferramentas/guia-harness',
    icon: '📐',
    title: 'Guia de tamanho de harness',
    description: 'Meça e escolha o container ideal.',
    searchCategory: 'Containers',
  },
  {
    id: 'wingloading',
    slug: 'wingloading',
    path: '/ferramentas/wingloading',
    icon: '🧮',
    title: 'Calculadora de wingloading',
    description: 'Descubra sua carga alar em lb/ft².',
    searchCategory: 'Velames',
  },
  {
    id: 'container-guide',
    slug: 'guia-container',
    path: '/ferramentas/guia-container',
    icon: '📦',
    title: 'Guia de tamanho de container',
    description: 'Compatibilidade velame × container.',
    searchCategory: 'Containers',
  },
  {
    id: 'gear-value',
    slug: 'calculadora-valor',
    path: '/ferramentas/calculadora-valor',
    icon: '💰',
    title: 'Calculadora de valor',
    description: 'Estimativa de preço justo do equipamento.',
  },
];

export const toolDisclaimerText =
  'Ferramenta educativa da Trade2Fly. Os resultados são estimativas e não substituem a avaliação de um rigger certificado ou instrutor. Sempre consulte um profissional antes de comprar ou saltar com equipamento novo.';

export function getToolBySlug(slug: string): SkydiverTool | undefined {
  return skydiverTools.find((tool) => tool.slug === slug);
}

/** Home section cards — same shape as legacy `resources` */
export const skydiverToolCards = skydiverTools.map((tool) => ({
  icon: tool.icon,
  title: tool.title,
  sub: tool.description,
  path: tool.path,
}));
