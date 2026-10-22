import { useState } from 'react';
import { AuthAlert } from '../auth/AuthAlert';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { createCardPaymentMethod, createSetupIntent } from '../../lib/paymentMethodsApi';

type AddCardFormProps = {
  mockMode: boolean;
  onSuccess: () => void;
  onCancel: () => void;
};

export function AddCardForm({ mockMode, onSuccess, onCancel }: AddCardFormProps) {
  const [last4, setLast4] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await createSetupIntent();
      const suffix = last4.replace(/\D/g, '').slice(-4).padStart(4, '0');
      await createCardPaymentMethod({ gatewayToken: `mock_pm_${Date.now()}_${suffix}` });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o cartão.');
    } finally {
      setLoading(false);
    }
  };

  if (!mockMode) {
    return (
      <div className="rounded-xl border border-nuvem bg-bruma/40 p-4">
        <p className="text-sm text-cinza">
          Integração Stripe Elements será usada quando as chaves estiverem configuradas no servidor.
          Por enquanto, use o modo mock em desenvolvimento.
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={onCancel}>
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-nuvem bg-white p-4">
      <h3 className="mb-2 font-display font-bold">Adicionar cartão (desenvolvimento)</h3>
      <p className="mb-4 text-sm text-cinza">
        Modo simulado — nenhum cartão real é armazenado. Informe os últimos 4 dígitos para identificar o
        cartão fictício.
      </p>
      {error ? (
        <div className="mb-4">
          <AuthAlert variant="error">{error}</AuthAlert>
        </div>
      ) : null}
      <Input
        label="Últimos 4 dígitos"
        placeholder="4242"
        value={last4}
        onChange={(event) => setLast4(event.target.value.replace(/\D/g, '').slice(0, 4))}
        maxLength={4}
      />
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="button" onClick={() => void handleSubmit()} disabled={loading || last4.length < 4}>
          {loading ? 'Salvando…' : 'Salvar cartão'}
        </Button>
      </div>
    </div>
  );
}
