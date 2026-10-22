import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { sendSupportChatMessage, type SupportChatTurn } from '../../lib/supportChatApi';

type DisplayMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const GREETING: DisplayMessage = {
  role: 'assistant',
  content: 'Oi! Sou o assistente da Trade2Fly. Posso ajudar com dúvidas sobre pagamento, envio, pedidos e mais. Como posso ajudar?',
};

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escalated, setEscalated] = useState<{ reason: string; email: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open, loading]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || loading) return;

    const history: SupportChatTurn[] = messages
      .filter((m) => m !== GREETING)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setDraft('');
    setError(null);
    setLoading(true);

    try {
      const response = await sendSupportChatMessage(text, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
      if (response.escalate) setEscalated(response.escalate);
    } catch {
      setError('Não consegui enviar sua mensagem agora. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[520px] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-nuvem bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-voo px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">Suporte Trade2Fly</p>
              <p className="text-xs text-white/80">Assistente automático</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Fechar chat"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-nuvem/30 px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm',
                    message.role === 'user'
                      ? 'rounded-br-sm bg-voo text-white'
                      : 'rounded-bl-sm border border-nuvem bg-white text-solo',
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-nuvem bg-white px-3 py-2 text-sm text-solo/60">
                  <Loader2 size={14} className="animate-spin" />
                  digitando...
                </div>
              </div>
            )}

            {escalated && (
              <div className="rounded-lg border border-pull/30 bg-pull/10 px-3 py-2 text-xs text-solo">
                Encaminhei sua conversa para o time de suporte humano. Se preferir, escreva direto para{' '}
                <a href={`mailto:${escalated.email}`} className="font-semibold text-pull underline">
                  {escalated.email}
                </a>
                .
              </div>
            )}

            {error && <p className="text-xs text-error">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-nuvem bg-white p-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escreva sua dúvida..."
              disabled={loading}
              className="h-10 flex-1 rounded-full border border-nuvem bg-nuvem/20 px-4 text-sm outline-none focus:border-voo disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !draft.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-voo text-white transition hover:bg-voo-dark disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Enviar mensagem"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-pull text-white shadow-[0_4px_16px_rgba(255,81,46,0.4)] transition hover:-translate-y-0.5 hover:bg-pull-dark"
        aria-label={open ? 'Fechar chat de suporte' : 'Abrir chat de suporte'}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
