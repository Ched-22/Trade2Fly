import { useState, type FormEvent } from 'react';
import { AuthAlert } from '../auth/AuthAlert';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  createPixPaymentMethod,
  PIX_KEY_TYPE_LABELS,
  type PixPaymentMethod,
} from '../../lib/paymentMethodsApi';

type AddPixFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

const PIX_TYPES = Object.keys(PIX_KEY_TYPE_LABELS) as PixPaymentMethod['pixKeyType'][];

export function AddPixForm({ onSuccess, onCancel }: AddPixFormProps) {
  const [pixKeyType, setPixKeyType] = useState<PixPaymentMethod['pixKeyType']>('email');
  const [pixKey, setPixKey] = useState('');
  const [holderName, setHolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createPixPaymentMethod({
        pixKey,
        pixKeyType,
        holderName: holderName.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a chave Pix.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="rounded-xl border border-nuvem bg-white p-4">
      <h3 className="mb-2 font-display font-bold">Adicionar chave Pix</h3>
      <p className="mb-4 text-sm text-cinza">
        Sua chave é armazenada de forma criptografada e exibida apenas parcialmente.
      </p>
      {error ? (
        <div className="mb-4">
          <AuthAlert variant="error">{error}</AuthAlert>
        </div>
      ) : null}
      <label className="mb-4 block text-sm font-medium text-solo">
        Tipo de chave
        <select
          value={pixKeyType}
          onChange={(event) => setPixKeyType(event.target.value as PixPaymentMethod['pixKeyType'])}
          className="mt-1.5 h-10 w-full rounded-lg border border-nuvem bg-white px-3 text-sm"
        >
          {PIX_TYPES.map((type) => (
            <option key={type} value={type}>
              {PIX_KEY_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>
      <Input
        label="Chave Pix"
        placeholder={
          pixKeyType === 'email'
            ? 'seu@email.com'
            : pixKeyType === 'phone'
              ? '11999999999'
              : pixKeyType === 'random'
                ? '00000000-0000-4000-8000-000000000000'
                : 'Somente números'
        }
        value={pixKey}
        onChange={(event) => setPixKey(event.target.value)}
      />
      <Input
        label="Nome do titular (opcional)"
        placeholder="Como no banco"
        value={holderName}
        onChange={(event) => setHolderName(event.target.value)}
      />
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !pixKey.trim()}>
          {loading ? 'Salvando…' : 'Salvar Pix'}
        </Button>
      </div>
    </form>
  );
}
