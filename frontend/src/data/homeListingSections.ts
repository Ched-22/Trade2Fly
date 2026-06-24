import type { Listing } from '../types/listing';

const sectionLimit = 6;

function takeLimit(listings: Listing[]): Listing[] {
  return listings.slice(0, sectionLimit);
}

export type HomeListingSectionConfig = {
  id: string;
  title: string;
  subtitle: string;
  seeMorePath: string;
  seeMoreLabel?: string;
  selectListings: (listings: Listing[]) => Listing[];
};

export const homeListingSections: HomeListingSectionConfig[] = [
  {
    id: 'trending',
    title: 'Em alta 🔥',
    subtitle: 'Os anúncios mais procurados desta semana.',
    seeMorePath: '/busca',
    seeMoreLabel: 'Ver todos os anúncios',
    selectListings: (listings) =>
      takeLimit([...listings].sort((a, b) => a.id - b.id)),
  },
  {
    id: 'newArrivals',
    title: 'Recém publicados',
    subtitle: 'Anúncios adicionados nos últimos dias.',
    seeMorePath: '/busca?sort=newest',
    selectListings: (listings) =>
      takeLimit([...listings].sort((a, b) => b.id - a.id)),
  },
  {
    id: 'escrow',
    title: 'Com custódia',
    subtitle: 'Pagamento protegido até você confirmar o recebimento.',
    seeMorePath: '/busca?escrow=true',
    selectListings: (listings) =>
      takeLimit(listings.filter((listing) => listing.escrow)),
  },
  {
    id: 'completeSystems',
    title: 'Sistemas completos',
    subtitle: 'Rigs prontos para saltar — container, main e reserva.',
    seeMorePath: '/busca?category=Sistemas%20Completos',
    selectListings: (listings) =>
      takeLimit(listings.filter((listing) => listing.category === 'Sistemas Completos')),
  },
  {
    id: 'canopies',
    title: 'Velames em destaque',
    subtitle: 'Mains e wings das marcas mais buscadas.',
    seeMorePath: '/busca?category=Velames',
    selectListings: (listings) =>
      takeLimit(listings.filter((listing) => listing.category === 'Velames')),
  },
];
