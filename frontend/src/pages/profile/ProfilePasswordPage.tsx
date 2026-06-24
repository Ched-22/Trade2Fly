import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ProfileSectionHeader } from '../../components/profile/ProfileSectionHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { validPassword } from '../../lib/authValidation';

export function ProfilePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!currentPassword) {
      setError('Informe sua senha atual.');
      return;
    }
    if (!validPassword(newPassword)) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setSuccessMessage('Senha atualizada (mock). Integração com API em breve.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <>
      <ProfileSectionHeader
        title="Senha"
        description="Mantenha sua conta segura com uma senha forte."
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
          label="Senha atual"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Input
          label="Nova senha"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Input
          label="Confirmar nova senha"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <p className="text-sm text-cinza">
          Esqueceu a senha?{' '}
          <Link to="/entrar/esqueci-senha" className="font-medium text-voo hover:underline">
            Redefinir senha
          </Link>
        </p>
        <div className="flex justify-end pt-2">
          <Button type="submit">Atualizar senha</Button>
        </div>
      </form>
    </>
  );
}
