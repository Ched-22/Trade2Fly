import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { formatPrice, getListingById } from '../data/mockListings';
import { useMarketplace } from '../hooks/useMarketplace';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { checkoutListingId } = useMarketplace();
  const listing = getListingById(checkoutListingId ?? 1)!;
  const [payMethod, setPayMethod] = useState<'pix' | 'card'>('pix');
  const [paid, setPaid] = useState(false);

  if (paid) {
    return (
      <div className="t2f-page max-w-2xl text-center">
        <div className="mb-4 text-5xl">✓</div>
        <h1 className="mb-3 font-display text-3xl font-extrabold">Pagamento registrado!</h1>
        <p className="mb-8 text-cinza">
          Seu pagamento está em custódia. O vendedor será notificado para enviar o equipamento.
        </p>
        <Button onClick={() => navigate('/')}>Acompanhar meus pedidos</Button>
      </div>
    );
  }

  return (
    <div className="t2f-page max-w-[980px]">
      <h1 className="mb-5 font-display text-2xl font-extrabold tracking-tight sm:mb-6 sm:text-3xl">Checkout seguro</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
        <div className="space-y-4">
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
                      background: (index * 7 + index * index + 3) % 3 === 0 ? '#0D2B45' : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="h-fit rounded-xl border border-nuvem bg-white p-4 shadow-md sm:p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 font-display text-lg font-bold">Resumo do pedido</h2>
          <div className="mb-4 flex gap-3">
            <div className="h-16 w-16 shrink-0 rounded-lg" style={{ background: listing.grad }} />
            <div>
              <div className="font-bold">{listing.title}</div>
              <div className="text-sm text-cinza">{listing.specs}</div>
            </div>
          </div>
          <div className="space-y-2 border-t border-nuvem pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-cinza">Subtotal</span>
              <span className="font-mono">{listing.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cinza">Taxa de proteção</span>
              <span className="font-mono">R$ 45</span>
            </div>
            <div className="flex justify-between border-t border-nuvem pt-2 text-base font-bold">
              <span>Total</span>
              <span className="font-mono text-pull">{formatPrice(listing.priceNum + 45)}</span>
            </div>
          </div>
          <p className="mt-4 rounded-lg bg-liberado-light p-3 text-xs leading-relaxed text-liberado-dark">
            🔒 O valor fica retido em custódia até você confirmar o recebimento do equipamento.
          </p>
          <Button className="mt-5 w-full" size="lg" onClick={() => setPaid(true)}>
            {payMethod === 'pix' ? 'Confirmar pagamento Pix' : 'Pagar com cartão'}
          </Button>
        </aside>
      </div>
    </div>
  );
}
