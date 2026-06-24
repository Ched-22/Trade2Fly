import { ProfileSectionHeader } from '../../components/profile/ProfileSectionHeader';
import { Button } from '../../components/ui/Button';

export function ProfilePaymentPage() {
  return (
    <>
      <ProfileSectionHeader
        title="Métodos de pagamento"
        description="Cartões e formas de pagamento para compras no marketplace."
      />

      <div className="rounded-xl border border-nuvem bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="mb-4 text-4xl" aria-hidden>
            💳
          </span>
          <h2 className="mb-2 font-display text-lg font-bold text-solo">
            Nenhum método cadastrado
          </h2>
          <p className="mb-6 max-w-sm text-sm text-cinza">
            Adicione um cartão para agilizar checkout com custódia. Integração com gateway em breve.
          </p>
          <Button disabled>Adicionar cartão</Button>
        </div>
      </div>
    </>
  );
}
