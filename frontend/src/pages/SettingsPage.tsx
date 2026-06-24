import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export function SettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="t2f-page max-w-2xl">
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight">Configurações</h1>
      <p className="mb-8 text-cinza">Preferências da conta e notificações.</p>

      <div className="space-y-6">
        <section className="rounded-xl border border-nuvem bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Conta</h2>
          <Input label="E-mail" type="email" defaultValue={user.email} readOnly />
        </section>

        <section className="rounded-xl border border-nuvem bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Notificações</h2>
          <label className="mb-3 flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked />
            Alertas de novos anúncios por e-mail
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked />
            Mensagens de compradores
          </label>
        </section>

        <p className="text-sm text-cinza">Persistência real será adicionada com o backend.</p>
      </div>
    </div>
  );
}
