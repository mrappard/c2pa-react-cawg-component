import { CAWG_Header } from "../../CAWG_Header";
import { Manifest } from 'c2pa-react-component-types';
import "../styles/cawg.css";

const ROLE_LABELS: Record<string, string> = {
  'cawg.creator': 'Creator',
  'cawg.contributor': 'Contributor',
  'cawg.editor': 'Editor',
  'cawg.producer': 'Producer',
  'cawg.publisher': 'Publisher',
  'cawg.sponsor': 'Sponsor',
  'cawg.translator': 'Translator',
};

const IDENTITY_TYPE_LABELS: Record<string, string> = {
  'cawg.document_verification': 'ID Verified',
  'cawg.web_site': 'Website',
  'cawg.affiliation': 'Affiliation',
  'cawg.social_media': 'Social Media',
  'cawg.crypto_wallet': 'Crypto Wallet',
};

const TRAINING_LABELS: Record<string, string> = {
  'cawg.data_mining': 'Data Mining',
  'cawg.ai_inference': 'AI Inference',
  'cawg.ai_training': 'AI Training',
  'cawg.ai_generative_training': 'AI Generative Training',
};

const USE_CLASSES: Record<string, string> = {
  'allowed': 'cawg-use-badge cawg-use-allowed',
  'notAllowed': 'cawg-use-badge cawg-use-not-allowed',
  'constrained': 'cawg-use-badge cawg-use-constrained',
};

const USE_LABELS: Record<string, string> = {
  'allowed': 'Allowed',
  'notAllowed': 'Not Allowed',
  'constrained': 'Constrained',
};

const SIG_TYPE_LABELS: Record<string, string> = {
  'cawg.identity_claims_aggregation': 'Identity Claims Aggregation',
  'cawg.x509.cose': 'X.509 Certificate',
  'cawg.verifiable_credential_binding': 'Verifiable Credential',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

function formatMetaValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(v => formatMetaValue(v)).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([k]) => !k.startsWith('@'))
      .map(([k, v]) => `${k}: ${formatMetaValue(v)}`)
      .join('; ');
  }
  return String(value);
}

export interface CAWGL3Props {
  manifest: Manifest;
  moreInfo?: () => void;
}

export default function CAWGL3({ manifest, moreInfo }: CAWGL3Props) {
  const title = manifest.title;
  const claimGenerator = manifest.claimGenerator ?? manifest.claimGeneratorInfo?.[0]?.name ?? 'Unknown';
  const initials = claimGenerator.split(' ').filter(Boolean).map((n: string) => n[0].toUpperCase()).join('') || '?';

  const identityAssertion = manifest.assertions?.['cawg.identity'];
  const roles: string[] = identityAssertion?.signer_payload?.role ?? [];
  const verifiedIdentities: Record<string, unknown>[] = identityAssertion?.verifiedIdentities ?? [];
  const sigType: string | undefined = identityAssertion?.signer_payload?.sig_type;
  const issuer: string | undefined = identityAssertion?.issuer;

  const trainingAssertion = manifest.assertions?.['cawg.training-mining'];
  const trainingEntries: Record<string, { use: string; constraint_info?: string }> = trainingAssertion?.entries ?? {};

  const cawgMetadata = manifest.assertions?.['cawg.metadata'];
  const metadataFields = cawgMetadata
    ? Object.entries(cawgMetadata as Record<string, unknown>).filter(([k]) => !k.startsWith('@'))
    : [];

  return (
    <div className="cawg-card">
      <CAWG_Header />
      <div className="cawg-container">
        {manifest.thumbnail ? (
          <img src={manifest.thumbnail} alt="Thumbnail" className="cawg-thumbnail" />
        ) : (
          <div className="cawg-square">
            <span className="cawg-logo-text">{initials}</span>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="cawg-media-title">{title}</span>
          <span className="cawg-claim-generator">{claimGenerator}</span>
        </div>
      </div>

      {roles.length > 0 && (
        <div className="cawg-roles">
          {roles.map(role => (
            <span key={role} className="cawg-role-badge">{ROLE_LABELS[role] ?? role}</span>
          ))}
        </div>
      )}

      {identityAssertion && (
        <>
          <div className="cawg-divider" />
          <div className="cawg-section-title">Identity Assertion</div>

          {sigType && (
            <div className="cawg-key-value">
              <div className="cawg-key-value-label">Credential Type</div>
              <div className="cawg-key-value-value">{SIG_TYPE_LABELS[sigType] ?? sigType}</div>
            </div>
          )}
          {issuer && (
            <div className="cawg-key-value">
              <div className="cawg-key-value-label">Issuer</div>
              <div className="cawg-key-value-value">{issuer}</div>
            </div>
          )}

          {verifiedIdentities.length > 0 && (
            <div className="cawg-identity-list" style={{ marginTop: 12 }}>
              {verifiedIdentities.map((identity, i) => {
                const type = identity.type as string;
                const name = (identity.name ?? identity.username ?? identity.address) as string | undefined;
                const provider = identity.provider as { name: string } | undefined;
                const uri = identity.uri as string | undefined;
                const verifiedAt = identity.verifiedAt as string | undefined;
                return (
                  <div key={i} className="cawg-identity-item">
                    <div style={{ flex: 1 }}>
                      <div className="cawg-identity-type-label">{IDENTITY_TYPE_LABELS[type] ?? type}</div>
                      {name && <div className="cawg-identity-name">{name}</div>}
                      {provider?.name && <div className="cawg-identity-provider">via {provider.name}</div>}
                      {uri && (
                        <a href={uri} target="_blank" rel="noopener noreferrer" className="cawg-identity-link">
                          {uri}
                        </a>
                      )}
                      {verifiedAt && (
                        <div className="cawg-identity-meta">Verified {formatDate(verifiedAt)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {Object.keys(trainingEntries).length > 0 && (
        <>
          <div className="cawg-divider" />
          <div className="cawg-section-title">Training & Data Mining</div>
          <div className="cawg-training-list">
            {Object.entries(trainingEntries).map(([key, entry]) => (
              <div key={key} className="cawg-training-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span className="cawg-training-label">{TRAINING_LABELS[key] ?? key}</span>
                  <span className={USE_CLASSES[entry.use] ?? 'cawg-use-badge'}>
                    {USE_LABELS[entry.use] ?? entry.use}
                  </span>
                </div>
                {entry.constraint_info && (
                  <div className="cawg-constraint-info">{entry.constraint_info}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {metadataFields.length > 0 && (
        <>
          <div className="cawg-divider" />
          <div className="cawg-section-title">Metadata</div>
          {metadataFields.map(([key, value]) => {
            const formatted = formatMetaValue(value);
            if (!formatted) return null;
            return (
              <div key={key} className="cawg-key-value">
                <div className="cawg-key-value-label">{key}</div>
                <div className="cawg-key-value-value">{formatted}</div>
              </div>
            );
          })}
        </>
      )}

      {moreInfo && (
        <div style={{ marginTop: 16 }}>
          <button onClick={moreInfo} className="cawg-button">Small View</button>
        </div>
      )}
    </div>
  );
}
