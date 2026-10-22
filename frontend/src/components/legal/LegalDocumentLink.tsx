import { Link } from 'react-router-dom';
import { getLegalDocument, legalDocumentPath } from '../../data/legalDocuments';

type LegalDocumentLinkProps = {
  documentId: string;
  className?: string;
};

export function LegalDocumentLink({ documentId, className = '' }: LegalDocumentLinkProps) {
  const document = getLegalDocument(documentId);
  const label = document?.title ?? documentId;

  return (
    <Link
      to={legalDocumentPath(documentId)}
      target="_blank"
      rel="noopener noreferrer"
      className={`font-semibold text-voo hover:text-voo-dark ${className}`}
    >
      {label}
    </Link>
  );
}
