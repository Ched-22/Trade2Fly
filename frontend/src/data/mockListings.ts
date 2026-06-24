import type { Listing } from '../types/listing';

const grad = (a: string, b: string, c: string) =>
  `linear-gradient(150deg, ${a}, ${b} 55%, ${c})`;

export const listings: Listing[] = [
  { id: 1, title: 'Velame PD Sabre2 210', price: 'R$ 6.400', priceNum: 6400, specs: '210 sqft · 380 saltos · 2021', size: '210', jumps: '380', year: '2021', weight: '2100', brand: 'PD', category: 'Velames', condition: 'Usado', location: 'São Paulo, SP', escrow: true, seller: 'Ana Martins', grad: grad('#0D2B45', '#2D7DD2', '#3a8ee0') },
  { id: 2, title: 'Container UPT Vector 3 M', price: 'R$ 9.200', priceNum: 9200, specs: 'M · 540 saltos · 2020', size: 'M', jumps: '540', year: '2020', weight: '3400', brand: 'UPT', category: 'Containers', condition: 'Usado', location: 'Boituva, SP', escrow: true, seller: 'Carlos Souza', grad: grad('#16456e', '#1FB98A', '#7EF0CC') },
  { id: 3, title: 'Reserva PD Optimum 176', price: 'R$ 5.100', priceNum: 5100, specs: '176 sqft · 0 usos · 2022', size: '176', jumps: '0', year: '2022', weight: '1500', brand: 'PD', category: 'Reservas', condition: 'Novo', location: 'Rio de Janeiro, RJ', escrow: true, seller: 'Marina Reis', grad: grad('#0D2B45', '#16456e', '#2D7DD2') },
  { id: 4, title: 'Capacete Cookie G4 Full Face', price: 'R$ 2.350', priceNum: 2350, specs: 'Tam. L · 2023', size: 'L', jumps: '—', year: '2023', weight: '900', brand: 'Cookie', category: 'Capacetes e Equipamentos', condition: 'Usado', location: 'Curitiba, PR', escrow: true, seller: 'Diego Alves', grad: grad('#1a4a72', '#2D7DD2', '#9ecbf0') },
  { id: 5, title: 'Sistema Completo UPT + PD', price: 'R$ 19.800', priceNum: 19800, specs: '190 sqft · 620 saltos · 2019', size: '190', jumps: '620', year: '2019', weight: '8200', brand: 'UPT', category: 'Sistemas Completos', condition: 'Usado', location: 'Goiânia, GO', escrow: true, seller: 'Ana Martins', grad: grad('#0D2B45', '#1FB98A', '#2D7DD2') },
  { id: 6, title: 'Altímetro L&B Viso II+', price: 'R$ 1.450', priceNum: 1450, specs: 'Digital · 2022', size: '—', jumps: '—', year: '2022', weight: '120', brand: 'L&B', category: 'Altímetros', condition: 'Usado', location: 'São Paulo, SP', escrow: true, seller: 'Carlos Souza', grad: grad('#16456e', '#2D7DD2', '#bcdcf6') },
  { id: 7, title: 'Audível L&B Optima II', price: 'R$ 980', priceNum: 980, specs: '3 alarmes · 2021', size: '—', jumps: '—', year: '2021', weight: '40', brand: 'L&B', category: 'Audíveis', condition: 'Usado', location: 'Boituva, SP', escrow: false, seller: 'Marina Reis', grad: grad('#1a4a72', '#16456e', '#2D7DD2') },
  { id: 8, title: 'Velame JYRO Pulse 170', price: 'R$ 7.300', priceNum: 7300, specs: '170 sqft · 210 saltos · 2022', size: '170', jumps: '210', year: '2022', weight: '2000', brand: 'JYRO', category: 'Velames', condition: 'Usado', location: 'Brasília, DF', escrow: true, seller: 'Diego Alves', grad: grad('#0D2B45', '#2D7DD2', '#7EF0CC') },
  { id: 9, title: 'Container Sun Path Javelin Odyssey', price: 'R$ 8.700', priceNum: 8700, specs: 'M2 · 410 saltos · 2021', size: 'M2', jumps: '410', year: '2021', weight: '3300', brand: 'Sun Path', category: 'Containers', condition: 'Usado', location: 'Florianópolis, SC', escrow: true, seller: 'Ana Martins', grad: grad('#16456e', '#1a4a72', '#2D7DD2') },
  { id: 10, title: 'Rig BASE completo', price: 'R$ 11.500', priceNum: 11500, specs: '260 sqft · 90 saltos · 2020', size: '260', jumps: '90', year: '2020', weight: '4100', brand: 'JYRO', category: 'BASE', condition: 'Usado', location: 'Belo Horizonte, MG', escrow: true, seller: 'Marina Reis', grad: grad('#0D2B45', '#16456e', '#1FB98A') },
  { id: 11, title: 'Velame PD Spectre 190', price: 'R$ 5.900', priceNum: 5900, specs: '190 sqft · 450 saltos · 2020', size: '190', jumps: '450', year: '2020', weight: '2050', brand: 'PD', category: 'Velames', condition: 'Usado', location: 'Campinas, SP', escrow: true, seller: 'Carlos Souza', grad: grad('#1a4a72', '#2D7DD2', '#3a8ee0') },
  { id: 12, title: 'Capacete Cookie Fuel Open Face', price: 'R$ 1.150', priceNum: 1150, specs: 'Tam. M · 2023', size: 'M', jumps: '—', year: '2023', weight: '600', brand: 'Cookie', category: 'Capacetes e Equipamentos', condition: 'Novo', location: 'Porto Alegre, RS', escrow: true, seller: 'Diego Alves', grad: grad('#16456e', '#2D7DD2', '#9ecbf0') },
];

export function getListingById(id: number): Listing | undefined {
  return listings.find((listing) => listing.id === id);
}

export function formatPrice(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}
