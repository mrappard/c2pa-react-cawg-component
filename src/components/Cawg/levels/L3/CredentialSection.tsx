import { useState } from 'react';
import { Manifest } from 'c2pa-react-component-types';
import { CREDENTIAL_SIG_TYPES, CawgCredential, getCawgCredentials, shortenDid } from '../../helper/getCawgCredentials';

export interface CredentialSectionProps {
  manifest: Manifest;
  /** Called with the issuer's DID when its name is clicked. Without it, the issuer is plain text. */
  onIssuerClick?: (issuer: string) => void;
}

/** The W3C verifiable credentials behind a manifest's CAWG identity assertions. */
export function CredentialSection({ manifest, onIssuerClick }: CredentialSectionProps) {
  const credentials = getCawgCredentials(manifest);
  if (credentials.length === 0) return null;

  return (
    <>
      <div className="cawg-divider" />
      <div className="cawg-section-title">{credentials.length === 1 ? 'Credential' : `Credentials (${credentials.length})`}</div>
      <div className="cawg-credential-list">
        {credentials.map(c => (
          <CredentialCard key={c.label} credential={c} onIssuerClick={onIssuerClick} />
        ))}
      </div>
    </>
  );
}

function formatDateTime(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/** Where now falls relative to the credential's validity period (display only; c2pa-rs does the validation). */
function validityOf(c: CawgCredential): { label: string; className: string } | undefined {
  const now = Date.now();
  const from = c.validFrom ? Date.parse(c.validFrom) : NaN;
  const until = c.validUntil ? Date.parse(c.validUntil) : NaN;
  if (!Number.isNaN(from) && now < from) return { label: 'Not yet valid', className: 'cawg-credential-badge-warn' };
  if (!Number.isNaN(until) && now > until) return { label: 'Expired', className: 'cawg-credential-badge-warn' };
  if (!Number.isNaN(from)) return { label: 'In validity period', className: 'cawg-credential-badge-ok' };
  return undefined;
}

function subjectText(s: Record<string, unknown>): string {
  const pick = (k: string) => (typeof s[k] === 'string' ? (s[k] as string) : undefined);
  const name = pick('name') ?? pick('username') ?? pick('address') ?? pick('uri');
  return [pick('type'), name].filter(Boolean).join(' · ') || pick('id') || 'Subject';
}

function CredentialCard({ credential: c, onIssuerClick }: { credential: CawgCredential; onIssuerClick?: (issuer: string) => void }) {
  const [raw, setRaw] = useState(false);
  const validity = validityOf(c);
  const referenced = c.bindings.flatMap(b => {
    const list = b.referencedAssertions ?? b.referenced_assertions;
    return Array.isArray(list) ? list : [];
  });
  const roles = c.bindings.flatMap(b => (Array.isArray(b.role) ? b.role : []));
  const issuerId = shortenDid(c.issuer.id);
  const issuerLabel = c.issuer.name ? `${c.issuer.name} (${issuerId})` : issuerId;

  return (
    <details className="cawg-credential">
      <summary>
        <span className="cawg-credential-kind">{CREDENTIAL_SIG_TYPES[c.sigType]}</span>
        {validity && <span className={`cawg-credential-badge ${validity.className}`}>{validity.label}</span>}
      </summary>

      <div className="cawg-credential-tabs" role="tablist">
        <button role="tab" aria-selected={!raw} className="cawg-credential-tab" onClick={() => setRaw(false)}>
          Summary
        </button>
        <button role="tab" aria-selected={raw} className="cawg-credential-tab" onClick={() => setRaw(true)}>
          Raw JSON
        </button>
      </div>

      {raw ? (
        <pre className="cawg-credential-raw">{JSON.stringify(c.raw, null, 2)}</pre>
      ) : (
        <>
          <div className="cawg-key-value">
            <div className="cawg-key-value-label">Issuer</div>
            <div className="cawg-key-value-value">
              {onIssuerClick ? (
                <button
                  className="cawg-credential-link"
                  onClick={() => onIssuerClick(c.issuer.id)}
                  title={`Look up ${c.issuer.id}`}
                  aria-label={c.issuer.id}
                >
                  {issuerLabel}
                </button>
              ) : (
                <span title={c.issuer.id}>{issuerLabel}</span>
              )}
            </div>
          </div>

          <div className="cawg-key-value">
            <div className="cawg-key-value-label">Type</div>
            <div className="cawg-key-value-value">{c.types.join(', ')}</div>
          </div>

          {(c.validFrom || c.validUntil) && (
            <div className="cawg-key-value">
              <div className="cawg-key-value-label">Validity</div>
              <div className="cawg-key-value-value">
                {c.validFrom && <>From {formatDateTime(c.validFrom)}</>}
                {c.validFrom && c.validUntil && <br />}
                {c.validUntil && <>Until {formatDateTime(c.validUntil)}</>}
              </div>
            </div>
          )}

          {c.subjects.length > 0 && (
            <div className="cawg-key-value">
              <div className="cawg-key-value-label">
                {c.sigType === 'cawg.identity_claims_aggregation' ? 'Verified identities' : 'Subjects'} ({c.subjects.length})
              </div>
              <ul className="cawg-credential-subjects">
                {c.subjects.map((s, i) => (
                  <li key={i}>{subjectText(s)}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="cawg-key-value">
            <div className="cawg-key-value-label">Asset binding</div>
            <div className="cawg-key-value-value">
              {referenced.length} referenced assertion{referenced.length === 1 ? '' : 's'}
              {roles.length > 0 && <> · role {roles.join(', ')}</>}
            </div>
          </div>

          <div className="cawg-key-value">
            <div className="cawg-key-value-label">Status</div>
            <div className="cawg-key-value-value">
              {c.status.length
                ? c.status.map(s => [s.type, s.statusPurpose].filter(Boolean).join(' · ')).join('; ')
                : 'No revocation status published'}
            </div>
          </div>

          {c.schemas.length > 0 && (
            <div className="cawg-key-value">
              <div className="cawg-key-value-label">Schema</div>
              <div className="cawg-key-value-value">
                {c.schemas.map(s => (
                  <div key={s.id}>
                    <a href={s.id} target="_blank" rel="noopener noreferrer" className="cawg-identity-link">
                      {s.id}
                    </a>
                    {s.type && <> ({s.type})</>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </details>
  );
}
