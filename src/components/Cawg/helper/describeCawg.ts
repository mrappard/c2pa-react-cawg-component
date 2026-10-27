import { ManifestEntry } from 'c2pa-react-component-types';
import { getBestUserName, VerifiedIdentitiesObject } from './getBestUserName';
import { getSignerPayload } from './getSignerPayload';

const ROLE_PHRASES: Record<string, string> = {
  'cawg.creator': 'Created by',
  'cawg.contributor': 'Contributed by',
  'cawg.editor': 'Edited by',
  'cawg.producer': 'Produced by',
  'cawg.publisher': 'Published by',
  'cawg.sponsor': 'Sponsored by',
  'cawg.translator': 'Translated by',
};

type Identity = Partial<VerifiedIdentitiesObject> & { uri?: string };

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function formatCreator(value: unknown): string {
  if (Array.isArray(value)) return value.filter(v => typeof v === 'string').join(', ');
  if (typeof value === 'string') return value;
  return '';
}

function siteHost(identity: Identity): string {
  const uri = identity.uri ?? identity.provider?.id;
  if (!uri) return 'website';
  try {
    return new URL(uri).host.replace(/^www\./, '');
  } catch {
    return uri;
  }
}

/** "(ID verified, linked to Instagram and example.com)" — empty when nothing verifies the person. */
function describeVerification(identities: Identity[]): string {
  const idVerified = identities.some(i => i.type === 'cawg.document_verification');
  const links: string[] = [];
  for (const identity of identities) {
    let link: string | undefined;
    if (identity.type === 'cawg.social_media') link = identity.provider?.name;
    else if (identity.type === 'cawg.web_site') link = siteHost(identity);
    else if (identity.type === 'cawg.crypto_wallet') link = 'crypto wallet';
    if (link && !links.includes(link)) links.push(link);
  }

  const parts: string[] = [];
  if (idVerified) parts.push('ID verified');
  if (links.length > 0) parts.push(`linked to ${joinList(links)}`);
  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
}

function describeAffiliation(identities: Identity[]): string {
  const orgs = [
    ...new Set(
      identities
        .filter(i => i.type === 'cawg.affiliation' && i.provider?.name)
        .map(i => i.provider!.name),
    ),
  ];
  return orgs.length > 0 ? `, affiliated with ${joinList(orgs)}` : '';
}

/**
 * Summarises who is behind the content across every manifest, e.g.
 * "Created by Jordan Lee (ID verified), affiliated with Example Recording Studio."
 * Entries are expected oldest ingredient first, active manifest last.
 */
export function describeCawg(entries: ManifestEntry[]): string | undefined {
  // role phrase -> person descriptions, in first-seen order
  const byRole = new Map<string, string[]>();

  for (const entry of entries) {
    const identity = entry.assertions?.['cawg.identity'] as Record<string, unknown> | undefined;
    const metadata = entry.assertions?.['cawg.metadata'] as Record<string, unknown> | undefined;
    if (!identity && !metadata) continue;

    const rawIdentities = identity?.verifiedIdentities;
    const identities: Identity[] = Array.isArray(rawIdentities)
      ? rawIdentities
      : rawIdentities
        ? [rawIdentities as Identity]
        : [];

    const metadataCreator = formatCreator(metadata?.['dc:creator']);
    // getBestUserName sorts its input in place, so hand it a copy.
    let name = identities.length > 0 ? getBestUserName([...identities] as VerifiedIdentitiesObject[], {}) : 'Unknown';
    if (name === 'Unknown') name = metadataCreator;
    if (!name) continue;

    const roles = getSignerPayload(identity)?.role ?? [];
    const phrases = roles.length > 0
      ? roles.map(role => ROLE_PHRASES[role] ?? `${role.replace(/^cawg\./, '')} by`)
      : [metadataCreator ? 'Created by' : 'Signed by'];

    const person = `${name}${describeVerification(identities)}${describeAffiliation(identities)}`;
    for (const phrase of phrases) {
      const people = byRole.get(phrase) ?? [];
      if (!people.includes(person)) people.push(person);
      byRole.set(phrase, people);
    }
  }

  if (byRole.size === 0) return undefined;

  const clauses = [...byRole.entries()].map(([phrase, people], i) => {
    const lead = i === 0 ? phrase : phrase.charAt(0).toLowerCase() + phrase.slice(1);
    return `${lead} ${joinList(people)}`;
  });
  const sentence = clauses.join('; ');
  // Names like "Adobe Inc." already end the sentence.
  return sentence.endsWith('.') ? sentence : `${sentence}.`;
}
