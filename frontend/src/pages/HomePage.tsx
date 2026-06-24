import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeListingSection } from '../components/home/HomeListingSection';
import { ToolCard } from '../components/tools/ToolCard';
import { CategoryCard } from '../components/ui/CategoryCard';
import { CategoryPill } from '../components/ui/CategoryPill';
import { Button } from '../components/ui/Button';
import {
  brands,
  categoryCards,
  homeSeals,
  protectionItems,
  resources,
  reviews,
} from '../data/mockCategories';
import { homeListingSections } from '../data/homeListingSections';
import { listings as mockListings } from '../data/mockListings';
import { useMarketplace } from '../hooks/useMarketplace';

export function HomePage() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, allListings } = useMarketplace();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const sourceListings = allListings.length > 0 ? allListings : mockListings;

  const listingsWithFavorites = useMemo(
    () =>
      sourceListings.map((listing) => ({
        ...listing,
        fav: !!favorites[listing.id],
      })),
    [sourceListings, favorites],
  );

  const categoryListingCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const listing of sourceListings) {
      counts.set(listing.category, (counts.get(listing.category) ?? 0) + 1);
    }
    return counts;
  }, [sourceListings]);

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
      <section className="relative overflow-hidden sky-gradient text-white">
        <div className="absolute inset-0 bg-[radial-gradient(900px_400px_at_80%_-10%,rgba(255,255,255,0.16),transparent)]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-start gap-4 px-4 py-12 sm:gap-6 sm:px-6 sm:py-[72px] sm:pb-[84px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-liberado/40 bg-liberado/18 px-3 py-1.5 text-xs font-semibold text-[#7EF0CC] sm:px-3.5">
            🔒 Pagamento protegido em custódia
          </span>
          <h1 className="font-display text-3xl leading-[1.08] font-black tracking-tight text-balance sm:text-4xl lg:text-5xl lg:leading-[1.05]">
            O marketplace mais seguro de equipamentos de paraquedismo do Brasil
          </h1>
          <p className="max-w-xl text-base leading-normal text-white/86 sm:text-lg">
            Compre e venda velames, containers e reservas com pagamento retido em custódia. O valor só é liberado quando você confirma o recebimento.
          </p>
          <div className="mt-1.5 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3.5">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/busca')}>
              COMPRAR AGORA
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-white/50 bg-white/10 text-white hover:-translate-y-px hover:border-white hover:bg-white/25 hover:text-white sm:w-auto"
              onClick={() => navigate('/vender')}
            >
              Vender meu equipamento
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-nuvem bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-5 sm:grid-cols-[repeat(auto-fit,minmax(170px,1fr))] sm:gap-4 sm:px-6 sm:py-7">
          {homeSeals.map((seal) => (
            <div key={seal.title} className="flex items-center gap-3">
              <span className="text-2xl">{seal.icon}</span>
              <div>
                <div className="text-sm font-bold text-solo">{seal.title}</div>
                <div className="text-xs text-cinza">{seal.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <section className="py-6 sm:py-10">
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-5">
            <h2 className="font-display text-base font-extrabold tracking-tight text-solo uppercase italic sm:text-2xl sm:normal-case sm:not-italic md:text-3xl">
              Categorias populares
            </h2>
            <button
              type="button"
              onClick={() => navigate('/busca')}
              className="hidden cursor-pointer rounded-lg border border-solo bg-white px-3 py-1.5 text-xs font-semibold text-solo hover:bg-bruma sm:inline-flex"
            >
              Ver todas
            </button>
          </div>
          <p className="mb-3 hidden text-cinza sm:mb-5 sm:block">
            Encontre exatamente o que precisa para o seu rig.
          </p>

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

        <section className="py-10 sm:py-14">
          <h2 className="mb-5 font-display text-2xl font-extrabold tracking-tight sm:mb-6 sm:text-3xl">Ferramentas para skydivers</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] sm:gap-4">
            {resources.map((resource) => (
              <ToolCard key={resource.path} {...resource} />
            ))}
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="grid items-center gap-6 rounded-2xl bg-gradient-to-br from-altitude to-[#16456e] p-6 text-white sm:gap-10 sm:rounded-3xl sm:p-12 md:grid-cols-2">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-liberado/18 px-3 py-1 text-xs font-semibold text-[#7EF0CC] sm:mb-4">
                🛡️ Proteção ao comprador
              </span>
              <h2 className="mb-3 font-display text-2xl leading-tight font-extrabold tracking-tight sm:mb-3.5 sm:text-4xl">
                Seu dinheiro fica seguro até você confirmar
              </h2>
              <p className="mb-6 leading-relaxed text-white/80">
                Todo pagamento passa pela custódia da Trade2Fly. O vendedor só recebe quando você confirma que está tudo certo com o equipamento.
              </p>
              <Button onClick={() => navigate('/')}>Saiba mais</Button>
            </div>
            <div className="flex flex-col gap-3.5">
              {protectionItems.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-white/6 px-4 py-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-liberado text-sm font-bold text-white">✓</span>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <h2 className="mb-4 font-display text-2xl font-extrabold tracking-tight">Marcas em destaque</h2>
          <div className="flex flex-wrap gap-3">
            {brands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => navigate(`/busca?brand=${encodeURIComponent(brand)}`)}
                className="cursor-pointer rounded-full border border-nuvem bg-white px-5 py-2.5 font-display text-[0.95rem] font-bold text-altitude shadow-sm"
              >
                {brand}
              </button>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="mb-6 font-display text-3xl font-extrabold tracking-tight">O que a comunidade diz</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] sm:gap-4">
            {reviews.map((review) => (
              <div key={review.name} className="rounded-lg border border-nuvem bg-white p-5 shadow-sm">
                <div className="mb-2.5 tracking-[2px] text-pull">{review.stars}</div>
                <p className="mb-4 text-[0.95rem] leading-relaxed text-solo">{review.text}</p>
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: review.color }}
                  >
                    {review.initials}
                  </span>
                  <div>
                    <div className="text-sm font-bold">{review.name}</div>
                    <div className="text-xs text-cinza">{review.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-12 sm:pb-16">
          <div className="flex flex-col items-stretch justify-between gap-6 rounded-2xl border border-nuvem bg-white p-6 shadow-md sm:flex-row sm:flex-wrap sm:items-center sm:p-10">
            <div className="max-w-md">
              <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">Receba novos anúncios no seu e-mail</h2>
              <p className="text-cinza">Alertas de equipamento e novidades da comunidade.</p>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2.5 text-sm font-semibold text-liberado-dark sm:text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-liberado text-white">✓</span>
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
                    className="h-11 w-full flex-1 rounded-md border-[1.5px] border-nuvem px-3.5 font-sans text-[0.95rem] outline-none focus:ring-3 focus:ring-voo/30 sm:h-[46px]"
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
