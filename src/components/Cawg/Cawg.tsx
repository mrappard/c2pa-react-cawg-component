import React from 'react'

import { CAWGL1 } from './levels/L1/CAWGL1'
import CAWGL2 from './levels/L2/CAWGL2';
import CAWGL3 from './levels/L3/CAWGL3';
import { describeCawg } from './helper/describeCawg';
import { Manifest, ManifestEntry, PluginC2PA } from 'c2pa-react-component-types';

function entryToManifest(entry: ManifestEntry): Manifest {
  return {
    id: entry.id ?? '',
    title: entry.title ?? '',
    claimGenerator: entry.claimGenerator ?? null,
    claimGeneratorInfo: (entry.claimGeneratorInfo ?? []).map(c => ({
      name: c.name,
      'org.contentauth.c2pa_rs': c['org.contentauth.c2pa_rs'] ?? '',
    })),
    instanceId: entry.instanceId ?? '',
    signatureInfo: {
      alg: entry.signatureInfo?.alg ?? '',
      issuer: entry.signatureInfo?.issuer ?? '',
      common_name: entry.signatureInfo?.common_name ?? '',
      cert_serial_number: entry.signatureInfo?.cert_serial_number ?? '',
    },
    assertions: entry.assertions ?? {},
    credentials: (entry.credentials ?? []) as [],
    thumbnail: typeof entry.thumbnail === 'string' ? entry.thumbnail : null,
    ingredients: (entry.ingredients ?? []) as [],
  };
}

/** Options for {@link createCAWGManifest}. */
export interface CawgManifestOptions {
  /**
   * Show the W3C verifiable credentials behind identity assertions (identity
   * claims aggregation and verifiable credential binding) in the L3 view, as
   * a summary with a raw JSON toggle. Off by default.
   */
  showCredentials?: boolean;
  /** Called with an issuer's DID when it's clicked in the credentials section. */
  onIssuerClick?: (issuer: string) => void;
}

const KNOWN_ASSERTIONS = [
  'cawg.identity',
  'cawg.training-mining',
  'cawg.metadata',
  'cawg.creator',
  'cawg.contributor',
  'cawg.editor',
  'cawg.producer',
  'cawg.publisher',
  'cawg.sponsor',
  'cawg.translator',
  'cawg.document_verification',
  'cawg.web_site',
  'cawg.affiliation',
  'cawg.social_media',
  'cawg.crypto_wallet',
];

/**
 * Creates a CAWG plugin for `C2paManifest` with the given options, e.g.
 * `plugin={[createCAWGManifest({ showCredentials: true })]}`.
 * `CAWGManifest` is `createCAWGManifest()`.
 */
export function createCAWGManifest(options: CawgManifestOptions = {}): PluginC2PA {
  const { showCredentials = false, onIssuerClick } = options;

  const CAWGPlugin: PluginC2PA = ({ manifest, entry, level, className }) => {
    // Hooks run before any early return, so their order never changes between renders.
    const [levelOfDetail, setLevelOfDetail] = React.useState(level || 1);

    const activeManifestKey = manifest.manifestStore?.activeManifest;

    const activeManifest =
      entry != null
        ? entryToManifest(entry)
        : manifest.manifests.find(
            m => m.id === activeManifestKey || m.instanceId === activeManifestKey
          ) ??
          (activeManifestKey
            ? manifest.manifestStore!.manifests[activeManifestKey] as unknown as Manifest
            : undefined) ??
          manifest.manifests[0];

    if (!activeManifest) return null;

    const hasCawgData =
      activeManifest.assertions?.['cawg.identity'] != null ||
      activeManifest.assertions?.['cawg.training-mining'] != null ||
      activeManifest.assertions?.['cawg.metadata'] != null;

    if (!hasCawgData) return null;

    switch (levelOfDetail) {
      case 1: return <CAWGL1 className={className} manifest={activeManifest} moreInfo={() => setLevelOfDetail(2)} />
      case 2: return <CAWGL2 className={className} manifest={activeManifest} moreInfo={() => setLevelOfDetail(3)} />
      case 3: return (
        <CAWGL3
          className={className}
          manifest={activeManifest}
          moreInfo={() => setLevelOfDetail(1)}
          showCredentials={showCredentials}
          onIssuerClick={onIssuerClick}
        />
      )
    }

    return <div>Level Of Detail Not Selected</div>
  };

  CAWGPlugin.knownAssertions = KNOWN_ASSERTIONS;
  CAWGPlugin.describe = describeCawg;
  return CAWGPlugin;
}

export const CAWGManifest: PluginC2PA = createCAWGManifest();

export default CAWGManifest
