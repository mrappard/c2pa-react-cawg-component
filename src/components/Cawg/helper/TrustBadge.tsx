import { useTrustRegistryQuery, useTrustRegistrySummary, QueryStatus, TrqpAuthorizationResponse, TrustRegistryQueryFn } from './trqp';
import type { TrustRegistryEntry } from './getSignerPayload';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

// Network Traffic Blocked by Policy
// Identity Credential Was Revoked
const identityWasVerified = "Identity Verified by Trust Registry";
const couldNotVerify = "Identity Unable to be Verified by Trust Registry";

function renderStatus(
  status: QueryStatus,
  result: TrqpAuthorizationResponse | null,
  error: Error | null,
  variant: 'compact' | 'full',
) {
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

export interface TrustBadgeProps {
  entityId?: string;
  action?: string;
  resource?: string;
  authorityId?: string;
  trqpAuthorizationUri?: string;
  variant?: 'compact' | 'full';
  queryFn?: TrustRegistryQueryFn;
}

export function TrustBadge({ entityId, action, resource, authorityId, trqpAuthorizationUri, variant = 'full', queryFn }: TrustBadgeProps) {
  const { status, result, error } = useTrustRegistryQuery(entityId, action, resource, authorityId, trqpAuthorizationUri, queryFn);

  if (!entityId) return null;
  if (status === 'done' && result?.hide) return null;

  return (
    <>
      {status === 'done' && result?.icon && <img src={result.icon} alt="" className="cawg-trust-icon" />}
      {renderStatus(status, result, error, variant)}
    </>
  );
}

export interface TrustRegistryRowProps {
  entry: TrustRegistryEntry;
  variant?: 'compact' | 'full';
  showEntity?: boolean;
  queryFn?: TrustRegistryQueryFn;
}

/**
 * Renders one trust_registry entry as a full row (authority/action/resource/link
 * plus its trust status). Queries only once for the row: if the result comes back
 * with `hide: true` the whole row is omitted, as if the entry didn't exist; if it
 * comes back with an `icon` URL, that image is placed at the front of the row.
 */
export function TrustRegistryRow({ entry, variant = 'full', showEntity = false, queryFn }: TrustRegistryRowProps) {
  const { status, result, error } = useTrustRegistryQuery(
    entry.entity_id,
    entry.action,
    entry.resource,
    entry.authority_id,
    entry.trqp_authorization_uri,
    queryFn,
  );

  if (status === 'done' && result?.hide) return null;

  return (
    <div className="cawg-identity-item">
      {status === 'done' && result?.icon && <img src={result.icon} alt="" className="cawg-trust-icon" />}
      <div style={{ flex: 1 }}>
        {entry.authority_id && <div className="cawg-identity-name">Authority: {entry.authority_id}</div>}
        {showEntity && entry.entity_id && <div className="cawg-identity-provider">Entity: {entry.entity_id}</div>}
        {entry.action && <div className="cawg-identity-meta">Action: {entry.action}</div>}
        {entry.resource && <div className="cawg-identity-meta">Resource: {entry.resource}</div>}
        {entry.trqp_authorization_uri && (
          <a href={entry.trqp_authorization_uri} target="_blank" rel="noopener noreferrer" className="cawg-identity-link">
            {entry.trqp_authorization_uri}
          </a>
        )}
        {renderStatus(status, result, error, variant)}
      </div>
    </div>
  );
}

export interface TrustRegistrySummaryBadgeProps {
  entries: TrustRegistryEntry[];
  variant?: 'compact' | 'full';
  queryFn?: TrustRegistryQueryFn;
}

/**
 * Reduces every trust_registry entry to one badge: authorized only if all entries
 * pass, so a single failing entry is enough to show the negative message overall.
 */
export function TrustRegistrySummaryBadge({ entries, variant = 'compact', queryFn }: TrustRegistrySummaryBadgeProps) {
  const { status, results, error } = useTrustRegistrySummary(entries, queryFn);

  if (entries.filter(e => e.entity_id).length === 0) return null;

  if (status === 'error') {
    return (
      <span className="cawg-trust-badge cawg-trust-unverified" title={error?.message}>
        Unable to reach trust registry
      </span>
    );
  }

  if (status !== 'done') {
    return <span className="cawg-trust-badge cawg-trust-pending">Checking trust registry…</span>;
  }

  const visible = results.filter(r => !r.hide);
  if (visible.length === 0) return null;

  const authorized = visible.every(r => r.authorized);
  const failures = visible.filter(r => !r.authorized);
  const iconUrl = visible.find(r => r.icon)?.icon;

  const title = authorized
    ? `Recognized by ${Array.from(new Set(visible.map(r => r.authority_id))).join(', ')}`
    : failures.map(r => r.message).filter(Boolean).join(' · ') || undefined;

  const badge = (
    <span
      className={authorized ? 'cawg-trust-badge cawg-trust-verified' : 'cawg-trust-badge cawg-trust-unverified'}
      title={title}
    >
      {authorized ? identityWasVerified : couldNotVerify}
    </span>
  );

  if (variant === 'compact') {
    return (
      <>
        {iconUrl && <img src={iconUrl} alt="" className="cawg-trust-icon" />}
        {badge}
      </>
    );
  }

  return (
    <div className="cawg-trust-status">
      {iconUrl && <img src={iconUrl} alt="" className="cawg-trust-icon" />}
      {badge}
      {authorized ? (
        <div className="cawg-trust-meta">
          {Array.from(new Set(visible.map(r => r.authority_id))).join(', ')} · checked{' '}
          {formatDate(visible[0].time_evaluated)}
        </div>
      ) : (
        title && <div className="cawg-trust-message">{title}</div>
      )}
    </div>
  );
}
