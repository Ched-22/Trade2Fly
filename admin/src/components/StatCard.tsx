type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-nuvem bg-white p-4 shadow-sm">
      <div className="text-sm text-cinza">{label}</div>
      <div className="mt-1 font-mono text-2xl font-bold text-solo">{value}</div>
      {hint ? <div className="mt-1 text-xs text-cinza">{hint}</div> : null}
    </div>
  );
}

type BarChartProps = {
  title: string;
  items: { label: string; value: number }[];
};

export function BarChart({ title, items }: BarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="rounded-xl border border-nuvem bg-white p-4">
      <h3 className="mb-4 font-display font-bold">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="truncate pr-2">{item.label}</span>
              <span className="font-mono">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-bruma">
              <div
                className="h-2 rounded-full bg-voo"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
