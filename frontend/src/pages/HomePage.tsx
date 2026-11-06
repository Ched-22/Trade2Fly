import { useMemo, useState } from 'react';
import { Bell, Lock, PackagePlus, Search, TrendingUp, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthAlert } from '../components/auth/AuthAlert';
import { HomeListingSection } from '../components/home/HomeListingSection';
import { CategoryCard } from '../components/ui/CategoryCard';
import { CategoryPill } from '../components/ui/CategoryPill';
import { Button } from '../components/ui/Button';
import { SectionTitle } from '../components/ui/SectionTitle';
import {
  brands,
  categoryCards,
  homeSeals,
  protectionItems,
  reviews,
} from '../data/mockCategories';
import { homeListingSections } from '../data/homeListingSections';
import { useMarketplace } from '../hooks/useMarketplace';

const sealIcons: Record<string, LucideIcon> = {
  lock: Lock,
  search: Search,
  package: PackagePlus,
  trending: TrendingUp,
  bell: Bell,
};

export function HomePage() {
  const navigate = useNavigate();
  const {
    favorites,
    toggleFavorite,
    allListings,
    listingsLoading,
    listingsError,
    dismissListingsError,
  } = useMarketplace();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const listingsWithFavorites = useMemo(
    () =>
      allListings.map((listing) => ({
        ...listing,
        fav: !!favorites[listing.id],
      })),
    [allListings, favorites],
  );

  const categoryListingCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const listing of allListings) {
      counts.set(listing.category, (counts.get(listing.category) ?? 0) + 1);
    }
    return counts;
  }, [allListings]);

  const subscribe = () => {
    if (!email) {
      setEmailError('E-mail é obrigatório');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setEmailError('Digite um e-mail válido');
      return;
    }
    setEmailError('');
    setSubscribed(true);
  };

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-solo text-white">
        <img
          src="/images/parachute-hero-2-bw.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[74%_68%] max-sm:-translate-y-[6%] sm:object-[center_68%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-solo/90 via-solo/55 to-solo/10" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-72 bg-gradient-to-t from-solo/90 to-transparent" />

        <div className="mx-auto flex min-h-[460px] max-w-7xl flex-col justify-end px-4 pt-16 pb-10 sm:min-h-[560px] sm:px-6 sm:pb-14">
          <div className="t2f-eyebrow mb-5 flex items-center gap-3 text-white/80">
            <span className="inline-block h-[2px] w-10 bg-pull" aria-hidden />
            Pagamento retido em custódia
          </div>
          <h1 className="max-w-4xl font-display text-[3.4rem] leading-[0.92] font-extrabold text-balance sm:text-[4.5rem] lg:text-[5.25rem]">
            Equipamento de <span className="text-pull">alto nível</span>.
            <br />
            Negócio sem risco.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Velames, containers e reservas de quem salta. O valor fica retido e só é liberado ao vendedor quando você confirma o recebimento.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/busca')}>
              Ver equipamentos
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-white text-white hover:bg-white hover:text-solo sm:w-auto"
              onClick={() => navigate('/vender')}
            >
              Vender o meu
            </Button>
          </div>
        </div>

      <div className="border-t border-white/15">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px sm:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
          {homeSeals.map((seal) => {
            const Icon = sealIcons[seal.icon];
            return (
              <div key={seal.title} className="flex items-center gap-3 border-white/15 px-4 not-first:border-l py-5 sm:px-6 sm:py-6">
                <Icon className="h-5 w-5 shrink-0 text-pull" strokeWidth={1.5} />
                <div>
                  <div className="font-display text-[1.05rem] leading-none font-bold">{seal.title}</div>
                  <div className="t2f-eyebrow mt-1.5 text-[0.58rem] text-white/50">{seal.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {listingsError ? (
          <div className="pt-6">
            <AuthAlert variant="error">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>{listingsError}</span>
                <button
                  type="button"
                  onClick={dismissListingsError}
                  className="cursor-pointer text-sm font-semibold underline"
                >
                  Fechar
                </button>
              </div>
            </AuthAlert>
          </div>
        ) : null}

        {!listingsLoading && allListings.length === 0 && !listingsError ? (
          <p className="pt-6 text-center text-cinza">Nenhum anúncio disponível no momento.</p>
        ) : null}

        <section className="py-10 sm:py-16">
          <SectionTitle
            eyebrow="01 — Categorias"
            title="Monte o seu rig"
            subtitle="Encontre exatamente o que precisa para o seu rig."
            action={
              <button
                type="button"
                onClick={() => navigate('/busca')}
                className="t2f-eyebrow hidden shrink-0 cursor-pointer border-b border-solo pb-0.5 text-solo transition-colors hover:border-pull hover:text-pull sm:inline-block"
              >
                Ver todas →
              </button>
            }
          />

          <div className="flex flex-wrap gap-2 md:hidden">
            {categoryCards.map((card) => (
              <CategoryPill
                key={card.name}
                card={card}
                onClick={() => navigate(`/busca?category=${encodeURIComponent(card.name)}`)}
              />
            ))}
          </div>

          <div className="hidden gap-2.5 md:grid md:grid-cols-2 md:gap-3 lg:grid-cols-3">
            {categoryCards.map((card) => (
              <CategoryCard
                key={card.name}
                card={card}
                listingCount={categoryListingCounts.get(card.name)}
                onClick={() => navigate(`/busca?category=${encodeURIComponent(card.name)}`)}
              />
            ))}
          </div>
        </section>

        {homeListingSections.map((config) => (
          <HomeListingSection
            key={config.id}
            config={config}
            listings={config.selectListings(listingsWithFavorites)}
            onToggleFavorite={toggleFavorite}
          />
        ))}

        <section className="py-10 sm:py-16">
          <div className="t2f-grain grid items-center gap-8 bg-solo p-6 text-white sm:gap-14 sm:p-14 md:grid-cols-2">
            <div>
              <div className="t2f-eyebrow mb-5 flex items-center gap-2 text-pull">
                <span className="inline-block h-[7px] w-[7px] bg-pull" aria-hidden />
                02 — Proteção ao comprador
              </div>
              <h2 className="mb-4 font-display text-[2.6rem] leading-[0.95] font-bold sm:text-[4rem]">
                Seu dinheiro fica parado até você confirmar
              </h2>
              <p className="mb-8 max-w-md leading-relaxed text-white/65">
                Todo pagamento passa pela custódia da Trade2Fly. O vendedor só recebe quando você confirma que está tudo certo com o equipamento.
              </p>
              <Button onClick={() => navigate('/faq#escrow')}>Como funciona</Button>
            </div>
            <ol className="flex flex-col border-t border-white/15">
              {protectionItems.map((item, index) => (
                <li key={item} className="flex items-baseline gap-5 border-b border-white/15 py-4">
                  <span className="font-mono text-xs text-pull">{String(index + 1).padStart(2, '0')}</span>
                  <span className="font-display text-[1.3rem] leading-tight font-semibold">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-10 sm:py-16">
          <SectionTitle eyebrow="03 — Marcas" title="Marcas em destaque" />
          <div className="grid grid-cols-2 gap-px border border-nuvem bg-nuvem sm:grid-cols-3 lg:grid-cols-6">
            {brands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => navigate(`/busca?brand=${encodeURIComponent(brand)}`)}
                className="cursor-pointer bg-white px-5 py-7 font-display text-[1.8rem] font-bold text-solo transition-colors hover:bg-solo hover:text-white"
              >
                {brand}
              </button>
            ))}
          </div>
        </section>

        <section className="py-10 sm:py-16">
          <SectionTitle eyebrow="04 — Comunidade" title="O que a comunidade diz" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
            {reviews.map((review) => (
              <figure key={review.name} className="border border-nuvem border-t-solo bg-white p-6">
                <div className="mb-3 text-sm tracking-[3px] text-pull">{review.stars}</div>
                <blockquote className="mb-6 text-[0.95rem] leading-relaxed text-solo">{review.text}</blockquote>
                <figcaption className="flex items-center gap-3 border-t border-nuvem pt-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-solo font-mono text-xs font-bold text-white">
                    {review.initials}
                  </span>
                  <div>
                    <div className="font-display text-[1.05rem] leading-none font-bold">{review.name}</div>
                    <div className="t2f-eyebrow mt-1 text-[0.58rem] text-cinza">{review.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="pb-12 sm:pb-16">
          <div className="flex flex-col items-stretch justify-between gap-6 border border-solo bg-white p-6 sm:flex-row sm:flex-wrap sm:items-center sm:p-10">
            <div className="max-w-md">
              <h2 className="font-display text-[1.9rem] leading-none font-bold sm:text-[2.3rem]">Receba novos anúncios no seu e-mail</h2>
              <p className="mt-2 text-cinza">Alertas de equipamento e novidades da comunidade.</p>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2.5 text-sm font-semibold text-liberado-dark sm:text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-liberado text-white">✓</span>
                Inscrição confirmada. Você começa a receber novidades em breve.
              </div>
            ) : (
              <div className="flex w-full min-w-0 flex-col gap-2 sm:max-w-md">
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <input
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailError('');
                    }}
                    placeholder="seu@email.com"
                    className="h-11 w-full flex-1 rounded-md border border-solo/30 bg-bruma px-3.5 font-sans text-[0.95rem] outline-none focus:border-solo focus:bg-white sm:h-[46px]"
                  />
                  <Button className="w-full shrink-0 sm:w-auto" onClick={subscribe}>Inscrever</Button>
                </div>
                {emailError ? <span className="text-xs text-error">{emailError}</span> : null}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
