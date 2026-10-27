import { describe, expect, it } from 'vitest';
import { getBestUserName } from './getBestUserName';

describe('getBestUserName', () => {
  it('returns Unknown when there are no identities and no cawg.metadata assertion', () => {
    expect(getBestUserName(undefined, undefined)).toBe('Unknown');
    expect(getBestUserName([], undefined)).toBe('Unknown');
  });

  it('falls back to dc:creator when there are no identities', () => {
    expect(getBestUserName(undefined, { 'dc:creator': 'Ada' })).toBe('Ada');
  });

  it('prefers the highest-ranked verified identity', () => {
    const provider = { id: 'https://example.com', name: 'Example' };
    expect(
      getBestUserName(
        [
          { type: 'cawg.web_site', name: 'site', provider, verifiedAt: '' },
          { type: 'cawg.document_verification', name: 'Ada Lovelace', provider, verifiedAt: '' },
        ],
        undefined,
      ),
    ).toBe('Ada Lovelace');
  });
});
