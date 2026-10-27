import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Manifest, VerificationOutcome } from 'c2pa-react-component-types';
import CAWGL3 from './L3/CAWGL3';
import { CAWGManifest, createCAWGManifest } from '../Cawg';
import { describeCawg } from '../helper/describeCawg';
import { getCawgCredentials, shortenDid } from '../helper/getCawgCredentials';

// The shapes c2pa-rs's decoded identity assertions take (`core.decode_identity_assertions`).
const vcb = {
  '@context': ['https://www.w3.org/ns/credentials/v2', 'https://cawg.io/identity/1.2/vcb/context/'],
  type: ['VerifiableCredential', 'C2PABindingCredential', 'CAWGVerifiedIdentities'],
  issuer: 'did:jwk:issuer',
  validFrom: '2026-01-01T00:00:00Z',
  credentialSubject: [
    { id: 'did:example:actor', type: 'cawg.social_media', username: 'samplecreator' },
    { id: 'did:example:actor', type: 'cawg.web_site', uri: 'https://samplecreator.example' },
  ],
  termsOfUse: {
    type: 'C2PAAssetBinding',
    referencedAssertions: [{ url: 'self#jumbf=c2pa.assertions/c2pa.hash.data', hash: 'AA==' }],
    role: ['cawg.creator'],
  },
  credentialSchema: [{ id: 'https://cawg.io/identity/1.1/vcb/schema/vc2.0/', type: 'JSONSchema' }],
  verifiedIdentities: [{ type: 'cawg.social_media', username: 'samplecreator' }],
  signer_payload: { sig_type: 'cawg.verifiable_credential_binding', referenced_assertions: [], role: ['cawg.creator'] },
};

const ica = {
  '@context': ['https://www.w3.org/ns/credentials/v2', 'https://cawg.io/identity/1.1/ica/context/'],
  type: ['VerifiableCredential', 'IdentityClaimsAggregationCredential'],
  issuer: { id: 'did:web:connected-identities.identity.adobe.com', name: 'Adobe' },
  validFrom: '2024-05-27T11:40:40Z',
  validUntil: '2025-05-27T11:40:40Z',
  verifiedIdentities: [{ type: 'cawg.document_verification', name: 'First Last' }],
  c2paAsset: { sig_type: 'cawg.identity_claims_aggregation', referenced_assertions: [{}, {}], role: [] },
  credentialStatus: { type: 'BitstringStatusListEntry', statusPurpose: 'revocation' },
};

const x509 = { signer_payload: { sig_type: 'cawg.x509.cose', referenced_assertions: [] }, signature: 'AA==' };

const manifest = (assertions: Record<string, unknown>) =>
  ({ id: 'urn:test', title: 'Test', claimGenerator: null, claimGeneratorInfo: [], instanceId: 'x', signatureInfo: {}, assertions, credentials: [], thumbnail: null, ingredients: [] }) as unknown as Manifest;

describe('getCawgCredentials', () => {
  it('finds ICA and VCB credentials in every identity assertion, skipping X.509', () => {
    const creds = getCawgCredentials(
      manifest({ 'cawg.identity': ica, 'cawg.identity__1': x509, 'cawg.identity__2': vcb, 'c2pa.actions': {} }),
    );
    expect(creds.map(c => [c.label, c.sigType])).toEqual([
      ['cawg.identity', 'cawg.identity_claims_aggregation'],
      ['cawg.identity__2', 'cawg.verifiable_credential_binding'],
    ]);
  });

  it('reads issuer, validity, subjects, binding, status and schema', () => {
    const [i, v] = getCawgCredentials(manifest({ 'cawg.identity': ica, 'cawg.identity__1': vcb }));
    expect(i).toMatchObject({
      issuer: { id: 'did:web:connected-identities.identity.adobe.com', name: 'Adobe' },
      validUntil: '2025-05-27T11:40:40Z',
      subjects: [{ type: 'cawg.document_verification' }],
      status: [{ statusPurpose: 'revocation' }],
    });
    expect(v.subjects).toHaveLength(2);
    expect(v.bindings[0].role).toEqual(['cawg.creator']);
    expect(v.schemas).toEqual([{ id: 'https://cawg.io/identity/1.1/vcb/schema/vc2.0/', type: 'JSONSchema' }]);
  });
});

