import { useTrustRegistryQuery, TrustRegistryQueryFn } from './trqp';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

export interface TrustBadgeProps {
  entityId?: string;
  action?: string;
  resource?: string;
  variant?: 'compact' | 'full';
  queryFn?: TrustRegistryQueryFn;
}

// Network Traffic Blocked by Policy
// Identity Credential Was Revoked
const identityWasVerified = "Identity Verified by Trust Registry";
const couldNotVerify = "Identity Unable to be Verified by Trust Registry"; 



export function TrustBadge({ entityId, action, resource, variant = 'full', queryFn }: TrustBadgeProps) {
  const { status, result, error } = useTrustRegistryQuery(entityId, action, resource, queryFn);

  if (!entityId) return null;

  if (status === 'error') {
    return (
      <span className="cawg-trust-badge cawg-trust-unverified" title={error?.message}>
        Unable to reach trust registry
      </span>
    );
  }

  if (status !== 'done' || !result) {
    return <span className="cawg-trust-badge cawg-trust-pending">Checking trust registry…</span>;
  }

  const badge = (
    <span
      className={result.authorized ? 'cawg-trust-badge cawg-trust-verified' : 'cawg-trust-badge cawg-trust-unverified'}
      title={
        result.authorized
          ? `Recognized by ${result.authority_id} · checked ${formatDate(result.time_evaluated)}`
          : result.message
      }
    >
      {result.authorized ? identityWasVerified : couldNotVerify}
    </span>
  );

  if (variant === 'compact') return badge;

  return (
    <div className="cawg-trust-status">
      {badge}
      {result.authorized ? (
        <div className="cawg-trust-meta">
          {result.authority_id} · checked {formatDate(result.time_evaluated)}
        </div>
      ) : (
        result.message && <div className="cawg-trust-message">{result.message}</div>
      )}
    </div>
  );
}
