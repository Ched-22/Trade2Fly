import { MapPin, Package } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAlert } from '../components/auth/AuthAlert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatPrice, getListingById } from '../data/mockListings';
import { useMarketplace } from '../hooks/useMarketplace';
import { apiGet } from '../lib/api';
import { transformListingFromApi, type ListingApiRaw } from '../lib/listingTransform';
import {
  CHECKOUT_PROTECTION_FEE,
  estimateShippingCost,
  formatCep,
  isValidCep,
  listingWeightKg,
  normalizeCep,
  parseListingLocation,
} from '../lib/shippingEstimate';
import { fetchAddressByCep } from '../lib/viacep';
import type { Listing } from '../types/listing';

type DeliveryMode = 'shipping' | 'pickup';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { checkoutListingId, allListings } = useMarketplace();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [payMethod, setPayMethod] = useState<'pix' | 'card'>('pix');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('shipping');
  const [cep, setCep] = useState('');
  const [destCity, setDestCity] = useState('');
  const [destState, setDestState] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const listingId = checkoutListingId ?? 1;

  useEffect(() => {
    let cancelled = false;

    const applyListing = (data: Listing) => {
      if (!cancelled) {
        setListing(data);
        setLoadingListing(false);
      }
    };

    const fromContext = allListings.find((item) => item.id === listingId);
    if (fromContext) {
      applyListing(fromContext);
      return () => {
        cancelled = true;
      };
    }

    const fromMock = getListingById(listingId);
    if (fromMock) {
      applyListing(fromMock);
      return () => {
        cancelled = true;
      };
    }

    setLoadingListing(true);
    apiGet<ListingApiRaw>(`/api/listings/${listingId}`)
      .then((data) => {
        if (!cancelled) applyListing(transformListingFromApi(data));
      })
      .catch(() => {
        if (!cancelled) {
          setListing(null);
          setLoadingListing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [listingId, allListings]);

  const origin = useMemo(
    () => parseListingLocation(listing?.location ?? ''),
    [listing?.location],
  );

  const weightKg = useMemo(
    () => listingWeightKg(listing?.weight ?? '', listing?.category ?? ''),
    [listing?.weight, listing?.category],
  );

  const shippingCost = useMemo(() => {
    if (deliveryMode === 'pickup' || !listing) return 0;
    return estimateShippingCost({
      origin,
      destination: { cep: normalizeCep(cep), city: destCity, state: destState },
      weightKg,
      category: listing.category,
    });
  }, [deliveryMode, listing, origin, cep, destCity, destState, weightKg]);

  const protectionFee = CHECKOUT_PROTECTION_FEE;
  const subtotal = listing?.priceNum ?? 0;
  const total = subtotal + protectionFee + shippingCost;

  const shippingReady =
    deliveryMode === 'pickup' ||
    (isValidCep(cep) && destCity.trim().length > 0 && destState.trim().length === 2);

  const handleCepBlur = async () => {
    if (!isValidCep(cep)) {
      setCepError(isValidCep(cep) ? null : 'Informe um CEP válido (8 dígitos).');
      return;
    }

    setCepLoading(true);
    setCepError(null);
    try {
      const address = await fetchAddressByCep(cep);
      if (!address) {
        setCepError('CEP não encontrado. Verifique e tente novamente.');
        return;
      }
      setDestCity(address.city);
      setDestState(address.state);
    } catch {
      setCepError('Não foi possível consultar o CEP. Tente novamente.');
    } finally {
      setCepLoading(false);
    }
  };

  if (loadingListing) {
    return (
      <div className="t2f-page max-w-[980px]">
        <p className="text-cinza">Carregando checkout…</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="t2f-page max-w-lg">
        <AuthAlert variant="error">Anúncio não encontrado para checkout.</AuthAlert>
        <Button className="mt-4" onClick={() => navigate('/busca')}>
          Voltar para busca
        </Button>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="t2f-page max-w-2xl text-center">
        <div className="mb-4 text-5xl">✓</div>
        <h1 className="mb-3 font-display text-3xl font-extrabold">Pagamento registrado!</h1>
        <p className="mb-8 text-cinza">
          Seu pagamento está em custódia. O vendedor será notificado para{' '}
          {deliveryMode === 'pickup' ? 'combinar a retirada' : 'enviar o equipamento'}.
        </p>
        <Button onClick={() => navigate('/')}>Acompanhar meus pedidos</Button>
      </div>
    );
  }

  return (
    <div className="t2f-page max-w-[980px]">
      <h1 className="mb-5 font-display text-2xl font-extrabold tracking-tight sm:mb-6 sm:text-3xl">
        Checkout seguro
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-nuvem bg-white p-5">
            <h2 className="font-display text-lg font-bold">Entrega</h2>
            <p className="text-sm text-cinza">
              O frete é pago pelo comprador e calculado com base na origem do anúncio e no endereço de
              destino.
            </p>

            <div className="flex items-start gap-2 rounded-lg bg-bruma px-3 py-2.5 text-sm text-solo">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-voo" />
              <div>
                <span className="font-semibold">Origem (vendedor): </span>
                {origin.city && origin.state
                  ? `${origin.city}, ${origin.state}`
                  : listing.location}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setDeliveryMode('shipping')}
                className={`cursor-pointer rounded-xl border-2 p-4 text-left ${
                  deliveryMode === 'shipping'
                    ? 'border-voo bg-voo-light'
                    : 'border-nuvem bg-white'
                }`}
              >
                <div className="mb-1 flex items-center gap-2 font-bold">
                  <Package className="h-4 w-4" />
                  Envio
                </div>
                <div className="text-sm text-cinza">Calcule o frete pelo CEP de destino</div>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode('pickup')}
                className={`cursor-pointer rounded-xl border-2 p-4 text-left ${
                  deliveryMode === 'pickup'
                    ? 'border-voo bg-voo-light'
                    : 'border-nuvem bg-white'
                }`}
              >
                <div className="mb-1 font-bold">Retirada em mão</div>
                <div className="text-sm text-cinza">Combine com o vendedor pelo chat (sem frete)</div>
              </button>
            </div>

            {deliveryMode === 'shipping' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="CEP de destino"
                  placeholder="00000-000"
                  value={formatCep(cep)}
                  onChange={(event) => {
                    setCep(normalizeCep(event.target.value));
                    setCepError(null);
                  }}
                  onBlur={() => void handleCepBlur()}
                  error={cepError ?? undefined}
                />
                <Input
                  label="Cidade"
                  value={destCity}
                  onChange={(event) => setDestCity(event.target.value)}
                  placeholder="Preenchido pelo CEP"
                />
                <Input
                  label="UF"
                  value={destState}
                  onChange={(event) => setDestState(event.target.value.toUpperCase().slice(0, 2))}
                  placeholder="SP"
                  maxLength={2}
                />
                <div className="flex items-end">
                  <p className="text-xs text-cinza">
                    {cepLoading
                      ? 'Consultando CEP…'
                      : shippingReady
                        ? `Frete estimado: ${formatPrice(shippingCost)} · ~${weightKg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`
                        : 'Informe o CEP para calcular o frete.'}
                  </p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold">Forma de pagamento</h2>

            <button
              type="button"
              onClick={() => setPayMethod('pix')}
              className={`w-full cursor-pointer rounded-xl border-2 p-5 text-left ${
                payMethod === 'pix' ? 'border-liberado bg-liberado-light' : 'border-nuvem bg-white'
              }`}
            >
              <div className="font-bold">Pix</div>
              <div className="text-sm text-cinza">Confirmação instantânea · Recomendado</div>
            </button>

            <button
              type="button"
              onClick={() => setPayMethod('card')}
              className={`w-full cursor-pointer rounded-xl border-2 p-5 text-left ${
                payMethod === 'card' ? 'border-voo bg-voo-light' : 'border-nuvem bg-white'
              }`}
            >
              <div className="font-bold">Cartão de crédito</div>
              <div className="text-sm text-cinza">Parcelamento em até 12x</div>
            </button>

            {payMethod === 'pix' ? (
              <div className="rounded-xl border border-nuvem bg-white p-6">
                <p className="mb-4 text-sm text-cinza">Escaneie o QR Code ou copie o código Pix</p>
                <div className="mx-auto grid h-40 w-40 grid-cols-7 gap-0.5 rounded-lg border border-nuvem p-2">
                  {Array.from({ length: 49 }, (_, index) => (
                    <div
                      key={index}
                      className="aspect-square"
                      style={{
                        background:
                          (index * 7 + index * index + 3) % 3 === 0 ? '#0D2B45' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-nuvem bg-white p-4 shadow-md sm:p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 font-display text-lg font-bold">Resumo do pedido</h2>
          <div className="mb-4 flex gap-3">
            <div
              className="h-16 w-16 shrink-0 rounded-lg bg-cover bg-center"
              style={
                listing.coverPhotoUrl
                  ? { backgroundImage: `url(${listing.coverPhotoUrl})` }
                  : { background: listing.grad }
              }
            />
            <div className="min-w-0">
              <div className="break-words font-bold">{listing.title}</div>
              <div className="text-sm text-cinza">{listing.specs}</div>
            </div>
          </div>
          <div className="space-y-2 border-t border-nuvem pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-cinza">Subtotal</span>
              <span className="font-mono">{listing.price}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-cinza">Frete</span>
              <span className="font-mono text-right">
                {deliveryMode === 'pickup'
                  ? 'Retirada (R$ 0)'
                  : shippingReady
                    ? formatPrice(shippingCost)
                    : '—'}
              </span>
            </div>
            {deliveryMode === 'shipping' && shippingReady ? (
              <p className="text-xs text-cinza">
                {origin.city}, {origin.state} → {destCity}, {destState}
              </p>
            ) : null}
            <div className="flex justify-between">
              <span className="text-cinza">Taxa de proteção</span>
              <span className="font-mono">{formatPrice(protectionFee)}</span>
            </div>
            <div className="flex justify-between border-t border-nuvem pt-2 text-base font-bold">
              <span>Total</span>
              <span className="font-mono text-pull">{formatPrice(total)}</span>
            </div>
          </div>
          <p className="mt-4 rounded-lg bg-liberado-light p-3 text-xs leading-relaxed text-liberado-dark">
            🔒 O valor fica retido em custódia até você confirmar o recebimento do equipamento.
          </p>
          <Button
            className="mt-5 w-full"
            size="lg"
            disabled={!shippingReady}
            onClick={() => setPaid(true)}
          >
            {payMethod === 'pix' ? 'Confirmar pagamento Pix' : 'Pagar com cartão'}
          </Button>
        </aside>
      </div>
    </div>
  );
}
