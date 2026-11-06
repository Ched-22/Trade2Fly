type LogoProps = {
  variant?: 'light' | 'dark';
};

/** Marca tipográfica: só o nome. Condensado, itálico de velocidade, o "2" em laranja. */
export function Logo({ variant = 'dark' }: LogoProps) {
  const ink = variant === 'dark' ? '#0e1114' : '#f4f1eb';

  return (
    <span
      aria-label="Trade2Fly"
      className="inline-block -skew-x-[9deg] font-display text-[1.7rem] leading-none font-extrabold tracking-[0.015em] sm:text-[2rem]"
      style={{ color: ink }}
    >
      Trade<span className="text-pull">2</span>Fly
    </span>
  );
}
