import React from 'react'

import { CAWGL1 } from './levels/L1/CAWGL1'
import CAWGL2 from './levels/L2/CAWGL2';
import CAWGL3 from './levels/L3/CAWGL3';
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

export const CAWGManifest: PluginC2PA = ({ manifest, entry, level, className }) => {
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

  const [levelOfDetail, setLevelOfDetail] = React.useState(level || 1)


  switch (levelOfDetail) {
    case 1: return <CAWGL1 className={className} manifest={activeManifest} moreInfo={()=>{
      setLevelOfDetail(2);
    }} />
    case 2: return <CAWGL2 className={className} manifest={activeManifest} moreInfo={()=>{
      setLevelOfDetail(3);
    }}  />
    case 3: return <CAWGL3 className={className} manifest={activeManifest} moreInfo={()=>{
      setLevelOfDetail(1);
    }}/>
  }

   return <div>Level Of Detail Not Selected</div>
}

  CAWGManifest.knownAssertions = [
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
  ]

export default CAWGManifest
