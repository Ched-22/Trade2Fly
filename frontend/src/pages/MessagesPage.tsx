import { ArrowLeft, Send, ShoppingBag, Unlock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OfferMessageBubble } from '../components/chat/OfferMessageBubble';
import { OfferRespondModal } from '../components/chat/OfferRespondModal';
import { ReleaseCheckoutModal } from '../components/chat/ReleaseCheckoutModal';
import { Button } from '../components/ui/Button';
import { createCheckoutGrant } from '../lib/checkoutGrantsApi';
import {
  findPendingOfferForUser,
  isOfferAwaitingCounterpart,
  isOfferPendingForUser,
} from '../lib/offerNegotiation';
import { gradForListingId } from '../lib/listingTransform';
import {
  formatChatPrice,
  formatThreadTime,
  useChatContext,
} from '../context/ChatContext';
import { useAuthContext } from '../context/AuthContext';
import { useMarketplace } from '../hooks/useMarketplace';
import type { ChatMessage, ChatThread } from '../types/chat';

function ThreadListItem({
  thread,
  isActive,
  onSelect,
}: {
  thread: ChatThread;
  isActive: boolean;
  onSelect: () => void;
}) {
  const lastMessage = thread.lastMessage?.text ?? '';
  const timeLabel = thread.lastMessage
    ? formatThreadTime(thread.lastMessage.createdAt)
    : formatThreadTime(thread.createdAt);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full cursor-pointer gap-3 border-none p-3 text-left sm:p-4 ${
        isActive ? 'bg-bruma' : 'bg-white hover:bg-bruma/50'
      }`}
    >
      <Link
        to={`/anuncio/${thread.listing.id}`}
        onClick={(event) => event.stopPropagation()}
        className="relative block h-10 w-10 shrink-0 rounded-lg sm:h-12 sm:w-12"
        style={{ background: gradForListingId(thread.listing.id) }}
        aria-label={`Ver anúncio: ${thread.listing.title}`}
      >
        {thread.unread ? (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-pull" />
        ) : null}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm sm:text-base ${
              thread.unread ? 'font-extrabold text-solo' : 'font-bold'
            }`}
          >
            {thread.otherUser.name}
          </span>
          <span className="shrink-0 text-xs text-cinza">{timeLabel}</span>
        </div>
        <Link
          to={`/anuncio/${thread.listing.id}`}
          onClick={(event) => event.stopPropagation()}
          className="inline-block max-w-full truncate text-xs text-cinza hover:text-voo hover:underline"
        >
          {thread.listing.title}
        </Link>
        <div
          className={`truncate text-sm ${thread.unread ? 'font-semibold text-solo' : 'text-cinza'}`}
        >
          {lastMessage}
        </div>
      </div>
    </button>
  );
}

function isNegotiationMessage(message: ChatMessage): boolean {
  return (
    message.messageType === 'offer' ||
    message.messageType === 'offer_accepted' ||
    message.messageType === 'offer_declined'
  );
}

