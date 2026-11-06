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
        <h1 className="mb-5 font-display text-[3rem] leading-[0.95] font-extrabold sm:text-[4.2rem]">
          Bem-vindo à comunidade Trade2Fly
        </h1>
        <p className="max-w-lg leading-relaxed text-cinza">
          Compre e venda equipamentos de paraquedismo com pagamento protegido em custódia. Junte-se a skydivers de todo o Brasil.
        </p>
        <ul className="mt-8 space-y-3">
          {highlights.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-pull text-[0.65rem] font-bold text-white">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="order-1 border border-solo bg-white p-6 sm:p-8 md:order-2">
        {children}
      </div>
    </div>
  );
}
