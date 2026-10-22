import { MapPin, Package } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatSocket } from '../lib/chatSocket';
import { AuthAlert } from '../components/auth/AuthAlert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatPrice } from '../lib/priceFormat';
import { useMarketplace } from '../hooks/useMarketplace';
import { apiGet, ApiError } from '../lib/api';
import {
  formatCheckoutGrantRemaining,
  isCheckoutGrantActive,
} from '../lib/checkoutGrantUtils';
import { createOrder, getOrder, type CreateOrderResponse } from '../lib/ordersApi';
import { calculateCardChargeTotal } from '../lib/cardInstallmentFee';
import { fetchShippingQuote, type ShippingQuote } from '../lib/shippingApi';
import { transformListingFromApi, type ListingApiRaw } from '../lib/listingTransform';
import {
  CHECKOUT_SHIPPING_INSURANCE_FEE,
  formatCep,
  isValidCep,
  normalizeCep,
  parseListingLocation,
} from '../lib/shippingEstimate';
import { fetchAddressByCep } from '../lib/viacep';
import type { CheckoutExpiredEvent } from '../types/chat';
import type { Listing } from '../types/listing';

type DeliveryMode = 'shipping' | 'pickup';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const formatCpfCnpj = (digits: string) => {
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

const formatCardNumber = (digits: string) => digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();

export function CheckoutPage() {
  const navigate = useNavigate();
  const { checkoutListingId, allListings } = useMarketplace();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [payMethod, setPayMethod] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('shipping');
  const [cep, setCep] = useState('');
  const [destCity, setDestCity] = useState('');
  const [destState, setDestState] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [paymentResult, setPaymentResult] = useState<CreateOrderResponse | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [listingRaw, setListingRaw] = useState<ListingApiRaw | null>(null);

  const [cpfCnpj, setCpfCnpj] = useState('');
  const [installments, setInstallments] = useState(1);
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiryMonth, setCardExpiryMonth] = useState('');
  const [cardExpiryYear, setCardExpiryYear] = useState('');
  const [cardCcv, setCardCcv] = useState('');
  const [cardHolderPostalCode, setCardHolderPostalCode] = useState('');
  const [cardHolderAddressNumber, setCardHolderAddressNumber] = useState('');
  const [cardHolderPhone, setCardHolderPhone] = useState('');
  const [checkoutExpired, setCheckoutExpired] = useState(false);
  const [sellerNotReady, setSellerNotReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingInsuranceOptedIn, setShippingInsuranceOptedIn] = useState(false);

  const listingId = checkoutListingId ?? 1;

  useEffect(() => {
    let cancelled = false;

    const applyListing = (data: Listing, raw?: ListingApiRaw) => {
      if (!cancelled) {
        setListing(data);
        if (raw) setListingRaw(raw);
        setLoadingListing(false);
      }
    };

    const fromContext = allListings.find((item) => item.id === listingId);
    if (fromContext) {
      applyListing(fromContext);
      void apiGet<ListingApiRaw>(`/api/listings/${listingId}`)
        .then((raw) => {
          if (!cancelled) {
            setListingRaw(raw);
            applyListing(transformListingFromApi(raw), raw);
          }
        })
        .catch(() => undefined);
      return () => {
        cancelled = true;
      };
    }

    setLoadingListing(true);
    apiGet<ListingApiRaw>(`/api/listings/${listingId}`)
      .then((data) => {
        if (!cancelled) applyListing(transformListingFromApi(data), data);
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

  const refetchListing = () => {
    void apiGet<ListingApiRaw>(`/api/listings/${listingId}`)
      .then((raw) => {
        setListingRaw(raw);
        setListing(transformListingFromApi(raw));
        if (!raw.checkoutGrant?.canCheckout) {
          setCheckoutExpired(Boolean(raw.checkoutGrant?.expired));
        }
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    const socket = getChatSocket();
    if (!socket || !listing) return;

    const onExpired = (event: CheckoutExpiredEvent) => {
      if (event.listingId !== listing.id) return;
      setCheckoutExpired(true);
      refetchListing();
    };

    socket.on('checkoutExpired', onExpired);
    return () => {
      socket.off('checkoutExpired', onExpired);
    };
  }, [listing?.id]);

  useEffect(() => {
    const expiresAt = listingRaw?.checkoutGrant?.expiresAt ?? listing?.checkoutGrant?.expiresAt;
    if (!expiresAt || checkoutExpired) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
      if (!isCheckoutGrantActive(expiresAt)) {
        setCheckoutExpired(true);
        refetchListing();
      }
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [listingRaw?.checkoutGrant?.expiresAt, listing?.checkoutGrant?.expiresAt, checkoutExpired, listingId]);

  const origin = useMemo(
    () => parseListingLocation(listing?.location ?? ''),
    [listing?.location],
  );

  const destinationReady =
    isValidCep(cep) && destCity.trim().length > 0 && destState.trim().length === 2;

  useEffect(() => {
    if (deliveryMode !== 'shipping' || !listing || !destinationReady) {
      setShippingQuote(null);
      setShippingError(null);
      setShippingLoading(false);
      return;
    }

    let cancelled = false;
    setShippingLoading(true);
    setShippingError(null);

    void fetchShippingQuote({
      listingId: listing.id,
      destinationCep: normalizeCep(cep),
      destinationCity: destCity.trim(),
      destinationState: destState.trim().toUpperCase(),
    })
      .then((quote) => {
        if (!cancelled) {
          setShippingQuote(quote);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setShippingQuote(null);
          setShippingError('Não foi possível calcular o frete. Tente novamente.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setShippingLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [deliveryMode, listing?.id, cep, destCity, destState, destinationReady]);

  const shippingCost = deliveryMode === 'pickup' ? 0 : (shippingQuote?.amount ?? 0);
  const weightKg = shippingQuote?.weightKg ?? 0;
  const insuranceAvailable = deliveryMode === 'shipping';
  const shippingInsuranceFee =
    insuranceAvailable && shippingInsuranceOptedIn ? CHECKOUT_SHIPPING_INSURANCE_FEE : 0;
  const saleMode = listingRaw?.saleMode ?? listing?.saleMode ?? 'direct';
  const checkoutGrant = listingRaw?.checkoutGrant ?? listing?.checkoutGrant ?? null;
  const checkoutGrantActive =
    checkoutGrant?.canCheckout && isCheckoutGrantActive(checkoutGrant.expiresAt);
  const checkoutBlocked =
    saleMode === 'offersOnly' && (!checkoutGrantActive || checkoutExpired);
  const isCheckoutExpired =
    checkoutExpired || Boolean(checkoutGrant?.expired) || Boolean(checkoutGrant?.expiresAt && !checkoutGrantActive);
  const itemPrice =
    saleMode === 'offersOnly' && checkoutGrantActive
      ? checkoutGrant.agreedPrice
      : (listing?.priceNum ?? 0);
  const subtotal = itemPrice;
  const cardCharge =
    payMethod === 'card' ? calculateCardChargeTotal(itemPrice, installments) : null;
  const installmentSurcharge = cardCharge?.buyerSurcharge ?? 0;
  const total = subtotal + shippingInsuranceFee + shippingCost + installmentSurcharge;
  const itemPriceLabel = formatPrice(itemPrice);
  const checkoutRemainingLabel =
    checkoutGrant?.expiresAt && checkoutGrantActive
      ? formatCheckoutGrantRemaining(checkoutGrant.expiresAt, now)
      : null;

  const shippingReady =
    !checkoutBlocked &&
    (deliveryMode === 'pickup' ||
      (destinationReady && !shippingLoading && shippingQuote !== null && !shippingError));

  const cpfCnpjDigits = onlyDigits(cpfCnpj);
  const cpfCnpjValid = cpfCnpjDigits.length === 11 || cpfCnpjDigits.length === 14;
  const cardFieldsValid =
    payMethod !== 'card' ||
    (cardHolderName.trim().length > 0 &&
      onlyDigits(cardNumber).length >= 13 &&
      cardExpiryMonth.length === 2 &&
      cardExpiryYear.length === 4 &&
      cardCcv.length >= 3 &&
      onlyDigits(cardHolderPostalCode).length === 8 &&
      cardHolderAddressNumber.trim().length > 0 &&
      onlyDigits(cardHolderPhone).length >= 10);
  const canSubmitPayment = cpfCnpjValid && cardFieldsValid;

  const handlePay = async () => {
    if (!listing || checkoutBlocked || !canSubmitPayment) return;

    setPaying(true);
    setPayError(null);
    setSellerNotReady(false);
    try {
      const result = await createOrder({
        listingId: listing.id,
        paymentType: payMethod,
        amount: itemPrice,
        cpfCnpj: cpfCnpjDigits,
        ...(payMethod === 'card'
          ? {
              installments,
              cardHolderName,
              cardNumber: onlyDigits(cardNumber),
              cardExpiryMonth,
              cardExpiryYear,
              cardCcv,
              cardHolderPostalCode: onlyDigits(cardHolderPostalCode),
              cardHolderAddressNumber,
              cardHolderPhone: onlyDigits(cardHolderPhone),
            }
          : {}),
      });
      setPaymentResult(result);
      if (result.status !== 'awaiting_payment') {
        setPaid(true);
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível registrar o pagamento.';
      if (error instanceof ApiError && error.code === 'CHECKOUT_EXPIRED') {
        setCheckoutExpired(true);
        refetchListing();
      }
      if (error instanceof ApiError && error.code === 'SELLER_PAYOUT_NOT_CONFIGURED') {
        setSellerNotReady(true);
      }
      setPayError(message);
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    if (!paymentResult || paymentResult.status !== 'awaiting_payment' || paid) return;

    const interval = window.setInterval(() => {
      void getOrder(paymentResult.id)
        .then((order) => {
          if (order.status === 'awaiting_shipment') {
            setPaid(true);
          } else if (order.status === 'cancelled') {
            setPayError('O pagamento não foi confirmado a tempo. Tente novamente.');
            setPaymentResult(null);
            refetchListing();
          }
        })
        .catch(() => undefined);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [paymentResult, paid]);

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

  if (checkoutBlocked) {
    return (
      <div className="t2f-page max-w-lg">
        <AuthAlert variant="error">
          {isCheckoutExpired
            ? 'O prazo de 1 hora para pagamento expirou. Envie uma nova oferta ou peça ao vendedor para liberar o pagamento novamente.'
            : 'O checkout ainda não foi liberado para você neste anúncio. Negocie com o vendedor ou envie uma oferta.'}
        </AuthAlert>
        <Button className="mt-4" onClick={() => navigate(`/anuncio/${listing.id}`)}>
          Voltar ao anúncio
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
          Pagamento confirmado. O vendedor será notificado para{' '}
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
              O frete é pago pelo comprador e cotado pela Loggi com base na origem do anúncio e no
              endereço de destino.
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
                onClick={() => {
                  setDeliveryMode('shipping');
                }}
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
                onClick={() => {
                  setDeliveryMode('pickup');
                  setShippingInsuranceOptedIn(false);
                }}
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
                      : shippingLoading
                        ? 'Consultando frete na Loggi…'
                        : shippingError
                          ? shippingError
                          : shippingQuote
                            ? `Frete ${shippingQuote.source === 'loggi' ? 'Loggi' : 'estimado'}: ${formatPrice(shippingQuote.amount)}${
                                shippingQuote.estimatedDays
                                  ? ` · entrega em até ${shippingQuote.estimatedDays} dia${shippingQuote.estimatedDays === 1 ? '' : 's'}`
                                  : ''
                              }${
                                shippingQuote.freightTypeLabel
                                  ? ` · ${shippingQuote.freightTypeLabel}`
                                  : ''
                              } · ~${weightKg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`
                            : destinationReady
                              ? 'Calculando frete…'
                              : 'Informe o CEP para calcular o frete.'}
                  </p>
                </div>
              </div>
            ) : null}

            {deliveryMode === 'shipping' ? (
              <div className="rounded-xl border border-nuvem bg-bruma/40 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={shippingInsuranceOptedIn}
                    onChange={(event) => setShippingInsuranceOptedIn(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-voo"
                  />
                  <span>
                    <span className="block font-semibold text-solo">
                      Adicionar seguro frete ({formatPrice(CHECKOUT_SHIPPING_INSURANCE_FEE)})
                    </span>
                    <span className="mt-1 block text-sm text-cinza">
                      Cobertura opcional contra problemas no transporte. É independente do valor do
                      frete cotado acima.
                    </span>
                  </span>
                </label>

                {!shippingInsuranceOptedIn ? (
                  <p className="mt-3 rounded-lg border border-pull/25 bg-pull/5 px-3 py-2.5 text-xs leading-relaxed text-solo">
                    <span className="font-semibold">Observação:</span> sem o seguro frete, em caso
                    de problema com a entrega (extravio, avaria no transporte etc.) você não estará
                    resguardado por essa cobertura. O frete continua sendo cobrado normalmente.
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-liberado-dark">
                    Seguro frete incluído no total. Em caso de incidente na entrega, use o suporte
                    Trade2Fly com a documentação do pedido.
                  </p>
                )}
              </div>
            ) : null}
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold">Forma de pagamento</h2>

            {paymentResult && paymentResult.status === 'awaiting_payment' ? (
              <div className="rounded-xl border border-nuvem bg-white p-6">
                {paymentResult.pixQrCodeBase64 ? (
                  <>
                    <p className="mb-4 text-sm text-cinza">
                      Escaneie o QR Code ou copie o código Pix. Assim que o pagamento for
                      confirmado pelo Asaas, o pedido avança automaticamente.
                    </p>
                    <img
                      src={`data:image/png;base64,${paymentResult.pixQrCodeBase64}`}
                      alt="QR Code Pix"
                      className="mx-auto h-48 w-48 rounded-lg border border-nuvem"
                    />
                    {paymentResult.pixPayload ? (
                      <div className="mt-4 flex items-center gap-2">
                        <Input readOnly value={paymentResult.pixPayload} className="text-xs" />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            void navigator.clipboard.writeText(paymentResult.pixPayload ?? '')
                          }
                        >
                          Copiar
                        </Button>
                      </div>
                    ) : null}
                  </>
                ) : paymentResult.bankSlipUrl ? (
                  <>
                    <p className="mb-4 text-sm text-cinza">
                      Boleto gerado. A compensação pode levar até 3 dias úteis; assim que for
                      confirmado, o pedido avança automaticamente.
                    </p>
                    <a
                      href={paymentResult.bankSlipUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block rounded-lg bg-voo px-4 py-2.5 text-sm font-bold text-white"
                    >
                      Visualizar boleto
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-cinza">Processando pagamento…</p>
                )}
              </div>
            ) : (
              <>
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

                <button
                  type="button"
                  onClick={() => setPayMethod('boleto')}
                  className={`w-full cursor-pointer rounded-xl border-2 p-5 text-left ${
                    payMethod === 'boleto' ? 'border-voo bg-voo-light' : 'border-nuvem bg-white'
                  }`}
                >
                  <div className="font-bold">Boleto</div>
                  <div className="text-sm text-cinza">Compensação em até 3 dias úteis</div>
                </button>

                <Input
                  label="CPF ou CNPJ do comprador"
                  placeholder="000.000.000-00"
                  value={formatCpfCnpj(cpfCnpjDigits)}
                  onChange={(event) => setCpfCnpj(onlyDigits(event.target.value).slice(0, 14))}
                />

                {payMethod === 'card' ? (
                  <div className="grid gap-3 rounded-xl border border-nuvem bg-white p-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Input
                        label="Nome no cartão"
                        value={cardHolderName}
                        onChange={(event) => setCardHolderName(event.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Número do cartão"
                        value={formatCardNumber(onlyDigits(cardNumber))}
                        onChange={(event) => setCardNumber(onlyDigits(event.target.value).slice(0, 19))}
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    <Input
                      label="Mês (MM)"
                      value={cardExpiryMonth}
                      onChange={(event) => setCardExpiryMonth(onlyDigits(event.target.value).slice(0, 2))}
                      placeholder="12"
                      maxLength={2}
                    />
                    <Input
                      label="Ano (AAAA)"
                      value={cardExpiryYear}
                      onChange={(event) => setCardExpiryYear(onlyDigits(event.target.value).slice(0, 4))}
                      placeholder="2030"
                      maxLength={4}
                    />
                    <Input
                      label="CVV"
                      value={cardCcv}
                      onChange={(event) => setCardCcv(onlyDigits(event.target.value).slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                    />
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-solo">Parcelas</label>
                      <select
                        value={installments}
                        onChange={(event) => setInstallments(Number(event.target.value))}
                        className="h-11 w-full rounded-md border border-nuvem bg-white px-3.5 text-[0.95rem] text-solo outline-none focus:ring-3 focus:ring-voo/30"
                      >
                        {Array.from({ length: 12 }, (_, index) => index + 1).map((n) => {
                          const optionCharge = calculateCardChargeTotal(itemPrice, n).chargeAmount;
                          const optionTotal = optionCharge + shippingInsuranceFee + shippingCost;
                          const installmentValue = Math.round((optionTotal / n) * 100) / 100;
                          return (
                            <option key={n} value={n}>
                              {n}x de {formatPrice(installmentValue)} (com juros)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <Input
                      label="CEP do titular"
                      value={cardHolderPostalCode}
                      onChange={(event) =>
                        setCardHolderPostalCode(onlyDigits(event.target.value).slice(0, 8))
                      }
                      placeholder="00000000"
                    />
                    <Input
                      label="Número do endereço"
                      value={cardHolderAddressNumber}
                      onChange={(event) => setCardHolderAddressNumber(event.target.value)}
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Telefone com DDD"
                        value={cardHolderPhone}
                        onChange={(event) =>
                          setCardHolderPhone(onlyDigits(event.target.value).slice(0, 11))
                        }
                        placeholder="11999999999"
                      />
                    </div>
                  </div>
                ) : null}
              </>
            )}
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
              <span className="font-mono">{itemPriceLabel}</span>
            </div>
            {saleMode === 'offersOnly' && checkoutGrantActive ? (
              <p className="text-xs text-cinza">
                Valor acordado com o vendedor (não editável).
                {checkoutRemainingLabel
                  ? ` Pagamento liberado por mais ${checkoutRemainingLabel}.`
                  : null}
              </p>
            ) : null}
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
            {deliveryMode === 'shipping' && shippingQuote ? (
              <p className="text-xs text-cinza">
                {origin.city}, {origin.state} → {destCity}, {destState}
                {shippingQuote.source === 'loggi' ? ' · via Loggi' : ''}
              </p>
            ) : null}
            <div className="flex justify-between gap-3">
              <span className="text-cinza">Seguro frete</span>
              <span className="font-mono text-right">
                {!insuranceAvailable
                  ? 'Não se aplica'
                  : shippingInsuranceOptedIn
                    ? formatPrice(CHECKOUT_SHIPPING_INSURANCE_FEE)
                    : 'Não optado'}
              </span>
            </div>
            {insuranceAvailable && !shippingInsuranceOptedIn ? (
              <p className="text-xs text-cinza">
                Sem cobertura de seguro frete nesta compra.
              </p>
            ) : null}
            {installmentSurcharge > 0 ? (
              <div className="flex justify-between gap-3">
                <span className="text-cinza">
                  Juros do cartão {installments > 1 ? `(${installments}x)` : '(à vista)'}
                </span>
                <span className="font-mono text-right">{formatPrice(installmentSurcharge)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-nuvem pt-2 text-base font-bold">
              <span>Total</span>
              <span className="font-mono text-pull">{formatPrice(total)}</span>
            </div>
          </div>
          <p className="mt-4 rounded-lg bg-liberado-light p-3 text-xs leading-relaxed text-liberado-dark">
            🔒 Pagamento processado com segurança via Asaas.
          </p>
          {sellerNotReady ? (
            <div className="mt-3">
              <AuthAlert variant="error">
                O vendedor ainda não cadastrou uma chave Pix para receber pagamentos. Avise o vendedor para
                configurar os dados de recebimento em "Perfil &gt; Dados de recebimento" antes de tentar comprar
                novamente.
              </AuthAlert>
            </div>
          ) : payError ? (
            <p className="mt-3 text-sm text-pull">{payError}</p>
          ) : null}
          {!paymentResult || paymentResult.status !== 'awaiting_payment' ? (
            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={!shippingReady || paying || !canSubmitPayment}
              onClick={() => void handlePay()}
            >
              {paying
                ? 'Processando…'
                : payMethod === 'pix'
                  ? 'Gerar cobrança Pix'
                  : payMethod === 'boleto'
                    ? 'Gerar boleto'
                    : `Pagar em ${installments}x`}
            </Button>
          ) : (
            <p className="mt-5 text-center text-sm text-cinza">Aguardando confirmação do pagamento…</p>
          )}
        </aside>
      </div>
    </div>
  );
}
