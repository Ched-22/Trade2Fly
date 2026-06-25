import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthReturnTo } from '../../hooks/useAuthReturnTo';
import {
  passwordsMatch,
  validDisplayName,
  validEmail,
  validPassword,
} from '../../lib/authValidation';
import { AuthAlert } from './AuthAlert';
import { PasswordInput } from './PasswordInput';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function RegisterForm() {
  const { register } = useAuth();
  const { returnTo, suffix } = useAuthReturnTo();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setTermsError('');

    let valid = true;

    if (!validDisplayName(fullName)) {
      setFullNameError('Informe nome e sobrenome.');
      valid = false;
    }

    if (!email.trim()) {
      setEmailError('E-mail é obrigatório');
      valid = false;
    } else if (!validEmail(email)) {
      setEmailError('Digite um e-mail válido');
      valid = false;
    }

    if (!validPassword(password)) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres');
      valid = false;
    }

    if (!passwordsMatch(password, confirmPassword)) {
      setConfirmPasswordError('As senhas não coincidem');
      valid = false;
    }

    if (!acceptedTerms) {
      setTermsError('Você precisa aceitar os termos para continuar');
      valid = false;
    }

    if (!valid) {
      return;
    }

    try {
      await register({ fullName, email, password }, returnTo);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-solo">Criar conta</h2>

      {formError ? <AuthAlert variant="error">{formError}</AuthAlert> : null}

      <Input
        label="Nome completo"
        value={fullName}
        onChange={(event) => {
          setFullName(event.target.value);
          setFullNameError('');
        }}
        error={fullNameError}
        placeholder="Nome e sobrenome"
        autoComplete="name"
      />

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

      <PasswordInput
        value={password}
        onChange={(value) => {
          setPassword(value);
          setPasswordError('');
        }}
        error={passwordError}
      />

      <PasswordInput
        label="Confirmar senha"
        value={confirmPassword}
        onChange={(value) => {
          setConfirmPassword(value);
          setConfirmPasswordError('');
        }}
        error={confirmPasswordError}
      />

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-cinza">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(event) => {
            setAcceptedTerms(event.target.checked);
            setTermsError('');
          }}
          className="mt-1 h-4 w-4 rounded border-nuvem accent-pull"
        />
        <span>
          Li e aceito os{' '}
          <Link to="/faq" className="font-semibold text-voo hover:text-voo-dark">
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link to="/faq" className="font-semibold text-voo hover:text-voo-dark">
            Política de Privacidade
          </Link>
        </span>
      </label>
      {termsError ? <span className="text-xs text-error">{termsError}</span> : null}

      <Button type="submit" className="w-full" size="lg">
        Criar conta
      </Button>

      <p className="text-center text-sm text-cinza">
        Já tem conta?{' '}
        <Link
          to={`/entrar${suffix}`}
          className="font-semibold text-voo hover:text-voo-dark"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
