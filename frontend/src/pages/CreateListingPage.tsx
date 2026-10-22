import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { AuthAlert } from '../components/auth/AuthAlert';
import { CategoryFieldsPanel } from '../components/sell/CategoryFieldsPanel';
import { ConditionSelector } from '../components/sell/ConditionSelector';
import { ListingFormSection } from '../components/sell/ListingFormSection';
import { ListingPhotoUpload } from '../components/sell/ListingPhotoUpload';
import { ListingPreviewPanel } from '../components/sell/ListingPreviewPanel';
import { SellerPayoutBreakdown } from '../components/sell/SellerPayoutBreakdown';
import { SellerPlatformFeeNotice } from '../components/sell/SellerPlatformFeeNotice';
import { SellerListingTermsAcceptance } from '../components/sell/SellerListingTermsAcceptance';
import {
  DraftRestoreBanner,
  ListingSuccessView,
} from '../components/sell/ListingSellExtras';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { brands, categories } from '../data/mockCategories';
import { getSellerCommissionInfo } from '../lib/sellerSalesApi';
import { ApiError, apiPost } from '../lib/api';
import { buildListingPayload } from '../lib/buildListingPayload';
import { useMarketplace } from '../hooks/useMarketplace';
import { resolvePhotoFiles, uploadListingPhotos } from '../lib/listingMediaApi';
import { saveListingPhotos } from '../lib/listingPhotoStorage';
import {
  clearListingDraft,
  hasListingDraft,
  isDraftOversized,
  loadListingDraft,
  saveListingDraft,
} from '../lib/listingDraftStorage';
import { formatCep, normalizeCep } from '../lib/shippingEstimate';
import { fetchAddressByCep } from '../lib/viacep';
import {
  hasFormErrors,
  validateListingForm,
  type ListingFormErrors,
} from '../lib/listingFormValidation';
import type { ListingFormState } from '../types/listingForm';
import { emptyListingForm } from '../types/listingForm';

const ERROR_FIELD_ORDER: (keyof ListingFormErrors)[] = [
  'photos',
  'title',
  'brand',
  'brandOther',
  'category',
  'size',
  'jumps',
  'year',
  'weight',
  'repackDate',
  'modelNotes',
  'condition',
  'priceNum',
  'postalCode',
  'location',
  'description',
];

