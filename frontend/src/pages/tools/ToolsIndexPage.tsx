import { Link } from 'react-router-dom';
import { ToolCard } from '../../components/tools/ToolCard';
import { skydiverToolCards } from '../../data/skydiverTools';

export function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-cinza">
        <Link to="/" className="hover:text-voo">
          Home
        </Link>
        <span aria-hidden> / </span>
        <span className="text-solo">Ferramentas</span>
      </nav>

      <h1 className="mb-2 font-display text-2xl font-extrabold tracking-tight text-solo sm:text-3xl">
        Ferramentas para skydivers
      </h1>
      <p className="mb-8 max-w-2xl text-cinza">
        Calculadoras e guias para ajudar na escolha de equipamento antes de comprar ou vender no marketplace.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] sm:gap-4">
        {skydiverToolCards.map((tool) => (
          <ToolCard key={tool.path} {...tool} />
        ))}
      </div>
    </div>
  );
}
