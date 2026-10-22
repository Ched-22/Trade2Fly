import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('owner@trade2fly.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-md rounded-xl border border-nuvem bg-white p-6 shadow-sm"
      >
        <h1 className="font-display text-2xl font-extrabold">Trade2Fly Admin</h1>
        <p className="mb-6 text-sm text-cinza">Acesso restrito a administradores</p>
        <label className="mb-4 block text-sm font-semibold">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-nuvem px-3"
          />
        </label>
        <label className="mb-4 block text-sm font-semibold">
          Senha
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-nuvem px-3"
          />
        </label>
        {error ? <p className="mb-4 text-sm text-pull">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full cursor-pointer rounded-lg bg-voo font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