function scrollToFirstError(errors: ListingFormErrors) {
  const firstKey = ERROR_FIELD_ORDER.find((key) => errors[key]);
  if (!firstKey) return;
  const el = document.getElementById(`listing-field-${firstKey}`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

type CreatedListing = {
  id: number;
  title: string;
};

export function CreateListingPage() {
  const { refetchListings } = useMarketplace();
  const [form, setForm] = useState<ListingFormState>(emptyListingForm);
  const [errors, setErrors] = useState<ListingFormErrors>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [published, setPublished] = useState<{ id: number; title: string } | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftWarning, setDraftWarning] = useState<string | null>(null);
  const [postalCodeLoading, setPostalCodeLoading] = useState(false);
  const [acceptedSellerTerms, setAcceptedSellerTerms] = useState(false);
  const [sellerTermsError, setSellerTermsError] = useState('');
  const [firstSaleExempt, setFirstSaleExempt] = useState(false);

  useEffect(() => {
    if (hasListingDraft()) {
      setShowDraftBanner(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getSellerCommissionInfo()
      .then((info) => {
        if (!cancelled) setFirstSaleExempt(info.firstSaleExempt);
      })
      .catch(() => {
        if (!cancelled) setFirstSaleExempt(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (published) return;
    const timer = window.setTimeout(() => {
      saveListingDraft(form);
      setDraftWarning(
        isDraftOversized(form)
          ? 'O rascunho está grande; fotos podem não ser salvas em alguns navegadores.'
          : null,
      );
    }, 500);
    return () => window.clearTimeout(timer);
  }, [form, published]);

  const updateField = useCallback(
    <K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) => {
      setForm((current) => ({ ...current, [key]: value }));
      setErrors((current) => {
        if (!current[key]) return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const handlePostalCodeBlur = async () => {
    const digits = normalizeCep(form.postalCode);
    if (digits.length !== 8) return;

    setPostalCodeLoading(true);
    try {
      const address = await fetchAddressByCep(digits);
      if (!address) {
        setErrors((current) => ({
          ...current,
          postalCode: 'CEP não encontrado. Verifique e tente novamente.',
        }));
        return;
      }

      updateField('postalCode', digits);
      updateField('location', `${address.city}, ${address.state}`);
    } catch {
      setErrors((current) => ({
        ...current,
        postalCode: 'Não foi possível consultar o CEP. Tente novamente.',
      }));
    } finally {
      setPostalCodeLoading(false);
    }
  };

  const handleRestoreDraft = () => {
    const draft = loadListingDraft();
    if (draft) {
      setForm(draft);
      setShowDraftBanner(false);
    }
  };

  const handleDiscardDraft = () => {
    clearListingDraft();
    setForm(emptyListingForm());
    setShowDraftBanner(false);
    setDraftWarning(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const validation = validateListingForm(form);
    if (hasFormErrors(validation)) {
      setErrors(validation);
      window.requestAnimationFrame(() => scrollToFirstError(validation));
      return;
    }

    if (!acceptedSellerTerms) {
      setSellerTermsError('Você precisa aceitar os termos e declarar ciência das taxas para publicar.');
      document.getElementById('listing-field-sellerTerms')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    setSellerTermsError('');

    setSubmitting(true);
    try {
      const payload = buildListingPayload(form, acceptedSellerTerms);
      const created = await apiPost<CreatedListing>('/api/listings', payload);

      setUploadingPhotos(true);
      try {
        const files = await resolvePhotoFiles(form.photos);
        await uploadListingPhotos(created.id, files);
      } catch {
        saveListingPhotos(
          created.id,
          form.photos.map((photo) => photo.previewUrl),
        );
      } finally {
        setUploadingPhotos(false);
      }

      clearListingDraft();
      await refetchListings();
      setPublished({ id: created.id, title: created.title });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível publicar o anúncio. Tente novamente.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (published) {
    return <ListingSuccessView title={published.title} listingId={published.id} firstSaleExempt={firstSaleExempt} />;
  }

  return (
    <div className="t2f-page max-w-[1080px]">
      <h1 className="mb-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
        Publicar anúncio
      </h1>
      <p className="mb-4 text-cinza sm:mb-6">
        Preencha os dados do equipamento. Pagamento protegido disponível para compradores.
      </p>
      <SellerPlatformFeeNotice className="mb-6 sm:mb-8" firstSaleExempt={firstSaleExempt} />

      {showDraftBanner ? (
        <DraftRestoreBanner onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
      ) : null}

      {draftWarning ? (
        <div className="mb-4">
          <AuthAlert variant="info">{draftWarning}</AuthAlert>
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
          <div className="space-y-5">
            <ListingFormSection
              title="1. Fotos"
              description="Mostre o equipamento de vários ângulos."
            >
              <div id="listing-field-photos">
              <ListingPhotoUpload
                photos={form.photos}
                onChange={(photos) => updateField('photos', photos)}
                error={errors.photos ?? photoError ?? undefined}
                onPhotoError={setPhotoError}
              />
              </div>
            </ListingFormSection>

            <ListingFormSection title="2. Informações básicas">
              <div id="listing-field-title">
              <Input
                label="Título do anúncio"
                placeholder="Ex.: Velame PD Sabre2 210 — 380 saltos"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                error={errors.title}
              />
              </div>
              <div className="grid gap-4 sm:grid-cols-2" id="listing-field-brand">
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-solo">
                  Marca
                  <select
                    value={form.brand}
                    onChange={(event) => updateField('brand', event.target.value)}
                    className="h-11 rounded-md border border-nuvem bg-white px-3.5 font-sans text-[0.95rem] outline-none focus:ring-3 focus:ring-voo/30"
                  >
                    <option value="">Selecione…</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                    <option value="__other__">Outra</option>
                  </select>
                  {errors.brand ? (
                    <span className="text-xs font-normal text-error">{errors.brand}</span>
                  ) : null}
                </label>
                {form.brand === '__other__' ? (
                  <div id="listing-field-brandOther">
                  <Input
                    label="Nome da marca"
                    value={form.brandOther}
                    onChange={(event) => updateField('brandOther', event.target.value)}
                    error={errors.brandOther}
                  />
                  </div>
                ) : null}
              </div>
            </ListingFormSection>

            <ListingFormSection title="3. Categoria e tipo">
              <div id="listing-field-category">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-solo">
                Categoria
                <select
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  className="h-11 rounded-md border border-nuvem bg-white px-3.5 font-sans text-[0.95rem] outline-none focus:ring-3 focus:ring-voo/30"
                >
                  <option value="">Selecione…</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category ? (
                  <span className="text-xs font-normal text-error">{errors.category}</span>
                ) : null}
              </label>
              </div>
            </ListingFormSection>

            {form.category ? (
              <ListingFormSection title="4. Detalhes do equipamento">
                <CategoryFieldsPanel
                  category={form.category}
                  form={form}
                  errors={errors}
                  onChange={updateField}
                />
              </ListingFormSection>
            ) : null}

            <ListingFormSection title="5. Estado e preço">
              <div id="listing-field-condition">
              <ConditionSelector
                value={form.condition}
                onChange={(value) => updateField('condition', value)}
                error={errors.condition}
              />
              </div>
              <div id="listing-field-priceNum">
              <Input
                label="Preço (R$)"
                type="number"
                min={100}
                placeholder="4800"
                value={form.priceNum}
                onChange={(event) => updateField('priceNum', event.target.value)}
                error={errors.priceNum}
              />
              </div>
              <p className="text-sm text-cinza">
                Pesquise anúncios similares na plataforma para definir um preço competitivo.
              </p>
              {Number(form.priceNum) > 0 ? (
                <SellerPayoutBreakdown
                  amount={Number(form.priceNum)}
                  className="mt-3"
                  commissionExempt={firstSaleExempt}
                />
              ) : null}
            </ListingFormSection>

            <ListingFormSection title="6. Localização">
              <div id="listing-field-postalCode" className="space-y-3">
                <Input
                  label="CEP de origem do envio"
                  placeholder="00000-000"
                  value={formatCep(form.postalCode)}
                  onChange={(event) => updateField('postalCode', normalizeCep(event.target.value))}
                  onBlur={() => void handlePostalCodeBlur()}
                  error={errors.postalCode}
                />
                <p className="text-sm text-cinza">
                  Usado para calcular o frete no checkout. Informe o CEP de onde o equipamento será
                  enviado.
                </p>
              </div>
              <div id="listing-field-location" className="mt-3">
                <Input
                  label="Cidade e estado"
                  placeholder="Preenchido automaticamente pelo CEP"
                  value={form.location}
                  onChange={(event) => updateField('location', event.target.value)}
                  error={errors.location}
                  disabled={postalCodeLoading}
                />
              </div>
            </ListingFormSection>

            <ListingFormSection title="7. Descrição">
              <div id="listing-field-description">
              <Textarea
                label="Descrição do equipamento"
                rows={6}
                placeholder="Histórico de manutenção, revisões por rigger, motivo da venda…"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                error={errors.description}
              />
              <p className="text-right text-xs text-cinza">{form.description.length} caracteres</p>
              </div>
            </ListingFormSection>

            {submitError ? <AuthAlert variant="error">{submitError}</AuthAlert> : null}

            <SellerPlatformFeeNotice firstSaleExempt={firstSaleExempt} />

            <SellerListingTermsAcceptance
              checked={acceptedSellerTerms}
              onChange={(checked) => {
                setAcceptedSellerTerms(checked);
                setSellerTermsError('');
              }}
              error={sellerTermsError}
            />

            <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
              {uploadingPhotos
                ? 'Enviando fotos…'
                : submitting
                  ? 'Publicando…'
                  : 'Publicar anúncio'}
            </Button>
          </div>

          <ListingPreviewPanel
            form={form}
            className="lg:sticky lg:top-24"
            commissionExempt={firstSaleExempt}
          />
        </div>
      </form>
    </div>
  );
}
