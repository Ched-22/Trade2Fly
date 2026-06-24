import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthReturnTo } from '../../hooks/useAuthReturnTo';
import { validEmail, validPassword } from '../../lib/authValidation';
import { ApiError } from '../../lib/api';
import { AuthAlert } from './AuthAlert';
import { PasswordInput } from './PasswordInput';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function LoginForm() {
  const { login } = useAuth();
  const { returnTo, suffix } = useAuthReturnTo();
  const [searchParams] = useSearchParams();
  const resetSuccess = searchParams.get('reset') === 'success';
  const pendingActivation = searchParams.get('pending') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    setEmailError('');
    setPasswordError('');

    let valid = true;

    if (!email.trim()) {
      setEmailError('E-mail é obrigatório');
      valid = false;
    } else if (!validEmail(email)) {
      setEmailError('Digite um e-mail válido');
      valid = false;
    }

    if (!password) {
      setPasswordError('Senha é obrigatória');
      valid = false;
    } else if (!validPassword(password)) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres');
      valid = false;
    }

    if (!valid) {
      return;
    }

    try {
      const success = await login(email, password, returnTo);
      if (!success) {
        setFormError('E-mail ou senha incorretos. Tente novamente.');
      }
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Não foi possível entrar. Tente novamente.',
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-solo">Entrar</h2>

      {resetSuccess ? (
        <AuthAlert variant="success">Senha redefinida com sucesso. Faça login com sua nova senha.</AuthAlert>
      ) : null}

      {pendingActivation ? (
        <AuthAlert variant="success">
          Conta criada com sucesso. Aguarde a ativação da sua conta para entrar.
        </AuthAlert>
      ) : null}

      {formError ? <AuthAlert variant="error">{formError}</AuthAlert> : null}

      <Input
        label="E-mail"
        type="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setEmailError('');
          setFormError('');
        }}
        error={emailError}
        placeholder="seu@email.com"
        autoComplete="email"
      />

      <PasswordInput
        value={password}
        onChange={(value) => {
          setPassword(value);
          setPasswordError('');
          setFormError('');
        }}
        error={passwordError}
        placeholder="Sua senha"
      />

      <div className="text-right">
        <Link
          to={`/entrar/esqueci-senha${suffix}`}
          className="text-sm font-semibold text-voo hover:text-voo-dark"
        >
          Esqueci minha senha
        </Link>
      </div>

      <Button type="submit" className="w-full" size="lg">
        Entrar
      </Button>

      <p className="text-center text-sm text-cinza">
        Não tem conta?{' '}
        <Link
          to={`/entrar/criar-conta${suffix}`}
          className="font-semibold text-voo hover:text-voo-dark"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
