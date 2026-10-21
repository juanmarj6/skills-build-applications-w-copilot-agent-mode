import { useEffect, useState } from 'react';

type JsonLoader = (path: string) => Promise<unknown>;

export function useApiList<T>(endpoint: string, responseKey: string, load: JsonLoader) {
  const [items, setItems] = useState<T[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(null);
    setHasError(false);

    void load(endpoint)
      .then((payload) => {
        if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
          throw new Error(`Invalid ${responseKey} response`);
        }
        const result = (payload as Record<string, unknown>)[responseKey];
        if (!Array.isArray(result)) throw new Error(`Invalid ${responseKey} response`);
        if (active) setItems(result as T[]);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => {
      active = false;
    };
  }, [endpoint, load, responseKey]);

  return { items, hasError };
}