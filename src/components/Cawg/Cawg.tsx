import React from 'react'

import { CAWGL1 } from './levels/L1/CAWGL1'
import CAWGL2 from './levels/L2/CAWGL2';
import CAWGL3 from './levels/L3/CAWGL3';
import { Manifest, PluginC2PA } from 'c2pa-react-component-types';

export const CAWGManifest: PluginC2PA = ({ manifest, level, className }) => {
  const activeManifestKey = manifest.manifestStore?.activeManifest;
  const activeManifest =
    manifest.manifests.find(
      m => m.id === activeManifestKey || m.instanceId === activeManifestKey
    ) ??
    (activeManifestKey
      ? manifest.manifestStore!.manifests[activeManifestKey] as unknown as Manifest
      : undefined) ??
    manifest.manifests[0];

  if (!activeManifest) {
    return <div className={className}>No active manifest found.</div>
  }

  const [levelOfDetail, setLevelOfDetail] = React.useState(level || 1)


  switch (levelOfDetail) {
    case 1: return <CAWGL1 manifest={activeManifest} moreInfo={()=>{
      setLevelOfDetail(2);
    }} />
    case 2: return <CAWGL2 manifest={activeManifest} moreInfo={()=>{
      setLevelOfDetail(3);
    }}  />
    case 3: return <CAWGL3 manifest={activeManifest} moreInfo={()=>{
      setLevelOfDetail(1);
    }}/>
  }

   return <div>Level Of Detail Not Selected</div>
}

export default CAWGManifest
