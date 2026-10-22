import { useCallback, useEffect, useState } from 'react';
import { ProfileSectionHeader } from '../../components/profile/ProfileSectionHeader';
import { AuthAlert } from '../../components/auth/AuthAlert';
import { Button } from '../../components/ui/Button';
import { ScopeTabs } from '../../components/ui/ScopeTabs';
import { AddCardForm } from '../../components/payment/AddCardForm';
import { AddPixForm } from '../../components/payment/AddPixForm';
import { PaymentMethodCard } from '../../components/payment/PaymentMethodCard';
import {
  deletePaymentMethod,
  getPaymentConfig,
  getPaymentMethods,
  setDefaultPaymentMethod,
  type PaymentMethod,
} from '../../lib/paymentMethodsApi';

type SectionTab = 'cards' | 'pix';

export function ProfilePaymentPage() {
  const [tab, setTab] = useState<SectionTab>('cards');
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [mockMode, setMockMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddPix, setShowAddPix] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await getPaymentConfig();
      setMockMode(config.gatewayMode === 'mock');
      if (!config.enabled) {
        setMethods([]);
        setError('Métodos de pagamento temporariamente indisponíveis.');
        return;
      }
      const items = await getPaymentMethods();
      setMethods(items);
    } catch (err) {
      setMethods([]);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar métodos de pagamento.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cardMethods = methods.filter((method) => method.type === 'card');
  const pixMethods = methods.filter((method) => method.type === 'pix');

  const handleSetDefault = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      await setDefaultPaymentMethod(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível definir padrão.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (method: PaymentMethod) => {
    const confirmMessage = method.isDefault
      ? 'Este é seu método padrão. Deseja remover mesmo assim?'
      : 'Remover este método de pagamento?';
    if (!window.confirm(confirmMessage)) return;

    setBusy(true);
    setError(null);
    try {
      await deletePaymentMethod(method.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível remover.');
    } finally {
      setBusy(false);
    }
  };

  const onAdded = async () => {
    setShowAddCard(false);
    setShowAddPix(false);
    await load();
  };

  return (
    <>
      <ProfileSectionHeader
        title="Métodos de pagamento"
        description="Cartões e Pix salvos para agilizar checkout com custódia quando pagamentos estiverem ativos."
      />

      {mockMode ? (
        <div className="mb-6">
          <AuthAlert variant="info">
            Modo de desenvolvimento — pagamentos simulados. Configure Stripe no servidor quando for
            ativar cobrança real.
          </AuthAlert>
        </div>
      ) : null}

      {error ? (
        <div className="mb-6">
          <AuthAlert variant="error">{error}</AuthAlert>
        </div>
      ) : null}

      <ScopeTabs
        value={tab}
        onChange={setTab}
        options={[
          { value: 'cards', label: `Cartões (${cardMethods.length})` },
          { value: 'pix', label: `Pix (${pixMethods.length})` },
        ]}
      />

      {loading ? <p className="text-cinza">Carregando métodos…</p> : null}

      {!loading && tab === 'cards' ? (
        <div className="space-y-4">
          {showAddCard ? (
            <AddCardForm mockMode={mockMode} onSuccess={() => void onAdded()} onCancel={() => setShowAddCard(false)} />
          ) : (
            <Button type="button" onClick={() => setShowAddCard(true)}>
              Adicionar cartão
            </Button>
          )}

          {cardMethods.length === 0 && !showAddCard ? (
            <div className="rounded-xl border border-nuvem bg-white p-8 text-center">
              <p className="text-cinza">Nenhum cartão cadastrado.</p>
            </div>
          ) : null}

          {cardMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              busy={busy}
              onSetDefault={(id) => void handleSetDefault(id)}
              onRemove={(item) => void handleRemove(item)}
            />
          ))}
        </div>
      ) : null}

      {!loading && tab === 'pix' ? (
        <div className="space-y-4">
          {showAddPix ? (
            <AddPixForm onSuccess={() => void onAdded()} onCancel={() => setShowAddPix(false)} />
          ) : (
            <Button type="button" onClick={() => setShowAddPix(true)}>
              Adicionar Pix
            </Button>
          )}

          {pixMethods.length === 0 && !showAddPix ? (
            <div className="rounded-xl border border-nuvem bg-white p-8 text-center">
              <p className="text-cinza">Nenhuma chave Pix cadastrada.</p>
            </div>
          ) : null}

          {pixMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              busy={busy}
              onSetDefault={(id) => void handleSetDefault(id)}
              onRemove={(item) => void handleRemove(item)}
            />
          ))}
        </div>
      ) : null}

      <p className="mt-8 text-sm text-cinza">
        Seu método padrão será usado automaticamente quando o pagamento com custódia estiver
        disponível. Nenhuma cobrança é feita nesta versão.
      </p>
    </>
  );
}
