import { type ReactNode } from 'react';

export interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No se encontraron registros',
}: DataTableProps<T>) {
  return (
    <div className="bg-background rounded-lg shadow overflow-x-auto">
      <table className="w-full table-fixed">
        <thead className="bg-muted">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-5 py-3.5 text-sm font-medium text-muted-foreground ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-muted transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className={`px-5 py-3.5 text-sm text-foreground ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`} style={col.width ? { width: col.width } : undefined}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
