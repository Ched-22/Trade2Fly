import { Link } from 'react-router-dom';

type ToolCardProps = {
  icon: string;
  title: string;
  sub: string;
  path: string;
};

export function ToolCard({ icon, title, sub, path }: ToolCardProps) {
  return (
    <Link
      to={path}
      className="block rounded-lg border border-nuvem bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3.5 flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-voo-light text-xl">
        {icon}
      </div>
      <div className="mb-1.5 font-display text-base font-bold text-solo">{title}</div>
      <div className="text-sm leading-snug text-cinza">{sub}</div>
    </Link>
  );
}
