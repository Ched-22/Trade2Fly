import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { passwordsMatch, validPassword } from '../../lib/authValidation';
import { apiPost } from '../../lib/api';
import { AuthAlert } from './AuthAlert';
import { PasswordInput } from './PasswordInput';
import { Button } from '../ui/Button';

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email') ?? '';
  const returnTo = searchParams.get('returnTo');
  const suffix = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const tokenValid = useMemo(() => Boolean(token && token.length > 10), [token]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!tokenValid) {
      setFormError('Link de redefinição inválido ou expirado.');
      return;
    }

    let valid = true;

    if (!validPassword(password)) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres');
      valid = false;
    }

    if (!passwordsMatch(password, confirmPassword)) {
      setConfirmPasswordError('As senhas não coincidem');
      valid = false;
    }

    if (!valid) return;

    try {
      await apiPost('/api/auth/reset-password', { token, password });
      const loginPath = `/entrar?reset=success${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`;
      navigate(loginPath, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Link inválido ou expirado.');
    }
  };

  if (!tokenValid) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-solo">Redefinir senha</h2>
        <AuthAlert variant="error">Link de redefinição inválido ou expirado.</AuthAlert>
        <p className="text-center text-sm text-cinza">
          <Link to={`/entrar/esqueci-senha${suffix}`} className="font-semibold text-voo hover:text-voo-dark">
            Solicitar novo link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-solo">Redefinir senha</h2>
      {email ? (
        <p className="text-sm text-cinza">
          Defina uma nova senha para <span className="font-semibold text-solo">{email}</span>.
        </p>
      ) : null}

      {formError ? <AuthAlert variant="error">{formError}</AuthAlert> : null}

      <PasswordInput
        label="Nova senha"
        value={password}
        onChange={(value) => {
          setPassword(value);
          setPasswordError('');
        }}
        error={passwordError}
      />

      <PasswordInput
        label="Confirmar nova senha"
        value={confirmPassword}
        onChange={(value) => {
          setConfirmPassword(value);
          setConfirmPasswordError('');
        }}
        error={confirmPasswordError}
      />

      <Button type="submit" className="w-full" size="lg">
        Salvar nova senha
      </Button>

      <p className="text-center text-sm text-cinza">
        <Link to={`/entrar${suffix}`} className="font-semibold text-voo hover:text-voo-dark">
          Voltar para entrar
        </Link>
      </p>
    </form>
  );
}