describe('CAWGL3 credentials section', () => {
  it('is hidden unless showCredentials is set', () => {
    const { rerender } = render(<CAWGL3 manifest={manifest({ 'cawg.identity': vcb })} />);
    expect(screen.queryByText('Verifiable credential binding')).toBeNull();

    rerender(<CAWGL3 manifest={manifest({ 'cawg.identity': vcb })} showCredentials />);
    expect(screen.getByText('Verifiable credential binding')).toBeTruthy();
    expect(screen.getByText('cawg.social_media · samplecreator')).toBeTruthy();
    expect(screen.getByText(/1 referenced assertion · role cawg.creator/)).toBeTruthy();
  });

  it('shows an object issuer in the identity section instead of crashing', () => {
    // Regression: CAWGL3 rendered `issuer` directly, which throws for a VC's `{ id, name }` issuer.
    render(<CAWGL3 manifest={manifest({ 'cawg.identity': ica })} />);
    expect(screen.getByText('Adobe (did:web:connected-identities.identity.adobe.com)')).toBeTruthy();
  });

  it('marks an expired credential and shows its revocation status', () => {
    render(<CAWGL3 manifest={manifest({ 'cawg.identity': ica })} showCredentials />);
    expect(screen.getByText('Expired')).toBeTruthy();
    expect(screen.getByText('BitstringStatusListEntry · revocation')).toBeTruthy();
  });

  it('links the issuer when onIssuerClick is given', () => {
    const onIssuerClick = vi.fn();
    render(<CAWGL3 manifest={manifest({ 'cawg.identity': vcb })} showCredentials onIssuerClick={onIssuerClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'did:jwk:issuer' }));
    expect(onIssuerClick).toHaveBeenCalledWith('did:jwk:issuer');
  });

  it('shortens a long issuer DID but passes the full DID on click', () => {
    const longDid = `did:jwk:${'e'.repeat(120)}`;
    const onIssuerClick = vi.fn();
    render(
      <CAWGL3 manifest={manifest({ 'cawg.identity': { ...vcb, issuer: longDid } })} showCredentials onIssuerClick={onIssuerClick} />,
    );
    const link = screen.getByRole('button', { name: longDid });
    expect(link.textContent).toBe(shortenDid(longDid));
    expect(link.textContent!.length).toBeLessThan(longDid.length);
    fireEvent.click(link);
    expect(onIssuerClick).toHaveBeenCalledWith(longDid);
  });

  it('toggles to the raw credential JSON', () => {
    render(<CAWGL3 manifest={manifest({ 'cawg.identity': vcb })} showCredentials />);
    fireEvent.click(screen.getByRole('tab', { name: 'Raw JSON' }));
    expect(screen.getByText(/"C2PABindingCredential"/)).toBeTruthy();
  });
});

describe('createCAWGManifest', () => {
  const outcome = (assertions: Record<string, unknown>): VerificationOutcome =>
    ({ state: true, manifests: [{ ...manifest(assertions), id: 'urn:test' }], manifestStore: { activeManifest: 'urn:test', manifests: {} } }) as unknown as VerificationOutcome;

  it('keeps the plugin metadata', () => {
    const plugin = createCAWGManifest({ showCredentials: true });
    expect(plugin.knownAssertions).toEqual(CAWGManifest.knownAssertions);
    expect(plugin.describe).toBe(describeCawg);
  });

  it('shows credentials at L3 only when created with showCredentials', () => {
    const Plain = CAWGManifest;
    const WithCredentials = createCAWGManifest({ showCredentials: true });
    const { unmount } = render(<Plain manifest={outcome({ 'cawg.identity': vcb })} level={3} />);
    expect(screen.queryByText('Verifiable credential binding')).toBeNull();
    unmount();
    render(<WithCredentials manifest={outcome({ 'cawg.identity': vcb })} level={3} />);
    expect(screen.getByText('Verifiable credential binding')).toBeTruthy();
  });

  it('renders nothing, without a hooks error, for a manifest with no CAWG data', () => {
    const Plugin = createCAWGManifest();
    const { container, rerender } = render(<Plugin manifest={outcome({})} level={3} />);
    expect(container.innerHTML).toBe('');
    rerender(<Plugin manifest={outcome({ 'cawg.identity': vcb })} level={3} />);
    expect(container.innerHTML).not.toBe('');
  });
});
