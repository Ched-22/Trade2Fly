import { Link } from 'react-router-dom';
import { footerColumns } from '../../data/mockCategories';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-nuvem bg-white text-solo">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col gap-8 sm:mb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xs shrink-0">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-cinza">
              O marketplace mais seguro de equipamentos de paraquedismo do Brasil.
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-3 font-display text-sm font-bold">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <Link
                          to={link.href}
                          className="text-sm text-cinza hover:text-solo"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <span className="cursor-pointer text-sm text-cinza hover:text-solo">
                          {link.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-nuvem pt-6 text-center text-sm text-cinza">
          © {new Date().getFullYear()} Trade2Fly. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
