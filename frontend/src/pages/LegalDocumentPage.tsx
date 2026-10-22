import { Link, Navigate, useParams } from 'react-router-dom';
import { getLegalDocument, legalDocumentList } from '../data/legalDocuments';

export function LegalDocumentPage() {
  const { documentId } = useParams();
  const document = documentId ? getLegalDocument(documentId) : undefined;

  if (!document) {
    return <Navigate to="/legal/termos" replace />;
  }

  return (
    <div className="t2f-page max-w-3xl">
      <nav className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-sm text-cinza">
        {legalDocumentList.map((item) => (
          <Link
            key={item.id}
            to={`/legal/${item.id}`}
            className={
              item.id === document.id
                ? 'font-semibold text-solo'
                : 'hover:text-solo'
            }
          >
            {item.title}
          </Link>
        ))}
      </nav>

      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight text-solo">
        {document.title}
      </h1>
      <p className="mb-1 text-sm text-cinza">{document.summary}</p>
      <p className="mb-8 text-xs text-cinza">
        Versão {document.version} · Atualizado em {document.updatedAt}
      </p>

      <div className="space-y-8 rounded-xl border border-nuvem bg-white p-6 sm:p-8">
        {document.sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 font-display text-lg font-bold text-solo">{section.title}</h2>
            <div className="space-y-3 text-sm leading-relaxed text-cinza">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-xs text-cinza">
        Dúvidas? Entre em contato pelo e-mail{' '}
        <a href="mailto:suporte@trade2fly.com.br" className="text-voo hover:text-voo-dark">
          suporte@trade2fly.com.br
        </a>
        .
      </p>
    </div>
  );
}
