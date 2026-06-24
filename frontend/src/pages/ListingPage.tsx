import { Heart, MapPin, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getListingById, formatPrice } from '../data/mockListings';
import { sellers } from '../data/mockSellers';
import { useMarketplace } from '../hooks/useMarketplace';

export function ListingPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, setCheckoutListingId, setSelectedListingId } = useMarketplace();

  const id = Number(listingId);
  const listing = getListingById(id) ?? getListingById(1)!;
  const seller = sellers[listing.seller] ?? { rating: '5.0', sales: '10' };
  const favorited = !!favorites[listing.id];
  const sellerInitials = listing.seller
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2);

  const specPanel = [
    { label: 'Marca', value: listing.brand },
    { label: 'Categoria', value: listing.category.split(' ')[0] },
    { label: 'Tamanho', value: listing.size, unit: listing.size && !Number.isNaN(Number(listing.size)) ? 'sqft' : '' },
    { label: 'Saltos', value: listing.jumps },
    { label: 'Ano (DOM)', value: listing.year },
    { label: 'Peso', value: listing.weight, unit: 'g' },
  ];

  const goCheckout = () => {
    setSelectedListingId(listing.id);
    setCheckoutListingId(listing.id);
    navigate('/checkout');
  };

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-5 pb-14 sm:px-6 sm:py-6 sm:pb-16">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div>
          <div
            className="mb-3 h-52 rounded-xl sm:h-72 lg:h-[360px]"
            style={{ background: listing.grad }}
          />
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[listing.grad, 'linear-gradient(150deg,#16456e,#2D7DD2)', 'linear-gradient(150deg,#1a4a72,#1FB98A)', 'linear-gradient(150deg,#0D2B45,#3a8ee0)'].map((grad, index) => (
              <div key={index} className="h-14 rounded-lg sm:h-20" style={{ background: grad }} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 font-mono text-2xl font-bold text-pull sm:text-3xl">{listing.price}</div>
              <h1 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">{listing.title}</h1>
              <p className="mt-2 font-mono text-sm text-cinza">{listing.specs}</p>
            </div>
            <button
              type="button"
              aria-label="Favoritar"
              onClick={() => toggleFavorite(listing.id)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-nuvem bg-white"
            >
              <Heart className={`h-5 w-5 ${favorited ? 'fill-pull text-pull' : 'text-solo'}`} />
            </button>
          </div>

          <div className="mb-4 flex items-center gap-2 text-sm text-cinza">
            <MapPin className="h-4 w-4" />
            {listing.location}
          </div>

          {listing.escrow ? (
            <Badge variant="escrow" className="mb-5">
              <Shield className="mr-1 inline h-3.5 w-3.5" />
              Pagamento protegido em custódia
            </Badge>
          ) : null}

          <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-nuvem bg-white p-3 sm:grid-cols-3 sm:gap-3 sm:p-4">
            {specPanel.map((spec) => (
              <div key={spec.label}>
                <div className="text-xs text-cinza">{spec.label}</div>
                <div className="font-mono text-sm font-bold">
                  {spec.value}
                  {spec.unit ? ` ${spec.unit}` : ''}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 rounded-xl border border-nuvem bg-white p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-voo text-sm font-bold text-white">
                {sellerInitials}
              </span>
              <div>
                <div className="font-bold">{listing.seller}</div>
                <div className="text-sm text-cinza">
                  ★ {seller.rating} · {seller.sales} vendas
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-cinza whitespace-pre-line">
              {`Equipamento de skydiver em ótimo estado de conservação, sempre guardado em local seco e revisado por rigger habilitado.

Manutenção em dia, sem reparos estruturais. Acompanha bag e documentação. Pronto para saltar.

Envio com rastreio para todo o Brasil. Retirada possível em Boituva/SP mediante combinação.`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button size="lg" className="w-full sm:flex-1" onClick={goCheckout}>
              Comprar com proteção
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto" onClick={() => navigate('/mensagens')}>
              Enviar mensagem
            </Button>
          </div>

          <p className="mt-3 text-sm text-cinza">
            Total estimado com taxas: <span className="font-mono font-bold text-solo">{formatPrice(listing.priceNum + 45)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
