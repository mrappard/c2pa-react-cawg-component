import { describe, expect, it } from 'vitest';
import { ManifestEntry } from 'c2pa-react-component-types';
import { describeCawg } from './describeCawg';

const provider = (name: string, id = `https://${name.toLowerCase().replace(/\s/g, '')}.com`) => ({ id, name });

function identityEntry(verifiedIdentities: unknown[], role: string[] = ['cawg.creator'], metadata?: Record<string, unknown>): ManifestEntry {
  return {
    assertions: {
      'cawg.identity': { signer_payload: { sig_type: 'cawg.identity_claims_aggregation', role }, verifiedIdentities },
      ...(metadata ? { 'cawg.metadata': metadata } : {}),
    },
  };
}

describe('describeCawg', () => {
  it('describes an ID-verified creator with an affiliation', () => {
    const entry = identityEntry([
      { type: 'cawg.document_verification', name: 'Jordan Lee', provider: provider('Example ID Verifier') },
      { type: 'cawg.affiliation', provider: provider('Example Recording Studio') },
    ]);
    expect(describeCawg([entry])).toBe('Created by Jordan Lee (ID verified), affiliated with Example Recording Studio.');
  });

  it('does not double the full stop after a name ending in one', () => {
    const entry = identityEntry([
      { type: 'cawg.document_verification', name: 'Jordan Lee', provider: provider('Example ID Verifier') },
      { type: 'cawg.affiliation', provider: provider('Adobe Inc.') },
    ]);
    expect(describeCawg([entry])).toBe('Created by Jordan Lee (ID verified), affiliated with Adobe Inc.');
  });

  it('lists social media and website links', () => {
    const entry = identityEntry([
      { type: 'cawg.document_verification', name: 'Matthew Rappard', provider: provider('Example ID Verifier') },
      { type: 'cawg.social_media', name: 'Matthew Rappard', provider: provider('Instagram') },
      { type: 'cawg.web_site', uri: 'https://www.matthewrappard.com', provider: provider('matthewrappard.com') },
    ]);
    expect(describeCawg([entry])).toBe('Created by Matthew Rappard (ID verified, linked to Instagram and matthewrappard.com).');
  });

  it('falls back to cawg.metadata dc:creator', () => {
    const entry: ManifestEntry = { assertions: { 'cawg.metadata': { 'dc:creator': ['deepseek-v2:16b'] } } };
    expect(describeCawg([entry])).toBe('Created by deepseek-v2:16b.');
  });

  it('removes duplicates across ingredients and groups by role', () => {
    const jordan = { type: 'cawg.document_verification', name: 'Jordan Lee', provider: provider('Example ID Verifier') };
    const priya = { type: 'cawg.social_media', name: 'Priya Nair', provider: provider('Instagram') };
    const sam = { type: 'cawg.document_verification', name: 'Sam Park', provider: provider('Example ID Verifier') };
    const entries = [
      identityEntry([jordan]),
      identityEntry([priya]),
      identityEntry([jordan]),
      identityEntry([sam], ['cawg.editor']),
    ];
    expect(describeCawg(entries)).toBe(
      'Created by Jordan Lee (ID verified) and Priya Nair (linked to Instagram); edited by Sam Park (ID verified).',
    );
  });

  it('returns undefined without CAWG data', () => {
    expect(describeCawg([{ assertions: { 'c2pa.actions.v2': { actions: [] } } }, {}])).toBeUndefined();
  });
});
