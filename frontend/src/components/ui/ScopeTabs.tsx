type ScopeTabsProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
};

export function ScopeTabs<T extends string>({ value, onChange, options }: ScopeTabsProps<T>) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            value === option.value
              ? 'bg-voo text-white'
              : 'border border-nuvem bg-white text-solo hover:bg-bruma'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
