import type { ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  items: T[] | null;
  hasError: boolean;
  emptyText: string;
  renderItem: (item: T, index: number) => ReactNode;
};

export function CapabilityCard<T>({ title, description, items, hasError, emptyText, renderItem }: Props<T>) {
  return (
    <section className="card">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {hasError ? (
          <p role="alert">Unable to load {title.toLowerCase()}.</p>
        ) : items === null ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p>{emptyText}</p>
        ) : (
          <ul className="list-group list-group-flush">{items.map(renderItem)}</ul>
        )}
      </div>
    </section>
  );
}
