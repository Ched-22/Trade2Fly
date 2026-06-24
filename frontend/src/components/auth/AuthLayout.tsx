import type { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
};

const highlights = [
  'Pagamento seguro em escrow',
  'Mensagens diretas com vendedores',
  'Favoritos e alertas de preço',
];

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-[1080px] items-center gap-8 px-4 py-10 sm:gap-12 sm:px-6 sm:py-12 md:grid-cols-[1fr_420px]">
      <div className="order-2 md:order-1">
        <h1 className="mb-4 font-display text-3xl font-black tracking-tight sm:text-4xl">
          Bem-vindo à comunidade Trade2Fly
        </h1>
        <p className="max-w-lg leading-relaxed text-cinza">
          Compre e venda equipamentos de paraquedismo com pagamento protegido em custódia. Junte-se a skydivers de todo o Brasil.
        </p>
        <ul className="mt-8 space-y-3">
          {highlights.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-liberado text-xs font-bold text-white">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="order-1 rounded-2xl border border-nuvem bg-white p-6 shadow-md sm:p-8 md:order-2">
        {children}
      </div>
    </div>
  );
}
