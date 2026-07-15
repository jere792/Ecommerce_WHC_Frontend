import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Search } from 'lucide-react';

type SelectOption = { value: number; label: string };

type FilterField = {
  label?: string;
  placeholder?: string;
  width?: string;
} & (
  | { type: 'search' | 'number'; value: string; onChange: (value: string) => void }
  | { type: 'date'; value: string; onChange: (value: string) => void }
  | { type: 'select'; value: number; onChange: (value: number) => void; options: SelectOption[] }
  | { type: 'range'; min: string; max: string; onMinChange: (value: string) => void; onMaxChange: (value: string) => void; minLimit?: number; maxLimit?: number }
);

interface FilterBarProps {
  title: string;
  fields: FilterField[];
  fields2?: FilterField[];
  onClear?: () => void;
  alwaysShow?: boolean;
  showMoreLabel?: string;
  showLessLabel?: string;
}

const inputClass = "border rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

export default function FilterBar({ title, fields, fields2, onClear, alwaysShow, showMoreLabel = 'Mostrar avanzados', showLessLabel = 'Ocultar avanzados' }: FilterBarProps) {
  const [showFields2, setShowFields2] = useState(alwaysShow ?? false);
  const showToggle = fields2 && !alwaysShow;

  return (
    <div className="p-4 border border-border rounded-lg bg-background mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Filtros de {title}</h3>
          {showToggle && (
            <button
              onClick={() => setShowFields2(!showFields2)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showFields2 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showFields2 ? showLessLabel : showMoreLabel}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onClear && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
      <hr className="border-t border-border mb-4" />
      <div className="flex flex-wrap items-start gap-4">
        {fields.map((f, i) => (
          <FilterField key={i} field={f} />
        ))}
      </div>
      {fields2 && (alwaysShow || showFields2) && (
        <div className="flex flex-wrap items-start gap-4 mt-4">
          {fields2.map((f, i) => (
            <FilterField key={i} field={f} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterField({ field }: { field: FilterField }) {
  const widths: Record<string, string> = {
    search: 'flex-1 min-w-[220px]',
    number: 'w-28',
    select: 'flex-1 min-w-[200px]',
    range: 'min-w-[420px] max-w-[420px]',
  };

  return (
    <div className={`flex flex-col gap-1 ${field.width || widths[field.type] || ''}`}>
      {field.label && (
        <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
      )}
      {field.type === 'search' && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={field.placeholder}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            className={`${inputClass} pl-9 w-full`}
          />
        </div>
      )}
      {field.type === 'number' && (
        <input
          type="number"
          placeholder={field.placeholder}
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          className={`${inputClass} w-full`}
        />
      )}
      {field.type === 'date' && (
        <input
          type="date"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          className={`${inputClass} w-full`}
        />
      )}
      {field.type === 'select' && (
        <select
          value={field.value}
          onChange={(e) => field.onChange(Number(e.target.value))}
          className={`${inputClass} w-full pr-8 appearance-none`}
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
      {field.type === 'range' && (
        <DoubleRangeSlider
          min={field.min}
          max={field.max}
          onMinChange={field.onMinChange}
          onMaxChange={field.onMaxChange}
          minLimit={field.minLimit}
          maxLimit={field.maxLimit}
        />
      )}
    </div>
  );
}

function DoubleRangeSlider({
  min,
  max,
  onMinChange,
  onMaxChange,
  minLimit = 0,
  maxLimit = 1000,
}: {
  min: string;
  max: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  minLimit?: number;
  maxLimit?: number;
}) {
  const clamp = useCallback((v: number, lo: number, hi: number) =>
    Math.min(Math.max(v, lo), hi), []);

  const minVal = clamp(Number(min) || minLimit, minLimit, maxLimit);
  const maxVal = clamp(Number(max) || maxLimit, minLimit, maxLimit);
  const range = maxLimit - minLimit || 1;
  const leftPct = ((minVal - minLimit) / range) * 100;
  const rightPct = ((maxLimit - maxVal) / range) * 100;

  return (
    <div className="w-full pt-1">
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-muted" />
        <div
          className="absolute h-1.5 rounded-full bg-primary"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          value={minVal}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= maxVal) onMinChange(String(v));
          }}
          className="absolute inset-x-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          value={maxVal}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= minVal) onMaxChange(String(v));
          }}
          className="absolute inset-x-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-sm text-foreground mt-1.5">
        <span>S/{minVal}</span>
        <span>S/{maxVal}</span>
      </div>
    </div>
  );
}
