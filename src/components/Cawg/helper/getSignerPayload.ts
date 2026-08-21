export type SignerPayload = {
    sig_type?: string,
    role?: string[],
    referenced_assertions?: unknown[],
}

/**
 * The cawg.identity assertion's role/sig_type/referenced_assertions data
 * lives under different keys depending on which identity path signed it:
 * the X.509/COSE path puts it at `signer_payload` (there's no VC wrapper,
 * so the assertion data *is* the signer_payload); the ICA (Identity Claims
 * Aggregation) path puts the same data at `c2paAsset` instead — that's the
 * actual field name the CAWG spec uses for it under `credentialSubject`
 * (see credentialSubject.c2paAsset in the Identity Claims Aggregation
 * spec). Consumers that only checked `signer_payload` would see roles for
 * X.509-signed assertions but never for ICA-signed ones, even though the
 * data is there under `c2paAsset`.
 */
export const getSignerPayload = (
    identityAssertion: Record<string, unknown> | undefined,
): SignerPayload | undefined => {
    if (!identityAssertion) {
        return undefined;
    }

    return (identityAssertion.signer_payload ?? identityAssertion.c2paAsset) as
        | SignerPayload
        | undefined;
}
