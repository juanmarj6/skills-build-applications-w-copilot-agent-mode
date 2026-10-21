import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  responseKey: string;
  emptyText: string;
  renderItem: (item: T, index: number) => ReactNode;
};

export function CapabilityCard<T>({ title, description, endpoint, responseKey, emptyText, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(null);
    setHasError(false);

    void getJson<Record<string, unknown>>(endpoint)
      .then((payload) => {
        const result = payload[responseKey];
        if (!Array.isArray(result)) throw new Error(`Invalid ${responseKey} response`);
        if (active) setItems(result as T[]);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => {
      active = false;
    };
  }, [endpoint, responseKey]);

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
