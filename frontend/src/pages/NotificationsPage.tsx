import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from '../lib/notificationsApi';
import { getNotificationLink } from '../lib/notificationLinks';
import { useChatContext } from '../context/ChatContext';
import { Button } from '../components/ui/Button';

const MOBILE_PAGE_SIZE = 10;
const DESKTOP_PAGE_SIZE = 50;
const MOBILE_MQ = '(max-width: 767px)';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MQ).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MQ);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { refreshNotificationCount } = useChatContext();
  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageSize = isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
  const hasMore = items.length < total;

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications({ page: 1, pageSize });
      setItems(data.items);
      setPage(1);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getNotifications({ page: nextPage, pageSize });
      setItems((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...data.items.filter((item) => !seen.has(item.id))];
      });
      setPage(nextPage);
      setTotal(data.total);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleOpen = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationRead(notification.id);
      await refreshNotificationCount();
      setItems((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
    }
    navigate(getNotificationLink(notification));
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    await refreshNotificationCount();
    await loadInitial();
  };

  return (
    <div className="t2f-page max-w-2xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Notificações</h1>
          <p className="mt-1 text-cinza">
            Compras liberadas, despachos e atualizações dos seus pedidos.
          </p>
        </div>
        {items.some((item) => !item.read) ? (
          <Button variant="secondary" onClick={() => void handleMarkAll()}>
            Marcar todas como lidas
          </Button>
        ) : null}
      </div>

      {loading ? <p className="text-cinza">Carregando…</p> : null}

      {!loading && items.length === 0 ? (
        <p className="rounded-xl border border-nuvem bg-white p-6 text-cinza">
          Nenhuma notificação.
        </p>
      ) : null}

      <div className="space-y-3">
        {items.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => void handleOpen(notification)}
            className={`w-full rounded-xl border p-4 text-left transition-colors ${
              notification.read ? 'border-nuvem bg-white' : 'border-pull/30 bg-pull/5'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold">{notification.title}</div>
                <p className="mt-1 text-sm text-cinza">{notification.body}</p>
              </div>
              {!notification.read ? (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pull" />
              ) : null}
            </div>
            <div className="mt-2 text-xs text-cinza">
              {new Date(notification.createdAt).toLocaleString('pt-BR')}
            </div>
          </button>
        ))}
      </div>

      {!loading && hasMore ? (
        <div className="mt-6 flex justify-center md:hidden">
          <Button
            variant="secondary"
            disabled={loadingMore}
            onClick={() => void handleLoadMore()}
          >
            {loadingMore ? 'Carregando…' : 'Ver mais'}
          </Button>
        </div>
      ) : null}

      <p className="mt-8 text-sm text-cinza">
        Ver também{' '}
        <Link to="/pedidos" className="text-pull underline">
          meus pedidos
        </Link>{' '}
        ou{' '}
        <Link to="/vendas" className="text-pull underline">
          minhas vendas
        </Link>
        .
      </p>
    </div>
  );
}
