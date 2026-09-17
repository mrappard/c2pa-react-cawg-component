import { CAWG_Header } from "../../CAWG_Header";
import { Manifest } from 'c2pa-react-component-types';
import "../styles/cawg.css";
import { getBestUserName } from "../../helper/getBestUserName";
import { getSignerPayload } from "../../helper/getSignerPayload";
import { useTrustRegistrySummary } from "../../helper/trqp";

const couldNotVerify = "Identity Unable to be Verified by Trust Registry";

const ROLE_LABELS: Record<string, string> = {
  'cawg.creator': 'Creator',
  'cawg.contributor': 'Contributor',
  'cawg.editor': 'Editor',
  'cawg.producer': 'Producer',
  'cawg.publisher': 'Publisher',
  'cawg.sponsor': 'Sponsor',
  'cawg.translator': 'Translator',
};

export interface CAWGL1Props {
  manifest: Manifest;
  moreInfo?: () => void;
  className?: string;
}

export function CAWGL1({ className, manifest, moreInfo }: CAWGL1Props) {
  const title = manifest.title;
  const claimGenerator = manifest.claimGenerator ?? manifest.claimGeneratorInfo?.[0]?.name ?? 'Unknown';
  
  const creatorName = getBestUserName(manifest.assertions?.['cawg.identity']?.verifiedIdentities, manifest.assertions?.["cawg.metadata"]);

  const initials = claimGenerator.split(' ').filter(Boolean).map((n: string) => n[0].toUpperCase()).join('') || '?';

  const identityAssertion = manifest.assertions?.['cawg.identity'];
  const signerPayload = getSignerPayload(identityAssertion);
  const roles: string[] = signerPayload?.role ?? [];

  const trustRegistries = signerPayload?.trust_registry ?? [];
  const { status: trustStatus, results: trustResults } = useTrustRegistrySummary(trustRegistries);
  const visibleTrustResults = trustResults.filter(r => !r.hide);
  const hasTrustFailure = trustStatus === 'done' && visibleTrustResults.some(r => !r.authorized);

  return (
    <div className={`cawg-card ${className ?? ''}`}>
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
          <span className="cawg-creators-name">{creatorName}</span>
        </div>
      </div>

      {hasTrustFailure && (
        <div style={{ marginTop: 12 }}>
          <span className="cawg-trust-badge cawg-trust-unverified">{couldNotVerify}</span>
        </div>
      )}

      {roles.length > 0 && (
        <div className="cawg-roles">
          {roles.map(role => (
            <span key={role} className="cawg-role-badge">
              {ROLE_LABELS[role] ?? role}
            </span>
          ))}
        </div>
      )}

      {moreInfo && (
        <div style={{ marginTop: 16 }}>
          <button onClick={moreInfo} className="cawg-button">More Info</button>
        </div>
      )}
    </div>
  );
}
