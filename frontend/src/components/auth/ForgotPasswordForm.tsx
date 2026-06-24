import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthReturnTo } from '../../hooks/useAuthReturnTo';
import { validEmail } from '../../lib/authValidation';
import { apiPost } from '../../lib/api';
import { AuthAlert } from './AuthAlert';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function ForgotPasswordForm() {
  const { returnTo, suffix } = useAuthReturnTo();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('E-mail é obrigatório');
      return;
    }

    if (!validEmail(email)) {
      setEmailError('Digite um e-mail válido');
      return;
    }

    try {
      const res = await apiPost<{ message: string; devToken?: string }>(
        '/api/auth/forgot-password',
        { email: email.trim() },
      );
      setDevToken(res.devToken ?? null);
    } catch {
      // always show generic message (don't leak if email exists)
    }
    setSubmitted(true);
  };

  const resetParams = new URLSearchParams({ email: email.trim() });
  if (devToken) resetParams.set('token', devToken);
  if (returnTo) resetParams.set('returnTo', returnTo);
  const resetLink = `/entrar/redefinir-senha?${resetParams.toString()}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-solo">Esqueci minha senha</h2>
      <p className="text-sm leading-relaxed text-cinza">
        Informe seu e-mail e enviaremos instruções para redefinir sua senha.
      </p>

      {submitted ? (
        <>
          <AuthAlert variant="success">
            Se existir uma conta com este e-mail, você receberá um link de redefinição em breve.
          </AuthAlert>
          {devToken ? (
            <AuthAlert variant="info">
              <span className="font-semibold">Dev:</span>{' '}
              <Link to={resetLink} className="font-semibold underline hover:text-voo-dark">
                Redefinir senha agora
              </Link>
            </AuthAlert>
          ) : null}
        </>
      ) : (
        <>
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError('');
            }}
            error={emailError}
            placeholder="seu@email.com"
            autoComplete="email"
          />

          <Button type="submit" className="w-full" size="lg">
            Enviar instruções
          </Button>
        </>
      )}

      <p className="text-center text-sm text-cinza">
        <Link to={`/entrar${suffix}`} className="font-semibold text-voo hover:text-voo-dark">
          Voltar para entrar
        </Link>
      </p>
    </form>
  );
}
