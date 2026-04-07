import type { NoteLinkSyntaxType } from "@prisma/client";

export type ParsedLink = {
  syntaxType: NoteLinkSyntaxType;
  rawRef: string;
};

const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;
const ENTITY_MENTION_RE = /@e:([a-z0-9][a-z0-9-]*)/gi;
const NOTE_MENTION_RE = /@n:([a-z0-9][a-z0-9-]*)/gi;

export function parseNoteLinks(contentMd: string): ParsedLink[] {
  const links: ParsedLink[] = [];

  for (const match of contentMd.matchAll(WIKILINK_RE)) {
    const rawRef = (match[1] ?? "").trim();
    if (rawRef) {
      links.push({ syntaxType: "wikilink", rawRef });
    }
  }

  for (const match of contentMd.matchAll(ENTITY_MENTION_RE)) {
    const rawRef = (match[1] ?? "").trim().toLowerCase();
    if (rawRef) {
      links.push({ syntaxType: "mention_entity", rawRef });
    }
  }

  for (const match of contentMd.matchAll(NOTE_MENTION_RE)) {
    const rawRef = (match[1] ?? "").trim().toLowerCase();
    if (rawRef) {
      links.push({ syntaxType: "mention_note", rawRef });
    }
  }

  const dedup = new Map<string, ParsedLink>();
  for (const link of links) {
    dedup.set(`${link.syntaxType}:${link.rawRef.toLowerCase()}`, link);
  }
  return Array.from(dedup.values());
}