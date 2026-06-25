import { Heart, MapPin, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SendOfferModal } from '../components/listing/SendOfferModal';
import { AuthAlert } from '../components/auth/AuthAlert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../data/mockListings';
import { sellers } from '../data/mockSellers';
import { apiGet } from '../lib/api';
import { getListingPhotos } from '../lib/listingPhotoStorage';
import { transformListingFromApi, type ListingApiRaw } from '../lib/listingTransform';
import { useMarketplace } from '../hooks/useMarketplace';
import type { Listing } from '../types/listing';

export function ListingPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const {
    allListings,
    favorites,
    toggleFavorite,
    setCheckoutListingId,
    setSelectedListingId,
    sendOffer,
  } = useMarketplace();
  const [offerOpen, setOfferOpen] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Number(listingId);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError('Anúncio inválido.');
      setLoading(false);
      return;
    }

    const applyListing = (data: Listing) => {
      const apiPhotos = data.imageUrls ?? [];
      const storedPhotos = apiPhotos.length > 0 ? apiPhotos : getListingPhotos(data.id);
      setListing({
        ...data,
        coverPhotoUrl: storedPhotos[0] ?? data.coverPhotoUrl,
        imageUrls: apiPhotos.length > 0 ? apiPhotos : data.imageUrls,
      });
      setPhotos(storedPhotos);
      setActivePhoto(0);
      setError(null);
      setLoading(false);
    };

    const fromContext = allListings.find((item) => item.id === id);
    if (fromContext) {
      applyListing(fromContext);
      return;
    }

    let cancelled = false;
    setLoading(true);
    apiGet<ListingApiRaw>(`/api/listings/${id}`)
      .then((data) => {
        if (!cancelled) applyListing(transformListingFromApi(data));
      })
      .catch(() => {
        if (!cancelled) {
          setListing(null);
          setError('Anúncio não encontrado.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, allListings]);

  if (loading) {
    return (
      <div className="t2f-page">
        <p className="text-cinza">Carregando anúncio…</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="t2f-page max-w-lg">
        <AuthAlert variant="error">{error ?? 'Anúncio não encontrado.'}</AuthAlert>
        <Button className="mt-4" onClick={() => navigate('/busca')}>
          Voltar para busca
        </Button>
      </div>
    );
  }

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
    {
      label: 'Tamanho',
      value: listing.size,
      unit: listing.size && !Number.isNaN(Number(listing.size)) ? 'sqft' : '',
    },
    { label: 'Saltos', value: listing.jumps },
    { label: 'Ano (DOM)', value: listing.year },
    { label: 'Peso', value: listing.weight, unit: 'kg' },
  ];

  const goCheckout = () => {
    setSelectedListingId(listing.id);
    setCheckoutListingId(listing.id);
    navigate('/checkout');
  };

  const handleSendOffer = (offerAmount: number, message: string) => {
    sendOffer(listing, offerAmount, message);
    navigate('/mensagens');
  };

  const heroPhoto = photos[activePhoto];
  const descriptionText =
    listing.description?.trim() ||
    'O vendedor não adicionou uma descrição detalhada para este anúncio.';

  return (
    <div className="mx-auto max-w-[1180px] overflow-x-hidden px-4 py-5 pb-14 sm:px-6 sm:py-6 sm:pb-16">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div className="min-w-0">
          <div
            className="mb-3 h-52 rounded-xl bg-cover bg-center sm:h-72 lg:h-[360px]"
            style={
              heroPhoto
                ? { backgroundImage: `url(${heroPhoto})` }
                : { background: listing.grad }
            }
          />
          {photos.length > 1 ? (
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {photos.map((photo, index) => (
                <button
                  key={`${index}-${photo.slice(0, 24)}`}
                  type="button"
                  onClick={() => setActivePhoto(index)}
                  className={`h-14 cursor-pointer overflow-hidden rounded-lg border-2 bg-cover bg-center sm:h-20 ${
                    activePhoto === index ? 'border-voo' : 'border-transparent'
                  }`}
                  style={{ backgroundImage: `url(${photo})` }}
                  aria-label={`Foto ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 font-mono text-2xl font-bold text-pull sm:text-3xl">{listing.price}</div>
              <h1 className="break-words font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                {listing.title}
              </h1>
              <p className="mt-2 break-words font-mono text-sm text-cinza">{listing.specs}</p>
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

          <div className="mb-4 flex min-w-0 items-center gap-2 text-sm text-cinza">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="break-words">{listing.location}</span>
          </div>

          {listing.escrow ? (
            <Badge variant="escrow" className="mb-5">
              <Shield className="mr-1 inline h-3.5 w-3.5" />
              Pagamento protegido em custódia
            </Badge>
          ) : null}

          <div className="mb-6 grid min-w-0 grid-cols-2 gap-2 rounded-xl border border-nuvem bg-white p-3 sm:grid-cols-3 sm:gap-3 sm:p-4">
            {specPanel.map((spec) => (
              <div key={spec.label} className="min-w-0">
                <div className="text-xs text-cinza">{spec.label}</div>
                <div className="break-words font-mono text-sm font-bold">
                  {spec.value}
                  {spec.unit ? ` ${spec.unit}` : ''}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 min-w-0 rounded-xl border border-nuvem bg-white p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-voo text-sm font-bold text-white">
                {sellerInitials}
              </span>
              <div className="min-w-0">
                <div className="break-words font-bold">{listing.seller}</div>
                <div className="text-sm text-cinza">
                  ★ {seller.rating} · {seller.sales} vendas
                </div>
              </div>
            </div>
            <p className="break-words text-sm leading-relaxed whitespace-pre-line text-cinza [overflow-wrap:anywhere]">
              {descriptionText}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button size="lg" className="w-full sm:flex-1" onClick={goCheckout}>
              Comprar
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:flex-1"
              onClick={() => setOfferOpen(true)}
            >
              Enviar oferta
            </Button>
          </div>

          <p className="mt-3 text-sm text-cinza">
            Total estimado com taxas: <span className="font-mono font-bold text-solo">{formatPrice(listing.priceNum + 45)}</span>
          </p>
        </div>
      </div>

      <SendOfferModal
        key={listing.id}
        open={offerOpen}
        listing={listing}
        onClose={() => setOfferOpen(false)}
        onSubmit={handleSendOffer}
      />
    </div>
  );
}
