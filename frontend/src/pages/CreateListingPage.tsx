import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { listings } from '../data/mockListings';

export function CreateListingPage() {
  const draft = listings[0];
  const [published, setPublished] = useState(false);
  const [title, setTitle] = useState('Velame PD Sabre2 210');
  const [price, setPrice] = useState('4800');

  if (published) {
    return (
      <div className="t2f-page max-w-2xl text-center">
        <div className="mb-4 text-5xl">🪂</div>
        <h1 className="mb-3 font-display text-3xl font-extrabold">Anúncio publicado!</h1>
        <p className="text-cinza">Seu equipamento já está visível para a comunidade Trade2Fly.</p>
      </div>
    );
  }

  return (
    <div className="t2f-page max-w-[1080px]">
      <h1 className="mb-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Publicar anúncio</h1>
      <p className="mb-6 text-cinza sm:mb-8">Preencha os dados do equipamento. Pagamento protegido disponível para compradores.</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
        <div className="space-y-5 rounded-xl border border-nuvem bg-white p-6">
          <Input label="Título do anúncio" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input label="Preço (R$)" value={price} onChange={(event) => setPrice(event.target.value)} />
          <label className="block text-sm font-semibold">
            Categoria
            <select className="mt-1.5 w-full rounded-md border border-nuvem px-3 py-2.5">
              <option>Velames</option>
              <option>Containers</option>
              <option>Reservas</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Descrição
            <textarea
              rows={5}
              defaultValue="Equipamento revisado por rigger. Fotos reais do item."
              className="mt-1.5 w-full rounded-md border border-nuvem px-3 py-2.5 font-sans"
            />
          </label>
          <Button size="lg" onClick={() => setPublished(true)}>
            Publicar Anúncio
          </Button>
        </div>

        <aside className="h-fit rounded-xl border border-nuvem bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display font-bold">Pré-visualização</h2>
          <div className="h-36 rounded-lg" style={{ background: draft.grad }} />
          <div className="mt-3 font-mono text-lg font-bold text-pull">
            R$ {Number(price).toLocaleString('pt-BR')}
          </div>
          <div className="font-display font-bold">{title}</div>
          <div className="mt-1 text-sm text-cinza">{draft.specs}</div>
          <div className="mt-2 text-sm text-cinza">{draft.location}</div>
        </aside>
      </div>
    </div>
  );
}
