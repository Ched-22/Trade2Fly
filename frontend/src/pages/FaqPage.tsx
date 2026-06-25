import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaqSectionBlock } from '../components/faq/FaqSectionBlock';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SUPPORT_EMAIL, faqSections } from '../data/faqContent';

export function FaqPage() {
  const [query, setQuery] = useState('');

  const filteredSections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return faqSections;

    return faqSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.question.toLowerCase().includes(normalized) ||
            item.answer.toLowerCase().includes(normalized),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  return (
    <div className="t2f-page max-w-3xl">
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight text-solo">
        Perguntas frequentes
      </h1>
      <p className="mb-6 text-cinza">
        Tudo sobre compra, venda e pagamento seguro em custódia no marketplace de paraquedismo.
      </p>

      <div className="mb-8">
        <Input
          label="Buscar na FAQ"
          placeholder="Ex.: escrow, fotos, taxas…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filteredSections.length === 0 ? (
        <p className="rounded-xl border border-nuvem bg-white p-6 text-center text-cinza">
          Nenhuma pergunta encontrada para &quot;{query}&quot;.
        </p>
      ) : (
        <div className="space-y-10">
          {filteredSections.map((section) => (
            <FaqSectionBlock
              key={section.id}
              section={section}
              emphasized={section.id === 'escrow'}
            />
          ))}
        </div>
      )}

      <div className="mt-12 rounded-xl border border-nuvem bg-white p-6 text-center sm:p-8">
        <h2 className="mb-2 font-display text-lg font-bold text-solo">Não encontrou sua resposta?</h2>
        <p className="mb-4 text-sm text-cinza">
          Fale com nossa equipe em dias úteis, 9h às 18h (horário de Brasília).
        </p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>
          <Button variant="secondary">{SUPPORT_EMAIL}</Button>
        </a>
        <p className="mt-4 text-xs text-cinza">
          Ou explore os{' '}
          <Link to="/ferramentas" className="font-semibold text-voo hover:text-voo-dark">
            guias e calculadoras
          </Link>{' '}
          antes de comprar.
        </p>
      </div>
    </div>
  );
}
