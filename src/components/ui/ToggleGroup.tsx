interface ToggleOption<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (val: T) => void;
  options: ToggleOption<T>[];
}) {
  return (
    <div className="flex bg-gray-700 border border-gray-600 rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          aria-label={opt.label}
          className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-1 ${
            value === opt.value
              ? "bg-gray-800 text-gray-100 shadow-sm"
              : "text-gray-400"
          }`}
          onClick={() => !opt.disabled && onChange(opt.value)}
          disabled={opt.disabled}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  );
}
export default ToggleGroup;
