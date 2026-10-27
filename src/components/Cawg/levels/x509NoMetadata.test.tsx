import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Manifest } from 'c2pa-react-component-types';
import { CAWGL1 } from './L1/CAWGL1';
import CAWGL2 from './L2/CAWGL2';
import CAWGL3 from './L3/CAWGL3';

// Shape c2pa-rs produces for an X.509-signed identity assertion (e.g. its
// C_with_CAWG_data.jpg fixture): no verifiedIdentities and no cawg.metadata.
const manifest = {
  id: 'urn:c2pa:test',
  title: 'C_with_CAWG_data.jpg',
  claimGenerator: null,
  claimGeneratorInfo: [{ name: 'c2pa cawg test', 'org.contentauth.c2pa_rs': '0.92.0' }],
  instanceId: 'xmp:iid:test',
  signatureInfo: { alg: 'Es256', issuer: 'C2PA Test Signing Cert', common_name: 'C2PA Signer', cert_serial_number: '1' },
  assertions: {
    'cawg.identity': {
      signer_payload: {
        sig_type: 'cawg.x509.cose',
        referenced_assertions: [{ url: 'self#jumbf=c2pa.assertions/cawg.training-mining', hash: '' }],
      },
    },
    'cawg.training-mining': { entries: { 'cawg.ai_generative_training': { use: 'notAllowed' } } },
  },
  credentials: [],
  thumbnail: null,
  ingredients: [],
} as unknown as Manifest;

describe('CAWG levels with an X.509 identity and no cawg.metadata', () => {
  it.each([
    ['L1', CAWGL1],
    ['L2', CAWGL2],
    ['L3', CAWGL3],
  ])('%s renders without throwing', (_, Level) => {
    expect(() => render(<Level manifest={manifest} />)).not.toThrow();
  });
});
