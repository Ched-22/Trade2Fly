import { LegalDocumentLink } from '../legal/LegalDocumentLink';
import { PLATFORM_FEE_PERCENT } from '../../lib/platformFee';

type SellerListingTermsAcceptanceProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

export function SellerListingTermsAcceptance({
  checked,
  onChange,
  error,
}: SellerListingTermsAcceptanceProps) {
  return (
    <div
      id="listing-field-sellerTerms"
      className={`rounded-xl border p-4 ${
        error ? 'border-error/40 bg-error/5' : 'border-nuvem bg-bruma/30'
      }`}
    >
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-solo">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-nuvem accent-pull"
          aria-invalid={Boolean(error)}
        />
        <span>
          Declaro que li e aceito os{' '}
          <LegalDocumentLink documentId="termos" />, a{' '}
          <LegalDocumentLink documentId="privacidade" /> e os{' '}
          <LegalDocumentLink documentId="vendedor" />. Estou ciente de que a Trade2Fly cobra
          comissão de {PLATFORM_FEE_PERCENT}% sobre o valor da venda (isenta na primeira venda
          concluída), deduzida na liberação do
          pagamento, e que sou responsável pelas informações publicadas neste anúncio.
        </span>
      </label>
      {error ? <p className="mt-2 text-xs text-error">{error}</p> : null}
    </div>
  );
}
