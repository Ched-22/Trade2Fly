import { Link } from 'react-router-dom';
import { footerColumns } from '../../data/mockCategories';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="t2f-grain mt-auto bg-solo text-white">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
        <div className="mb-12 flex flex-col gap-10 sm:mb-14 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xs shrink-0">
            <Logo variant="light" />
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              O marketplace mais seguro de equipamentos de paraquedismo do Brasil.
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-8 sm:grid-cols-4 lg:max-w-3xl">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="t2f-eyebrow mb-4 border-b border-white/15 pb-3 text-pull">
                  {column.title}
                </h3>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <Link to={link.href} className="text-sm text-white/65 transition-colors hover:text-white">
                          {link.label}
                        </Link>
                      ) : (
                        <span className="cursor-pointer text-sm text-white/65 transition-colors hover:text-white">
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
        <div className="font-display text-[22vw] leading-[0.8] font-extrabold tracking-[0.02em] text-white/[0.05] select-none sm:text-[13rem]" aria-hidden>
          Trade2Fly
        </div>
        <div className="t2f-eyebrow mt-6 flex flex-col gap-2 border-t border-white/15 pt-5 text-[0.62rem] text-white/45 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Trade2Fly. Todos os direitos reservados.</span>
          <span>Pagamento em custódia · Equipamentos de paraquedismo</span>
        </div>
      </div>
    </footer>
  );
}
