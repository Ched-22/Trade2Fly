import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const SALT_ROUNDS = 10;

  const [ana, carlos, marina, diego] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ana.martins@email.com' },
      update: { active: true },
      create: {
        email: 'ana.martins@email.com',
        password: await bcrypt.hash('senha123', SALT_ROUNDS),
        displayName: 'Ana',
        initials: 'AM',
        active: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'carlos.souza@email.com' },
      update: { active: true },
      create: {
        email: 'carlos.souza@email.com',
        password: await bcrypt.hash('senha123', SALT_ROUNDS),
        displayName: 'Carlos',
        initials: 'CS',
        active: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'marina.reis@email.com' },
      update: { active: true },
      create: {
        email: 'marina.reis@email.com',
        password: await bcrypt.hash('senha123', SALT_ROUNDS),
        displayName: 'Marina',
        initials: 'MR',
        active: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'diego.alves@email.com' },
      update: { active: true },
      create: {
        email: 'diego.alves@email.com',
        password: await bcrypt.hash('senha123', SALT_ROUNDS),
        displayName: 'Diego',
        initials: 'DA',
        active: true,
      },
    }),
  ]);

  const seedListings = [
    { title: 'Velame PD Sabre2 210', priceNum: 6400, specs: '210 sqft · 380 saltos · 2021', size: '210', jumps: '380', year: '2021', weight: '2100', brand: 'PD', category: 'Velames', condition: 'Usado', location: 'São Paulo, SP', escrow: true, sellerId: ana.id },
    { title: 'Container UPT Vector 3 M', priceNum: 9200, specs: 'M · 540 saltos · 2020', size: 'M', jumps: '540', year: '2020', weight: '3400', brand: 'UPT', category: 'Containers', condition: 'Usado', location: 'Boituva, SP', escrow: true, sellerId: carlos.id },
    { title: 'Reserva PD Optimum 176', priceNum: 5100, specs: '176 sqft · 0 usos · 2022', size: '176', jumps: '0', year: '2022', weight: '1500', brand: 'PD', category: 'Reservas', condition: 'Novo', location: 'Rio de Janeiro, RJ', escrow: true, sellerId: marina.id },
    { title: 'Capacete Cookie G4 Full Face', priceNum: 2350, specs: 'Tam. L · 2023', size: 'L', jumps: '—', year: '2023', weight: '900', brand: 'Cookie', category: 'Capacetes e Equipamentos', condition: 'Usado', location: 'Curitiba, PR', escrow: true, sellerId: diego.id },
    { title: 'Sistema Completo UPT + PD', priceNum: 19800, specs: '190 sqft · 620 saltos · 2019', size: '190', jumps: '620', year: '2019', weight: '8200', brand: 'UPT', category: 'Sistemas Completos', condition: 'Usado', location: 'Goiânia, GO', escrow: true, sellerId: ana.id },
    { title: 'Altímetro L&B Viso II+', priceNum: 1450, specs: 'Digital · 2022', size: '—', jumps: '—', year: '2022', weight: '120', brand: 'L&B', category: 'Altímetros', condition: 'Usado', location: 'São Paulo, SP', escrow: true, sellerId: carlos.id },
    { title: 'Audível L&B Optima II', priceNum: 980, specs: '3 alarmes · 2021', size: '—', jumps: '—', year: '2021', weight: '40', brand: 'L&B', category: 'Audíveis', condition: 'Usado', location: 'Boituva, SP', escrow: false, sellerId: marina.id },
    { title: 'Velame JYRO Pulse 170', priceNum: 7300, specs: '170 sqft · 210 saltos · 2022', size: '170', jumps: '210', year: '2022', weight: '2000', brand: 'JYRO', category: 'Velames', condition: 'Usado', location: 'Brasília, DF', escrow: true, sellerId: diego.id },
    { title: 'Container Sun Path Javelin Odyssey', priceNum: 8700, specs: 'M2 · 410 saltos · 2021', size: 'M2', jumps: '410', year: '2021', weight: '3300', brand: 'Sun Path', category: 'Containers', condition: 'Usado', location: 'Florianópolis, SC', escrow: true, sellerId: ana.id },
    { title: 'Rig BASE completo', priceNum: 11500, specs: '260 sqft · 90 saltos · 2020', size: '260', jumps: '90', year: '2020', weight: '4100', brand: 'JYRO', category: 'BASE', condition: 'Usado', location: 'Belo Horizonte, MG', escrow: true, sellerId: marina.id },
    { title: 'Velame PD Spectre 190', priceNum: 5900, specs: '190 sqft · 450 saltos · 2020', size: '190', jumps: '450', year: '2020', weight: '2050', brand: 'PD', category: 'Velames', condition: 'Usado', location: 'Campinas, SP', escrow: true, sellerId: carlos.id },
    { title: 'Capacete Cookie Fuel Open Face', priceNum: 1150, specs: 'Tam. M · 2023', size: 'M', jumps: '—', year: '2023', weight: '600', brand: 'Cookie', category: 'Capacetes e Equipamentos', condition: 'Novo', location: 'Porto Alegre, RS', escrow: true, sellerId: diego.id },
    { title: 'Velame PD Storm 168', priceNum: 6800, specs: '168 sqft · 120 saltos · 2023', size: '168', jumps: '120', year: '2023', weight: '1980', brand: 'PD', category: 'Velames', condition: 'Bom', location: 'São Paulo, SP', escrow: true, sellerId: ana.id },
  ];

  for (const listing of seedListings) {
    await prisma.listing.upsert({
      where: { id: seedListings.indexOf(listing) + 1 },
      update: {},
      create: listing,
    });
  }

  console.log('Seed concluído. Usuários e anúncios criados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
