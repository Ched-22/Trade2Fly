import { Send } from 'lucide-react';
import { chatThreads } from '../data/mockChat';
import { useMarketplace } from '../hooks/useMarketplace';

export function MessagesPage() {
  const {
    chatIdx,
    setChatIdx,
    chatMsgs,
    chatDraft,
    setChatDraft,
    appendMessage,
  } = useMarketplace();

  const activeThread = chatThreads[chatIdx];
  const messages = chatMsgs[chatIdx] ?? [];

  return (
    <div className="t2f-page max-w-[1180px]">
      <h1 className="mb-4 font-display text-2xl font-extrabold tracking-tight sm:mb-6 sm:text-3xl">Mensagens</h1>

      <div className="flex min-h-[min(70vh,520px)] flex-col overflow-hidden rounded-xl border border-nuvem bg-white md:grid md:min-h-[520px] md:grid-cols-[minmax(0,320px)_1fr]">
        <div className="max-h-44 shrink-0 overflow-y-auto border-b border-nuvem md:max-h-none md:overflow-visible md:border-r md:border-b-0">
          {chatThreads.map((thread, index) => {
            const lastMessage = chatMsgs[index]?.at(-1)?.text ?? '';
            const isActive = chatIdx === index;
            return (
              <button
                key={thread.name}
                type="button"
                onClick={() => setChatIdx(index)}
                className={`flex w-full cursor-pointer gap-3 border-none p-3 text-left sm:p-4 ${
                  isActive ? 'bg-bruma' : 'bg-white hover:bg-bruma/50'
                }`}
              >
                <div className="h-10 w-10 shrink-0 rounded-lg sm:h-12 sm:w-12" style={{ background: thread.grad }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold sm:text-base">{thread.name}</span>
                    <span className="shrink-0 text-xs text-cinza">{thread.time}</span>
                  </div>
                  <div className="truncate text-xs text-cinza">{thread.item}</div>
                  <div className="truncate text-sm text-cinza">{lastMessage}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-nuvem px-4 py-3 sm:px-5 sm:py-4">
            <div className="truncate font-bold">{activeThread.name}</div>
            <div className="truncate text-sm text-cinza">
              {activeThread.item} · <span className="font-mono">{activeThread.price}</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
            {messages.map((message, index) => (
              <div
                key={index}
                className="flex"
                style={{ justifyContent: message.me ? 'flex-end' : 'flex-start' }}
              >
                <div
                  className="max-w-[85%] px-3.5 py-2 text-sm leading-relaxed sm:max-w-[75%] sm:px-4 sm:py-2.5"
                  style={{
                    background: message.me ? '#FF512E' : '#fff',
                    color: message.me ? '#fff' : '#0A1B2A',
                    borderRadius: message.me ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    border: message.me ? 'none' : '1px solid #E3ECF7',
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t border-nuvem p-3 sm:p-4">
            <input
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') appendMessage();
              }}
              placeholder="Digite sua mensagem…"
              className="h-10 min-w-0 flex-1 rounded-lg border border-nuvem px-3 text-sm outline-none focus:ring-3 focus:ring-voo/30 sm:h-11 sm:px-4"
            />
            <button
              type="button"
              onClick={appendMessage}
              aria-label="Enviar"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-pull text-white sm:h-11 sm:w-11"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
