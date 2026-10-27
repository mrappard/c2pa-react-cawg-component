import { Manifest } from 'c2pa-react-component-types';

/** The CAWG identity assertion signature types whose credential is a W3C verifiable credential. */
export const CREDENTIAL_SIG_TYPES = {
  'cawg.identity_claims_aggregation': 'Identity claims aggregation',
  'cawg.verifiable_credential_binding': 'Verifiable credential binding',
} as const;

export type CredentialSigType = keyof typeof CREDENTIAL_SIG_TYPES;

/**
 * A W3C verifiable credential carried by a CAWG identity assertion, as
 * decoded by c2pa-rs (`core.decode_identity_assertions`).
 */
export interface CawgCredential {
  /** Assertion label, e.g. `cawg.identity` or `cawg.identity__1`. */
  label: string;
  sigType: CredentialSigType;
  issuer: { id: string; name?: string };
  types: string[];
  validFrom?: string;
  validUntil?: string;
  /**
   * The credential subjects: `credentialSubject` for a verifiable credential
   * binding, or the verified identities of an identity claims aggregation
   * credential (which is what c2pa-rs keeps of its subject).
   */
  subjects: Record<string, unknown>[];
  /**
   * What binds the credential to this asset: the `C2PAAssetBinding`
   * `termsOfUse` entries of a binding, or an aggregation credential's
   * `c2paAsset`.
   */
  bindings: Record<string, unknown>[];
  /** `credentialStatus` entries (revocation and similar). */
  status: Record<string, unknown>[];
  /** `credentialSchema` entries. */
  schemas: { id: string; type?: string }[];
  /** The decoded assertion, for raw display. */
  raw: Record<string, unknown>;
}

const IDENTITY_LABEL = /^cawg\.identity(__\d+)?$/;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const objects = (v: unknown): Obj[] => (Array.isArray(v) ? v : v === undefined ? [] : [v]).filter(isObj);
const str = (v: unknown) => (typeof v === 'string' ? v : undefined);

function sigTypeOf(data: Obj): CredentialSigType | undefined {
  const payload = isObj(data.signer_payload) ? data.signer_payload : isObj(data.c2paAsset) ? data.c2paAsset : undefined;
  const sigType = str(payload?.sig_type);
  return sigType && sigType in CREDENTIAL_SIG_TYPES ? (sigType as CredentialSigType) : undefined;
}

function toCredential(label: string, data: Obj): CawgCredential | undefined {
  const sigType = sigTypeOf(data);
  if (!sigType) return undefined;

  const issuer = isObj(data.issuer)
    ? { id: str(data.issuer.id) ?? '', name: str(data.issuer.name) }
    : { id: str(data.issuer) ?? '' };
  if (!issuer.id) return undefined;

  const isBinding = sigType === 'cawg.verifiable_credential_binding';
  return {
    label,
    sigType,
    issuer,
    types: (Array.isArray(data.type) ? data.type : [data.type]).filter((t): t is string => typeof t === 'string'),
    validFrom: str(data.validFrom) ?? str(data.issuanceDate),
    validUntil: str(data.validUntil) ?? str(data.expirationDate),
    subjects: isBinding ? objects(data.credentialSubject) : objects(data.verifiedIdentities),
    bindings: isBinding
      ? objects(data.termsOfUse).filter(t => t.type === 'C2PAAssetBinding')
      : objects(data.c2paAsset),
    status: objects(data.credentialStatus),
    schemas: objects(data.credentialSchema)
      .map(s => ({ id: str(s.id) ?? '', type: str(s.type) }))
      .filter(s => s.id),
    raw: data,
  };
}

/** The verifiable credentials in a manifest's CAWG identity assertions, in label order. */
export function getCawgCredentials(manifest: Manifest): CawgCredential[] {
  return Object.entries(manifest.assertions ?? {})
    .filter(([label, data]) => IDENTITY_LABEL.test(label) && isObj(data))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([label, data]) => toCredential(label, data as Obj))
    .filter((c): c is CawgCredential => c !== undefined);
}

/** Long DIDs (a did:jwk carries the whole key) are shortened to their start and end. */
export function shortenDid(id: string, max = 48): string {
  return id.length > max ? `${id.slice(0, max - 15)}…${id.slice(-12)}` : id;
}
