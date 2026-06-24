import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, MessageCircle, Search } from 'lucide-react';
import { categories } from '../../data/mockCategories';
import { useAuth } from '../../hooks/useAuth';
import { useMarketplace } from '../../hooks/useMarketplace';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';

export function Header() {
  const navigate = useNavigate();
  const { loggedIn, user, logout } = useAuth();
  const { query, setQuery, favCount } = useMarketplace();

  const submitSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    navigate(`/busca${params.toString() ? `?${params}` : ''}`);
  };

  const searchBar = (
    <div className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-nuvem bg-bruma px-3 sm:h-11 sm:px-4 md:max-w-[560px]">
      <Search className="h-4 w-4 shrink-0 text-solo sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') submitSearch();
        }}
        placeholder="Buscar velames, containers, marcas…"
        className="min-w-0 flex-1 border-none bg-transparent font-sans text-sm text-solo outline-none placeholder:text-cinza sm:text-[0.95rem]"
      />
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-nuvem bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center gap-3 sm:h-[68px] sm:gap-4">
          <Link to="/" className="flex shrink-0 items-center">
            <Logo />
          </Link>

          <div className="hidden min-w-0 flex-1 justify-center md:flex">{searchBar}</div>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-2.5">
            {loggedIn && user ? (
              <>
                <button
                  type="button"
                  aria-label="Favoritos"
                  onClick={() => navigate('/favoritos')}
                  className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-solo hover:bg-bruma sm:h-10 sm:w-10"
                >
                  <Heart className="h-5 w-5" strokeWidth={1.75} />
                  {favCount > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pull px-1 font-mono text-[10px] font-bold text-white">
                      {favCount}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  aria-label="Mensagens"
                  onClick={() => navigate('/mensagens')}
                  className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-solo hover:bg-bruma sm:h-10 sm:w-10"
                >
                  <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pull px-1 font-mono text-[10px] font-bold text-white">
                    2
                  </span>
                </button>
                <UserMenu user={user} onLogout={logout} />
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/entrar')}
                className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-solo bg-white px-3 text-sm font-semibold text-solo transition-colors hover:bg-bruma sm:h-10 sm:px-5"
              >
                Entrar
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/vender')}
              className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-solo px-4 text-sm font-semibold text-white transition-colors hover:bg-solo/90 sm:h-10 sm:px-5"
            >
              Vender
            </button>
          </div>
        </div>

        <div className="pb-3 md:hidden">{searchBar}</div>
      </div>

      <nav className="t2f-scroll border-t border-nuvem" aria-label="Categorias">
        <div className="mx-auto flex max-w-7xl items-center gap-0.5 overflow-x-auto px-4 py-2 sm:gap-1 sm:px-6">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => navigate(`/busca?category=${encodeURIComponent(category)}`)}
              className="shrink-0 cursor-pointer rounded-md border-none bg-transparent px-2.5 py-1.5 font-sans text-xs font-medium whitespace-nowrap text-solo/80 hover:bg-bruma hover:text-solo sm:px-3 sm:text-sm"
            >
              {category}
            </button>
          ))}

          <button
            type="button"
            onClick={() => navigate('/busca')}
            className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border-none bg-transparent px-2.5 py-1.5 font-sans text-xs font-medium whitespace-nowrap text-solo hover:bg-bruma sm:px-3 sm:text-sm"
          >
            <Menu className="h-4 w-4" strokeWidth={1.75} />
            Todas as categorias
          </button>
        </div>
      </nav>
    </header>
  );
}
