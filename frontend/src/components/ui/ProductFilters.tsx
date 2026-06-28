import { Search } from 'lucide-react';
import type { MarcaProducto } from '../../lib/supabaseTypes';

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  brandFilter: number;
  onBrandFilterChange: (value: number) => void;
  brands: MarcaProducto[];
}

export default function ProductFilters({
  search,
  onSearchChange,
  brandFilter,
  onBrandFilterChange,
  brands,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 border border-border rounded-lg bg-background">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>
      <select
        value={brandFilter}
        onChange={(e) => onBrandFilterChange(Number(e.target.value))}
        className="border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      >
        <option value={0}>Todas las marcas</option>
        {brands.map((b) => (
          <option key={b.id_marca_producto} value={b.id_marca_producto}>
            {b.nombre_marca_producto}
          </option>
        ))}
      </select>
    </div>
  );
}
