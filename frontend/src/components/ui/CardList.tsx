import { type ReactNode } from 'react';

export interface CardField<T> {
  label?: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface CardListProps<T> {
  fields: CardField<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

export default function CardList<T>({
  fields,
  data,
  keyExtractor,
  emptyMessage = 'No se encontraron registros',
}: CardListProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-background rounded-lg border border-border">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((item) => (
        <div
          key={keyExtractor(item)}
          className="bg-background rounded-lg border border-border p-5 hover:shadow-md transition-shadow"
        >
          {fields.map((field, i) => (
            <div key={i} className={field.className ?? `${i > 0 ? 'mt-3' : ''}`}>
              {field.label && (
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  {field.label}
                </span>
              )}
              {field.render(item)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
