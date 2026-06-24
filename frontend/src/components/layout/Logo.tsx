type LogoProps = {
  variant?: 'light' | 'dark';
};

export function Logo({ variant = 'dark' }: LogoProps) {
  const isDark = variant === 'dark';

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <svg
        className="h-7 w-7 sm:h-[30px] sm:w-[30px]"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
      >
        <path
          d="M4 18a20 20 0 0 1 40 0"
          stroke="#FF512E"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M4 18l8 8M24 18v8M44 18l-8 8M24 26l-7 9h14l-7-9z"
          stroke={isDark ? '#0a1b2a' : '#fff'}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`font-display text-lg font-black tracking-tight sm:text-[1.3rem] ${
          isDark ? 'text-solo' : 'text-white'
        }`}
      >
        Trade<span className={isDark ? 'text-pull' : 'text-pull'}>2</span>Fly
      </span>
    </div>
  );
}
