import { useCallback, useEffect, useState } from 'react';
import {
  confirmDisputeResolved,
  getOrderDispute,
  replyToDispute,
  type OrderDispute,
} from '../../lib/ordersApi';
import { AuthAlert } from '../auth/AuthAlert';
import { Button } from '../ui/Button';

type DisputePanelProps = {
  orderId: number;
  /** Chamado quando a disputa muda o pedido (ex.: "resolveu meu problema" conclui o pedido). */
  onOrderChanged: () => void;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

const OUTCOME_MESSAGES: Record<string, string> = {
  buyer_satisfied: 'Disputa encerrada: você confirmou que o problema foi resolvido.',
  refund_buyer: 'Disputa encerrada: o valor da compra foi reembolsado.',
  release_seller: 'Disputa encerrada: o pedido foi concluído a favor do vendedor.',
};

export function DisputePanel({ orderId, onOrderChanged }: DisputePanelProps) {
  const [dispute, setDispute] = useState<OrderDispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState('');

  const load = useCallback(async () => {
    try {
      setDispute(await getOrderDispute(orderId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar a disputa.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSendReply = async () => {
    const trimmed = reply.trim();
    if (trimmed.length < 10) {
      setError('Descreva o problema com pelo menos 10 caracteres.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setDispute(await replyToDispute(orderId, trimmed));
      setReply('');
      setShowReply(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a mensagem.');
    } finally {
      setBusy(false);
    }
  };

  const handleResolved = async () => {
    setBusy(true);
    setError(null);
    try {
      setDispute(await confirmDisputeResolved(orderId));
      onOrderChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível confirmar.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-cinza">Carregando disputa…</p>;
  if (!dispute) return error ? <AuthAlert variant="error">{error}</AuthAlert> : null;

  return (
    <section className="space-y-4 rounded-xl border border-nuvem bg-white p-5">
      <header>
        <h2 className="font-display text-xl font-extrabold">Disputa do pedido</h2>
        <p className="text-sm text-cinza">Aberta em {formatDateTime(dispute.openedAt)}</p>
      </header>

      <ol className="space-y-3">
        {dispute.messages.map((message) => {
          const mine = message.authorType === 'buyer';
          return (
            <li
              key={message.id}
              className={`max-w-[90%] rounded-lg px-4 py-3 text-sm ${
                mine ? 'ml-auto bg-voo/10 text-solo' : 'mr-auto bg-nuvem/60 text-solo'
              }`}
            >
              <div className="mb-1 text-xs font-semibold text-cinza">
                {mine ? 'Você' : 'Equipe Trade2Fly'} · {formatDateTime(message.createdAt)}
              </div>
              <p className="whitespace-pre-wrap break-words">{message.body}</p>
            </li>
          );
        })}
      </ol>

      {error ? <AuthAlert variant="error">{error}</AuthAlert> : null}

      {dispute.status === 'awaiting_admin' ? (
        <AuthAlert variant="info">
          Sua mensagem foi enviada e será analisada pela equipe Trade2Fly em até{' '}
          <strong>48 horas úteis</strong>. Você será notificado quando houver resposta.
        </AuthAlert>
      ) : null}

      {dispute.status === 'awaiting_buyer' ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-solo">A resposta da equipe resolveu o seu problema?</p>
          {!showReply ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button disabled={busy} onClick={() => void handleResolved()}>
                Resolveu meu problema
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setShowReply(true);
                  setError(null);
                }}
              >
                Ainda não resolveu
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-solo" htmlFor="dispute-reply">
                Conte o que ainda não foi resolvido
              </label>
              <textarea
                id="dispute-reply"
                value={reply}
                onChange={(event) => {
                  setReply(event.target.value);
                  setError(null);
                }}
                rows={4}
                maxLength={2000}
                className="w-full rounded-md border border-nuvem p-3 text-sm"
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button disabled={busy} onClick={() => void handleSendReply()}>
                  Enviar
                </Button>
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    setShowReply(false);
                    setReply('');
                    setError(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {dispute.status === 'resolved' ? (
        <AuthAlert variant="success">
          {(dispute.outcome && OUTCOME_MESSAGES[dispute.outcome]) ?? 'Disputa encerrada.'}
        </AuthAlert>
      ) : null}
    </section>
  );
}
