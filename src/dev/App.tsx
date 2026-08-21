import { useState } from 'react'
import { CAWGManifest } from '../components/Cawg/Cawg'
import { setTrustRegistryQueryFn } from '../components/Cawg/helper/trqp'
import type { TrqpAuthorizationResponse } from '../components/Cawg/helper/trqp'
import type { VerificationOutcome } from 'c2pa-react-component-types'

import carEsPs from '../../examples/car-es-Ps-Cr.json'
import chatGptImage from '../../examples/ChatGPT_Image.json'
import cloudscape from '../../examples/cloudscape-ACA-Cr.json'
import craterLake from '../../examples/crater-lake-cr.json'
import createdExample from '../../examples/createdExample.json'
import fireflyTabby from '../../examples/Firefly_tabby_cat.json'
import identityExample from '../../examples/cawg-identity-example.json'
import identityIcaRealExample from '../../examples/cawg-identity-ica-real-example.json'
import trqpAuthorizationUnverified from '../../examples/trqp-identity-example.json'
import trqpAuthorizationVerified from '../../examples/trqp-identity-verified-example.json'

// Dev-only mock so the playground can demonstrate TrustBadge without a real TRQP endpoint.
// Consumers of the published package must call setTrustRegistryQueryFn themselves.
const MOCK_TRUST_REGISTRY: Record<string, { authority_id: string }> = {
  'did:web:connected-identities.identity.adobe.com': { authority_id: 'did:web:contentauthenticity.org' },
  'did:web:creatorassertions.org': { authority_id: 'did:web:creatorassertions.org' },
  'did:jwk:eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5IiwieCI6Imx0RzZINmxHSFZKUDdETDhycjV0WWdYSHh4ZDdrSlEwUG53RVQyd3RiM2MifQ': { authority_id: 'https://mix-o-tron.com' },
}

setTrustRegistryQueryFn(async ({ entityId, action = 'issue', resource = 'cawg.identity' }): Promise<TrqpAuthorizationResponse> => {
  const time_requested = new Date().toISOString()
  await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 250))

  const known = MOCK_TRUST_REGISTRY[entityId]

  return {
    entity_id: entityId,
    authority_id: known?.authority_id ?? 'unknown',
    action,
    resource,
    authorized: !!known,
    time_requested,
    time_evaluated: new Date().toISOString(),
    message: known ? undefined : `No trust registry record found for "${entityId}"`,
  }
})

type ManifestStoreFormat = {
  activeManifest: string
  manifests: Record<string, Record<string, unknown>>
}

function storeToOutcome(store: ManifestStoreFormat): VerificationOutcome {
  const manifests = Object.entries(store.manifests).map(([id, m]) => ({
    id,
    title: (m.title as string) ?? '',
    claimGenerator: (m.claimGenerator as string | null) ?? null,
    claimGeneratorInfo: (m.claimGeneratorInfo as { name: string; 'org.contentauth.c2pa_rs': string }[]) ?? [],
    instanceId: (m.instanceId as string) ?? '',
    signatureInfo: (m.signatureInfo as { alg: string; issuer: string; common_name: string; cert_serial_number: string }) ?? { alg: '', issuer: '', common_name: '', cert_serial_number: '' },
    assertions: (m.assertions as Record<string, unknown>) ?? {},
    credentials: [] as [],
    thumbnail: (m.thumbnail as string | null) ?? null,
    ingredients: [] as [],
  }))

  return {
    state: true,
    manifests,
    manifestStore: {
      activeManifest: store.activeManifest,
      manifests: store.manifests,
    },
  }
}

const examples: { label: string; data: VerificationOutcome }[] = [
  { label: 'CAWG Identity + Metadata + Training (full example)', data: identityExample as unknown as VerificationOutcome },
  { label: 'CAWG Identity — real ICA output shape (c2paAsset, not signer_payload)', data: identityIcaRealExample as unknown as VerificationOutcome },
  { label: 'Created Example (schema.org only)', data: createdExample as unknown as VerificationOutcome },
  { label: 'Adobe Firefly – Tabby Cat', data: storeToOutcome(fireflyTabby as ManifestStoreFormat) },
  { label: 'Adobe Photoshop – Car', data: storeToOutcome(carEsPs as ManifestStoreFormat) },
  { label: 'ChatGPT – Image', data: storeToOutcome(chatGptImage as ManifestStoreFormat) },
  { label: 'Adobe Content Authenticity – Cloudscape', data: storeToOutcome(cloudscape as ManifestStoreFormat) },
  { label: 'Lightroom – Crater Lake', data: storeToOutcome(craterLake as ManifestStoreFormat) },
  { label: "TRQP Unverified", data: trqpAuthorizationUnverified as unknown as VerificationOutcome },
  { label: "TRQP Verified", data: trqpAuthorizationVerified as unknown as VerificationOutcome }
]

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const example = examples[selectedIndex]

  return (
    <div style={{ maxWidth: '960px', margin: '2rem auto', fontFamily: 'sans-serif', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>CAWG Component – Dev Playground</h1>
      <p style={{ color: '#64748b', marginTop: 0, marginBottom: '2rem' }}>
        Creator Assertions Working Group plugin for c2pa-react-component
      </p>

      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label htmlFor="example-select" style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
          Example:
        </label>
        <select
          id="example-select"
          value={selectedIndex}
          onChange={e => setSelectedIndex(Number(e.target.value))}
          style={{ padding: '6px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff' }}
        >
          {examples.map((ex, i) => (
            <option key={i} value={i}>{ex.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {([1, 2, 3] as const).map((l) => (
          <div key={l}>
            <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Level {l}
            </p>
            <CAWGManifest manifest={example.data} level={l} />
          </div>
        ))}
      </div>
    </div>
  )
}
