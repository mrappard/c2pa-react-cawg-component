import { useEffect, useState } from 'react';
import type { TrustRegistryEntry } from './getSignerPayload';

export interface TrqpAuthorizationResponse {
  entity_id: string;
  authority_id: string;
  action: string;
  resource: string;
  authorized: boolean;
  time_requested: string;
  time_evaluated: string;
  message?: string;
  /** Image URL rendered at the front of the trust registry row, if provided. */
  icon?: string;
  hide?: boolean;
}

export type TrustRegistryQueryFn = (params: {
  entityId: string;
  action?: string;
  resource?: string;
  authorityId?: string;
  trqpAuthorizationUri?: string;
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

export type QueryStatus = 'idle' | 'loading' | 'done' | 'error';

export function useTrustRegistryQuery(
  entityId: string | undefined,
  action?: string,
  resource?: string,
  authorityId?: string,
  trqpAuthorizationUri?: string,
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

    queryFn({ entityId, action, resource, authorityId, trqpAuthorizationUri }).then(
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
  }, [entityId, action, resource, authorityId, trqpAuthorizationUri, queryFn]);

  return { status, result, error };
}

/**
 * Queries the trust registry for every entry and reduces the results to a single
 * pass/fail: authorized only when every entry comes back authorized, so one failing
 * registry entry is enough to flip the overall status to unauthorized.
 */
export function useTrustRegistrySummary(
  entries: TrustRegistryEntry[],
  queryFn: TrustRegistryQueryFn = getTrustRegistryQueryFn(),
) {
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [results, setResults] = useState<TrqpAuthorizationResponse[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const validEntries = entries.filter((e): e is TrustRegistryEntry & { entity_id: string } => !!e.entity_id);
  const key = validEntries
    .map(e => `${e.entity_id}|${e.action ?? ''}|${e.resource ?? ''}|${e.authority_id ?? ''}|${e.trqp_authorization_uri ?? ''}`)
    .join(',');

  useEffect(() => {
    if (validEntries.length === 0) {
      setStatus('idle');
      setResults([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(null);

    Promise.all(
      validEntries.map(e =>
        queryFn({
          entityId: e.entity_id,
          action: e.action,
          resource: e.resource,
          authorityId: e.authority_id,
          trqpAuthorizationUri: e.trqp_authorization_uri,
        }),
      ),
    ).then(
      res => {
        if (!cancelled) {
          setResults(res);
          setStatus('done');
        }
      },
      (err: unknown) => {
        if (!cancelled) {
          setResults([]);
          setError(err instanceof Error ? err : new Error(String(err)));
          setStatus('error');
        }
      },
    );

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, queryFn]);

  return { status, results, error };
}
