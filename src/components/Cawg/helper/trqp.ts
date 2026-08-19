import { useEffect, useState } from 'react';

export interface TrqpAuthorizationResponse {
  entity_id: string;
  authority_id: string;
  action: string;
  resource: string;
  authorized: boolean;
  time_requested: string;
  time_evaluated: string;
  message?: string;
}

export type TrustRegistryQueryFn = (params: {
  entityId: string;
  action?: string;
  resource?: string;
}) => Promise<TrqpAuthorizationResponse>;

export async function queryTrustRegistry(): Promise<TrqpAuthorizationResponse> {
  throw new Error(
    'No trust registry query function configured. Call `setTrustRegistryQueryFn` (or pass a `queryFn` prop to TrustBadge) with a function that queries a real TRQP endpoint.',
  );
}

let activeQueryFn: TrustRegistryQueryFn = queryTrustRegistry;

/**
 * Overrides the default TRQP query function used by every TrustBadge / useTrustRegistryQuery
 * call that doesn't receive an explicit `queryFn`. Call once at app startup.
 */
export function setTrustRegistryQueryFn(fn: TrustRegistryQueryFn): void {
  activeQueryFn = fn;
}

export function getTrustRegistryQueryFn(): TrustRegistryQueryFn {
  return activeQueryFn;
}

type QueryStatus = 'idle' | 'loading' | 'done' | 'error';

export function useTrustRegistryQuery(
  entityId: string | undefined,
  action?: string,
  resource?: string,
  queryFn: TrustRegistryQueryFn = getTrustRegistryQueryFn(),
) {
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [result, setResult] = useState<TrqpAuthorizationResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!entityId) {
      setStatus('idle');
      setResult(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(null);

    queryFn({ entityId, action, resource }).then(
      res => {
        if (!cancelled) {
          setResult(res);
          setStatus('done');
        }
      },
      (err: unknown) => {
        if (!cancelled) {
          setResult(null);
          setError(err instanceof Error ? err : new Error(String(err)));
          setStatus('error');
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [entityId, action, resource, queryFn]);

  return { status, result, error };
}
