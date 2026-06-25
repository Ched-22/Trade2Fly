import { useState, type FormEvent } from 'react';
import type { Listing } from '../../types/listing';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

type SendOfferModalProps = {
  open: boolean;
  listing: Listing;
  onClose: () => void;
  onSubmit: (offerAmount: number, message: string) => void;
};

export function SendOfferModal({ open, listing, onClose, onSubmit }: SendOfferModalProps) {
  const [offerAmount, setOfferAmount] = useState(String(listing.priceNum));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(offerAmount);
    if (!amount || amount < 1) {
      setError('Informe um valor válido para a oferta.');
      return;
    }
    setError('');
    onSubmit(amount, message.trim());
    setMessage('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-solo/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-offer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-nuvem bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="send-offer-title" className="font-display text-xl font-bold text-solo">
              Enviar oferta
            </h2>
            <p className="mt-1 text-sm text-cinza">{listing.title}</p>
            <p className="font-mono text-sm text-cinza">
              Preço anunciado: {listing.price}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-cinza hover:text-solo"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Valor da oferta (R$)"
            type="number"
            min={1}
            value={offerAmount}
            onChange={(e) => {
              setOfferAmount(e.target.value);
              setError('');
            }}
            error={error}
          />
          <Textarea
            label="Mensagem"
            placeholder="Conte ao vendedor o motivo da sua oferta ou tire dúvidas…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Enviar oferta no chat</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
