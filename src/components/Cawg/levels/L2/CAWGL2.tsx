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

export interface CAWGL2Props {
  manifest: Manifest;
  moreInfo?: () => void;
}

export default function CAWGL2({ manifest, moreInfo }: CAWGL2Props) {
  const title = manifest.title;
  const claimGenerator = manifest.claimGenerator ?? manifest.claimGeneratorInfo?.[0]?.name ?? 'Unknown';
  const initials = claimGenerator.split(' ').filter(Boolean).map((n: string) => n[0].toUpperCase()).join('') || '?';

  const identityAssertion = manifest.assertions?.['cawg.identity'];
  const roles: string[] = identityAssertion?.signer_payload?.role ?? [];
  const verifiedIdentities: Record<string, unknown>[] = identityAssertion?.verifiedIdentities ?? [];

  const trainingAssertion = manifest.assertions?.['cawg.training-mining'];
  const trainingEntries: Record<string, { use: string; constraint_info?: string }> = trainingAssertion?.entries ?? {};

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

      {verifiedIdentities.length > 0 && (
        <>
          <div className="cawg-divider" />
          <div className="cawg-section-title">Identity</div>
          <div className="cawg-identity-list">
            {verifiedIdentities.map((identity, i) => {
              const type = identity.type as string;
              const name = (identity.name ?? identity.username) as string | undefined;
              const provider = identity.provider as { name: string } | undefined;
              return (
                <div key={i} className="cawg-identity-item">
                  <div style={{ flex: 1 }}>
                    <div className="cawg-identity-type-label">{IDENTITY_TYPE_LABELS[type] ?? type}</div>
                    {name && <div className="cawg-identity-name">{name}</div>}
                    {provider?.name && <div className="cawg-identity-provider">{provider.name}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {Object.keys(trainingEntries).length > 0 && (
        <>
          <div className="cawg-divider" />
          <div className="cawg-section-title">Training & Data Mining</div>
          <div className="cawg-training-list">
            {Object.entries(trainingEntries).map(([key, entry]) => (
              <div key={key} className="cawg-training-item">
                <span className="cawg-training-label">{TRAINING_LABELS[key] ?? key}</span>
                <span className={USE_CLASSES[entry.use] ?? 'cawg-use-badge'}>
                  {USE_LABELS[entry.use] ?? entry.use}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {moreInfo && (
        <div style={{ marginTop: 16 }}>
          <button onClick={moreInfo} className="cawg-button">More Info</button>
        </div>
      )}
    </div>
  );
}