export function MessagesPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { setCheckoutListingId, setSelectedListingId } = useMarketplace();
  const {
    threads,
    threadsLoading,
    threadsError,
    selectedThreadId,
    setSelectedThreadId,
    messages,
    messagesLoading,
    draft,
    setDraft,
    sendThreadMessage,
    refreshThreads,
    refreshMessages,
  } = useChatContext();

  const activeThread = threads.find((thread) => thread.id === selectedThreadId) ?? null;
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const showMobileConversation = selectedThreadId !== null;
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [respondOffer, setRespondOffer] = useState<ChatMessage | null>(null);
  const [dismissedOfferId, setDismissedOfferId] = useState<number | null>(null);
  const autoOpenedOfferIdRef = useRef<number | null>(null);

  const showReleaseCheckout = activeThread?.canReleaseCheckout === true;
  const showCompletePurchase = activeThread?.canCompletePurchase === true;
  const pendingOffer = findPendingOfferForUser(messages, user?.id);

  const handleCompletePurchase = () => {
    if (!activeThread) return;
    setSelectedListingId(activeThread.listing.id);
    setCheckoutListingId(activeThread.listing.id);
    navigate('/checkout');
  };

  const handleReleaseCheckout = async (agreedPrice: number) => {
    if (!activeThread) return;
    await createCheckoutGrant(activeThread.listing.id, {
      threadId: activeThread.id,
      agreedPrice,
      sellerAcknowledgedWarning: true,
    });
    await refreshThreads();
  };

  const handleOfferResolved = async () => {
    if (!activeThread) return;
    await refreshMessages(activeThread.id);
    await refreshThreads();
  };

  useEffect(() => {
    setRespondOffer(null);
    setDismissedOfferId(null);
    autoOpenedOfferIdRef.current = null;
  }, [selectedThreadId]);

  useEffect(() => {
    if (!pendingOffer || messagesLoading) return;
    if (dismissedOfferId === pendingOffer.id) return;
    if (respondOffer?.id === pendingOffer.id) return;
    if (autoOpenedOfferIdRef.current === pendingOffer.id) return;

    autoOpenedOfferIdRef.current = pendingOffer.id;
    setRespondOffer(pendingOffer);
  }, [pendingOffer, messagesLoading, dismissedOfferId, respondOffer?.id]);

  useEffect(() => {
    if (!selectedThreadId || messagesLoading) return;

    const el = messagesScrollRef.current;
    if (!el) return;

    const frame = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedThreadId, messages, messagesLoading]);

  const handleSend = () => {
    void sendThreadMessage();
  };

  const handleBackToList = () => {
    setSelectedThreadId(null);
  };

  if (threadsLoading && threads.length === 0) {
    return (
      <div className="t2f-page max-w-[1180px]">
        <h1 className="mb-4 font-display text-2xl font-extrabold tracking-tight sm:mb-6 sm:text-3xl">
          Mensagens
        </h1>
        <p className="text-cinza">Carregando conversas…</p>
      </div>
    );
  }

  return (
    <div className="t2f-page max-w-[1180px]">
      <h1
        className={`mb-4 font-display text-2xl font-extrabold tracking-tight sm:mb-6 sm:text-3xl ${
          showMobileConversation ? 'hidden md:block' : ''
        }`}
      >
        Mensagens
      </h1>

      {threadsError ? (
        <p className="mb-4 text-sm text-pull">{threadsError}</p>
      ) : null}

      <div className="flex h-[calc(100dvh-10.5rem)] min-h-[560px] flex-col overflow-hidden rounded-xl border border-nuvem bg-white md:grid md:min-h-[680px] md:grid-cols-[minmax(0,340px)_1fr]">
        <div
          className={`min-h-0 flex-col overflow-y-auto border-nuvem md:border-r ${
            showMobileConversation ? 'hidden md:flex' : 'flex flex-1'
          }`}
        >
          {threads.length === 0 ? (
            <p className="p-4 text-sm text-cinza">Nenhuma conversa ainda.</p>
          ) : (
            threads.map((thread) => (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                isActive={selectedThreadId === thread.id}
                onSelect={() => setSelectedThreadId(thread.id)}
              />
            ))
          )}
        </div>

        <div
          className={`min-h-0 flex-1 flex-col overflow-hidden ${
            showMobileConversation ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeThread ? (
            <>
              <div className="flex shrink-0 items-center gap-2 border-b border-nuvem px-3 py-3 sm:px-5 sm:py-4">
                <button
                  type="button"
                  onClick={handleBackToList}
                  aria-label="Voltar para conversas"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-nuvem bg-white text-solo md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{activeThread.otherUser.name}</div>
                  <Link
                    to={`/anuncio/${activeThread.listing.id}`}
                    className="inline-block max-w-full truncate text-sm text-cinza hover:text-voo hover:underline"
                  >
                    {activeThread.listing.title} ·{' '}
                    <span className="font-mono">
                      {formatChatPrice(activeThread.listing.priceNum)}
                    </span>
                  </Link>
                </div>
                {pendingOffer ? (
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setRespondOffer(pendingOffer)}
                  >
                    Responder proposta
                  </Button>
                ) : null}
                {showReleaseCheckout && !pendingOffer ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setReleaseOpen(true)}
                  >
                    <Unlock className="mr-1.5 h-4 w-4" />
                    Liberar pagamento
                  </Button>
                ) : null}
                {showCompletePurchase ? (
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0"
                    onClick={handleCompletePurchase}
                  >
                    <ShoppingBag className="mr-1.5 h-4 w-4" />
                    Concluir compra
                    {activeThread.checkoutAgreedPrice != null
                      ? ` · ${formatChatPrice(activeThread.checkoutAgreedPrice)}`
                      : ''}
                  </Button>
                ) : null}
              </div>

              <div ref={messagesScrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="flex flex-col gap-3">
                  {messagesLoading && messages.length === 0 ? (
                    <p className="text-sm text-cinza">Carregando mensagens…</p>
                  ) : null}
                  {messages.map((message) => {
                    const isMe = message.senderId === user?.id;

                    if (isNegotiationMessage(message)) {
                      return (
                        <OfferMessageBubble
                          key={message.id}
                          message={message}
                          isMe={isMe}
                          isPendingForMe={isOfferPendingForUser(messages, message.id, user?.id)}
                          isAwaitingCounterpart={isOfferAwaitingCounterpart(
                            messages,
                            message.id,
                            user?.id,
                          )}
                          onRespond={() => setRespondOffer(message)}
                        />
                      );
                    }

                    return (
                      <div
                        key={message.id}
                        className="flex"
                        style={{ justifyContent: isMe ? 'flex-end' : 'flex-start' }}
                      >
                        <div
                          className="max-w-[85%] px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line sm:max-w-[75%] sm:px-4 sm:py-2.5"
                          style={{
                            background: isMe ? '#FF512E' : '#fff',
                            color: isMe ? '#fff' : '#0A1B2A',
                            borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            border: isMe ? 'none' : '1px solid #E3ECF7',
                          }}
                        >
                          {message.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex shrink-0 gap-2 border-t border-nuvem p-3 sm:p-4">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSend();
                  }}
                  placeholder="Digite sua mensagem…"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-nuvem px-3 text-sm outline-none focus:ring-3 focus:ring-voo/30 sm:h-11 sm:px-4"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  aria-label="Enviar"
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-pull text-white sm:h-11 sm:w-11"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-sm text-cinza">
              Selecione uma conversa para ver as mensagens.
            </div>
          )}
        </div>
      </div>

      {activeThread ? (
        <ReleaseCheckoutModal
          open={releaseOpen}
          listingId={activeThread.listing.id}
          threadId={activeThread.id}
          onClose={() => setReleaseOpen(false)}
          onSubmit={handleReleaseCheckout}
        />
      ) : null}

      {activeThread && respondOffer ? (
        <OfferRespondModal
          open
          thread={activeThread}
          offer={respondOffer}
          isSeller={activeThread.isSeller}
          onClose={() => {
            setDismissedOfferId(respondOffer.id);
            setRespondOffer(null);
          }}
          onResolved={handleOfferResolved}
        />
      ) : null}
    </div>
  );
}
