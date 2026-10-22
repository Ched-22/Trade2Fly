import { useEffect, useState, type FormEvent } from 'react';
import { ProfileSectionHeader } from '../../components/profile/ProfileSectionHeader';
import { AuthAlert } from '../../components/auth/AuthAlert';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ApiError } from '../../lib/api';
import { getPayoutStatus, setPayoutPixKey, type PixKeyType } from '../../lib/sellerAsaasApi';

const PIX_KEY_TYPE_LABEL: Record<PixKeyType, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'E-mail',
  phone: 'Telefone',
  random: 'Chave aleatória',
};

export function ProfilePayoutPage() {
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [hasPixKey, setHasPixKey] = useState(false);
  const [pixKeyType, setPixKeyType] = useState<PixKeyType | null>(null);
  const [pixKeyMasked, setPixKeyMasked] = useState<string | null>(null);

  const [formPixKeyType, setFormPixKeyType] = useState<PixKeyType>('cpf');
  const [formPixKey, setFormPixKey] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadStatus = () => {
    setLoadingStatus(true);
    return getPayoutStatus()
      .then((result) => {
        setHasPixKey(result.hasPixKey);
        setPixKeyType(result.pixKeyType);
        setPixKeyMasked(result.pixKeyMasked);
      })
      .catch(() => setErrorMessage('Não foi possível carregar o status da sua conta de recebimento.'))
      .finally(() => setLoadingStatus(false));
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      await setPayoutPixKey({ pixKeyType: formPixKeyType, pixKey: formPixKey });
      setSuccessMessage('Chave Pix cadastrada com sucesso!');
      setFormPixKey('');
      await loadStatus();
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : 'Não foi possível salvar a chave Pix.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ProfileSectionHeader
        title="Dados de recebimento"
        description="Cadastre a chave Pix onde você recebe o valor das vendas com custódia liberada após a confirmação do comprador."
      />

      {hasPixKey && pixKeyType && pixKeyMasked ? (
        <div className="mb-6">
          <AuthAlert variant="success">
            Chave Pix cadastrada: {PIX_KEY_TYPE_LABEL[pixKeyType]} — {pixKeyMasked}
          </AuthAlert>
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-6">
          <AuthAlert variant="success">{successMessage}</AuthAlert>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mb-6">
          <AuthAlert variant="error">{errorMessage}</AuthAlert>
        </div>
      ) : null}

      {loadingStatus ? (
        <p className="text-sm text-cinza">Carregando...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-nuvem bg-white p-5 shadow-sm sm:p-8"
        >
          <div className="flex w-full flex-col gap-1.5">
            <label htmlFor="pixKeyType" className="text-sm font-semibold text-solo">
              Tipo de chave Pix
            </label>
            <select
              id="pixKeyType"
              value={formPixKeyType}
              onChange={(e) => setFormPixKeyType(e.target.value as PixKeyType)}
              className="h-11 rounded-md border border-nuvem bg-white px-3.5 text-[0.95rem] text-solo outline-none focus-within:ring-3 focus-within:ring-voo/30"
            >
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="email">E-mail</option>
              <option value="phone">Telefone</option>
              <option value="random">Chave aleatória</option>
            </select>
          </div>
          <Input
            label="Chave Pix"
            placeholder="Digite a chave conforme o tipo selecionado"
            value={formPixKey}
            onChange={(e) => setFormPixKey(e.target.value)}
            required
          />
          <p className="text-sm text-cinza">
            O valor da sua venda fica retido com a Trade2Fly e é transferido automaticamente para essa chave Pix
            assim que o comprador confirma o recebimento do produto.
          </p>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : hasPixKey ? 'Atualizar chave Pix' : 'Salvar chave Pix'}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
