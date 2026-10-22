import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  connectChatSocket,
  disconnectChatSocket,
  emitJoinThread,
  emitSendMessage,
  isSocketConnected,
} from '../lib/chatSocket';
import { createOffer } from '../lib/offersApi';
import { getMessages, getThreads, markThreadRead, replyToThread } from '../lib/messagesApi';
import { getUnreadNotificationCount } from '../lib/notificationsApi';
import { getToken } from '../lib/api';
import type { ChatMessage, ChatThread } from '../types/chat';
import { useAuthContext } from './AuthContext';

type ChatContextValue = {
  threads: ChatThread[];
  threadsLoading: boolean;
  threadsError: string | null;
  selectedThreadId: number | null;
  setSelectedThreadId: (threadId: number | null) => void;
  messages: ChatMessage[];
  messagesLoading: boolean;
  draft: string;
  setDraft: (draft: string) => void;
  sendThreadMessage: () => Promise<void>;
  sendOffer: (listingId: number, offerAmount: number, message?: string) => Promise<number>;
  refreshThreads: () => Promise<void>;
  refreshMessages: (threadId: number) => Promise<void>;
  unreadThreadCount: number;
  unreadNotificationCount: number;
  refreshNotificationCount: () => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function formatThreadTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function formatChatPrice(priceNum: number): string {
  return `R$ ${priceNum.toLocaleString('pt-BR')}`;
}

export { formatThreadTime };

export function ChatProvider({ children }: { children: ReactNode }) {
  const { loggedIn, authReady, user } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadsError, setThreadsError] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadIdState] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const selectedThreadIdRef = useRef<number | null>(null);

  const refreshNotificationCount = useCallback(async () => {
    if (!getToken()) {
      setUnreadNotificationCount(0);
      return;
    }
    try {
      const data = await getUnreadNotificationCount();
      setUnreadNotificationCount(data.unreadCount);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    selectedThreadIdRef.current = selectedThreadId;
  }, [selectedThreadId]);

  const setSelectedThreadId = useCallback(
    (threadId: number | null) => {
      setSelectedThreadIdState(threadId);
      if (threadId) {
        setSearchParams({ thread: String(threadId) }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    },
    [setSearchParams],
  );

  const fetchThreads = useCallback(async (): Promise<boolean> => {
    if (!getToken()) {
      setThreads([]);
      return false;
    }

    setThreadsLoading(true);
    try {
      const data = await getThreads();
      setThreads(data);
      setThreadsError(null);
      return true;
    } catch {
      setThreads([]);
      setThreadsError('Não foi possível carregar conversas.');
      return false;
    } finally {
      setThreadsLoading(false);
    }
  }, []);

  const refreshThreads = useCallback(async () => {
    await fetchThreads();
  }, [fetchThreads]);

  const refreshMessages = useCallback(async (threadId: number) => {
    setMessagesLoading(true);
    try {
      const data = await getMessages(threadId);
      setMessages(data);
      setThreads((current) =>
        current.map((thread) =>
          thread.id === threadId ? { ...thread, unread: false } : thread,
        ),
      );
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const handleMessageCreated = useCallback(
    (event: { threadId: number; message: ChatMessage }) => {
      const isFromMe = event.message.senderId === user?.id;
      const isViewing = selectedThreadIdRef.current === event.threadId;
      const unread = !isFromMe && !isViewing;

      setThreads((current) => {
        const existing = current.find((thread) => thread.id === event.threadId);
        const updatedThread: ChatThread = existing
          ? {
              ...existing,
              lastMessage: {
                text: event.message.text,
                createdAt: event.message.createdAt,
              },
              unread,
            }
          : {
              id: event.threadId,
              otherUser: {
                id: event.message.sender.id,
                name: event.message.sender.displayName,
              },
              listing: { id: 0, title: 'Conversa', priceNum: 0 },
              lastMessage: {
                text: event.message.text,
                createdAt: event.message.createdAt,
              },
              createdAt: event.message.createdAt,
              unread,
              isSeller: false,
            };

        const rest = current.filter((thread) => thread.id !== event.threadId);
        return [updatedThread, ...rest];
      });

      if (isViewing) {
        setMessages((current) => {
          if (current.some((message) => message.id === event.message.id)) return current;
          return [...current, event.message];
        });
        if (!isFromMe) {
          void markThreadRead(event.threadId);
        }
      }

      if (
        !isFromMe &&
        (event.message.messageType === 'offer' ||
          event.message.messageType === 'offer_accepted' ||
          event.message.messageType === 'offer_declined')
      ) {
        void refreshThreads();
      }
    },
    [user?.id, refreshThreads],
  );

  const handleThreadUpdated = useCallback(
    (event: { threadId: number; lastMessage: { text: string; createdAt: string } }) => {
      setThreads((current) =>
        current.map((thread) =>
          thread.id === event.threadId
            ? { ...thread, lastMessage: event.lastMessage }
            : thread,
        ),
      );
    },
    [],
  );

  useEffect(() => {
    if (!authReady || !loggedIn) {
      disconnectChatSocket();
      setThreads([]);
      setMessages([]);
      setSelectedThreadIdState(null);
      setUnreadNotificationCount(0);
      return;
    }

    let cancelled = false;

    void (async () => {
      const backendReady = await fetchThreads();
      void refreshNotificationCount();
      if (cancelled || !backendReady) return;

      const token = getToken();
      if (!token) return;

      connectChatSocket(token, {
        onMessageCreated: handleMessageCreated,
        onThreadUpdated: handleThreadUpdated,
        onListingSaleModeChanged: () => {
          void refreshThreads();
        },
        onNotificationUnread: (event) => setUnreadNotificationCount(event.unreadCount),
        onNotificationNew: (event) => {
          void refreshNotificationCount();
          const type = event.notification.type;
          if (
            type === 'order_purchased' ||
            type === 'order_completed' ||
            type === 'order_auto_completed'
          ) {
            void refreshThreads();
          }
        },
        onCheckoutUnlocked: () => {
          void refreshThreads();
        },
        onCheckoutExpired: () => {
          void refreshThreads();
        },
        onConnect: () => {
          const threadId = selectedThreadIdRef.current;
          if (threadId) {
            emitJoinThread(threadId);
            void refreshMessages(threadId);
          }
        },
      });
    })();

    return () => {
      cancelled = true;
      disconnectChatSocket();
    };
  }, [authReady, loggedIn, fetchThreads, refreshThreads, refreshMessages, refreshNotificationCount, handleMessageCreated, handleThreadUpdated]);

  useEffect(() => {
    if (!loggedIn) return;
    const onFocus = () => {
      if (!isSocketConnected()) void refreshNotificationCount();
    };
    window.addEventListener('focus', onFocus);
    const interval = window.setInterval(() => {
      if (!isSocketConnected()) void refreshNotificationCount();
    }, 60_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(interval);
    };
  }, [loggedIn, refreshNotificationCount]);

  useEffect(() => {
    if (!authReady || !loggedIn) return;

    const threadParam = searchParams.get('thread');
    if (!threadParam) {
      if (selectedThreadIdRef.current !== null) {
        setSelectedThreadIdState(null);
      }
      return;
    }

    if (threads.length === 0) return;

    const threadId = Number(threadParam);
    if (!Number.isFinite(threadId)) return;

    if (selectedThreadIdRef.current === threadId) return;

    setSelectedThreadIdState(threadId);
    emitJoinThread(threadId);
    void refreshMessages(threadId);
  }, [authReady, loggedIn, threads.length, searchParams, refreshMessages]);

  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([]);
      return;
    }

    emitJoinThread(selectedThreadId);
    void refreshMessages(selectedThreadId);
  }, [selectedThreadId, refreshMessages]);

  const sendThreadMessage = useCallback(async () => {
    const text = draft.trim();
    const threadId = selectedThreadId;
    if (!text || !threadId || !user) return;

    setDraft('');

    if (isSocketConnected()) {
      emitSendMessage(threadId, text);
      return;
    }

    try {
      const message = await replyToThread(threadId, text);
      handleMessageCreated({ threadId, message });
    } catch {
      setDraft(text);
    }
  }, [draft, selectedThreadId, user, handleMessageCreated]);

  const sendOffer = useCallback(
    async (listingId: number, offerAmount: number, message?: string): Promise<number> => {
      const result = await createOffer(listingId, offerAmount, message);
      await refreshThreads();
      setSelectedThreadIdState(result.threadId);
      setMessages([result.message]);
      return result.threadId;
    },
    [refreshThreads],
  );

  const unreadThreadCount = useMemo(
    () => (loggedIn ? threads.filter((thread) => thread.unread).length : 0),
    [loggedIn, threads],
  );

  const value = useMemo<ChatContextValue>(
    () => ({
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
      sendOffer,
      refreshThreads,
      refreshMessages,
      unreadThreadCount,
      unreadNotificationCount,
      refreshNotificationCount,
    }),
    [
      threads,
      threadsLoading,
      threadsError,
      selectedThreadId,
      setSelectedThreadId,
      messages,
      messagesLoading,
      draft,
      sendThreadMessage,
      sendOffer,
      refreshThreads,
      refreshMessages,
      unreadThreadCount,
      unreadNotificationCount,
      refreshNotificationCount,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}
