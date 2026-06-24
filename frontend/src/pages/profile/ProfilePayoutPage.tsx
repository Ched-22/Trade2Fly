import { useState, type FormEvent } from 'react';
import { ProfileSectionHeader } from '../../components/profile/ProfileSectionHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function ProfilePayoutPage() {
  const [holderName, setHolderName] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [bankName, setBankName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSuccessMessage('Dados de recebimento salvos (mock). Pagamentos reais em breve.');
  };

  return (
    <>
      <ProfileSectionHeader
        title="Dados de recebimento"
        description="Configure como você recebe o valor das vendas com custódia liberada."
      />

      {successMessage ? (
        <div className="mb-6 rounded-lg border border-liberado/40 bg-liberado/10 px-4 py-3 text-sm font-medium text-liberado-dark">
          {successMessage}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-nuvem bg-white p-5 shadow-sm sm:p-8"
      >
        <Input
          label="Nome do titular"
          placeholder="Como no documento ou conta bancária"
          value={holderName}
          onChange={(e) => setHolderName(e.target.value)}
        />
        <Input
          label="Chave Pix"
          placeholder="E-mail, CPF, telefone ou chave aleatória"
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
        />
        <Input
          label="Banco (opcional)"
          placeholder="Ex.: Nubank, Itaú"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
        />
        <p className="text-sm text-cinza">
          Os repasses passam pela custódia da Trade2Fly. Validação de titularidade será exigida antes do primeiro saque.
        </p>
        <div className="flex justify-end pt-2">
          <Button type="submit">Salvar dados de recebimento</Button>
        </div>
      </form>
    </>
  );
}
